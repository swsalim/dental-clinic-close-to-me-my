import { NextResponse } from 'next/server';

import { GoogleMapsService, parseMapsUrl } from '@/services/google-maps.service';
import OpenAI from 'openai';
import { z } from 'zod';

const bodySchema = z.object({
  url: z.string().url('Enter a valid Google Maps URL'),
});

function isGoogleMapsUrl(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return (
      hostname === 'maps.app.goo.gl' ||
      hostname === 'goo.gl' ||
      hostname.endsWith('google.com') ||
      hostname.endsWith('google.com.my') ||
      hostname === 'maps.google.com'
    );
  } catch {
    return false;
  }
}

async function extractClinicNameWithAi(url: string): Promise<string | null> {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          'Extract the dental clinic or business name from a Google Maps URL. Reply with only the name, or the word UNKNOWN if you cannot tell.',
      },
      { role: 'user', content: url },
    ],
    max_tokens: 80,
    temperature: 0,
  });

  const name = completion.choices[0]?.message?.content?.trim();
  if (!name || name.toUpperCase() === 'UNKNOWN') {
    return null;
  }
  return name;
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Enter a valid Google Maps URL' }, { status: 400 });
    }

    const { url } = parsed.data;
    if (!isGoogleMapsUrl(url)) {
      return NextResponse.json(
        { error: 'Paste a Google Maps link for the clinic' },
        { status: 400 },
      );
    }

    const maps = new GoogleMapsService();

    try {
      const result = await maps.lookupPlaceFromUrl(url, 'google');
      return NextResponse.json(result);
    } catch (googleError) {
      console.warn('Google Maps lookup failed, trying AI fallback:', googleError);
    }

    const parsedUrl = parseMapsUrl(url);
    const aiName = (await extractClinicNameWithAi(url)) || parsedUrl.query;
    if (!aiName) {
      return NextResponse.json(
        { error: 'Could not fetch this listing. Fill the form yourself.' },
        { status: 422 },
      );
    }

    const result = await maps.lookupPlaceByName(aiName, 'ai');
    return NextResponse.json(result);
  } catch (error) {
    console.error('Place lookup error:', error);
    return NextResponse.json(
      {
        error: 'Could not fetch this listing. Fill the form yourself.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 422 },
    );
  }
}
