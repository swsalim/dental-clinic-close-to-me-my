'use client';

import { ChangeEvent, useState } from 'react';
import { useForm } from 'react-hook-form';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import type { ClinicState } from '@/types/clinic';
import { zodResolver } from '@hookform/resolvers/zod';
import { RefreshCwIcon, XIcon } from 'lucide-react';
import * as z from 'zod';

// Lib imports
import { createClient } from '@/lib/supabase/client';
import { getCloudinaryPublicId, sanitizeHtmlField } from '@/lib/utils';

import { File } from '@/components/form-fields/file';
import { Input } from '@/components/form-fields/input';
import { Textarea } from '@/components/form-fields/textarea';
import { ImageCloudinary } from '@/components/image/image-cloudinary';
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
import { toast } from '@/components/ui/use-toast';

interface EditStateFormProps {
  state: Partial<ClinicState>;
}

const clinicProfileSchema = z.object({
  name: z.string(),
  slug: z.string(),
  short_description: z.string().optional(),
  description: z.string().optional(),
  thumbnail_image: z.any().optional(),
  banner_image: z.any().optional(),
});

type FormData = z.infer<typeof clinicProfileSchema>;

export default function FormEditState({ state }: EditStateFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [currentThumbnailImage, setCurrentThumbnailImage] = useState<string>(
    state.thumbnail_image || '',
  );
  const [currentBannerImage, setCurrentBannerImage] = useState<string>(state.banner_image || '');
  const [imagesToRemove, setImagesToRemove] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cloudinaryUploadUrl] = useState(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDIARY_API_NAME}/upload`,
  );

  const form = useForm<FormData>({
    resolver: zodResolver(clinicProfileSchema),
    defaultValues: {
      name: state.name || '',
      slug: state.slug,
      description: state.description || undefined,
      short_description: state.short_description || undefined,
      thumbnail_image: '',
      banner_image: '',
    },
    mode: 'onChange',
  });

  const { reset } = form;
  const watchThumbnailImage = form.watch('thumbnail_image');
  const watchBannerImage = form.watch('banner_image');

  const handleThumbnailImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = Array.from(e.target.files)[0];
    form.setValue('thumbnail_image', file);
  };

  const handleThumbnailImageRemove = () => {
    form.setValue('thumbnail_image', '');
  };

  const handleBannerImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = Array.from(e.target.files)[0];
    form.setValue('banner_image', file);
  };

  const handleBannerImageRemove = () => {
    form.setValue('banner_image', '');
  };

  const handleThumbnailImageCloudinaryRemove = (e: React.MouseEvent, imageToRemove: string) => {
    e.preventDefault();

    const publicId = getCloudinaryPublicId(imageToRemove);
    if (!publicId) {
      toast({
        variant: 'destructive',
        title: 'Error removing image',
        description: 'Could not get image ID',
      });
      return;
    }

    setCurrentThumbnailImage('');
    setImagesToRemove((prev) => [...prev, publicId]);
  };

  const handleBannerImageCloudinaryRemove = (e: React.MouseEvent, imageToRemove: string) => {
    e.preventDefault();

    const publicId = getCloudinaryPublicId(imageToRemove);
    if (!publicId) {
      toast({
        variant: 'destructive',
        title: 'Error removing image',
        description: 'Could not get image ID',
      });
      return;
    }

    setCurrentBannerImage('');
    setImagesToRemove((prev) => [...prev, publicId]);
  };

  const renderThumbnailImage = (image: string | File, isCurrentImage = false) => {
    let imageSrc: string;
    if (!isCurrentImage && typeof window !== 'undefined' && image instanceof window.File) {
      imageSrc = URL.createObjectURL(image);
    } else if (typeof image === 'string') {
      imageSrc = image;
    } else {
      return null;
    }
    return (
      <div>
        <div className="aspect-h-3 aspect-w-4 relative w-fit overflow-hidden rounded-md shadow-md">
          {!isCurrentImage && (
            <button
              type="button"
              className="absolute left-auto right-2 top-2 z-10 h-8 w-8 rounded-full border-2 border-gray-700 bg-white/90"
              onClick={() => handleThumbnailImageRemove()}
              aria-label="Remove image"
              tabIndex={0}>
              <XIcon className="mx-auto h-6 w-6" />
            </button>
          )}
          {isCurrentImage && (
            <button
              type="button"
              className="absolute left-auto right-2 top-2 z-10 h-8 w-8 rounded-full border-2 border-gray-700 bg-white/90"
              onClick={(e) => handleThumbnailImageCloudinaryRemove(e, imageSrc)}
              aria-label="Remove image"
              tabIndex={0}>
              <XIcon className="mx-auto h-6 w-6" />
            </button>
          )}
          {!isCurrentImage && (
            <Image
              src={imageSrc}
              alt="Image preview"
              width={600}
              height={600}
              className="object-cover"
            />
          )}
          {isCurrentImage && (
            <ImageCloudinary src={imageSrc} alt="Image preview" className="object-cover" />
          )}
        </div>
      </div>
    );
  };

  const renderBannerImage = (image: string | File, isCurrentImage = false) => {
    let imageSrc: string;
    if (!isCurrentImage && typeof window !== 'undefined' && image instanceof window.File) {
      imageSrc = URL.createObjectURL(image);
    } else if (typeof image === 'string') {
      imageSrc = image;
    } else {
      return null;
    }
    return (
      <div>
        <div className="aspect-h-3 aspect-w-4 relative w-fit overflow-hidden rounded-md shadow-md">
          {!isCurrentImage && (
            <button
              type="button"
              className="absolute left-auto right-2 top-2 z-10 h-8 w-8 rounded-full border-2 border-gray-700 bg-white/90"
              onClick={() => handleBannerImageRemove()}
              aria-label="Remove image"
              tabIndex={0}>
              <XIcon className="mx-auto h-6 w-6" />
            </button>
          )}
          {isCurrentImage && (
            <button
              type="button"
              className="absolute left-auto right-2 top-2 z-10 h-8 w-8 rounded-full border-2 border-gray-700 bg-white/90"
              onClick={(e) => handleBannerImageCloudinaryRemove(e, imageSrc)}
              aria-label="Remove image"
              tabIndex={0}>
              <XIcon className="mx-auto h-6 w-6" />
            </button>
          )}
          {!isCurrentImage && (
            <Image
              src={imageSrc}
              alt="Image preview"
              width={600}
              height={600}
              className="object-cover"
            />
          )}
          {isCurrentImage && (
            <ImageCloudinary src={imageSrc} alt="Image preview" className="object-cover" />
          )}
        </div>
      </div>
    );
  };

  const onSubmit = async (data: FormData) => {
    console.log('onSubmit ~ data');
    console.log(watchThumbnailImage);
    console.log(watchBannerImage);
    console.log(data);
    try {
      setIsSubmitting(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      // Delete removed images from Cloudinary
      for (const image of imagesToRemove) {
        try {
          await fetch('/api/delete-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ public_id: image }),
          });
        } catch (error) {
          console.error(error);
          return null;
        }
      }

      // Upload new images
      let newThumbnailImage: string = '';
      let newBannerImage: string = '';
      if (watchThumbnailImage) {
        if (
          typeof window !== 'undefined' &&
          window.File &&
          watchThumbnailImage instanceof window.File
        ) {
          const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET_LOCATION;
          if (uploadPreset) {
            const formData = new FormData();
            formData.append('upload_preset', uploadPreset);
            formData.append('file', watchThumbnailImage);
            try {
              const response = await fetch(cloudinaryUploadUrl, {
                method: 'POST',
                body: formData,
              });
              const uploadData = await response.json();
              const imageUrl = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDIARY_API_NAME}/image/upload/f_auto,q_auto/${uploadData.public_id}.${uploadData.format}`;
              newThumbnailImage = imageUrl;
            } catch (error) {
              console.error(error);
              return null;
            }
          }
        }
      }

      if (watchBannerImage) {
        if (
          typeof window !== 'undefined' &&
          window.File &&
          watchBannerImage instanceof window.File
        ) {
          const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET_LOCATION;
          if (uploadPreset) {
            const formData = new FormData();
            formData.append('upload_preset', uploadPreset);
            formData.append('file', watchBannerImage);
            try {
              const response = await fetch(cloudinaryUploadUrl, {
                method: 'POST',
                body: formData,
              });
              const uploadData = await response.json();
              const imageUrl = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDIARY_API_NAME}/image/upload/f_auto,q_auto/${uploadData.public_id}.${uploadData.format}`;
              newBannerImage = imageUrl;
            } catch (error) {
              console.error(error);
              return null;
            }
          }
        }
      }

      const finalData = {
        ...data,
        description: sanitizeHtmlField(data.description),
        short_description: sanitizeHtmlField(data.short_description),
        thumbnail_image: newThumbnailImage,
        banner_image: newBannerImage,
      };

      console.log('finalData');
      console.log(finalData);

      // Update area information
      const { data: updatedState, error: updateError } = await supabase
        .from('states')
        .update({
          // GENERAL
          name: finalData.name,
          description: finalData.description,
          short_description: finalData.short_description,
          slug: finalData.slug,
          // IMAGE RELATED
          thumbnail_image: finalData.thumbnail_image || currentThumbnailImage,
          banner_image: finalData.banner_image || currentBannerImage,
        })
        .eq('id', state.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      if (updatedState) {
        // Update the form with the new data
        reset({
          name: updatedState.name || '',
          slug: updatedState.slug || '',
          description: updatedState.description || undefined,
          short_description: updatedState.short_description || undefined,
          thumbnail_image: '',
          banner_image: '',
        });

        // Update the current images state
        setCurrentThumbnailImage(updatedState.thumbnail_image || '');
        setCurrentBannerImage(updatedState.banner_image || '');
      }

      toast({
        title: 'Success',
        description: 'State updated successfully',
      });

      setImagesToRemove([]);
      router.refresh();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update state';
      console.error('Error updating state:', errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} aria-label="Clinic review form">
        <div className="space-y-6 divide-y divide-gray-200 shadow sm:overflow-hidden sm:rounded-md">
          <div className="space-y-6 bg-white px-4 py-6 sm:p-6">
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">Edit State</h3>
              <p className="text-text-gray-500 mt-1 text-sm">
                This information will be displayed publicly so be careful what you share.
              </p>
            </div>

            <div className="grid grid-cols-6 gap-8">
              <div className="col-span-6 sm:col-span-3">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter state name"
                          aria-describedby="name-description"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription id="name-description">
                        This is the name that will be displayed on the state page.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-6 space-y-4">
                <h4 className="text-base font-medium text-gray-900">Number of Clinics</h4>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {state.clinics?.length}
                </div>
              </div>

              <div className="col-span-6 sm:col-span-5">
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="block">Slug</FormLabel>
                      <FormControl>
                        <Input placeholder="url-slug" {...field} />
                      </FormControl>
                      <FormDescription>This is the url for the state page.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-6">
                <FormField
                  control={form.control}
                  name="short_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="block">Short Description</FormLabel>
                      <FormControl>
                        <Textarea
                          advanced
                          placeholder="Type the description here."
                          rows={10}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-6">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="block">Description</FormLabel>
                      <FormControl>
                        <Textarea
                          advanced
                          placeholder="Type the description here."
                          rows={10}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {currentThumbnailImage && (
                <div className="col-span-6">
                  <h3>Current Thumbnail Image</h3>
                  {renderThumbnailImage(currentThumbnailImage, true)}
                </div>
              )}
              <div className="col-span-6">
                <FormField
                  control={form.control}
                  name="thumbnail_image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thumbnail Image</FormLabel>
                      <FormControl>
                        <File
                          id="thumbnail_image"
                          {...field}
                          value=""
                          onChange={(e) => {
                            handleThumbnailImageChange(e);
                          }}
                        />
                      </FormControl>
                      <FormDescription>Upload thumbnail image for the state</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {watchThumbnailImage && renderThumbnailImage(watchThumbnailImage)}
              </div>

              {currentBannerImage && (
                <div className="col-span-6">
                  <h3>Current Banner Image</h3>
                  {renderBannerImage(currentBannerImage, true)}
                </div>
              )}
              <div className="col-span-6">
                <FormField
                  control={form.control}
                  name="thumbnail_image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Banner Image</FormLabel>
                      <FormControl>
                        <File
                          id="banner_image"
                          {...field}
                          value=""
                          onChange={(e) => {
                            handleBannerImageChange(e);
                          }}
                        />
                      </FormControl>
                      <FormDescription>Upload banner image for the state</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {watchBannerImage && renderBannerImage(watchBannerImage)}
              </div>
            </div>
          </div>
        </div>
        <div className="col-span-6 mt-6 flex justify-between space-x-4">
          <Link href="/dashboard/states">Back</Link>
          <Button type="submit" disabled={isSubmitting} className="flex items-center space-x-2">
            {isSubmitting ? (
              <>
                <RefreshCwIcon className="h-4 w-4 animate-spin" />
                <span>Updating State Info...</span>
              </>
            ) : (
              <span>Update</span>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
