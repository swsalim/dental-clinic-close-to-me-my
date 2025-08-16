'use client';

import * as React from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import useScroll from '@/lib/hooks/use-scroll';
import { cn } from '@/lib/utils';

import { buttonVariants } from '@/components/ui/button';
import Container from '@/components/ui/container';
import Logo from '@/components/ui/logo';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';

const ListItem = React.forwardRef<
  React.ElementRef<'a'>,
  React.ComponentPropsWithoutRef<'a'> & {
    title: string;
    logo?: string;
    isExternal?: boolean;
  }
>(({ className, title, children, logo, isExternal, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:border-transparent hover:bg-blue-50 hover:text-blue-600 focus:border-transparent focus:bg-blue-50 focus:text-blue-600',
            className,
          )}
          target={isExternal ? '_blank' : '_self'}
          rel={isExternal ? 'noopener noreferrer' : undefined}
          {...props}>
          {!logo && <div className="text-sm font-medium leading-none">{title}</div>}
          {logo && (
            <div className="flex flex-row gap-2 text-sm font-medium leading-none">
              <Image
                src={`https://flagcdn.com/${logo.toLowerCase()}.svg`}
                alt={`${logo} flag`}
                width={24}
                height={18}
                className="rounded"
              />
              {title}
            </div>
          )}
          <p className="line-clamp-2 text-sm leading-snug text-gray-500">{children}</p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = 'ListItem';

export const navItems: {
  name: string;
  href?: string;
  segments?: string[];
  childItems?: {
    title: string;
    href: string;
    description?: string;
    isExternal?: boolean;
    icon?: React.ElementType;
    iconClassName?: string;
    logo?: string;
  }[];
}[] = [
  {
    name: 'Browse Location',
    href: '/browse',
  },
  {
    name: 'Dentists',
    href: '/dentists',
  },
];

export default function Navbar() {
  const scrolled = useScroll(50);
  const pathname = usePathname();

  return (
    <>
      <div
        className={`sticky top-[-1px] w-full ${
          scrolled
            ? 'border-b border-gray-200 bg-white/50 backdrop-blur-xl dark:border-gray-700 dark:bg-gray-900/50'
            : 'bg-white/0'
        } z-40 transition-all`}>
        <Container className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-x-2 text-xl hover:border-transparent">
            <Logo className="h-8 w-auto fill-blue-500" />
          </Link>
          <NavigationMenu className="hidden lg:block">
            <NavigationMenuList>
              {navItems.map(({ name, href, segments, childItems }) => {
                const isActive = segments?.some((segment) => pathname?.startsWith(segment));

                return (
                  <NavigationMenuItem key={name}>
                    <>
                      {href && (
                        <NavigationMenuLink
                          className={cn(
                            'font-regular focus:bg-blue-50/hover:bg-blue-50 data-[active=true]:bg-blue-50/hover:bg-blue-50 data-[state=open]:bg-blue-50/hover:bg-blue-50 data-[active=true]:focus:bg-blue-50/hover:bg-blue-50 group inline-flex h-10 w-max items-center justify-center rounded-md bg-white px-4 py-2 text-base text-gray-700 transition-colors hover:border-transparent hover:bg-blue-50 hover:text-blue-600 focus:text-blue-600 focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active=true]:text-blue-600 data-[state=open]:text-blue-600 data-[active=true]:hover:bg-blue-50 data-[state=open]:hover:bg-blue-50 data-[state=open]:focus:bg-blue-50 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-300',
                          )}
                          asChild>
                          <Link href={href}>{name}</Link>
                        </NavigationMenuLink>
                      )}
                      {!href && (
                        <>
                          <NavigationMenuTrigger data-active={isActive}>
                            {name}
                          </NavigationMenuTrigger>
                          <NavigationMenuContent>
                            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                              {childItems?.map((item) => {
                                return (
                                  <ListItem
                                    key={item.title}
                                    title={item.title}
                                    href={item.href}
                                    logo={item.logo}
                                    isExternal={item.isExternal}
                                    data-active={pathname === item.href}
                                    className={cn(
                                      pathname === item.href && 'bg-blue-50 text-blue-600',
                                    )}>
                                    {item.description}
                                  </ListItem>
                                );
                              })}
                            </ul>
                          </NavigationMenuContent>
                        </>
                      )}
                    </>
                  </NavigationMenuItem>
                );
              })}
              <NavigationMenuItem>
                <Link
                  href="https://www.buymeacoffee.com/yuyu"
                  target="_blank"
                  className={cn(buttonVariants({ variant: 'secondary' }))}>
                  Support ❤️
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          {/* Hide as we only have 2 items in the menu */}
          {/* <div className="hidden w-[180] md:block"></div> */}
        </Container>
      </div>
    </>
  );
}
