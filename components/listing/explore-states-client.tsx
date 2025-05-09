'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';

import pluralize from 'pluralize';

import { ImageCloudinary } from '../image/image-cloudinary';

interface StateWithCount {
  id: string;
  name: string;
  slug: string;
  thumbnail_image: string | null;
  clinics: { count: number }[];
}

interface ExploreStatesClientProps {
  states: StateWithCount[];
}

export function ExploreStatesClient({ states }: ExploreStatesClientProps) {
  const [orderedStateIds, setOrderedStateIds] = useState<string[]>([]);

  useEffect(() => {
    const today = new Date().toDateString();
    const storedDate = localStorage.getItem('exploreStatesDate');
    const storedStateIds = localStorage.getItem('exploreStateIds');

    if (storedDate === today && storedStateIds) {
      setOrderedStateIds(JSON.parse(storedStateIds));
    } else {
      const randomizedIds = states.map((state) => state.id).sort(() => 0.5 - Math.random());
      localStorage.setItem('exploreStatesDate', today);
      localStorage.setItem('exploreStateIds', JSON.stringify(randomizedIds));
      setOrderedStateIds(randomizedIds);
    }
  }, [states]);

  // Create a map of states for easy lookup
  const statesMap = new Map(states.map((state) => [state.id, state]));

  // Get ordered states using the stored IDs
  const orderedStates = orderedStateIds
    .map((id) => statesMap.get(id))
    .filter((state): state is StateWithCount => state !== undefined);

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-8 lg:grid-cols-5">
      {orderedStates.map((state) => (
        <div key={state.id}>
          <Link href={`/${state.slug}`}>
            <div className="group relative mb-2 h-56 w-full overflow-hidden rounded-lg transition md:h-52 lg:h-48">
              {state.thumbnail_image && (
                <ImageCloudinary
                  src={state.thumbnail_image}
                  alt={state.name}
                  width={600}
                  height={600}
                  className="h-full w-full object-cover transition group-hover:scale-105"
                />
              )}
              {!state.thumbnail_image && (
                <ImageCloudinary
                  src="placeholder-location.jpg"
                  alt={state.name}
                  width={600}
                  height={600}
                  className="h-full w-full object-cover transition group-hover:scale-105"
                />
              )}
            </div>
            <h3 className="text-lg font-semibold">{state.name}</h3>
            <p className="text-base font-medium text-gray-600 dark:text-gray-300">
              {state.clinics?.[0].count} {pluralize('clinic', state.clinics?.[0].count)}
            </p>
          </Link>
        </div>
      ))}
    </div>
  );
}
