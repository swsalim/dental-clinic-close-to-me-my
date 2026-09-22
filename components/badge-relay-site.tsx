/**
 * Drop-in Next.js App Router server component.
 * Copy into your host site (for example `components/BadgeRelaySite.tsx`).
 *
 * Renders real <a><img> nodes in the initial HTML so directory crawlers can
 * verify badges without executing JavaScript.
 */
type PublicBadge = {
  id: string;
  name: string;
  targetUrl: string;
  imageUrl: string;
  alt: string;
  width?: number;
  height?: number;
};

type PublicConfig = {
  schemaVersion: number;
  configVersion: number;
  appearance: {
    layout: 'carousel' | 'row';
    theme: 'auto' | 'light' | 'dark';
    badgeHeight: number;
    gap: number;
    motion?: 'auto' | 'off';
    speed?: 'slow' | 'medium' | 'fast';
    alignment: 'left' | 'center' | 'right';
  };
  showAttribution: boolean;
  badges: PublicBadge[];
};

export type BadgeRelaySiteProps = {
  siteKey: string;
  /** BadgeRelay origin, e.g. https://badgerelay.com or http://localhost:3000 */
  apiBase: string;
  /** ISR / cache seconds. Keep short so publishes appear quickly. */
  revalidateSeconds?: number;
  className?: string;
};

function carouselDuration(speed: PublicConfig['appearance']['speed']): string {
  if (speed === 'fast') return '24s';
  if (speed === 'medium') return '32s';
  return '48s';
}

function BadgeLink({
  badge,
  height,
  clone,
}: {
  badge: PublicBadge;
  height: number;
  clone?: boolean;
}) {
  return (
    <a
      href={badge.targetUrl}
      target="_blank"
      rel={clone ? 'nofollow noopener noreferrer' : 'noopener noreferrer'}
      title={badge.name}
      aria-hidden={clone ? true : undefined}
      tabIndex={clone ? -1 : undefined}
      data-br-clone={clone ? '1' : undefined}
      style={{ display: 'inline-flex', flex: '0 0 auto' }}>
      {/* Host sites may replace with next/image if desired */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={badge.imageUrl}
        alt={clone ? '' : badge.alt || badge.name}
        width={badge.width ?? 120}
        height={badge.height ?? 40}
        loading="lazy"
        decoding="async"
        style={{
          display: 'block',
          height,
          width: 'auto',
          maxWidth: 240,
          objectFit: 'contain',
        }}
      />
    </a>
  );
}

export async function BadgeRelaySite({
  siteKey,
  apiBase,
  revalidateSeconds = 30,
  className,
}: BadgeRelaySiteProps) {
  if (!siteKey.startsWith('site_live_')) {
    return null;
  }

  const endpoint = `${apiBase.replace(/\/$/, '')}/api/public/widgets/${encodeURIComponent(siteKey)}`;
  let config: PublicConfig | null = null;

  try {
    const res = await fetch(endpoint, {
      headers: { Accept: 'application/json' },
      next: { revalidate: revalidateSeconds },
    });
    if (!res.ok) return null;
    config = (await res.json()) as PublicConfig;
  } catch {
    return null;
  }

  if (!config || config.schemaVersion !== 1 || !Array.isArray(config.badges)) {
    return null;
  }

  const badges = config.badges.slice(0, 50);
  const theme = config.appearance.theme || 'auto';
  const layout = config.appearance.layout === 'row' ? 'row' : 'carousel';
  const motionOn =
    layout === 'carousel' && config.appearance.motion !== 'off' && badges.length >= 2;
  const justify =
    config.appearance.alignment === 'left'
      ? 'flex-start'
      : config.appearance.alignment === 'right'
        ? 'flex-end'
        : 'center';
  const muted = theme === 'dark' ? '#a1a1aa' : theme === 'light' ? '#71717a' : undefined;
  const height = config.appearance.badgeHeight;
  const gap = config.appearance.gap;
  const speed = carouselDuration(config.appearance.speed);

  return (
    <div
      data-badgerelay-ssr={siteKey}
      data-br-config-version={config.configVersion}
      data-br-theme={theme}
      data-br-layout={layout}
      data-br-motion={motionOn ? 'on' : 'off'}
      className={className}
      style={{
        width: '100%',
        maxWidth: '100%',
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        fontSize: 14,
        lineHeight: 1.4,
        ['--br-muted' as string]: muted || '#71717a',
        ['--br-gap' as string]: `${gap}px`,
        ['--br-height' as string]: `${height}px`,
        ['--br-speed' as string]: speed,
      }}>
      <style>{`
[data-badgerelay-ssr="${siteKey}"] .br-ssr-shell{display:flex;width:100%}
[data-badgerelay-ssr="${siteKey}"] .br-ssr-cluster{display:flex;flex-direction:column;align-items:flex-start;max-width:100%}
[data-badgerelay-ssr="${siteKey}"][data-br-layout="carousel"] .br-ssr-cluster{width:100%}
[data-badgerelay-ssr="${siteKey}"] .br-ssr-track-wrap{max-width:100%}
[data-badgerelay-ssr="${siteKey}"][data-br-layout="carousel"] .br-ssr-track-wrap{width:100%;overflow:hidden}
[data-badgerelay-ssr="${siteKey}"][data-br-motion="on"] .br-ssr-track-wrap{-webkit-mask-image:linear-gradient(to right,transparent,#000 32px,#000 calc(100% - 32px),transparent);mask-image:linear-gradient(to right,transparent,#000 32px,#000 calc(100% - 32px),transparent)}
[data-badgerelay-ssr="${siteKey}"][data-br-layout="carousel"][data-br-motion="off"] .br-ssr-track-wrap{overflow-x:auto}
[data-badgerelay-ssr="${siteKey}"] .br-ssr-track{display:flex;align-items:center;width:max-content}
[data-badgerelay-ssr="${siteKey}"] .br-ssr-set{display:flex;align-items:center;gap:var(--br-gap);flex:0 0 auto}
[data-badgerelay-ssr="${siteKey}"][data-br-layout="row"] .br-ssr-track,[data-badgerelay-ssr="${siteKey}"][data-br-layout="row"] .br-ssr-set{flex-wrap:wrap;width:auto;max-width:100%}
[data-badgerelay-ssr="${siteKey}"][data-br-motion="on"] .br-ssr-set{padding-right:var(--br-gap)}
[data-badgerelay-ssr="${siteKey}"][data-br-motion="on"] .br-ssr-track{animation:br-ssr-scroll var(--br-speed,48s) linear infinite}
[data-badgerelay-ssr="${siteKey}"][data-br-motion="on"]:hover .br-ssr-track,[data-badgerelay-ssr="${siteKey}"][data-br-motion="on"]:focus-within .br-ssr-track{animation-play-state:paused}
@media (prefers-reduced-motion:reduce){
  [data-badgerelay-ssr="${siteKey}"] .br-ssr-track{animation:none!important}
  [data-badgerelay-ssr="${siteKey}"] .br-ssr-set[aria-hidden="true"]{display:none}
  [data-badgerelay-ssr="${siteKey}"][data-br-motion="on"] .br-ssr-set{padding-right:0}
}
@keyframes br-ssr-scroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}
`}</style>
      {theme === 'auto' ? (
        <style>{`@media (prefers-color-scheme: dark) {[data-badgerelay-ssr="${siteKey}"]{--br-muted:#a1a1aa}}`}</style>
      ) : null}
      <div
        className="br-ssr-shell"
        style={{ justifyContent: layout === 'carousel' ? 'flex-start' : justify }}>
        <div className="br-ssr-cluster">
          <div className="br-ssr-track-wrap">
            <div className="br-ssr-track">
              <div className="br-ssr-set">
                {badges.map((badge) => (
                  <BadgeLink key={badge.id} badge={badge} height={height} />
                ))}
              </div>
              {motionOn ? (
                <div className="br-ssr-set" aria-hidden="true">
                  {badges.map((badge) => (
                    <BadgeLink key={`${badge.id}-clone`} badge={badge} height={height} clone />
                  ))}
                </div>
              ) : null}
            </div>
          </div>
          {config.showAttribution ? (
            <div style={{ marginTop: 8 }}>
              <a
                href={`${apiBase.replace(/\/$/, '')}/?utm_source=widget&utm_medium=powered_by&utm_campaign=free_site`}
                target="_blank"
                rel="nofollow noopener"
                style={{
                  color: 'var(--br-muted)',
                  textDecoration: 'underline',
                  textUnderlineOffset: 2,
                  fontSize: 14,
                }}>
                Powered by BadgeRelay
              </a>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
