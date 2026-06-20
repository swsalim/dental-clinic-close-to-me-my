'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { HospitalIcon } from 'lucide-react';

import useScroll from '@/lib/hooks/use-scroll';
import { cn } from '@/lib/utils';

import Container from '@/components/ui/container';
import Logo from '@/components/ui/logo';

import { advertiseNavItem, isNavItemActive, primaryNavItems } from './site-links';

export { primaryNavItems as navItems } from './site-links';

export default function Navbar() {
  const scrolled = useScroll(50);
  const pathname = usePathname();

  return (
    <header
      className={cn(
        'sticky top-0 z-10 w-full border-b border-transparent bg-white/90 backdrop-blur-md transition-[border-color,background-color] duration-150 dark:bg-gray-900/90',
        scrolled && 'border-gray-200 dark:border-gray-800',
      )}>
      <Container className="pb-0 pt-4 lg:pt-5">
        <div className="flex min-w-0 items-center justify-between gap-4 pb-3 lg:pb-4">
          <Link
            href="/"
            className="group inline-flex min-w-0 items-center gap-3 hover:border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
            aria-label="Dental Clinics Malaysia home">
            <Logo className="h-8 w-auto shrink-0 fill-blue-500 transition-transform duration-150 group-active:scale-[0.98]" />
            <span className="hidden min-w-0 sm:inline">
              <span className="block truncate font-display text-lg leading-tight text-gray-900 dark:text-gray-50">
                Dental Clinics
              </span>
              <span className="block truncate text-xs font-medium uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">
                Malaysia
              </span>
            </span>
          </Link>

          <nav className="hidden min-w-0 items-center gap-1 lg:flex" aria-label="Primary">
            <ul className="flex min-w-0 items-center gap-0.5">
              {primaryNavItems.map((item) => {
                const active = isNavItemActive(pathname, item);

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      prefetch={false}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'inline-flex h-11 min-w-[4.5rem] items-center justify-center rounded-md px-3.5 text-sm font-medium text-gray-700 transition-colors duration-150 hover:border-transparent hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 active:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:focus-visible:ring-offset-gray-900 dark:active:bg-gray-700',
                        active && 'dark:bg-blue-950/40 bg-blue-50 text-blue-700 dark:text-blue-300',
                      )}>
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <Link
              href={advertiseNavItem.href}
              prefetch={false}
              aria-current={isNavItemActive(pathname, advertiseNavItem) ? 'page' : undefined}
              className={cn(
                'ml-2 inline-flex h-11 shrink-0 items-center justify-center rounded-full border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-900 transition-colors duration-150 hover:border-gray-400 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 active:translate-y-px dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:hover:border-gray-500 dark:hover:bg-gray-800 dark:focus-visible:ring-offset-gray-900',
                isNavItemActive(pathname, advertiseNavItem) &&
                  'dark:bg-blue-950/40 border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-700 dark:text-blue-200',
              )}>
              Advertise
            </Link>
          </nav>
        </div>

        <div
          className="hidden border-t border-gray-900 lg:block dark:border-gray-100"
          aria-hidden="true">
          <div className="border-t border-gray-900 dark:border-gray-100" />
        </div>
      </Container>
    </header>
  );
}
