import { createAdminClient } from '@/lib/supabase/admin';

export interface ClinicData {
  name: string;
  description: string;
  slug: string;
  state_id: string;
  area_id: string;
  address: string;
  phone: string;
  postal_code: string;
  email?: string;
  images: string[];
  neighborhood: string | null;
  city: string | null;
  latitude: number;
  longitude: number;
  location: string;
  youtube_url?: string;
  facebook_url?: string;
  instagram_url?: string;
  featured_video?: string;
  place_id: string;
  source: string;
  status: string;
}

export class DatabaseService {
  private readonly supabase;

  constructor() {
    this.supabase = createAdminClient();
  }

  async createClinic(data: ClinicData) {
    const { error, data: clinic } = await this.supabase
      .from('clinics')
      .insert({
        ...data,
        rating: 0,
        review_count: 0,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create clinic: ${error.message}`);
    }

    return clinic;
  }
}
