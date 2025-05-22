import { NextResponse } from 'next/server';

import { DatabaseService } from '@/services/database.service';
import { GoogleMapsService } from '@/services/google-maps.service';
import Stripe from 'stripe';

import { absoluteUrl, slugify } from '@/lib/utils';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.email || !body.clinic_name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Only store minimal data in metadata due to Stripe limits
    const metadata: Record<string, string> = {
      name: body.name || '',
      clinic_name: body.clinic_name || '',
      email: body.email || '',
    };

    // Initialize services
    const googleMapsService = new GoogleMapsService();
    const databaseService = new DatabaseService();

    // Geocode address
    const { lat, lng, placeId, neighborhood, city } = await googleMapsService.geocodeAddress(
      body.address,
      body.postal_code,
    );

    // Generate slug
    const slug = slugify(
      `${body.clinic_name}-${body.area_id}-${Math.floor(Math.random() * 10000)}`,
    );

    const clinic = await databaseService.createClinic({
      name: body.clinic_name,
      description: body.description,
      slug,
      state_id: body.state_id,
      area_id: body.area_id,
      address: body.address,
      phone: body.phone,
      postal_code: body.postal_code,
      email: body.clinic_email,
      images: body.images,
      neighborhood,
      city,
      latitude: lat,
      longitude: lng,
      location: `POINT(${lng} ${lat})`,
      youtube_url: body.youtube_url,
      facebook_url: body.facebook_url,
      instagram_url: body.instagram_url,
      featured_video: body.featured_video,
      place_id: placeId,
      source: 'ugc_paid',
      status: 'pending_payment',
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'myr',
            product_data: {
              name: 'Instant Listing',
              description: 'Get your clinic listed instantly with premium features.',
            },
            unit_amount: 19900, // RM199.00
          },
          quantity: 1,
        },
      ],
      customer_email: body.email,
      metadata,
      success_url: absoluteUrl(
        `/submit/success?session_id={CHECKOUT_SESSION_ID}&clinic_id=${clinic.id}`,
      ),
      cancel_url: absoluteUrl('/submit?canceled=1'),
    });
    return NextResponse.json({ checkoutUrl: session.url }, { status: 200 });
  } catch (error) {
    console.error('Stripe session creation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create Stripe session',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 400 },
    );
  }
}
