'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Menu, X } from 'lucide-react';

import { cn } from '@/lib/utils';

import { advertiseNavItem, isNavItemActive, primaryNavItems } from './site-links';

const mobileNavItems = [...primaryNavItems, advertiseNavItem];

export default function NavMobile() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls="mobile-primary-nav"
        aria-label={open ? 'Close menu' : 'Open menu'}
        className={cn(
          'fixed right-3 top-3 z-50 inline-flex size-11 items-center justify-center rounded-full border border-gray-200 bg-white/95 text-gray-700 shadow-sm backdrop-blur transition-colors duration-150 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 active:bg-gray-100 dark:border-gray-700 dark:bg-gray-900/95 dark:text-gray-200 dark:hover:bg-gray-800 dark:focus-visible:ring-offset-gray-900 dark:active:bg-gray-700',
        )}>
        {open ? (
          <X className="size-5" aria-hidden="true" />
        ) : (
          <Menu className="size-5" aria-hidden="true" />
        )}
      </button>

      {open ? (
        <button
          type="button"
          aria-label="Close menu overlay"
          className="fixed inset-0 z-30 bg-gray-900/20 backdrop-blur-[1px] dark:bg-black/40"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <nav
        id="mobile-primary-nav"
        className={cn(
          'fixed inset-x-0 top-0 z-40 hidden max-h-[calc(100dvh-6.5rem)] overflow-y-auto border-b border-gray-200 bg-white px-5 py-4 shadow-lg dark:border-gray-800 dark:bg-gray-900',
          open && 'block',
        )}>
        <ul className="divide-y divide-gray-100 dark:divide-gray-800">
          {mobileNavItems.map((item) => {
            const active = isNavItemActive(pathname, item);
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  prefetch={false}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex min-h-11 items-center gap-3 py-3 transition-colors duration-150 hover:border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900',
                    active
                      ? 'text-blue-700 dark:text-blue-300'
                      : 'text-gray-900 dark:text-gray-100',
                  )}>
                  {Icon ? (
                    <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                  ) : null}
                  <span className="min-w-0">
                    <span className="block font-medium">{item.name}</span>
                    {item.description ? (
                      <span className="block text-sm text-gray-500 dark:text-gray-400">
                        {item.description}
                      </span>
                    ) : null}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
