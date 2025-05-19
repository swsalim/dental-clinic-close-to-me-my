import { ClinicNotificationEmail } from '@/emails/clinic-notification';
import { ReviewNotificationEmail } from '@/emails/review-notification';
import { Resend } from 'resend';

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
  if (!resend) {
    console.info('RESEND_API_KEY is not set in the .env. Skipping sending email.');
    return;
  }

  try {
    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'support@dentalclinicclosetome.my',
      to: process.env.NOTIFICATION_EMAIL || 'swsalim+dentalclinicclosetome@gmail.com',
      subject: `New Review for ${clinicName}`,
      react: ReviewNotificationEmail({
        clinicName,
        authorName,
        rating,
        reviewText,
      }),
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

// Email template for new clinic submissions
export const sendNewClinicNotification = async ({
  name,
  email,
  clinicName,
  clinicEmail,
  phone,
  address,
  description,
  price,
}: {
  name: string;
  email?: string;
  clinicName: string;
  clinicEmail?: string;
  phone: string;
  address: string;
  description: string;
  price: string;
}) => {
  if (!resend) {
    console.info('RESEND_API_KEY is not set in the .env. Skipping sending email.');
    return;
  }

  try {
    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'support@dentalclinicclosetome.my',
      to: process.env.NOTIFICATION_EMAIL || 'swsalim+dentalclinicclosetome@gmail.com',
      subject: `New Clinic Submission: ${clinicName}`,
      react: ClinicNotificationEmail({
        name,
        email,
        clinicName,
        clinicEmail,
        phone,
        address,
        description,
        price,
      }),
    });

    if (error) {
      console.error('Error sending clinic notification:', error);
      return { success: false, error };
    }
    return { success: true };
  } catch (error) {
    console.error('Exception when sending clinic notification:', error);
    return { success: false, error };
  }
};
