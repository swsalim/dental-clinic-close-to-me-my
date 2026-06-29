import { Metadata } from 'next';

import { siteConfig } from '@/config/site';

import { getDashboardClinics } from '@/helpers/clinics';

import { ClinicTableData, columns } from './columns';
import { DataTable } from './components/data-table';

export const dynamic = 'force-dynamic';

const config = {
  title: 'Clinics',
  description: 'List all clinics',
  url: '/dashboard/clinics',
};

export const metadata: Metadata = {
  title: config.title,
  description: config.description,
  alternates: {
    canonical: config.url,
  },
  openGraph: {
    title: config.title,
    description: config.description,
    url: config.url,
    images: [
      {
        url: new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/api/og?title=${config.title}`),
        width: siteConfig.openGraph.width,
        height: siteConfig.openGraph.height,
        alt: config.title,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    title: config.title,
    description: config.description,
    card: 'summary_large_image',
    creator: siteConfig.creator,
    images: [
      {
        url: new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/api/og?title=${config.title}`),
        width: siteConfig.openGraph.width,
        height: siteConfig.openGraph.height,
        alt: config.title,
      },
    ],
  },
};

export default async function DashboardClinicsPage() {
  const { data, total } = await getDashboardClinics({
    status: 'approved',
    orderBy: 'created_at',
  });

  return (
    <DataTable
      columns={columns}
      data={(data as unknown as ClinicTableData[]) || []}
      type="clinic"
      totalCount={total}
    />
  );
}
