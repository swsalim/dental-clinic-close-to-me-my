'use client';

import type { Control, UseFormGetValues, UseFormSetValue } from 'react-hook-form';

import { XIcon } from 'lucide-react';

import { DAYS_OF_WEEK, type BusinessHours, type DayOfWeek } from '@/lib/listing/business-hours';

import { Checkbox } from '@/components/form-fields/checkbox';
import { Input } from '@/components/form-fields/input';
import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';

type HoursForm = {
  businessHours: BusinessHours;
};

type Props = {
  control: Control<HoursForm>;
  getValues: UseFormGetValues<HoursForm>;
  setValue: UseFormSetValue<HoursForm>;
};

export function BusinessHoursFields({ control, getValues, setValue }: Props) {
  const handleAddShift = (day: DayOfWeek) => {
    const currentShifts = getValues(`businessHours.${day}.shifts`) || [];
    setValue(`businessHours.${day}.shifts`, [
      ...currentShifts,
      { openTime: '09:00', closeTime: '17:00' },
    ]);
  };

  const handleRemoveShift = (day: DayOfWeek, index: number) => {
    const currentShifts = getValues(`businessHours.${day}.shifts`) || [];
    setValue(
      `businessHours.${day}.shifts`,
      currentShifts.filter((_, i) => i !== index),
    );
  };

  const handleCloseDay = (day: DayOfWeek, checked: boolean) => {
    setValue(`businessHours.${day}.isClosed`, checked);
    if (checked) {
      setValue(`businessHours.${day}.shifts`, []);
    } else if ((getValues(`businessHours.${day}.shifts`) || []).length === 0) {
      setValue(`businessHours.${day}.shifts`, [{ openTime: '09:00', closeTime: '17:00' }]);
    }
  };

  const applyShiftsToDays = (days: readonly DayOfWeek[], sourceDay: DayOfWeek) => {
    const source = getValues(`businessHours.${sourceDay}`);
    const shifts =
      source?.isClosed || !source?.shifts?.length
        ? [{ openTime: '09:00', closeTime: '17:00' }]
        : source.shifts;
    days.forEach((day) => {
      setValue(`businessHours.${day}.isClosed`, false);
      setValue(`businessHours.${day}.shifts`, shifts);
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            applyShiftsToDays(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], 'Monday')
          }>
          Copy Monday to weekdays
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => applyShiftsToDays(['Saturday', 'Sunday'], 'Saturday')}>
          Copy Saturday to weekend
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {DAYS_OF_WEEK.map((day) => (
          <div key={day} className="rounded-md border p-4 dark:border-gray-700">
            <div className="mb-2 flex items-center justify-between gap-2">
              <h4 className="font-display font-medium dark:text-gray-50">{day}</h4>
              <div className="flex items-center gap-2">
                <FormField
                  control={control}
                  name={`businessHours.${day}.isClosed`}
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(checked) => handleCloseDay(day, !!checked)}
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">Closed</FormLabel>
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="default"
                  onClick={() => handleAddShift(day)}
                  disabled={getValues(`businessHours.${day}.isClosed`)}>
                  + Add Shift
                </Button>
              </div>
            </div>
            {!getValues(`businessHours.${day}.isClosed`) && (
              <div className="space-y-2">
                {(getValues(`businessHours.${day}.shifts`) || []).map((shift, index) => (
                  <div key={`${day}-${index}-${shift.openTime}`} className="flex items-center gap-2">
                    <div className="grid flex-1 grid-cols-2 gap-2">
                      <FormField
                        control={control}
                        name={`businessHours.${day}.shifts.${index}.openTime`}
                        render={({ field }) => (
                          <Input
                            type="time"
                            value={field.value}
                            onChange={(e) =>
                              setValue(
                                `businessHours.${day}.shifts.${index}.openTime`,
                                e.target.value,
                              )
                            }
                            disabled={getValues(`businessHours.${day}.isClosed`)}
                          />
                        )}
                      />
                      <FormField
                        control={control}
                        name={`businessHours.${day}.shifts.${index}.closeTime`}
                        render={({ field }) => (
                          <Input
                            type="time"
                            value={field.value}
                            onChange={(e) =>
                              setValue(
                                `businessHours.${day}.shifts.${index}.closeTime`,
                                e.target.value,
                              )
                            }
                            disabled={getValues(`businessHours.${day}.isClosed`)}
                          />
                        )}
                      />
                    </div>
                    {(getValues(`businessHours.${day}.shifts`) || []).length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="default"
                        onClick={() => handleRemoveShift(day, index)}>
                        <XIcon className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
