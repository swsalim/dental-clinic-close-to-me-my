'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

import { useRouter } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { StarIcon } from 'lucide-react';
import * as z from 'zod';

import { sendNewReviewNotification } from '@/lib/email';
import { createAdminClient } from '@/lib/supabase';

import { Textarea } from '@/components/form-fields/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';

import { Input } from '../form-fields/input';

// Review form schema
const reviewFormSchema = z.object({
  author_name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters long' })
    .max(50, { message: 'Name cannot exceed 50 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  text: z
    .string()
    .min(10, { message: 'Review must be at least 10 characters long' })
    .max(500, { message: 'Review cannot exceed 500 characters' }),
  rating: z
    .number()
    .min(1, { message: 'Please select a rating' })
    .max(5, { message: 'Rating cannot exceed 5 stars' }),
  honeypot: z.string().max(0, { message: 'This field should be empty' }),
});

type ReviewFormValues = z.infer<typeof reviewFormSchema>;

interface AddReviewFormProps {
  clinicId: string;
}

export default function AddReviewForm({ clinicId }: AddReviewFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      author_name: '',
      email: '',
      text: '',
      rating: 5,
      honeypot: '',
    },
    mode: 'onBlur',
  });

  const onSubmit = async (data: ReviewFormValues) => {
    setIsSubmitting(true);

    try {
      // Check the honeypot field - if it's filled, it's likely a bot
      if (data.honeypot) {
        console.log('Honeypot detected, ignoring submission');
        // Still pretend to submit the form to not alert the bot
        setTimeout(() => {
          form.reset();
          setIsSubmitting(false);
        }, 2000);
        return;
      }

      const supabase = createAdminClient();

      // Add review to the database
      const { error } = await supabase.from('clinic_reviews').insert({
        clinic_id: clinicId,
        author_name: data.author_name,
        email: data.email,
        text: data.text,
        rating: data.rating,
        review_time: new Date().toISOString(),
        source: 'manual',
        status: 'pending',
      });

      if (error) throw error;

      // Get clinic name for the email notification
      const { data: clinicData, error: clinicError } = await supabase
        .from('clinics')
        .select('name')
        .eq('id', clinicId)
        .single();

      if (!clinicError && clinicData) {
        // Send email notification about the new review
        await sendNewReviewNotification({
          clinicName: clinicData.name,
          authorName: data.author_name,
          rating: data.rating,
          reviewText: data.text,
        });
      }

      // Reset form and refresh page
      form.reset();
      router.refresh();

      // Show success toast notification
      toast({
        title: 'Review Submitted',
        description: 'Thank you for your review! It will be visible after approval.',
      });
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: 'Error',
        description: 'There was an error submitting your review. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Custom star rating input for the form
  const RatingInput = React.forwardRef<
    HTMLDivElement,
    { value: number; onChange: (value: number) => void; id?: string }
  >(({ value, onChange, id }, ref) => {
    return (
      <div ref={ref} className="flex space-x-1" id={id}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="focus:outline-none">
            <StarIcon
              className={`h-6 w-6 ${
                star <= value ? 'fill-brand stroke-transparent' : 'fill-gray-200 stroke-gray-200'
              }`}
            />
          </button>
        ))}
      </div>
    );
  });
  RatingInput.displayName = 'RatingInput';

  return (
    <article className="mt-8">
      <h2>Add Your Review</h2>
      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Honeypot field - hidden from users but visible to bots */}
              {/* <div className="hidden" aria-hidden="true">
                <FormField
                  control={form.control}
                  name="honeypot"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor={field.name}>Leave this empty</FormLabel>
                      <FormControl>
                        <Input
                          id={field.name}
                          aria-hidden="true"
                          tabIndex={-1}
                          autoComplete="off"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div> */}

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="author_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor={field.name}>Name</FormLabel>
                      <FormControl>
                        <Input
                          id={field.name}
                          aria-describedby={`${field.name}-description`}
                          placeholder="Your name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage id={`${field.name}-description`} />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor={field.name}>Email</FormLabel>
                      <FormControl>
                        <Input
                          id={field.name}
                          aria-describedby={`${field.name}-description`}
                          placeholder="Your email"
                          type="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage id={`${field.name}-description`} />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor={field.name}>Rating</FormLabel>
                    <FormControl>
                      <RatingInput
                        id={field.name}
                        aria-describedby={`${field.name}-description`}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage id={`${field.name}-description`} />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor={field.name}>Review</FormLabel>
                    <FormControl>
                      <Textarea
                        id={field.name}
                        aria-describedby={`${field.name}-description`}
                        placeholder="Share your experience at this clinic"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage id={`${field.name}-description`} />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full md:w-auto"
                disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </article>
  );
}
