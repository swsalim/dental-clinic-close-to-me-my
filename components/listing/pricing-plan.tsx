'use client';

import { useState } from 'react';

import { Check } from 'lucide-react';
import { motion } from 'motion/react';

import { cn } from '@/lib/utils';

import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

export function PricingPlan() {
  const [type, setType] = useState<'monthly' | 'yearly'>('monthly');

  const pricing = {
    monthly: [
      {
        name: 'Featured Basic',
        price: 59,
        type: 'monthly',
        features: [
          'Top placement on your preferred area',
          'Ad-free listing page',
          '<strong>Do-follow</strong> backlink to your website',
          'Add 1 promotional image',
          '8x more visibility than free listings',
          'Featured badge to stand out',
          'Appears on your preferred area page and parent state page',
          'Eligible for homepage rotation',
        ],
        tag: 'most popular',
      },
      {
        name: 'Featured Premium',
        price: 89,
        type: 'monthly',
        features: [
          'Top placement on your preferred area',
          'Ad-free listing page',
          '<strong>Do-follow</strong> backlink to your website',
          'Add up to <strong>5</strong> promotional images',
          '8x more visibility than free listings',
          'Featured badge to stand out',
          'Appears on your preferred area page and parent state page',
          'Eligible for homepage rotation',
        ],
      },
    ],
    yearly: [
      {
        name: 'Featured Basic',
        price: 565,
        type: 'yearly',
        features: [
          'Top placement on your preferred area',
          'Ad-free listing page',
          '<strong>Do-follow</strong> backlink to your website',
          'Add 1 promotional image',
          '8x more visibility than free listings',
          'Featured badge to stand out',
          'Appears on your preferred area page and parent state page',
          'Eligible for homepage rotation',
        ],
        tag: 'save 20%',
      },
      {
        name: 'Featured Premium',
        price: 855,
        type: 'yearly',
        features: [
          'Top placement on your preferred area',
          'Ad-free listing page',
          '<strong>Do-follow</strong> backlink to your website',
          'Add up to <strong>5</strong> promotional images',
          '8x more visibility than free listings',
          'Featured badge to stand out',
          'Appears on your preferred area page and parent state page',
          'Eligible for homepage rotation',
        ],
        tag: 'save 20%',
      },
    ],
  };

  return (
    <>
      <div className="mt-16 flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex flex-row items-center justify-between">
            <h2 className="mb-0 mt-0 text-2xl font-bold">Simple Pricing</h2>
            <div className="flex flex-row items-center gap-2">
              <span className="text-sm font-medium text-gray-500">Monthly</span>
              <Switch
                checked={type === 'yearly'}
                onCheckedChange={(checked) => setType(checked ? 'yearly' : 'monthly')}
              />
              <span className="text-sm font-medium text-gray-500">Yearly</span>
            </div>
          </div>
        </div>
        <div className="grid gap-8 md:grid-cols-2">
          {pricing[type].map((plan, index) => (
            <motion.div
              key={plan.name}
              whileHover={{ y: -5 }}
              className="relative rounded-xl border p-6 shadow-sm transition hover:shadow-lg">
              {plan.tag && (
                <div className="absolute right-6 top-6">
                  <Badge variant="brand">{plan.tag}</Badge>
                </div>
              )}
              <div className="mb-6 flex flex-col gap-2">
                <h2 className="mb-0 mt-0 !text-xl !font-bold">{plan.name}</h2>
                <p className="mb-0 text-2xl font-semibold text-blue-600">
                  RM{plan.price}
                  {type === 'monthly' ? (
                    <span className="text-base text-gray-500">/month</span>
                  ) : (
                    <span className="text-base text-gray-500">/year</span>
                  )}
                </p>
                {type === 'yearly' && (
                  <p className="mb-0 mt-1 text-sm text-gray-500">
                    <span className="text-base text-gray-500 line-through">
                      RM{pricing.monthly[index].price * 12}/year
                    </span>
                  </p>
                )}
              </div>
              <ul className="mb-6 space-y-2 ps-0">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-gray-700">
                    <Check className="mt-0.5 h-5 w-5 text-green-500" />
                    <span dangerouslySetInnerHTML={{ __html: feature }} />
                  </li>
                ))}
              </ul>
              <div className="not-prose">
                <a
                  href={`mailto:hello@dentalclinicclosetome.my?subject=Featured Listing Enquiry for ${plan.name}`}
                  className={cn(buttonVariants({ variant: 'primary' }))}>
                  Contact Us
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </>
  );
}
