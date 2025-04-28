import { ClinicInsert, ClinicReviewInsert } from '@/types/clinic';
import { Database } from '@/types/database.types';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import fs from 'fs';
import * as path from 'path';

// Configure dotenv to load variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

interface GoogleReview {
  name: string;
  stars: number;
  text: string;
  publishedAtDate: string;
  reviewOrigin: string;
  reviewImageUrls: string[];
  [key: string]: unknown;
}

interface ClinicListing {
  title: string;
  website: string;
  latitude: number;
  longitude: number;
  placeId: string;
  slug: string;
  skip?: boolean;
  description?: string;
  reviewsCount: number;
  totalScore: number;
  phone?: string;
  permanentlyClosed: boolean;
  address: string;
  street: string;
  neighborhood: string;
  city: string;
  postalCode: string;
  state: string;
  countryCode: string;
  locatedIn: string;
  images: string;
  reviews: GoogleReview[];
  openingHours?: Array<{ day_of_week: string; open_time: string; close_time: string }>;
  [key: string]:
    | string
    | number
    | boolean
    | GoogleReview[]
    | Array<{ day_of_week: string; open_time: string; close_time: string }>
    | undefined;
}

interface ProcessingStats {
  total: number;
  processed: number;
  failed: number;
  failedItems: Array<{ name: string; error: string }>;
}

class ClinicDataProcessor {
  private supabase: SupabaseClient<Database>;
  private stats: ProcessingStats = {
    total: 0,
    processed: 0,
    failed: 0,
    failedItems: [],
  };

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    this.initializeCloudinary();

    const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY;
    const cloudinaryApiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudinaryApiKey || !cloudinaryApiSecret) {
      throw new Error('Missing Cloudinary credentials');
    }
  }

  private initializeCloudinary(): void {
    cloudinary.config({
      cloud_name: process.env.NEXT_PUBLIC_CLOUDIARY_API_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  private async uploadImageCloudinary(imageUrl: string, uploadPreset: string): Promise<string> {
    try {
      const result = await cloudinary.uploader.upload(imageUrl, {
        upload_preset: uploadPreset,
      });
      return result.secure_url;
    } catch (error) {
      console.error(`Failed to upload image ${imageUrl}:`, error);
      throw error;
    }
  }

  private async insertReviews(reviews: GoogleReview[], clinicId: string): Promise<void> {
    if (!reviews?.length) return;

    const reviewsToInsert: ClinicReviewInsert[] = reviews.map((review) => ({
      clinic_id: clinicId,
      author_name: review.name,
      email: '', // Google reviews don't provide email
      text: review.text || '',
      rating: review.stars || 0,
      status: 'approved',
      review_time: review.publishedAtDate,
      source: 'scraped',
    }));

    const { error } = await this.supabase.from('clinic_reviews').insert(reviewsToInsert);

    if (error) {
      console.error('Failed to insert reviews:', error);
      throw error;
    }
  }

  private async insertOpeningHours(
    openingHours: Array<{ day_of_week: string; open_time: string; close_time: string }>,
    clinicId: string,
  ): Promise<void> {
    if (!openingHours?.length) return;

    const dayMap: { [key: string]: number } = {
      monday: 0,
      tuesday: 1,
      wednesday: 2,
      thursday: 3,
      friday: 4,
      saturday: 5,
      sunday: 6,
    };

    const hoursToInsert = openingHours
      .map((slot) => {
        const dayOfWeek = dayMap[slot.day_of_week.toLowerCase()];
        if (dayOfWeek === undefined) return null;

        // Times are already in 24-hour format, just validate them
        const openTime = slot.open_time;
        const closeTime = slot.close_time;

        return {
          clinic_id: clinicId,
          day_of_week: dayOfWeek,
          open_time: openTime,
          close_time: closeTime,
        };
      })
      .filter((hour): hour is NonNullable<typeof hour> => hour !== null);

    if (hoursToInsert.length) {
      const { error } = await this.supabase.from('clinic_hours').insert(hoursToInsert);

      if (error) {
        console.error('Failed to insert opening hours:', error);
        throw error;
      }
    }
  }

  private convertTimeTo24Hour(timeStr: string): string | undefined {
    // Remove any non-standard characters and normalize spaces
    timeStr = timeStr.replace(/[^0-9APM\s:]/g, '').trim();

    // Handle 24-hour format
    if (timeStr.includes('24')) return '23:59';

    // Handle 12-hour format
    const isPM = timeStr.toUpperCase().includes('PM');
    const timeParts = timeStr.match(/(\d+)(?::(\d+))?\s*(?:AM|PM)?/i);

    if (!timeParts) return undefined;

    let hours = parseInt(timeParts[1]);
    const minutes = timeParts[2] ? parseInt(timeParts[2]) : 0;

    if (isPM && hours < 12) hours += 12;
    if (!isPM && hours === 12) hours = 0;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  private async processClinicListing(listing: ClinicListing): Promise<void> {
    try {
      // Upload images if available
      let processedImageUrls: string[] = [];
      if (listing.images) {
        // Handle both string and array formats
        const imageUrlArray =
          typeof listing.images === 'string' ? listing.images.split(',') : listing.images;

        const uploadPromises = imageUrlArray.map((imageUrl) =>
          this.uploadImageCloudinary(
            imageUrl.trim(),
            process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET_PLACE as string,
          ),
        );
        processedImageUrls = await Promise.all(uploadPromises);
      }

      // Process location
      const location = `POINT(${listing.longitude} ${listing.latitude})`;

      const listingData: ClinicInsert = {
        name: listing.title,
        area_id: '5072419a-bb6d-46d9-bae0-b2bc8ce12ae3',
        state_id: '6a082287-6946-45c4-9ee6-fb12ca29ba54',
        is_active: false,
        is_featured: false,
        slug: listing.slug,
        description: listing.description || '',
        website: listing.website || '',
        images: processedImageUrls,
        address: listing.street || '',
        neighborhood: listing.neighborhood || '',
        city: listing.city || '',
        postal_code: listing.postalCode || '',
        phone: listing.phone || '',
        latitude: listing.latitude || 0,
        longitude: listing.longitude || 0,
        rating: listing.totalScore || 0,
        review_count: listing.reviewsCount || 0,
        is_permanently_closed: listing.permanentlyClosed || false,
        open_on_public_holidays: false,
        location,
        email: '',
        facebook_url: '',
        instagram_url: '',
        youtube_url: '',
        featured_video: '',
        source: 'scraped',
        place_id: listing.placeId || '',
        status: 'pending',
      };

      // Insert clinic and get the ID
      const { data, error } = await this.supabase
        .from('clinics')
        .insert(listingData)
        .select()
        .single();

      if (error) throw error;

      // Insert reviews if available
      if (data?.id && listing.reviews?.length) {
        await this.insertReviews(listing.reviews, data.id);
      }

      // Insert opening hours if available
      if (data?.id && listing.openingHours?.length) {
        await this.insertOpeningHours(listing.openingHours, data.id);
      }

      this.stats.processed++;
      console.log(`✓ Processed: ${listing.title}`);
    } catch (error) {
      this.stats.failed++;
      this.stats.failedItems.push({
        name: listing.title,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      console.error(`✗ Failed to process ${listing.title}:`, error);
    }
  }

  public async processFile(inputFilename: string): Promise<ProcessingStats> {
    try {
      const parsedDataDir = path.resolve('./tasks/data/parsedData');
      const rawdata = fs.readFileSync(path.join(parsedDataDir, inputFilename), 'utf8');
      const listings: ClinicListing[] = JSON.parse(rawdata);

      this.stats.total = listings.length;
      console.log(`Starting to process ${listings.length} clinics...`);

      for (const listing of listings) {
        await this.processClinicListing(listing);
      }

      this.logResults();
      return this.stats;
    } catch (error) {
      console.error('Failed to process file:', error);
      throw error;
    }
  }

  private logResults(): void {
    console.log('\nProcessing completed:');
    console.log(`Total clinics: ${this.stats.total}`);
    console.log(`Successfully processed: ${this.stats.processed}`);
    console.log(`Failed: ${this.stats.failed}`);

    if (this.stats.failedItems.length) {
      console.log('\nFailed items:');
      this.stats.failedItems.forEach(({ name, error }) => {
        console.log(`- ${name}: ${error}`);
      });
    }
  }
}

// Script execution
const command = process.argv[2];

if (!command) {
  console.error('Please provide a file name.');
  process.exit(1);
}

const filename = `final-filtered-processed-${command}.json`;
const processor = new ClinicDataProcessor();
processor.processFile(filename).catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});
