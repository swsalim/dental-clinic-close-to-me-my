/** Homepage document title. The root layout default uses this string as-is. */
export const HOME_TITLE = 'Dental Clinics Near You in Malaysia';

export const HOME_DESCRIPTION_FALLBACK =
  'Find dental clinics near you in Malaysia. Compare opening hours, services and contact details.';

/** Description from the existing homepage directory counts. No booking claim. */
export function homeMetaDescription(clinicCount: number, stateCount: number): string {
  if (clinicCount > 0 && stateCount > 0) {
    const clinics = clinicCount.toLocaleString('en-MY');
    const states = stateCount.toLocaleString('en-MY');
    return `Find dental clinics near you in Malaysia. ${clinics} active clinics across ${states} states, with opening hours and contact details.`;
  }
  return HOME_DESCRIPTION_FALLBACK;
}
