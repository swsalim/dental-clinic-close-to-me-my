import * as React from 'react';
import { Controller, ControllerProps, FormProvider, Path, useFormContext } from 'react-hook-form';

import * as LabelPrimitive from '@radix-ui/react-label';
import { Slot } from '@radix-ui/react-slot';

import { cn } from '@/lib/utils';

import { Label } from '@/components/ui/label';

// Type definitions
type FormFieldContextValue = {
  name: string;
};

type FormItemContextValue = {
  id: string;
};

// Create context with proper types
const Form = FormProvider;
const FormFieldContext = React.createContext<FormFieldContextValue | undefined>(undefined);
const FormItemContext = React.createContext<FormItemContextValue | undefined>(undefined);

const FormField = <
  TFieldValues extends Record<string, any> = Record<string, any>,
  TName extends Path<TFieldValues> = Path<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();

  if (!fieldContext) {
    throw new Error('useFormField should be used within <FormField>');
  }

  const fieldState = getFieldState(fieldContext.name, formState);

  if (!itemContext) {
    throw new Error('FormItemContext is undefined');
  }

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

interface FormItemProps extends React.HTMLAttributes<HTMLDivElement> {}

const FormItem = React.forwardRef<HTMLDivElement, FormItemProps>(({ className, ...props }, ref) => {
  const idRef = React.useRef<string>(`form-item-${Math.random().toString(36).substring(2, 9)}`);

  return (
    <FormItemContext.Provider value={{ id: idRef.current }}>
      <div ref={ref} className={cn('space-y-2', className)} {...props} />
    </FormItemContext.Provider>
  );
});
FormItem.displayName = 'FormItem';

interface FormLabelProps extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> {}

const FormLabel = React.forwardRef<React.ElementRef<typeof LabelPrimitive.Root>, FormLabelProps>(
  ({ className, ...props }, ref) => {
    const { error, formItemId } = useFormField();

    return (
      <Label
        ref={ref}
        className={cn(error && 'text-red-700', className)}
        htmlFor={formItemId}
        {...props}
      />
    );
  },
);
FormLabel.displayName = 'FormLabel';

interface FormControlProps extends React.ComponentPropsWithoutRef<typeof Slot> {}

const FormControl = React.forwardRef<React.ElementRef<typeof Slot>, FormControlProps>(
  ({ ...props }, ref) => {
    const { error, formItemId, formDescriptionId, formMessageId } = useFormField();

    return (
      <Slot
        ref={ref}
        id={formItemId}
        aria-describedby={!error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`}
        aria-invalid={!!error}
        {...props}
      />
    );
  },
);
FormControl.displayName = 'FormControl';

interface FormDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const FormDescription = React.forwardRef<HTMLParagraphElement, FormDescriptionProps>(
  ({ className, ...props }, ref) => {
    const { formDescriptionId } = useFormField();

    return (
      <p
        ref={ref}
        id={formDescriptionId}
        className={cn('text-sm text-gray-500', className)}
        {...props}
      />
    );
  },
);
FormDescription.displayName = 'FormDescription';

interface FormMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children?: React.ReactNode;
}

const FormMessage = React.forwardRef<HTMLParagraphElement, FormMessageProps>(
  ({ className, children, ...props }, ref) => {
    const { error, formMessageId } = useFormField();
    const body = error ? String(error?.message) : children;

    if (!body) return null;

    return (
      <p
        ref={ref}
        id={formMessageId}
        className={cn('text-sm font-medium text-red-700', className)}
        role={error ? 'alert' : undefined}
        {...props}>
        {body}
      </p>
    );
  },
);
FormMessage.displayName = 'FormMessage';

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
};
