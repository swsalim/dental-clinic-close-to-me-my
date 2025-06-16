import { unstable_cache } from 'next/cache';

import { createServerClient } from '@/lib/supabase';

import { ExploreStatesClient } from '@/components/listing/explore-states-client';
import Container from '@/components/ui/container';
import { Wrapper } from '@/components/ui/wrapper';

const getPopularStates = unstable_cache(
  async (supabase: Awaited<ReturnType<typeof createServerClient>>) => {
    const { data: states } = await supabase
      .from('states')
      .select('id, name, slug, thumbnail_image, clinics:clinics(count)')
      .eq('clinics.status', 'approved');

    return states
      ? [...states].sort((a, b) => b.clinics[0].count - a.clinics[0].count).slice(0, 8)
      : [];
  },
  ['popular-states'],
  {
    revalidate: 3600, // Cache for 1 hour
    tags: ['popular-states'],
  },
);

export async function ExploreStates() {
  const supabase = await createServerClient();
  const sortedStates = await getPopularStates(supabase);

  return (
    <Wrapper className="bg-gray-50 dark:bg-gray-950/30">
      <Container>
        <div className="mb-10 flex flex-col gap-2 text-center md:mb-12">
          <span className="text-base font-semibold uppercase text-red-500">Popular States</span>
          <h2 className="text-balance text-3xl font-black">
            Explore dental clinics in popular states
          </h2>
          <p className="text-base font-medium text-gray-700 dark:text-gray-300">
            We&apos;ve compiled a list of dental clinics in these locations.
          </p>
        </div>
        <ExploreStatesClient states={sortedStates} />
      </Container>
    </Wrapper>
  );
}
