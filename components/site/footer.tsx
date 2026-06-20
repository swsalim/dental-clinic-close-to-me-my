import Link from 'next/link';

import { seo } from '@/config/next-seo.config';

import Logo from '../ui/logo';

import { footerLinkGroups } from './site-links';

function FooterCopyright() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="border-t border-gray-800 px-6 py-6">
      <p className="text-sm leading-relaxed text-gray-400">
        <span>&copy; {currentYear} {seo.site_name}.</span>{' '}
        <span>
          Built by{' '}
          <a
            href="https://www.yuurrific.com?ref=dentalclinicclosetome.my"
            className="font-medium text-gray-300 underline decoration-gray-600 underline-offset-4 transition-colors duration-150 hover:text-white hover:decoration-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
            target="_blank"
            rel="noopener noreferrer">
            Yuurrific
          </a>
          .
        </span>{' '}
        <span>
          Privacy-friendly analytics by{' '}
          <a
            href="https://go.yuurrific.com/seline"
            className="font-medium text-gray-300 underline decoration-gray-600 underline-offset-4 transition-colors duration-150 hover:text-white hover:decoration-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
            target="_blank"
            rel="noopener noreferrer">
            Seline
          </a>
          .
        </span>
      </p>
    </div>
  );
}

function FooterBadges() {
  return (
    <div className="flex flex-row flex-wrap items-center justify-start gap-6 px-6 pb-8">
      <a
        href="https://productburst.com/product/dental-clinics-malaysia"
        target="_blank"
        rel="noopener noreferrer"
        className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900">
        <img
          src="https://3188a5210b07f4ad511bbcdc967bc67b.cdn.bubble.io/f1747782156422x193143061268857820/pB-Badge-dark.png"
          alt="Featured on ProductBurst"
          width="147"
          height="34"
        />
      </a>
      <a
        href="https://fazier.com/launches/www.dentalclinicclosetome.my"
        target="_blank"
        rel="noopener noreferrer"
        className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900">
        <img
          src="https://fazier.com/api/v1//public/badges/launch_badges.svg?badge_type=featured&theme=neutral"
          width="170"
          height="34"
          alt="Fazier badge"
        />
      </a>
      <a
        href="https://turbo0.com/item/dental-clinics-malaysia"
        target="_blank"
        rel="noopener noreferrer"
        className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900">
        <img
          src="https://img.turbo0.com/badge-listed-light.svg"
          alt="Listed on Turbo0"
          height="34"
          width="101"
        />
      </a>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-gray-950" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>

      <div className="mx-auto max-w-7xl px-6 pb-8 pt-10">
        <div className="grid min-w-0 gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.6fr)] lg:gap-16">
          <div className="min-w-0 space-y-4">
            <Link
              href="/"
              className="inline-flex items-center gap-3 hover:border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950"
              prefetch={false}
              aria-label="Home">
              <Logo className="relative h-9 w-9 shrink-0" />
              <span>
                <span className="font-display block text-lg leading-tight text-gray-100">
                  Dental Clinics Malaysia
                </span>
                <span className="block text-sm text-gray-400">
                  Find trusted care near you
                </span>
              </span>
            </Link>
            <p className="max-w-sm text-sm leading-6 text-gray-400">
              Explore top-rated dental clinics across Malaysia. Search by location,
              compare services, and book with confidence.
            </p>
          </div>

          <nav
            className="grid min-w-0 grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-6"
            aria-label="Footer">
            {footerLinkGroups.map((group) => (
              <div key={group.title} className="min-w-0">
                <h3 className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-gray-500">
                  {group.title}
                </h3>
                <ul className="mt-4 space-y-3">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      {link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-11 items-center text-sm text-gray-300 transition-colors duration-150 hover:border-transparent hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950">
                          {link.label}
                          <span className="sr-only"> (opens in new tab)</span>
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          prefetch={false}
                          className="inline-flex min-h-11 items-center text-sm text-gray-300 transition-colors duration-150 hover:border-transparent hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950">
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
      </div>

      <FooterBadges />

      <div className="mx-auto max-w-7xl">
        <FooterCopyright />
      </div>
    </footer>
  );
}
