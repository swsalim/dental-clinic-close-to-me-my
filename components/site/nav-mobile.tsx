'use client';

import { ElementType, useEffect, useState } from 'react';

import Link from 'next/link';

import { ChevronDown, Menu, X } from 'lucide-react';

import { cn } from '@/lib/utils';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

import { navItems } from './navbar';

export default function NavMobile() {
  const [open, setOpen] = useState(false);
  // prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [open]);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'fixed right-3 top-3 isolate z-50 rounded-full p-2 transition-colors duration-200 hover:bg-gray-50 focus:outline-none active:bg-gray-100 lg:hidden',
        )}>
        {open ? (
          <X className="h-5 w-5 text-gray-600" />
        ) : (
          <Menu className="h-5 w-5 text-gray-600" />
        )}
      </button>
      <nav
        className={cn(
          'fixed inset-0 z-30 hidden max-h-screen w-full overflow-y-auto bg-white px-5 py-16 lg:hidden',
          open && 'block',
        )}>
        <ul className="grid divide-y divide-gray-100">
          {navItems.map(({ name, href, childItems }, idx) => (
            <MobileNavItem
              key={idx}
              name={name}
              href={href}
              childItems={childItems}
              setOpen={setOpen}
            />
          ))}
        </ul>
      </nav>
    </div>
  );
}

const MobileNavItem = ({
  name,
  href,
  childItems,
  setOpen,
}: {
  name: string;
  href?: string;
  childItems?: {
    title: string;
    description?: string;
    isExternal?: boolean;
    href: string;
    icon?: ElementType;
    iconClassName?: string;
  }[];
  setOpen: (open: boolean) => void;
}) => {
  const [expanded, setExpanded] = useState(false);

  if (childItems && childItems.length > 0) {
    return (
      <li className="py-3">
        <Collapsible open={expanded} onOpenChange={setExpanded}>
          <CollapsibleTrigger className="flex w-full items-center justify-between">
            <p className="font-semibold">{name}</p>
            <ChevronDown
              className={cn('h-5 w-5 text-gray-500 transition-all', expanded && 'rotate-180')}
            />
          </CollapsibleTrigger>
          <CollapsibleContent
            className={cn(
              'duration overflow-hidden transition-all ease-in-out',
              'data-[state=closed]:animate-slide-up',
              'data-[state=open]:animate-slide-down',
            )}>
            <div className="grid gap-4 overflow-hidden py-4">
              {childItems.map(({ title, href, icon: Icon, description }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="flex w-full gap-3">
                  {Icon && (
                    <div className="flex size-10 items-center justify-center rounded-lg border border-gray-200 bg-gradient-to-t from-gray-100">
                      <Icon className="size-5 text-gray-700" />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-medium text-gray-900">{title}</h2>
                    </div>
                    <p className="text-sm text-gray-500">{description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </li>
    );
  }

  if (!href) {
    return null;
  }

  return (
    <li className="py-3">
      <Link
        href={href}
        onClick={() => setOpen(false)}
        className="flex w-full font-semibold capitalize">
        {name}
      </Link>
    </li>
  );
};
