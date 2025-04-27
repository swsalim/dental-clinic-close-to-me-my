export const areaList = {
  north: { name: 'North' },
  east: { name: 'East' },
  west: { name: 'West' },
  central: { name: 'Central' },
  'north-east': { name: 'North-East' },
};

export const townList = {
  'ang-mo-kio': { name: 'Ang Mo Kio' },
  bedok: { name: 'Bedok' },
  bishan: { name: 'Bishan' },
  'bukit-batok': { name: 'Bukit Batok' },
  'bukit-merah': { name: 'Bukit Merah' },
  'bukit-panjang': { name: 'Bukit Panjang' },
  'bukit-timah': { name: 'Bukit Timah' },
  'central-town': { name: 'Central' },
  'choa-chu-kang': { name: 'Choa Chu Kang' },
  clementi: { name: 'Clementi' },
  geylang: { name: 'Geylang' },
  hougang: { name: 'Hougang' },
  'jurong-east': { name: 'Jurong East' },
  'jurong-west': { name: 'Jurong West' },
  'kallang-whampoa': { name: 'Kallang / Whampoa' },
  'marine-parade': { name: 'Marine Parade' },
  'pasir-ris': { name: 'Pasir Ris' },
  punggol: { name: 'Punggol' },
  queenstown: { name: 'Queenstown' },
  sembawang: { name: 'Sembawang' },
  sengkang: { name: 'Sengkang' },
  serangoon: { name: 'Serangoon' },
  tampines: { name: 'Tampines' },
  tengah: { name: 'Tengah' },
  'toa-payoh': { name: 'Toa Payoh' },
  woodlands: { name: 'Woodlands' },
  yishun: { name: 'Yishun' },
};

export const townListArr = Object.entries(townList).map(([slug, { name }]) => ({
  name,
  slug,
}));

// Used in middleware
export const categoryList = {
  '24-hour-clinic': {
    name: '24-Hour Clinic',
    slug: '24-hour-clinic',
    short_label: '24-hr',
    is_active: true,
  },
  'general-practitioner': {
    name: 'General Practitioner',
    slug: 'general-practitioner',
    short_label: 'gp',
    is_active: true,
  },
  'accident-and-emergency': {
    name: 'Accident & Emergency',
    slug: 'accident-and-emergency',
    short_label: 'a&e',
    is_active: true,
  },
  hospital: { name: 'Hospitals', slug: 'hospital', short_label: 'hospital', is_active: true },
  paediatric: {
    name: 'Paediatric',
    slug: 'paediatric',
    short_label: 'paediatric',
    is_active: true,
  },
  aesthetic: { name: 'Aesthetic', slug: 'aesthetic', short_label: 'aesthetic', is_active: true },
  dental: { name: 'Dental', slug: 'dental', short_label: 'dental', is_active: true },
  'womens-health-clinic': {
    name: "Women's Clinic",
    slug: 'womens-health-clinic',
    short_label: "Women's Clinic",
    is_active: true,
  },
  'chinese-physician': {
    name: 'Chinese Physician',
    slug: 'chinese-physician',
    short_label: 'tcm',
    is_active: true,
  },
  chiropractic: {
    name: 'Chiropractic',
    slug: 'chiropractic',
    short_label: 'chiropractic',
    is_active: true,
  },
  physiotherapy: {
    name: 'Physiotherapy',
    slug: 'physiotherapy',
    short_label: 'physio',
    is_active: true,
  },
  psychotherapy: {
    name: 'Psychotherapy',
    slug: 'psychotherapy',
    short_label: 'psychotherapy',
    is_active: true,
  },
};

export const navSpecialities = {
  title: 'Health Professionals',
  items: [
    {
      title: 'General Practitioners',
      href: '/physician/general-practitioner',
    },
    {
      title: 'Paediatrics',
      href: '/physician/paediatric',
    },
    {
      title: 'Dentists',
      href: '/physician/dentist',
    },
    {
      title: 'Chiropractors',
      href: '/physician/chiropractor',
    },
    {
      title: 'View All Proffessionals',
      href: '/physician',
    },
  ],
};

export const navCategories = {
  title: 'Health Providers',
  items: [
    {
      title: '24-Hour Clinic',
      href: '/24-hour-clinic',
    },
    {
      title: 'Accident & Emergency',
      href: '/accident-and-emergency',
    },
    {
      title: 'Aesthetic',
      href: '/aesthetic',
    },
    {
      title: 'Dental',
      href: '/dental',
    },
    {
      title: 'General Practitioner',
      href: '/general-practitioner',
    },
    {
      title: 'Paediatric',
      href: '/paediatric',
    },
    {
      title: 'Hospital',
      href: '/hospital',
    },
    {
      title: "Women's Clinic",
      href: '/womens-health-clinic',
    },
    {
      title: 'TCM',
      href: '/chinese-physician',
    },
    {
      title: 'Chiropractic',
      href: '/chiropractic',
    },
    {
      title: 'Physiotherapy',
      href: '/physiotherapy',
    },
    {
      title: 'Psychotherapy',
      href: '/psychotherapy',
    },
    {
      title: 'View All Providers',
      href: '/browse',
    },
  ],
};

export const navBlog = {
  title: 'Wellness',
  items: [
    {
      title: 'Parenthood',
      href: '/parenthood',
    },
    {
      title: 'Nutrition',
      href: '/nutrition',
    },
    {
      title: 'Health',
      href: '/health',
    },
    {
      title: 'Sleep',
      href: '/sleep',
    },
    {
      title: 'Mental Health',
      href: '/mental-health',
    },
    {
      title: 'Fitness',
      href: '/fitness',
    },
    {
      title: 'View All Tips',
      href: '/blog',
    },
  ],
};

export const navTools = {
  title: 'Other Projects',
  items: [
    {
      title: 'Random Number Generator',
      href: 'https://www.randomnumberapp.com/?ref=clinicgeek.com',
      isExternal: true,
    },
    {
      title: 'Resize Image',
      href: 'https://pfpresizer.com/?ref=clinicgeek.com',
      isExternal: true,
    },
    {
      title: 'Flip Image',
      href: 'https://www.flipanimage.xyz/?ref=clinicgeek.com',
      isExternal: true,
    },
    {
      title: 'Play Unlimited Sudoku',
      href: 'https://sudokuunlimited.com/?ref=clinicgeek.com',
      isExternal: true,
    },
    {
      title: 'RGB to Pantone Converter',
      href: 'https://www.rgbtopantone.com/?ref=clinicgeek.com',
      isExternal: true,
    },
    {
      title: 'Water a Day',
      href: 'https://www.wateraday.com/?ref=clinicgeek.com',
      isExternal: true,
    },
    {
      title: 'Will it rain tomorrow?',
      href: 'https://www.willitraintomorrow.com/?ref=clinicgeek.com',
      isExternal: true,
    },
    {
      title: 'Pantone Color Match Game',
      href: 'https://www.cmyktopantone.com/pantone-color-match?ref=clinicgeek.com',
      isExternal: true,
    },
    {
      title: 'Aesthetic Clinics 🇲🇾',
      href: 'https://www.aestheticclinics.my/?ref=clinicgeek.com',
      isExternal: true,
    },
    {
      title: 'Dental Clinics 🇲🇾',
      href: 'https://www.dentalclinicclosetome.my/?ref=clinicgeek.com',
      isExternal: true,
    },
  ],
};

export const validAreas = Object.keys(areaList);
export const validTowns = Object.keys(townList);
export const validCategories = Object.keys(categoryList);
