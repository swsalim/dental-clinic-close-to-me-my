import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    {
      error: 'Free clinic submissions are no longer accepted. Submit a paid listing at /submit.',
    },
    { status: 410 },
  );
}
