'use client';

import * as React from 'react';
import { DayButton, DayPicker, getDefaultClassNames } from 'react-day-picker';

import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

import { Button, buttonVariants } from '@/components/ui/button';

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = 'label',
  buttonVariant = 'ghost',
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>['variant'];
}) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        'group/calendar bg-white p-3 dark:bg-gray-900 dark:text-gray-400 [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent',
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className,
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) => date.toLocaleString('default', { month: 'short' }),
        ...formatters,
      }}
      classNames={{
        root: cn('w-fit', defaultClassNames.root),
        months: cn('relative flex flex-col gap-4 md:flex-row', defaultClassNames.months),
        month: cn('flex w-full flex-col gap-4', defaultClassNames.month),
        nav: cn(
          'absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1',
          defaultClassNames.nav,
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          'size-8 select-none p-0 aria-disabled:opacity-50',
          defaultClassNames.button_previous,
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          'size-8 select-none p-0 aria-disabled:opacity-50',
          defaultClassNames.button_next,
        ),
        month_caption: cn(
          'flex h-8 w-full items-center justify-center px-8',
          defaultClassNames.month_caption,
        ),
        dropdowns: cn(
          'flex h-8 w-full items-center justify-center gap-1.5 text-sm font-medium',
          defaultClassNames.dropdowns,
        ),
        dropdown_root: cn(
          'has-focus:border-ring shadow-xs has-focus:ring-ring/50 has-focus:ring-[3px] relative rounded-md border border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900',
          defaultClassNames.dropdown_root,
        ),
        dropdown: cn('absolute inset-0 opacity-0', defaultClassNames.dropdown),
        caption_label: cn(
          'select-none font-medium text-gray-700 dark:text-gray-400',
          captionLayout === 'label'
            ? 'text-sm'
            : 'flex h-8 items-center gap-1 rounded-md pl-2 pr-1 text-sm [&>svg]:size-3.5 [&>svg]:text-gray-500 dark:[&>svg]:text-gray-400',
          defaultClassNames.caption_label,
        ),
        table: 'w-full border-collapse',
        weekdays: cn('flex', defaultClassNames.weekdays),
        weekday: cn(
          'flex-1 select-none rounded-md text-[0.8rem] font-normal text-gray-500 dark:text-gray-400',
          defaultClassNames.weekday,
        ),
        week: cn('mt-2 flex w-full', defaultClassNames.week),
        week_number_header: cn('w-8 select-none', defaultClassNames.week_number_header),
        week_number: cn(
          'select-none text-[0.8rem] text-gray-500 dark:text-gray-400',
          defaultClassNames.week_number,
        ),
        day: cn(
          'group/day relative aspect-square h-full w-full select-none p-0 text-center [&:first-child[data-selected=true]_button]:rounded-l-md [&:last-child[data-selected=true]_button]:rounded-r-md',
          defaultClassNames.day,
        ),
        range_start: cn('rounded-l-md bg-gray-100 dark:bg-gray-800', defaultClassNames.range_start),
        range_middle: cn(
          'rounded-none bg-gray-100 dark:bg-gray-800',
          defaultClassNames.range_middle,
        ),
        range_end: cn('rounded-r-md bg-gray-100 dark:bg-gray-800', defaultClassNames.range_end),
        today: cn(
          'rounded-md bg-gray-100 text-gray-700 data-[selected=true]:rounded-none dark:bg-gray-700 dark:text-gray-300',
          defaultClassNames.today,
        ),
        outside: cn(
          'text-gray-500 aria-selected:text-gray-500 dark:text-gray-500 dark:aria-selected:text-gray-500',
          defaultClassNames.outside,
        ),
        disabled: cn('text-gray-500 opacity-50 dark:text-gray-500', defaultClassNames.disabled),
        hidden: cn('invisible', defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return <div data-slot="calendar" ref={rootRef} className={cn(className)} {...props} />;
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === 'left') {
            return <ChevronLeftIcon className={cn('size-4', className)} {...props} />;
          }

          if (orientation === 'right') {
            return <ChevronRightIcon className={cn('size-4', className)} {...props} />;
          }

          return <ChevronDownIcon className={cn('size-4', className)} {...props} />;
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-8 items-center justify-center text-center">{children}</div>
            </td>
          );
        },
        ...components,
      }}
      {...props}
    />
  );
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames();

  const ref = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        'group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-ring/50 flex aspect-square size-auto w-full min-w-8 flex-col gap-1 font-normal leading-none hover:text-gray-700 data-[range-end=true]:rounded-md data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-md data-[range-end=true]:rounded-r-md data-[range-start=true]:rounded-l-md data-[range-end=true]:bg-gray-700 data-[range-middle=true]:bg-gray-100 data-[range-start=true]:bg-gray-700 data-[selected-single=true]:bg-gray-700 data-[range-end=true]:text-gray-100 data-[range-middle=true]:text-gray-700 data-[range-start=true]:text-gray-100 data-[selected-single=true]:text-gray-100 group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px] dark:hover:text-gray-300 dark:data-[range-end=true]:bg-gray-600 dark:data-[range-middle=true]:bg-gray-800 dark:data-[range-start=true]:bg-gray-600 dark:data-[selected-single=true]:bg-gray-600 dark:data-[range-end=true]:text-gray-100 dark:data-[range-middle=true]:text-gray-300 dark:data-[range-start=true]:text-gray-100 dark:data-[selected-single=true]:text-gray-100 [&>span]:text-xs [&>span]:opacity-70',
        defaultClassNames.day,
        className,
      )}
      {...props}
    />
  );
}

export { Calendar, CalendarDayButton };
