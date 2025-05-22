import { Metadata } from 'next';
import Link from 'next/link';

import { ClinicArea } from '@/types/clinic';
import { ClinicState } from '@/types/clinic';
import { ExternalLinkIcon } from 'lucide-react';

import { siteConfig } from '@/config/site';

import { createServerClient } from '@/lib/supabase';

import WebsiteJsonLd from '@/components/structured-data/website-json-ld';
import Container from '@/components/ui/container';
import Prose from '@/components/ui/prose';
import { Wrapper } from '@/components/ui/wrapper';

const config = {
  url: '/browse',
};

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
  alternates: {
    canonical: config.url,
  },
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    url: config.url,
    images: [
      {
        url: new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/api/og?title=${siteConfig.title}`),
        width: siteConfig.openGraph.width,
        height: siteConfig.openGraph.height,
        alt: siteConfig.title,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    title: siteConfig.title,
    description: siteConfig.description,
    card: 'summary_large_image',
    creator: siteConfig.creator,
    images: [
      {
        url: new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/api/og?title=${siteConfig.title}`),
        width: siteConfig.openGraph.width,
        height: siteConfig.openGraph.height,
        alt: siteConfig.title,
      },
    ],
  },
};

export default async function BrowsePage() {
  const supabase = await createServerClient();

  const [{ data: statesData }, { data: areasData }] = await Promise.all([
    supabase.from('states').select('*', { count: 'exact' }),
    supabase.from('areas').select('*', { count: 'exact' }),
  ]);

  const states = (statesData || []) as ClinicState[];
  const areas = (areasData || []) as ClinicArea[];

  return (
    <>
      <WebsiteJsonLd company="Dental Clinics Malaysia" url={process.env.NEXT_PUBLIC_BASE_URL} />
      <Wrapper>
        <Container>
          <Prose>
            <h1>Find Dental Clinics in Malaysia</h1>
            <div className="my-12 flex flex-col gap-6">
              {states.map((state) => (
                <div key={state.id} className="flex w-full flex-row items-start gap-6">
                  <div className="flex w-1/6 flex-row items-start gap-2">
                    <h2 className="m-0 p-0 text-lg font-semibold">{state.name}</h2>
                    <Link
                      href={`/${state.slug}`}
                      className="grid size-8 place-items-center rounded-full">
                      <ExternalLinkIcon className="size-4" />
                    </Link>
                  </div>
                  <div className="flex flex-col flex-wrap gap-2">
                    {areas
                      .filter((area) => area.state_id === state.id)
                      .map((area) => (
                        <Link
                          href={`/${state.slug}/${area.slug}`}
                          className="inline-block w-fit"
                          key={area.id}>
                          {area.name}
                        </Link>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </Prose>
        </Container>
      </Wrapper>
    </>
  );
}
