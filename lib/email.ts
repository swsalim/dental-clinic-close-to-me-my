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
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clinicName,
        authorName,
        rating,
        reviewText,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Error sending email notification:', result.error);
      return { success: false, error: result.error };
    }

    return { success: true, data: result };
  } catch (error) {
    console.error('Exception when sending email:', error);
    return { success: false, error };
  }
};
