export type GuideCategory = {
  id: string;
  title: string;
  description: string;
  slugs: string[];
};

/** Stable groups for the guides index, homepage, and navigation. */
export const guideCategories: GuideCategory[] = [
  {
    id: 'finding-a-clinic',
    title: 'Finding a clinic',
    description: 'Compare a listing, a nearby clinic, urgent hours, and ratings before you call.',
    slugs: [
      'the-complete-guide-to-finding-and-comparing-a-dental-clinic',
      'how-to-find-a-nearby-dentist-clinic-that-fits-your-needs',
      'dental-clinic-open-now-common-questions-about-urgent-visits',
      'dental-clinic-ratings-checklist',
    ],
  },
  {
    id: 'braces-and-retainers',
    title: 'Braces and retainers',
    description: 'Compare brace types, wax, elastics, and how to keep the result.',
    slugs: [
      'braces-options-compared',
      'conventional-vs-self-ligating-braces',
      'dental-wax-for-braces',
      'braces-elastics',
      'teeth-retainer',
    ],
  },
  {
    id: 'tooth-and-gum-care',
    title: 'Tooth and gum care',
    description: 'Plaque, stains, sensitivity, decay, and extra teeth.',
    slugs: [
      'plaque-on-teeth',
      'teeth-stains',
      'sensitive-teeth',
      'dental-caries-questions',
      'supernumerary-teeth',
    ],
  },
  {
    id: 'treatment-and-scans',
    title: 'Treatment and scans',
    description: 'Crowns, implants, and the questions to ask before a scan.',
    slugs: [
      'crown-teeth',
      'dental-implant-vs-restorative-care',
      'cbct-dental-scan-questions',
    ],
  },
];

export function guideCategoryHref(id: string): string {
  return `/guides#${id}`;
}
