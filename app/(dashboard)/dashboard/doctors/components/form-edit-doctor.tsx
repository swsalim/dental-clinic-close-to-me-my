'use client';

import { ChangeEvent, useState } from 'react';
import { useForm } from 'react-hook-form';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import type { ClinicDoctor } from '@/types/clinic';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckIcon, ChevronsUpDown, RefreshCwIcon, XIcon } from 'lucide-react';
import * as z from 'zod';

// Lib imports
import { createClient } from '@/lib/supabase/client';
import { cn, getCloudinaryPublicId } from '@/lib/utils';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/dashboard/command';
import { File } from '@/components/form-fields/file';
import { Input } from '@/components/form-fields/input';
import { SelectContent, SelectItem } from '@/components/form-fields/select';
import { SelectTrigger, SelectValue } from '@/components/form-fields/select';
import { Select } from '@/components/form-fields/select';
import { Switch } from '@/components/form-fields/switch';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from '@/components/ui/use-toast';

interface EditDoctorFormProps {
  doctor: Partial<ClinicDoctor> & {
    clinics: {
      id: string;
      name: string;
      slug: string;
    }[];
    clinic_doctor_relations: {
      clinic_id: string;
      clinics: {
        id: string;
        name: string;
        slug: string;
      };
    }[];
  };
  clinics: {
    id: string;
    name: string;
    slug: string;
  }[];
}

const STATUS_OPTIONS = [
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Suspended', value: 'suspended' },
];

const doctorProfileSchema = z.object({
  name: z.string(),
  slug: z.string(),
  bio: z.string().optional(),
  specialty: z.string().optional(),
  status: z.string().optional(),
  image: z.any().optional(),
  featured_video: z.string().optional(),
  is_active: z.boolean(),
  is_featured: z.boolean(),
  selectedClinics: z.array(z.object({ clinic_id: z.string() })),
});

type FormData = z.infer<typeof doctorProfileSchema>;

export default function FormEditDoctor({ doctor, clinics }: EditDoctorFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [currentImage, setCurrentImage] = useState<string>(doctor.image || '');
  const [imageToRemove, setImageToRemove] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cloudinaryUploadUrl] = useState(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDIARY_API_NAME}/upload`,
  );

  const form = useForm<FormData>({
    resolver: zodResolver(doctorProfileSchema),
    defaultValues: {
      name: doctor.name || '',
      slug: doctor.slug || '',
      bio: doctor.bio || '',
      specialty: doctor.specialty || '',
      status: doctor.status || '',
      image: '',
      featured_video: doctor.featured_video || '',
      is_active: doctor.is_active || false,
      is_featured: doctor.is_featured || false,
      selectedClinics:
        doctor.clinics?.map((clinic) => ({
          clinic_id: clinic.id,
        })) || [],
    },
    mode: 'onChange',
  });

  const { reset } = form;
  const watchImage = form.watch('image');

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const files = Array.from(e.target.files)[0];
    form.setValue('image', files);
  };

  const handleImageRemove = () => {
    form.setValue('image', '');
  };

  const handleCloudinaryImageRemove = (e: React.MouseEvent, imageToRemove: string) => {
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

    setCurrentImage('');
    setImageToRemove(publicId);
  };

  const renderImage = (image: string | File, isCurrentImage = false) => {
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
              onClick={() => handleImageRemove()}
              aria-label="Remove image"
              tabIndex={0}>
              <XIcon className="mx-auto h-6 w-6" />
            </button>
          )}
          {isCurrentImage && (
            <button
              type="button"
              className="absolute left-auto right-2 top-2 z-10 h-8 w-8 rounded-full border-2 border-gray-700 bg-white/90"
              onClick={(e) => handleCloudinaryImageRemove(e, imageSrc)}
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
    try {
      setIsSubmitting(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      // Delete removed images from Cloudinary
      if (imageToRemove) {
        try {
          await fetch('/api/delete-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ public_id: imageToRemove }),
          });
        } catch (error) {
          console.error(error);
          return null;
        }
      }

      // Upload new images
      let newImage: string = '';
      if (watchImage) {
        if (typeof window !== 'undefined' && window.File && watchImage instanceof window.File) {
          const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET_PERSON;
          if (uploadPreset) {
            const formData = new FormData();
            formData.append('upload_preset', uploadPreset);
            formData.append('file', watchImage);
            try {
              const response = await fetch(cloudinaryUploadUrl, {
                method: 'POST',
                body: formData,
              });
              const uploadData = await response.json();
              const imageUrl = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDIARY_API_NAME}/image/upload/f_auto,q_auto/${uploadData.public_id}.${uploadData.format}`;
              newImage = imageUrl;
            } catch (error) {
              console.error(error);
              return null;
            }
          }
        }
      }

      const finalData = {
        ...data,
        image: newImage,
      };

      // Update doctor information
      const { data: updatedDoctor, error: updateError } = await supabase
        .from('clinic_doctors')
        .update({
          // GENERAL
          name: finalData.name,
          bio: finalData.bio,
          slug: finalData.slug,
          specialty: finalData.specialty,
          status: finalData.status,
          image: finalData.image || currentImage,
          featured_video: finalData.featured_video,
          is_active: finalData.is_active,
          is_featured: finalData.is_featured,
          // selectedClinics: finalData.selectedClinics,
        })
        .eq('id', doctor.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      // Delete existing clinic doctor relations
      const { error: deleteClinicDoctorRelationsError } = await supabase
        .from('clinic_doctor_relations')
        .delete()
        .eq('doctor_id', doctor.id);

      if (deleteClinicDoctorRelationsError) {
        throw deleteClinicDoctorRelationsError;
      }

      // Insert new clinic doctor relations
      const { error: insertClinicDoctorRelationsError } = await supabase
        .from('clinic_doctor_relations')
        .insert(
          finalData.selectedClinics.map((clinic) => ({
            doctor_id: doctor.id,
            clinic_id: clinic.clinic_id,
          })),
        );

      if (insertClinicDoctorRelationsError) {
        throw insertClinicDoctorRelationsError;
      }

      if (updatedDoctor) {
        // Get the updated doctor's clinics from the database
        const { data: updatedSelectedClinicsData } = await supabase
          .from('clinic_doctor_relations')
          .select('clinic_id')
          .eq('doctor_id', doctor.id);

        // Map the clinics back to the clinic format
        const updatedSelectedClinics = updatedSelectedClinicsData?.map(
          (c: { clinic_id: string }) => ({
            clinic_id: c.clinic_id,
          }),
        );

        // Update the form with the new data
        reset({
          name: updatedDoctor.name || '',
          slug: updatedDoctor.slug || '',
          bio: updatedDoctor.bio || '',
          specialty: updatedDoctor.specialty || '',
          status: updatedDoctor.status || '',
          image: '',
          featured_video: updatedDoctor.featured_video || '',
          is_active: updatedDoctor.is_active || false,
          is_featured: updatedDoctor.is_featured || false,
          selectedClinics: updatedSelectedClinics || [],
          // clinics: updatedClinics || [],
        });

        // Update the current images state
        setCurrentImage(updatedDoctor.image || '');
      }

      toast({
        title: 'Success',
        description: 'Doctor updated successfully',
      });

      setImageToRemove('');
      router.refresh();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update doctor';
      console.error('Error updating doctor:', errorMessage);
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
      <form onSubmit={form.handleSubmit(onSubmit)} aria-label="Doctor edit form">
        <div className="space-y-6 divide-y divide-gray-200 overflow-hidden">
          <div className="space-y-6 bg-white">
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">Profile</h3>
              <p className="text-text-muted mt-1 text-sm">
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
                          placeholder="Enter doctor name"
                          aria-describedby="name-description"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription id="name-description">
                        This is the name that will be displayed on the doctor profile.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-6 sm:col-span-3"></div>

              <div className="col-span-6">
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="block">Bio</FormLabel>
                      <FormControl>
                        <Textarea
                          advanced
                          placeholder="Type the doctor bio here."
                          rows={10}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-6 sm:col-span-5">
                <FormField
                  control={form.control}
                  name="featured_video"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="block">Featured Video</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>This is the url for the featured video.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-6 sm:col-span-5">
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="block">Slug</FormLabel>
                      <FormControl>
                        <Input placeholder="url-slug" prefix="person" {...field} />
                      </FormControl>
                      <FormDescription>This is the url for the doctor profile.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-6">
                <FormField
                  control={form.control}
                  name="specialty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="block">Specialty</FormLabel>
                      <FormControl>
                        <Textarea
                          advanced
                          placeholder="Type the specialty here."
                          rows={10}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {currentImage && (
                <div className="col-span-6">
                  <h3>Current Image</h3>
                  {renderImage(currentImage, true)}
                </div>
              )}
              <div className="col-span-6">
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image</FormLabel>
                      <FormControl>
                        <File
                          id="image"
                          {...field}
                          value=""
                          onChange={(e) => {
                            handleImageChange(e);
                          }}
                        />
                      </FormControl>
                      <FormDescription>Upload images for the doctor</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {watchImage && renderImage(watchImage)}
              </div>
            </div>
          </div>

          <div className="space-y-6 bg-white">
            <div className="mt-4">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Listing Feature</h3>
              <p className="mt-1 text-sm text-gray-500">Listing related fields</p>
            </div>

            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6">
                <FormField
                  control={form.control}
                  name="selectedClinics"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="block">Clinics</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              type="button"
                              className={cn(
                                'w-full justify-between',
                                !field.value?.length && 'text-gray-500',
                              )}>
                              {field.value?.length
                                ? `${field.value.length} clinic${field.value.length === 1 ? '' : 's'} selected`
                                : 'Select clinics'}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput placeholder="Search clinics..." />
                            <CommandEmpty>No clinic found.</CommandEmpty>
                            <CommandGroup className="max-h-[250px] overflow-auto">
                              {clinics.map((clinic) => (
                                <CommandItem
                                  value={clinic.id}
                                  key={clinic.id}
                                  onSelect={() => {
                                    const clinicId = clinic.id;
                                    const newValue = field.value?.some(
                                      (item) => item.clinic_id === clinicId,
                                    )
                                      ? field.value.filter((item) => item.clinic_id !== clinicId)
                                      : [...(field.value || []), { clinic_id: clinicId }];
                                    field.onChange(newValue);
                                  }}>
                                  <CheckIcon
                                    className={cn(
                                      'mr-2 h-4 w-4',
                                      field.value?.some((item) => item.clinic_id === clinic.id)
                                        ? 'opacity-100'
                                        : 'opacity-0',
                                    )}
                                  />
                                  {clinic.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormDescription>Select the clinics where this doctor works.</FormDescription>
                      {field.value?.length > 0 && (
                        <div className="mt-3">
                          <div className="mb-2 text-sm font-medium text-gray-700">
                            Selected Clinics:
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {field.value.map((selectedClinic) => {
                              const clinic = clinics.find((c) => c.id === selectedClinic.clinic_id);
                              return (
                                <div
                                  key={selectedClinic.clinic_id}
                                  className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm">
                                  <span>{clinic?.name}</span>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    className="h-auto p-1 hover:bg-gray-200"
                                    onClick={() => {
                                      field.onChange(
                                        field.value.filter(
                                          (selectedClinic) =>
                                            selectedClinic.clinic_id !== clinic?.id,
                                        ),
                                      );
                                    }}>
                                    <XIcon className="h-3 w-3" />
                                    <span className="sr-only">Remove {clinic?.name}</span>
                                  </Button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-6">
                <FormField
                  control={form.control}
                  name="is_featured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Featured Listing</FormLabel>
                        <FormDescription>Set this place as featured listing</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-6">
                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Activate account</FormLabel>
                        <FormDescription>Turn this on to activate the listing</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-6">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {STATUS_OPTIONS.map((status) => (
                            <SelectItem value={status.value} key={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>Choose a status for the doctor.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="col-span-6 mt-6 flex justify-between space-x-4">
          <Link href="/dashboard/doctors">Back</Link>
          <Button type="submit" disabled={isSubmitting} className="flex items-center space-x-2">
            {isSubmitting ? (
              <>
                <RefreshCwIcon className="h-4 w-4 animate-spin" />
                <span>Updating...</span>
              </>
            ) : (
              <span>Update Doctor Profile</span>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
