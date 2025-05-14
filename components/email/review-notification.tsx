import * as React from 'react';

interface ReviewNotificationEmailProps {
  clinicName: string;
  authorName: string;
  rating: number;
  reviewText: string;
}

export const ReviewNotificationEmail: React.FC<ReviewNotificationEmailProps> = ({
  clinicName,
  authorName,
  rating,
  reviewText,
}) => {
  // Create star rating display
  const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ backgroundColor: '#f8f8f8', padding: '20px', borderRadius: '5px' }}>
        <h1 style={{ color: '#3b82f6', marginBottom: '20px' }}>New Review Submitted</h1>

        <div
          style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '5px',
            marginBottom: '20px',
          }}>
          <p style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>{clinicName}</p>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px' }}>
            <tbody>
              <tr>
                <td style={{ padding: '8px 0', borderBottom: '1px solid #eee', width: '30%' }}>
                  <strong>Reviewer:</strong>
                </td>
                <td style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>{authorName}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
                  <strong>Rating:</strong>
                </td>
                <td style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
                  <span style={{ color: '#f59e0b' }}>{stars}</span> ({rating}/5)
                </td>
              </tr>
            </tbody>
          </table>

          <div>
            <p style={{ marginBottom: '5px', fontWeight: 'bold' }}>Review:</p>
            <div
              style={{
                padding: '15px',
                backgroundColor: '#f9fafb',
                borderRadius: '5px',
                borderLeft: '4px solid #3b82f6',
              }}>
              <p style={{ margin: '0', lineHeight: '1.6' }}>{reviewText}</p>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', fontSize: '14px', color: '#6b7280', marginTop: '20px' }}>
          <p>This review is pending approval in your dashboard.</p>
        </div>
      </div>
    </div>
  );
};

// Function to render the email to HTML string
export const renderReviewNotificationEmail = (props: ReviewNotificationEmailProps): string => {
  // In a real implementation, you'd use a proper JSX to HTML converter
  // For simple needs, we'll use a template string approximation
  const { clinicName, authorName, rating, reviewText } = props;
  const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #f8f8f8; padding: 20px; border-radius: 5px;">
        <h1 style="color: #3b82f6; margin-bottom: 20px;">New Review Submitted</h1>
        
        <div style="background-color: white; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
          <p style="font-size: 18px; font-weight: bold; margin-bottom: 10px;">
            ${clinicName}
          </p>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
            <tbody>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee; width: 30%;">
                  <strong>Reviewer:</strong>
                </td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">
                  ${authorName}
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">
                  <strong>Rating:</strong>
                </td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">
                  <span style="color: #f59e0b;">${stars}</span> (${rating}/5)
                </td>
              </tr>
            </tbody>
          </table>
          
          <div>
            <p style="margin-bottom: 5px; font-weight: bold;">Review:</p>
            <div style="padding: 15px; background-color: #f9fafb; border-radius: 5px; border-left: 4px solid #3b82f6;">
              <p style="margin: 0; line-height: 1.6;">${reviewText}</p>
            </div>
          </div>
        </div>
        
        <div style="text-align: center; font-size: 14px; color: #6b7280; margin-top: 20px;">
          <p>This review is pending approval in your dashboard.</p>
        </div>
      </div>
    </div>
  `;
};
