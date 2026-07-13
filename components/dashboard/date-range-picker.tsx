'use client';

import * as React from 'react';
import type { DateRange } from 'react-day-picker';

import { format, isSameDay, startOfMonth, startOfToday, subDays } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const PRESETS = [
  {
    label: 'Last 7 days',
    getValue: () => ({ from: subDays(startOfToday(), 6), to: startOfToday() }),
  },
  {
    label: 'Last 30 days',
    getValue: () => ({ from: subDays(startOfToday(), 29), to: startOfToday() }),
  },
  {
    label: 'Last 90 days',
    getValue: () => ({ from: subDays(startOfToday(), 89), to: startOfToday() }),
  },
  {
    label: 'This month',
    getValue: () => ({ from: startOfMonth(startOfToday()), to: startOfToday() }),
  },
] as const;

function isSameRange(a: DateRange | undefined, b: DateRange | undefined) {
  if (!a?.from || !a?.to || !b?.from || !b?.to) return false;
  return isSameDay(a.from, b.from) && isSameDay(a.to, b.to);
}

function formatRangeLabel(range: DateRange | undefined) {
  if (!range?.from) return 'Pick a date range';
  if (!range.to) return format(range.from, 'LLL dd, y');

  const preset = PRESETS.find((p) => isSameRange(range, p.getValue()));
  if (preset) return preset.label;

  if (isSameDay(range.from, range.to)) {
    return format(range.from, 'LLL dd, y');
  }

  return `${format(range.from, 'LLL dd, y')} – ${format(range.to, 'LLL dd, y')}`;
}

export function getDateRangeLabel(range: DateRange | undefined) {
  return formatRangeLabel(range);
}

interface DatePickerWithRangeProps {
  className?: string;
  value?: DateRange;
  onChange?: (date: DateRange | undefined) => void;
  disabled?: boolean;
}

export const DatePickerWithRange: React.FC<DatePickerWithRangeProps> = ({
  className,
  value,
  onChange,
  disabled = false,
}) => {
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<DateRange | undefined>(value);

  React.useEffect(() => {
    if (open) {
      setDraft(value);
    }
  }, [open, value]);

  const applyRange = (range: DateRange | undefined) => {
    if (!range?.from || !range?.to) return;
    onChange?.(range);
    setOpen(false);
  };

  const handlePreset = (preset: (typeof PRESETS)[number]) => {
    const range = preset.getValue();
    setDraft(range);
    applyRange(range);
  };

  const handleApply = () => {
    applyRange(draft);
  };

  const handleClear = () => {
    setDraft(undefined);
    onChange?.(undefined);
    setOpen(false);
  };

  const canApply = Boolean(draft?.from && draft?.to);
  const activePreset = PRESETS.find((preset) => isSameRange(value, preset.getValue()));

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            disabled={disabled}
            className={cn(
              'h-10 w-full justify-start text-left font-normal sm:w-[320px]',
              !value?.from && 'text-gray-500 dark:text-gray-400',
            )}>
            <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
            <span className="truncate">{formatRangeLabel(value)}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex flex-col sm:flex-row">
            <div className="flex flex-row gap-1 overflow-x-auto border-b border-gray-200 p-3 sm:w-40 sm:flex-col sm:gap-1 sm:overflow-visible sm:border-b-0 sm:border-r dark:border-gray-700">
              {PRESETS.map((preset) => (
                <Button
                  key={preset.label}
                  type="button"
                  variant={activePreset?.label === preset.label ? 'secondary' : 'ghost'}
                  className="h-8 shrink-0 justify-start px-2 text-sm font-normal"
                  onClick={() => handlePreset(preset)}>
                  {preset.label}
                </Button>
              ))}
            </div>

            <div className="flex flex-col">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={draft?.from ?? value?.from}
                selected={draft}
                onSelect={setDraft}
                numberOfMonths={2}
                disabled={{ after: startOfToday() }}
              />

              <div className="flex items-center justify-between gap-2 border-t border-gray-200 px-3 py-3 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {draft?.from && draft?.to
                    ? `${format(draft.from, 'MMM d, y')} – ${format(draft.to, 'MMM d, y')}`
                    : draft?.from
                      ? 'Select an end date'
                      : 'Select a start date'}
                </p>
                <div className="flex gap-2">
                  <Button type="button" variant="ghost" className="h-8 px-3 text-xs" onClick={handleClear}>
                    Clear
                  </Button>
                  <Button type="button" className="h-8 px-3 text-xs" disabled={!canApply} onClick={handleApply}>
                    Apply
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
