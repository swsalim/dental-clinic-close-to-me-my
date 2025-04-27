import Link from 'next/link';

import { seo } from '@/config/next-seo.config';
import { navBlog, navCategories, navSpecialities, navTools } from '@/config/routes';

import Logo from '@/components/ui/logo';

interface NavigationItem {
  title: string;
  href: string;
  isExternal?: boolean;
}

interface NavigationSection {
  title: string;
  items: NavigationItem[];
  href?: string;
  isExternal?: boolean;
}

function FooterLink({
  href,
  children,
  isExternal = false,
}: {
  href: string;
  children: React.ReactNode;
  isExternal?: boolean;
}) {
  return (
    <Link
      href={href}
      className="leading-6 text-gray-300 transition-colors duration-200 hover:text-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-50/50 focus:ring-offset-2 focus:ring-offset-gray-900"
      prefetch={false}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}>
      {children}
    </Link>
  );
}

function NavigationSection({
  section,
  isExternal = false,
}: {
  section: NavigationSection;
  isExternal?: boolean;
}) {
  return (
    <div>
      {section.href ? (
        <Link
          href={section.href}
          className="font-semibold leading-6 text-gray-100 hover:text-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-50/50 focus:ring-offset-2 focus:ring-offset-gray-900"
          prefetch={false}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noopener noreferrer' : undefined}>
          {section.title}
        </Link>
      ) : (
        <h3 className="font-semibold leading-6 text-gray-100">{section.title}</h3>
      )}
      <ul role="list" className="mt-6 space-y-4">
        {section.items.map((item) => (
          <li key={item.title}>
            <FooterLink href={item.href} isExternal={item.isExternal}>
              {item.title}
            </FooterLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FooterLogo() {
  return (
    <Link
      href="/"
      className="inline-block focus:outline-none focus:ring-2 focus:ring-gray-100 focus:ring-offset-2 focus:ring-offset-gray-900"
      prefetch={false}
      aria-label="Home">
      <Logo className="relative h-8 w-8 sm:h-10 sm:w-10" />
    </Link>
  );
}

function FooterCopyright() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="mt-16 border-t border-gray-100/10 pt-8 sm:mt-20 lg:mt-24">
      <p className="text-sm leading-5 text-gray-100">
        &copy; {currentYear} {seo.site_name}.
        <span className="ml-2 mt-0 inline-block text-gray-100">
          Built by{' '}
          <a
            href="https://www.yuurrific.com"
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
  );
}

export default function Footer() {
  return (
    <footer className="bg-gray-900" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="mx-auto max-w-7xl px-6 pb-8 pt-16 sm:pt-24 lg:px-8 lg:pt-32">
        <div className="lg:gap-8 xl:grid xl:grid-cols-3 xl:gap-16">
          <div className="space-y-8">
            <FooterLogo />
            <p className="text-base leading-6 text-gray-300">
              Navigating Health with Precision: Your Ultimate Healthcare Directory and Knowledge
              Hub.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <NavigationSection section={navCategories} />
              <div className="mt-10 md:mt-0">
                <NavigationSection section={navSpecialities} />
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <NavigationSection section={navBlog} />
              <div className="mt-10 md:mt-0">
                <NavigationSection section={navTools} />
              </div>
            </div>
          </div>
        </div>
        <FooterCopyright />
      </div>
    </footer>
  );
}
