import { seo } from '@/config/next-seo.config';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="mx-auto max-w-7xl px-6 pt-8">
        <div className="flex flex-row flex-wrap items-center justify-start gap-6">
          <div>
            <a
              href="https://productburst.com/product/dental-clinics-malaysia"
              target="_blank"
              rel="noopener noreferrer">
              <img
                src="https://3188a5210b07f4ad511bbcdc967bc67b.cdn.bubble.io/f1747782156422x193143061268857820/pB-Badge-dark.png"
                alt="Featured on ProductBurst"
                width="147"
                height="34"
              />
            </a>
          </div>
          <div>
            <a href="https://fazier.com/launches/www.dentalclinicclosetome.my" target="_blank">
              <img
                src="https://fazier.com/api/v1//public/badges/launch_badges.svg?badge_type=featured&theme=neutral"
                width="170"
                height="34"
                alt="Fazier badge"
              />
            </a>
          </div>
          <div>
            <a href="https://liiinks.net" target="_blank">
              <svg width="102" height="34" viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg">
                <rect width="120" height="40" rx="8" fill="#667eea" />
                <text
                  x="60"
                  y="25"
                  font-family="Arial, sans-serif"
                  font-size="12"
                  fill="white"
                  text-anchor="middle">
                  Liiinks
                </text>
              </svg>
            </a>
          </div>
          <div>
            <a href="https://theindiewall.net" target="_blank">
              <img
                src="https://theindiewall.net/indiewall.svg"
                alt="IndieWall"
                width="68"
                height="34"
              />
            </a>
          </div>
          <div>
            <a
              href="https://turbo0.com/item/dental-clinics-malaysia"
              target="_blank"
              rel="noopener noreferrer">
              <img
                src="https://img.turbo0.com/badge-listed-light.svg"
                alt="Listed on Turbo0"
                height="34"
                width="101"
              />
            </a>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-6 py-8">
        <p className="text-sm leading-5 text-gray-100">
          &copy; {currentYear} {seo.site_name}.
          <span className="ml-2 mt-0 inline-block text-gray-100">
            Built by{' '}
            <a
              href="https://www.yuurrific.com?ref=dentalclinicclosetome.my"
              className="inline-block font-medium underline underline-offset-4 transition-colors duration-200 hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-100 focus:ring-offset-2 focus:ring-offset-gray-900"
              target="_blank"
              rel="noopener noreferrer">
              Yuurrific
            </a>
            .
          </span>
          <span className="mt-2 block text-gray-100 md:ml-2 md:mt-0 md:inline-block">
            Privacy-friendly analytics by{' '}
            <a
              href="https://go.yuurrific.com/simpleanalytics"
              className="inline-block rotate-0 rounded-md bg-blue-600 px-2 py-1 text-gray-100 transition duration-100 ease-out hover:-rotate-3 hover:bg-blue-700 hover:ease-in focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              target="_blank"
              rel="noopener noreferrer">
              SimpleAnalytics
            </a>
          </span>
        </p>
      </div>
    </footer>
  );
}
