'use client';

import { useState } from 'react';

import { Check } from 'lucide-react';
import { motion } from 'motion/react';

import { cn } from '@/lib/utils';

import { buttonVariants } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

export function PricingPlan() {
  const [tier, setTier] = useState<'area' | 'state'>('area');

  const pricing = {
    area: {
      title: 'Area-level featured listing',
      subtitle: 'Show up in a specific location (e.g. Cheras, Petaling Jaya)',
      plans: [
        {
          name: 'Standard',
          price: 'RM180 / year',
          features: [
            'Ad-free listing page',
            'Do-follow backlink to your website',
            'Priority placement above free listings',
            '1 promotional image (below clinic details)',
            'Featured Clinic badge',
            'Appears on both area and state pages',
            'Eligible for homepage rotation',
          ],
        },
        {
          name: 'Premium',
          price: 'RM280 / year',
          features: [
            'Everything in Standard, plus:',
            'Up to 5 promotional images (gallery-style section)',
          ],
        },
      ],
    },
    state: {
      title: 'State-level featured listing',
      subtitle: 'Appear across your entire state (e.g. Kuala Lumpur, Johor)',
      plans: [
        {
          name: 'Standard',
          price: 'RM480 / year',
          features: [
            'Ad-free listing page',
            'Do-follow backlink to your website',
            'Priority placement above free listings',
            '1 promotional image (below clinic details)',
            'Featured Clinic badge',
            'Appears on both area and state pages',
            'Eligible for homepage rotation',
          ],
        },
        {
          name: 'Premium',
          price: 'RM680 / year',
          features: [
            'Everything in Standard, plus:',
            'Up to 5 promotional images (gallery-style section)',
          ],
        },
      ],
    },
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex flex-row items-center justify-between">
            <h2 className="mb-0 text-2xl font-bold">{pricing[tier].title}</h2>
            <div className="flex flex-row items-center gap-2">
              <span className="text-sm font-medium text-gray-500">State-level</span>
              <Switch
                checked={tier === 'area'}
                onCheckedChange={(checked) => setTier(checked ? 'area' : 'state')}
              />

              <span className="text-sm font-medium text-gray-500">Area-level</span>
            </div>
          </div>
          <div>
            <p className="mt-0 text-lg text-gray-500">{pricing[tier].subtitle}</p>
          </div>
        </div>
        <div className="grid gap-8 md:grid-cols-2">
          {pricing[tier].plans.map((plan) => (
            <motion.div
              key={plan.name}
              whileHover={{ y: -5 }}
              className="rounded-xl border p-6 shadow-sm transition hover:shadow-lg">
              <h2 className="mb-2 mt-0 text-2xl font-bold">{plan.name}</h2>
              <p className="mb-6 text-xl font-semibold text-blue-600">{plan.price}</p>
              <ul className="mb-6 space-y-2 ps-0">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-gray-700">
                    <Check className="mt-0.5 h-5 w-5 text-green-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="not-prose">
                <a
                  href={`mailto:hello@dentalclinicclosetome.my?subject=Featured Listing Enquiry for ${plan.name} - ${pricing[tier].title}`}
                  className={cn(buttonVariants({ variant: 'primary' }))}>
                  Contact Us to Get Featured
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </>
  );
}
