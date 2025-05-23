import { ClinicNotificationEmail } from '@/emails/clinic-notification';
import { ClinicSubmissionEmail } from '@/emails/clinic-submission';
import { ReviewNotificationEmail } from '@/emails/review-notification';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Email template for new review notifications
export const sendNewReviewNotification = async ({
  clinicName,
  authorName,
  email,
  rating,
  reviewText,
}: {
  clinicName: string;
  authorName: string;
  email: string;
  rating: number;
  reviewText: string;
}) => {
  if (!resend) {
    console.info('RESEND_API_KEY is not set in the .env. Skipping sending email.');
    return;
  }

  try {
    const { error } = await resend.batch.send([
      {
        from: process.env.EMAIL_FROM || 'hello@dentalclinicclosetome.my',
        to: email,
        subject: `New Review for ${clinicName}`,
        react: ReviewNotificationEmail({
          clinicName,
          authorName,
          rating,
          reviewText,
        }),
      },
      {
        from: process.env.EMAIL_FROM || 'hello@dentalclinicclosetome.my',
        to: process.env.NOTIFICATION_EMAIL || 'admin@dentalclinicclosetome.my',
        subject: `New Review for ${clinicName}`,
        react: ReviewNotificationEmail({
          clinicName,
          authorName,
          rating,
          reviewText,
        }),
      },
    ]);

    // const { error } = await resend.emails.send({
    //   from: process.env.EMAIL_FROM || 'hello@dentalclinicclosetome.my',
    //   to: email,
    //   //   bcc: [process.env.NOTIFICATION_EMAIL || 'hello@dentalclinicclosetome.my'],
    //   bcc: ['yuyu@clinicgeek.com'],
    //   subject: `New Review for ${clinicName}`,
    //   react: ReviewNotificationEmail({
    //     clinicName,
    //     authorName,
    //     rating,
    //     reviewText,
    //   }),
    // });

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
  email: string;
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
    const subject =
      price === 'instant'
        ? 'Your Premium Dental Clinic Listing: Live Within 24 Hours'
        : 'Dental Clinic Listing Received - Processing Confirmation';
    const { error } = await resend.batch.send([
      {
        from: process.env.EMAIL_FROM || 'hello@dentalclinicclosetome.my',
        to: email,
        subject,
        react: ClinicSubmissionEmail({
          recipientName: name,
          clinicName,
          price,
        }),
      },
      {
        from: process.env.EMAIL_FROM || 'hello@dentalclinicclosetome.my',
        to: process.env.NOTIFICATION_EMAIL || 'admin@dentalclinicclosetome.my',
        subject,
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
      },
    ]);

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
