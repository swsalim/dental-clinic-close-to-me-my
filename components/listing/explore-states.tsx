import { createServerClient } from '@/lib/supabase';

import Container from '@/components/ui/container';
import { Wrapper } from '@/components/ui/wrapper';

import { ExploreStatesClient } from './explore-states-client';

export async function ExploreStates() {
  const supabase = await createServerClient();
  const { data: states } = await supabase
    .from('states')
    .select('id, name, slug, thumbnail_image, clinics:clinics(count)')
    .eq('clinics.status', 'approved');

  const sortedStates = states
    ? [...states].sort((a, b) => b.clinics[0].count - a.clinics[0].count).slice(0, 10)
    : [];

  return (
    <Wrapper>
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
