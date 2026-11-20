export const NOFOLLOW_OUTBOUND_REL = 'nofollow noopener noreferrer' as const;
export const SPONSORED_OUTBOUND_REL = 'sponsored noopener noreferrer' as const;

export type OutboundRel = typeof NOFOLLOW_OUTBOUND_REL | typeof SPONSORED_OUTBOUND_REL;

/** Paid clinic website and social links use sponsored. Other clinics stay nofollow. */
export function getOutboundRel(isFeatured: boolean): OutboundRel {
  return isFeatured ? SPONSORED_OUTBOUND_REL : NOFOLLOW_OUTBOUND_REL;
}
