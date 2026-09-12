'use client';

import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useForm } from 'react-hook-form';

import type { ClinicArea, ClinicState } from '@/types/clinic';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, Loader2, MapPin } from 'lucide-react';
import * as z from 'zod';

import {
  createNewImageEntries,
  uploadOrderedNewImages,
  type ClinicImageEntry,
} from '@/lib/clinic-images';
import { defaultBusinessHours } from '@/lib/listing/business-hours';
import { LISTING_FEE_LABEL } from '@/lib/listing/submission-fee';
import { uploadFileToImageKit } from '@/lib/upload-imagekit-client';
import { generateUniqueFilename } from '@/lib/utils';
import type { PlaceLookupResult } from '@/services/google-maps.service';

import { ClinicImageGallery } from '@/components/dashboard/clinic-image-gallery';
import { BusinessHoursFields } from '@/components/forms/business-hours-fields';
import { Input } from '@/components/form-fields/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/form-fields/select';
import { Textarea } from '@/components/form-fields/textarea';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';

const dayHoursSchema = z.object({
  isClosed: z.boolean(),
  shifts: z.array(z.object({ openTime: z.string(), closeTime: z.string() })),
});

const schema = z.object({
  name: z.string().min(2, 'Your name is required'),
  email: z.string().email(),
  google_maps_url: z.string().url('Enter a valid Google Maps URL'),
  clinic_name: z.string().min(2, 'Clinic name is required'),
  description: z.string().min(10, 'Description is required'),
  state_id: z.string().min(1, 'State is required'),
  area_id: z.string().min(1, 'Area is required'),
  address: z.string().min(2, 'Address is required'),
  phone: z.string().min(2, 'Telephone is required'),
  postal_code: z.string().min(2, 'Postal code is required'),
  clinic_email: z.string().email().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
  images: z.any().optional(),
  youtube_url: z.string().url().optional().or(z.literal('')),
  facebook_url: z.string().url().optional().or(z.literal('')),
  instagram_url: z.string().url().optional().or(z.literal('')),
  featured_video: z.string().url().optional().or(z.literal('')),
  businessHours: z.object({
    Monday: dayHoursSchema,
    Tuesday: dayHoursSchema,
    Wednesday: dayHoursSchema,
    Thursday: dayHoursSchema,
    Friday: dayHoursSchema,
    Saturday: dayHoursSchema,
    Sunday: dayHoursSchema,
  }),
  honeypot: z.string().max(0, { message: 'This field should be empty' }),
});

type FormData = z.infer<typeof schema>;

type Props = {
  states: ClinicState[];
  areas: ClinicArea[];
};

function normalizePlaceName(value: string) {
  return value
    .toLowerCase()
    .replace(/\b(wilayah persekutuan|w\.?p\.?)\b/g, '')
    .replace(/[^a-z0-9]/g, '');
}

function matchState(states: ClinicState[], name: string) {
  const needle = normalizePlaceName(name);
  if (!needle) {
    return undefined;
  }
  return states.find((state) => {
    const haystack = normalizePlaceName(state.name);
    return haystack === needle || haystack.includes(needle) || needle.includes(haystack);
  });
}

function matchArea(areas: ClinicArea[], stateId: string, city: string) {
  const needle = normalizePlaceName(city);
  if (!needle) {
    return undefined;
  }
  return areas
    .filter((area) => area.state_id === stateId)
    .find((area) => {
      const haystack = normalizePlaceName(area.name);
      return haystack === needle || haystack.includes(needle) || needle.includes(haystack);
    });
}

export default function SubmitClinicForm({ states, areas }: Props) {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupDone, setLookupDone] = useState(false);
  const [selectedState, setSelectedState] = useState<string>('');
  const [orderedImages, setOrderedImages] = useState<ClinicImageEntry[]>([]);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      google_maps_url: '',
      clinic_name: '',
      description: '',
      state_id: '',
      area_id: '',
      address: '',
      phone: '',
      postal_code: '',
      clinic_email: '',
      website: '',
      images: [],
      youtube_url: '',
      facebook_url: '',
      instagram_url: '',
      featured_video: '',
      businessHours: defaultBusinessHours(),
      honeypot: '',
    },
    mode: 'onChange',
  });

  const watchStateId = form.watch('state_id');
  form.watch('businessHours');
  const filteredAreas = areas.filter((a) => a.state_id === (watchStateId || selectedState));

  const isDuplicateFile = (file: File, existingFiles: File[]) =>
    existingFiles.some(
      (existing) =>
        existing.name === file.name &&
        existing.size === file.size &&
        existing.type === file.type,
    );

  const handleDrop = (acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter(
      (file) => file.size > 0 && file.type.startsWith('image/') && file.name && file.name.includes('.'),
    );
    const currentFiles = orderedImages
      .filter((entry): entry is Extract<ClinicImageEntry, { kind: 'new' }> => entry.kind === 'new')
      .map((entry) => entry.file);

    let newFiles = validFiles.filter((file) => !isDuplicateFile(file, currentFiles));

    if (orderedImages.length + newFiles.length > 5) {
      toast({
        title: 'Image Limit',
        description: 'You can only upload up to 5 images.',
        variant: 'destructive',
      });
      newFiles = newFiles.slice(0, 5 - orderedImages.length);
    }

    if (newFiles.length > 0) {
      setOrderedImages((prev) => [...prev, ...createNewImageEntries(newFiles)]);
    }
  };

  const uploadImageToImageKit = async (
    imageFile: File,
  ): Promise<{ url: string; fileId: string } | null> => {
    try {
      const maxSize = 2 * 1024 * 1024;
      if (imageFile.size > maxSize) {
        throw new Error('Image file size must be less than 2MB');
      }

      if (!imageFile.type.startsWith('image/')) {
        throw new Error('Please select a valid image file');
      }

      const result = await uploadFileToImageKit(
        imageFile,
        'dental-clinics-my/places',
        generateUniqueFilename(imageFile.name),
      );
      if (!result) {
        throw new Error('Failed to upload image');
      }
      return result;
    } catch (error) {
      console.error('Image upload error:', error);
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Failed to upload image',
      });
      return null;
    }
  };

  const dropzone = useDropzone({
    onDrop: handleDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    maxFiles: 5,
    maxSize: 2 * 1024 * 1024,
    onDropRejected: (fileRejections) => {
      fileRejections.forEach((rejection) => {
        if (rejection.errors[0].code === 'file-too-large') {
          toast({
            title: 'File too large',
            description: 'File size must be less than 2MB',
            variant: 'destructive',
          });
        } else if (rejection.errors[0].code === 'file-invalid-type') {
          toast({
            title: 'Invalid file type',
            description: 'Only JPG, JPEG and PNG files are allowed',
            variant: 'destructive',
          });
        }
      });
    },
  });

  const applyLookupResult = (result: PlaceLookupResult) => {
    if (result.name) {
      form.setValue('clinic_name', result.name, { shouldValidate: true });
    }
    if (result.address) {
      form.setValue('address', result.address, { shouldValidate: true });
    }
    if (result.phone) {
      form.setValue('phone', result.phone, { shouldValidate: true });
    }
    if (result.postal_code) {
      form.setValue('postal_code', result.postal_code, { shouldValidate: true });
    }
    if (result.website) {
      form.setValue('website', result.website, { shouldValidate: true });
    }
    if (result.hours) {
      form.setValue('businessHours', result.hours, { shouldValidate: true });
    }

    const matchedState = matchState(states, result.stateName);
    if (matchedState) {
      form.setValue('state_id', matchedState.id, { shouldValidate: true });
      setSelectedState(matchedState.id);
      const matchedArea = matchArea(areas, matchedState.id, result.city || result.stateName);
      if (matchedArea) {
        form.setValue('area_id', matchedArea.id, { shouldValidate: true });
      } else {
        form.setValue('area_id', '');
      }
    }
  };

  const handleFetchDetails = async () => {
    const valid = await form.trigger(['name', 'email', 'google_maps_url']);
    if (!valid) {
      return;
    }

    setLookupLoading(true);
    try {
      const res = await fetch('/api/places/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: form.getValues('google_maps_url') }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data?.name) {
        applyLookupResult(data as PlaceLookupResult);
        toast({
          title: data.source === 'ai' ? 'Filled with AI — please check' : 'Details filled from Google Maps',
          description: 'You can still edit any field before paying.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Could not fetch listing',
          description: data.error || 'Fill the listing yourself.',
        });
      }
    } catch {
      toast({
        variant: 'destructive',
        title: 'Could not fetch listing',
        description: 'Fill the listing yourself.',
      });
    } finally {
      setLookupDone(true);
      setLookupLoading(false);
    }
  };

  const onSubmit = async (formData: FormData) => {
    if (formData.honeypot) {
      console.log('Honeypot detected, ignoring submission');
      setTimeout(() => {
        form.reset();
        setSubmitting(false);
      }, 2000);
      return;
    }

    if (!lookupDone) {
      toast({
        title: 'Fetch clinic details first',
        description: 'Paste a Google Maps URL and fetch details before paying.',
      });
      return;
    }

    setSubmitting(true);

    toast({
      title: 'Processing...',
      description: 'Please wait while we process your submission.',
    });
    try {
      const newImages = await uploadOrderedNewImages(orderedImages, uploadImageToImageKit);

      const finalData = {
        ...formData,
        images: newImages,
      };

      const res = await fetch('/api/stripe/checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalData),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create Stripe session');
      }
      const { checkoutUrl } = await res.json();
      window.location.href = checkoutUrl;
      return;
    } catch (error: unknown) {
      let message = 'Failed to submit clinic. Please try again later.';
      if (typeof error === 'object' && error && 'message' in error) {
        message = (error as { message?: string }).message || message;
      }
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="hidden" aria-hidden="true">
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
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Name*</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Email*</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your email address" {...field} />
                </FormControl>
                <FormDescription>
                  We&apos;ll use this email to contact you if there&apos;s any issue with your
                  submission.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="google_maps_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Google Maps URL*</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://maps.app.goo.gl/..."
                  disabled={lookupDone}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Paste your clinic&apos;s Google Maps link. We&apos;ll fill name, address, and hours
                from it.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="button"
          onClick={handleFetchDetails}
          disabled={lookupDone || lookupLoading}
          className="w-full">
          {lookupLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Fetching clinic details...
            </>
          ) : (
            <>
              <MapPin className="mr-2 h-4 w-4" />
              Fetch clinic details
            </>
          )}
        </Button>

        {lookupDone && (
          <>
            <FormField
              control={form.control}
              name="clinic_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Clinic Name*</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter clinic name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Clinic Description*</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe your clinic" rows={5} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="state_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State*</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(val) => {
                        field.onChange(val);
                        setSelectedState(val);
                        form.setValue('area_id', '');
                      }}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a state" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {states.map((state) => (
                          <SelectItem key={state.id} value={state.id}>
                            {state.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="area_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Area*</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={!watchStateId && !selectedState}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an area" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredAreas.map((area) => (
                          <SelectItem key={area.id} value={area.id}>
                            {area.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address*</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter address" rows={5} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telephone*</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter telephone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="clinic_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter clinic email address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="postal_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal Code*</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter postal code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div>
              <p className="font-display mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
                Business hours
              </p>
              <BusinessHoursFields
                control={form.control as never}
                getValues={form.getValues as never}
                setValue={form.setValue as never}
              />
            </div>
            <FormField
              control={form.control}
              name="images"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Images (up to 5)</FormLabel>
                  <div
                    {...dropzone.getRootProps()}
                    className={`cursor-pointer rounded border-2 border-dashed p-4 text-center transition-colors ${
                      dropzone.isDragActive
                        ? 'border-blue-500 bg-blue-50 dark:border-blue-700 dark:bg-blue-900'
                        : 'border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900'
                    }`}>
                    <input {...dropzone.getInputProps()} onBlur={field.onBlur} />
                    <p className="text-gray-500 dark:text-gray-400">
                      Drag and drop or click to select up to 5 images.
                    </p>
                  </div>
                  <ClinicImageGallery
                    images={orderedImages}
                    onChange={setOrderedImages}
                    onRemoveExisting={() => {}}
                  />
                  <FormDescription>Drag and drop or select up to 5 images.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="youtube_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>YouTube URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://youtube.com/..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="facebook_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Facebook URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://facebook.com/..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="instagram_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instagram URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://instagram.com/..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="featured_video"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Featured Video</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-5 dark:border-blue-800 dark:bg-blue-950/30">
              <div className="mb-4 flex items-baseline justify-between gap-3">
                <p className="font-display text-lg font-bold text-gray-900 dark:text-gray-100">
                  Clinic listing
                </p>
                <p className="font-display text-2xl font-black tabular-nums text-blue-600 dark:text-blue-400">
                  {LISTING_FEE_LABEL}
                  <span className="ml-1 text-sm font-semibold text-gray-500 dark:text-gray-400">
                    one-time
                  </span>
                </p>
              </div>
              <ul className="space-y-2">
                {[
                  'Reviewed and published within 24 hours',
                  'Dofollow link to your website',
                  'Profile with photos, contact details, and location',
                  'One-time payment — no subscription',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check
                      className="mt-0.5 size-4 shrink-0 text-green-600 dark:text-green-400"
                      aria-hidden="true"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                `Pay ${LISTING_FEE_LABEL} and submit`
              )}
            </Button>
          </>
        )}
      </form>
    </Form>
  );
}
