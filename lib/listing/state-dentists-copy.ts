export function stateDentistsCopy(totalDoctors: number, stateName: string) {
  if (totalDoctors > 0) {
    return {
      index: true,
      title: `Top ${totalDoctors} Dentists in ${stateName}`,
      description: `Discover ${totalDoctors} dentists in ${stateName}. Browse by city or clinic to find a dentist near you. Information includes clinic locations and contact details.`,
    };
  }

  return {
    index: false,
    title: `Dentists in ${stateName}`,
    description: `Browse dentists in ${stateName}. Find a dentist by city or clinic. Information includes clinic locations and contact details.`,
  };
}
