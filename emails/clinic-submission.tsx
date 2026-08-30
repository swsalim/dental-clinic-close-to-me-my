import type * as React from 'react';

import { Container, Heading, Hr, Link, Text } from '@react-email/components';

import { LISTING_FEE_LABEL } from '@/lib/listing/submission-fee';

import { EmailLayout } from './layout';

interface ClinicSubmissionEmailProps {
  clinicName: string;
  price?: string;
  recipientName?: string;
}

export const ClinicSubmissionEmail = ({
  clinicName,
  recipientName = 'Partner',
}: ClinicSubmissionEmailProps) => {
  return (
    <EmailLayout preview={`Thank you for your ${clinicName} listing submission`}>
      <Container className="px-6 py-4">
        <Heading className="mb-2 text-2xl font-bold text-gray-900">
          Thank You for Your Dental Clinic Listing Submission
        </Heading>

        <Text className="text-base text-gray-700">Dear {recipientName},</Text>

        <Text className="text-base font-bold text-gray-700">
          Thank you for submitting your {clinicName} listing to DentalClinicCloseToMe.my!
        </Text>

        <Hr className="my-4 border-gray-300" />

        <Heading className="mb-2 mt-0 text-lg font-bold text-gray-800">
          Your Submission Status:
        </Heading>

        <Container className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <Text className="text-base font-bold text-gray-800">
            Paid listing ({LISTING_FEE_LABEL})
          </Text>
          <Text className="text-base text-gray-700">
            Your listing will be live on our platform within 24 hours.
          </Text>
        </Container>

        <Text className="mt-4 text-base text-gray-700">
          Our team will notify you via email once your listing is live or if we need additional
          information.
        </Text>

        <Hr className="my-4 border-gray-300" />

        <Heading className="mb-2 text-lg font-bold text-gray-800">Questions or Concerns?</Heading>

        <Text className="text-base text-gray-700">
          Please contact our support team at{' '}
          <Link href="mailto:hello@dentalclinicclosetome.my" className="text-blue-600">
            hello@dentalclinicclosetome.my
          </Link>
        </Text>

        <Text className="mt-6 text-base text-gray-700">
          Thank you for choosing DentalClinicCloseToMe.my as your partner in connecting with
          patients.
        </Text>

        <Text className="text-base text-gray-700">
          Warm regards,
          <br />
          The DentalClinicCloseToMe.my Team
        </Text>
      </Container>
    </EmailLayout>
  );
};

ClinicSubmissionEmail.PreviewProps = {
  clinicName: 'Dental Clinic',
  recipientName: 'John Wick',
} satisfies ClinicSubmissionEmailProps;

export default ClinicSubmissionEmail;
