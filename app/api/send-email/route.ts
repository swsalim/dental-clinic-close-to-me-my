import { NextRequest, NextResponse } from 'next/server';

import { Resend } from 'resend';

import { renderReviewNotificationEmail } from '@/components/email/review-notification';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { clinicName, authorName, rating, reviewText } = await request.json();

    // Validate required fields
    if (!clinicName || !authorName || !rating || !reviewText) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Use our template to generate the HTML content
    const html = renderReviewNotificationEmail({
      clinicName,
      authorName,
      rating,
      reviewText,
    });

    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'support@dentalclinicclosetome.my',
      to: process.env.NOTIFICATION_EMAIL || 'support@dentalclinicclosetome.my',
      subject: `New Review for ${clinicName}`,
      html,
    });

    if (error) {
      console.error('Error sending email notification:', error);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Exception when sending email:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
