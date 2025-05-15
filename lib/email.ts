import { Resend } from 'resend';

import { renderReviewNotificationEmail } from '@/components/email/review-notification';

const resend = new Resend(process.env.RESEND_API_KEY);

// Email template for new review notifications
export const sendNewReviewNotification = async ({
  clinicName,
  authorName,
  rating,
  reviewText,
}: {
  clinicName: string;
  authorName: string;
  rating: number;
  reviewText: string;
}) => {
  try {
    // Use our template to generate the HTML content
    const html = renderReviewNotificationEmail({
      clinicName,
      authorName,
      rating,
      reviewText,
    });

    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'support@dentalclinicclosetome.my',
      to: process.env.NOTIFICATION_EMAIL || 'swsalim+dentalclinicclosetome@gmail.com',
      subject: `New Review for ${clinicName}`,
      html,
    });

    if (error) {
      console.error('Error sending email notification:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error('Exception when sending email:', error);
    return { success: false, error };
  }
};
