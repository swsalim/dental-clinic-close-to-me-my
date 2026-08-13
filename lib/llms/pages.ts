import { Clinic, ClinicDetails } from '@/types/clinic';

import { siteConfig } from '@/config/site';

import {
  escapeMd,
  formatHours,
  htmlToText,
  joinSections,
  listItem,
  mdUrl,
} from '@/lib/llms/format';
import { absoluteUrl } from '@/lib/utils';

import { getAreaBySlug, getAreaListings } from '@/helpers/areas';
import { getClinicByServiceId, getClinicBySlug } from '@/helpers/clinics';
import { getDoctorBySlug, getDoctorListings, getDoctorsByState } from '@/helpers/doctors';
import { getAllServices } from '@/helpers/services';
import {
  getStateAreasWithClinics,
  getStateBySlug,
  getStateListings,
  getStateMetadataBySlug,
} from '@/helpers/states';

import { getHomeDirectoryStats } from '@/components/listing/home-stats';

const LIST_LIMIT = 9_999;

function clinicLocation(clinic: Partial<Clinic> | ClinicDetails) {
  const area =
    'area' in clinic && clinic.area && typeof clinic.area === 'object'
      ? clinic.area.name
      : 'area_name' in clinic
        ? clinic.area_name
        : undefined;
  const state =
    'state' in clinic && clinic.state && typeof clinic.state === 'object'
      ? clinic.state.name
      : 'state_name' in clinic
        ? clinic.state_name
        : undefined;

  return [area, state].filter(Boolean).join(', ');
}

function clinicNote(clinic: Partial<Clinic>) {
  const parts = [clinicLocation(clinic)];

  if (clinic.rating) {
    parts.push(`${clinic.rating.toFixed(1)} rating`);
  }

  return parts.filter(Boolean).join(' · ') || undefined;
}

export async function markdownHome() {
  const [stats, states, services] = await Promise.all([
    getHomeDirectoryStats(),
    getStateListings(),
    getAllServices(),
  ]);

  const statsLine = [
    stats.clinicCount > 0 ? `${stats.clinicCount.toLocaleString('en-MY')} listed clinics` : null,
    stats.stateCount > 0 ? `${stats.stateCount.toLocaleString('en-MY')} states` : null,
    stats.serviceCount > 0 ? `${stats.serviceCount.toLocaleString('en-MY')} services` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return joinSections([
    `# ${siteConfig.siteName}`,
    `> ${siteConfig.description}`,
    statsLine ? `${statsLine}. Compare reviews, hours, and contact details near you.` : null,
    '## Browse',
    [
      listItem('Browse by location', mdUrl('/browse'), 'Dental clinics grouped by state and city'),
      listItem('Dentists', mdUrl('/dentists'), 'Dentists practising in Malaysia'),
    ].join('\n'),
    '## States',
    states
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((state) =>
        listItem(`Dental clinics in ${state.name}`, mdUrl(`/${state.slug}`), state.name),
      )
      .join('\n'),
    '## Dental services',
    services
      .map((service) =>
        listItem(
          service.name,
          mdUrl(`/services/${service.slug}`),
          htmlToText(service.description) || undefined,
        ),
      )
      .join('\n'),
    '## For clinic owners',
    [
      listItem('List your clinic', mdUrl('/submit'), 'Free listing for dental clinics in Malaysia'),
      listItem(
        'Advertise with us',
        mdUrl('/advertise-with-us'),
        'Featured placement for clinics that want more patients',
      ),
    ].join('\n'),
    `HTML version: ${absoluteUrl('/')}`,
  ]);
}

export async function markdownBrowse() {
  const [states, areas, stats] = await Promise.all([
    getStateListings(),
    getAreaListings(),
    getHomeDirectoryStats(),
  ]);

  const areasByState = new Map<string, typeof areas>();
  for (const area of areas) {
    const stateSlug = area.state?.slug;
    if (!stateSlug) {
      continue;
    }
    const list = areasByState.get(stateSlug) ?? [];
    list.push(area);
    areasByState.set(stateSlug, list);
  }

  const sortedStates = states.slice().sort((a, b) => a.name.localeCompare(b.name));
  const stateSections = sortedStates.map((state) => {
    const stateAreas = (areasByState.get(state.slug) ?? [])
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name));
    const areaLines =
      stateAreas.length > 0
        ? stateAreas
            .map((area) =>
              listItem(
                area.name,
                mdUrl(`/${state.slug}/${area.slug}`),
                `Dental clinics in ${area.name}, ${state.name}`,
              ),
            )
            .join('\n')
        : '- No city pages yet.';

    return `### ${escapeMd(state.name)}\n\n${listItem(`All clinics in ${state.name}`, mdUrl(`/${state.slug}`))}\n${areaLines}`;
  });

  return joinSections([
    '# Browse dental clinics in Malaysia by location',
    `> Browse ${stats.clinicCount.toLocaleString('en-MY')} dental clinics across ${stats.stateCount} states and ${areas.length} cities in Malaysia. Compare reviews, services, and opening hours.`,
    'Use a state or city page to find clinics near you. Each linked file is a Markdown version of the listing page.',
    '## States and cities',
    stateSections.join('\n\n'),
    `HTML version: ${absoluteUrl('/browse')}`,
  ]);
}

export async function markdownDentists() {
  const doctors = await getDoctorListings();
  const sorted = doctors.slice().sort((a, b) => a.name.localeCompare(b.name));

  return joinSections([
    `# Browse top ${sorted.length} dentists in Malaysia`,
    '> Find dentists across Malaysia. Browse by state, city, or clinic to find a dentist near you.',
    '## Dentists',
    sorted.length > 0
      ? sorted.map((doctor) => listItem(doctor.name, mdUrl(`/dentist/${doctor.slug}`))).join('\n')
      : '- No dentist profiles yet.',
    `HTML version: ${absoluteUrl('/dentists')}`,
  ]);
}

export function markdownSubmit() {
  return joinSections([
    '# List your clinic | Reach more patients in Malaysia',
    '> Promote your dental clinic on Malaysia’s top local directory. Submit your listing on DentalClinicCloseToMe.my for free and connect with nearby patients.',
    'Submit your clinic and get exposure to patients searching for dental care near them. Listings are free.',
    `HTML form: ${absoluteUrl('/submit')}`,
  ]);
}

export function markdownAdvertise() {
  return joinSections([
    '# Grow your dental clinic with us',
    "> Join Malaysia's trusted dental clinic directory. Get featured listings to grow your practice with premium placement options.",
    'Reach Malaysia’s dental patients directly. Showcase your clinic, highlight your expertise, and connect with patients searching for dental care.',
    '## Why list with us',
    [
      '- Boost visibility in local “dental clinic near me” searches',
      '- Verified listings, reviews, and a professionally presented profile',
      '- Authoritative citations and backlinks for SEO',
      '- Affordable packages — one new patient can cover ad spend',
      '- Dedicated local support',
    ].join('\n'),
    '## Plans',
    [
      '### Featured — RM 59/month or RM 565/year',
      'Priority placement in your selected city or area, featured badge, ad-free profile, do-follow backlink, and 1 promotional image.',
      '### Featured Plus — RM 89/month or RM 855/year',
      'Everything in Featured, plus up to 5 promotional images and rotation in the homepage Featured Clinics section.',
      '### Featured Partner — RM 149/month or RM 1,430/year',
      'Everything in Featured Plus, plus large rotating homepage hero placement and a Featured Partner badge.',
    ].join('\n\n'),
    `Questions: [hello@dentalclinicclosetome.my](mailto:hello@dentalclinicclosetome.my?subject=Advertise%20With%20Us%20Enquiry)`,
    `HTML version: ${absoluteUrl('/advertise-with-us')}`,
  ]);
}

export async function markdownState(stateSlug: string) {
  const [stateData, areas, doctorsResult] = await Promise.all([
    getStateBySlug(stateSlug, 0, LIST_LIMIT),
    getStateAreasWithClinics(stateSlug),
    getDoctorsByState(stateSlug, 1, 0),
  ]);

  if (!stateData) {
    return null;
  }

  const totalClinics = stateData.total_clinics ?? stateData.clinics?.length ?? 0;
  const nearbyAreas = areas
    .slice(0, 3)
    .map((area) => area.name)
    .join(', ');

  return joinSections([
    `# Top ${totalClinics} dental clinics in ${stateData.name}`,
    `> Explore ${totalClinics} trusted dental clinics${nearbyAreas ? ` across cities like ${nearbyAreas}` : ''} in ${stateData.name}. Find services, reviews, and opening hours.`,
    doctorsResult.count
      ? listItem(
          `Dentists in ${stateData.name}`,
          mdUrl(`/${stateSlug}/dentists`),
          `${doctorsResult.count} dentist profiles`,
        )
      : null,
    areas.length > 0
      ? joinSections([
          '## Cities',
          areas
            .slice()
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((area) =>
              listItem(
                area.name,
                mdUrl(`/${stateSlug}/${area.slug}`),
                `Dental clinics in ${area.name}, ${stateData.name}`,
              ),
            )
            .join('\n'),
        ])
      : null,
    joinSections([
      '## Clinics',
      stateData.clinics?.length
        ? stateData.clinics
            .filter((clinic) => clinic.slug && clinic.name)
            .map((clinic) =>
              listItem(clinic.name as string, mdUrl(`/place/${clinic.slug}`), clinicNote(clinic)),
            )
            .join('\n')
        : '- No approved clinics yet.',
    ]),
    `HTML version: ${absoluteUrl(`/${stateSlug}`)}`,
  ]);
}

export async function markdownStateDentists(stateSlug: string) {
  const [stateData, doctorsResult] = await Promise.all([
    getStateMetadataBySlug(stateSlug),
    getDoctorsByState(stateSlug, LIST_LIMIT, 0),
  ]);

  if (!stateData) {
    return null;
  }

  const doctors = doctorsResult.data ?? [];

  return joinSections([
    `# Dentists in ${stateData.name}`,
    `> Find dentists practising in ${stateData.name}, Malaysia.`,
    listItem(`Dental clinics in ${stateData.name}`, mdUrl(`/${stateSlug}`)),
    '## Dentists',
    doctors.length > 0
      ? doctors
          .map((doctor) => {
            const clinic = doctor.clinics?.[0];
            const note = [clinic?.area?.name, clinic?.name].filter(Boolean).join(' · ');
            return listItem(doctor.name, mdUrl(`/dentist/${doctor.slug}`), note || undefined);
          })
          .join('\n')
      : '- No dentist profiles yet.',
    `HTML version: ${absoluteUrl(`/${stateSlug}/dentists`)}`,
  ]);
}

export async function markdownArea(stateSlug: string, areaSlug: string) {
  const areaData = await getAreaBySlug(areaSlug, 0, LIST_LIMIT);

  if (!areaData || areaData.state?.slug !== stateSlug) {
    return null;
  }

  const stateName = areaData.state.name ?? stateSlug;

  return joinSections([
    `# Top ${areaData.total_clinics} dental clinics in ${areaData.name}, ${stateName}`,
    `> Explore ${areaData.total_clinics} trusted dental clinics located in ${areaData.name}, ${stateName}. Find services, reviews, and opening hours.`,
    listItem(`All clinics in ${stateName}`, mdUrl(`/${stateSlug}`)),
    '## Clinics',
    areaData.clinics?.length
      ? areaData.clinics
          .filter((clinic) => clinic.slug && clinic.name)
          .map((clinic) =>
            listItem(clinic.name as string, mdUrl(`/place/${clinic.slug}`), clinicNote(clinic)),
          )
          .join('\n')
      : '- No approved clinics yet.',
    `HTML version: ${absoluteUrl(`/${stateSlug}/${areaSlug}`)}`,
  ]);
}

export async function markdownService(serviceSlug: string) {
  const services = await getAllServices();
  const service = services.find((item) => item.slug === serviceSlug);

  if (!service) {
    return null;
  }

  const { clinics } = await getClinicByServiceId(service.id, 0, LIST_LIMIT);
  const description = htmlToText(service.description) || service.name;

  return joinSections([
    `# ${service.name} — find top dental clinics`,
    `> Find qualified dental clinics offering ${description.toLowerCase()} services near you. Compare reviews, locations, and book appointments online.`,
    htmlToText(service.description) || null,
    '## Clinics',
    clinics?.length
      ? clinics
          .filter((clinic) => clinic.slug && clinic.name)
          .map((clinic) =>
            listItem(clinic.name as string, mdUrl(`/place/${clinic.slug}`), clinicNote(clinic)),
          )
          .join('\n')
      : '- No clinics listed for this service yet.',
    `HTML version: ${absoluteUrl(`/services/${serviceSlug}`)}`,
  ]);
}

function clinicAddress(clinic: ClinicDetails) {
  return [
    clinic.address,
    clinic.neighborhood,
    [clinic.postal_code, clinic.area?.name].filter(Boolean).join(' '),
    clinic.state?.name,
    'Malaysia',
  ]
    .filter(Boolean)
    .join(', ');
}

export async function markdownClinic(clinicSlug: string) {
  const clinic = await getClinicBySlug(clinicSlug);

  if (!clinic) {
    return null;
  }

  const location = clinicLocation(clinic);
  const facts = [
    clinicAddress(clinic) ? `- Address: ${clinicAddress(clinic)}` : null,
    clinic.phone ? `- Phone: ${clinic.phone}` : null,
    clinic.whatsapp ? `- WhatsApp: ${clinic.whatsapp}` : null,
    clinic.email ? `- Email: ${clinic.email}` : null,
    clinic.website ? `- Website: ${clinic.website}` : null,
    clinic.rating
      ? `- Rating: ${clinic.rating.toFixed(1)}${clinic.review_count ? ` (${clinic.review_count} reviews)` : ''}`
      : null,
    clinic.is_permanently_closed ? '- Status: Permanently closed' : null,
    clinic.is_featured ? '- Featured listing' : null,
  ].filter(Boolean);

  const hours = formatHours(clinic.hours);
  const reviews = (clinic.reviews ?? [])
    .filter((review) => review.author_name)
    .map((review) => {
      const rating = review.rating ? ` (${review.rating}/5)` : '';
      const text = htmlToText(review.text);
      return `- ${escapeMd(review.author_name as string)}${rating}${text ? `: ${text}` : ''}`;
    });

  return joinSections([
    `# ${clinic.name}`,
    `> Learn more about ${clinic.name}, a dental clinic located in ${location || 'Malaysia'}. View services, hours, and contact info.`,
    facts.length > 0 ? facts.join('\n') : null,
    clinic.state?.slug && clinic.area?.slug
      ? listItem(
          `More clinics in ${clinic.area.name}`,
          mdUrl(`/${clinic.state.slug}/${clinic.area.slug}`),
        )
      : null,
    htmlToText(clinic.description)
      ? joinSections(['## About', htmlToText(clinic.description)])
      : null,
    clinic.services?.length
      ? joinSections([
          '## Services',
          clinic.services
            .filter((service) => service.name && service.slug)
            .map((service) => listItem(service.name as string, mdUrl(`/services/${service.slug}`)))
            .join('\n'),
        ])
      : null,
    clinic.doctors?.length
      ? joinSections([
          '## Dentists',
          clinic.doctors
            .filter((doctor) => doctor.name && doctor.slug)
            .map((doctor) => {
              const note = [doctor.specialty, doctor.qualification].filter(Boolean).join(' · ');
              return listItem(
                doctor.name as string,
                mdUrl(`/dentist/${doctor.slug}`),
                note || undefined,
              );
            })
            .join('\n'),
        ])
      : null,
    hours.length > 0 ? joinSections([`## Opening hours`, hours.join('\n')]) : null,
    reviews.length > 0
      ? joinSections([
          '## Reviews',
          reviews.join('\n'),
          listItem('All reviews', mdUrl(`/place/${clinicSlug}/reviews`)),
        ])
      : listItem('Reviews', mdUrl(`/place/${clinicSlug}/reviews`)),
    `HTML version: ${absoluteUrl(`/place/${clinicSlug}`)}`,
  ]);
}

export async function markdownClinicReviews(clinicSlug: string) {
  const clinic = await getClinicBySlug(clinicSlug);

  if (!clinic) {
    return null;
  }

  const reviews = (clinic.reviews ?? [])
    .filter((review) => review.author_name)
    .map((review) => {
      const rating = review.rating ? `${review.rating}/5` : 'unrated';
      const text = htmlToText(review.text);
      return `### ${escapeMd(review.author_name as string)} — ${rating}\n\n${text || 'No written comment.'}`;
    });

  return joinSections([
    `# Reviews for ${clinic.name}`,
    `> Read reviews and ratings for ${clinic.name}, a dental clinic located in ${clinic.area?.name}, ${clinic.state?.name}.`,
    listItem(clinic.name, mdUrl(`/place/${clinicSlug}`), 'Clinic profile'),
    clinic.rating
      ? `Average rating: ${clinic.rating.toFixed(1)}${clinic.review_count ? ` from ${clinic.review_count} reviews` : ''}.`
      : null,
    reviews.length > 0 ? reviews.join('\n\n') : 'No reviews yet.',
    `HTML version: ${absoluteUrl(`/place/${clinicSlug}/reviews`)}`,
  ]);
}

export async function markdownDentist(slug: string) {
  const doctor = await getDoctorBySlug(slug);

  if (!doctor) {
    return null;
  }

  const clinic = doctor.clinics?.[0];
  const location = [clinic?.area?.name, clinic?.state?.name].filter(Boolean).join(', ');

  return joinSections([
    `# ${doctor.name}`,
    `> Learn more about ${doctor.name}, a dentist based in ${location || 'Malaysia'}. View clinic location and contact details.`,
    [
      doctor.specialty ? `- Specialty: ${doctor.specialty}` : null,
      doctor.qualification ? `- Qualification: ${doctor.qualification}` : null,
    ]
      .filter(Boolean)
      .join('\n') || null,
    htmlToText(doctor.bio) ? joinSections(['## About', htmlToText(doctor.bio)]) : null,
    doctor.clinics?.length
      ? joinSections([
          '## Clinics',
          doctor.clinics
            .filter((item) => item?.slug && item.name)
            .map((item) => {
              const note = [item.area?.name, item.state?.name, item.phone]
                .filter(Boolean)
                .join(' · ');
              return listItem(item.name, mdUrl(`/place/${item.slug}`), note || undefined);
            })
            .join('\n'),
        ])
      : null,
    `HTML version: ${absoluteUrl(`/dentist/${slug}`)}`,
  ]);
}

export async function markdownServicesIndex() {
  const services = await getAllServices();

  return joinSections([
    '# Dental services in Malaysia',
    '> Find dental clinics by treatment — from general dentistry to cosmetic care, braces, and emergency visits.',
    services
      .map((service) =>
        listItem(
          service.name,
          mdUrl(`/services/${service.slug}`),
          htmlToText(service.description) || undefined,
        ),
      )
      .join('\n'),
  ]);
}
