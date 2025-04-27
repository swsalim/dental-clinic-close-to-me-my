const clinicProfileSchema = z.object({
  name: z.string(),
  address: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  postal_code: z.string().optional(),
  slug: z.string(),
  description: z.string().optional(),
  website: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  latitude: z.number(),
  longitude: z.number(),
  location: z.unknown(),
  place_id: z.string(),
  rating: z.number().nullable(),
  review_count: z.number().nullable(),
  is_active: z.boolean(),
  is_featured: z.boolean(),
  is_permanently_closed: z.boolean(),
  open_on_public_holidays: z.boolean(),
  images: z.array(z.any()).optional(),
  source: z.string().optional(),
  facebook_url: z.string().optional(),
  instagram_url: z.string().optional(),
  featured_video: z.string().optional(),
  youtube_url: z.string().optional(),
  area_id: z.string(),
  state_id: z.string(),
  status: z.string(),
  businessHours: z.record(
    z.string(),
    z.object({
      isClosed: z.boolean(),
      shifts: z.array(z.object({ openTime: z.string(), closeTime: z.string() })),
    }),
  ),
  services: z.array(z.string()).optional(),
});

const form = useForm<FormData>({
  resolver: zodResolver(clinicProfileSchema),
  defaultValues: {
    name: clinic.name || '',
    address: clinic.address || '',
    neighborhood: clinic.neighborhood || '',
    city: clinic.city || '',
    postal_code: clinic.postal_code || '',
    slug: clinic.slug,
    description: clinic.description || undefined,
    website: clinic.website || undefined,
    email: clinic.email || undefined,
    phone: clinic.phone || undefined,
    latitude: clinic.latitude || undefined,
    longitude: clinic.longitude || undefined,
    location: clinic.location,
    place_id: clinic.place_id,
    rating: clinic.rating,
    review_count: clinic.review_count,
    is_active: clinic.is_active,
    is_featured: clinic.is_featured,
    is_permanently_closed: clinic.is_permanently_closed,
    open_on_public_holidays: clinic.open_on_public_holidays,
    images: [],
    source: clinic.source || '',
    facebook_url: clinic.facebook_url || undefined,
    instagram_url: clinic.instagram_url || undefined,
    featured_video: clinic.featured_video || undefined,
    youtube_url: clinic.youtube_url || undefined,
    area_id: clinic.area_id || undefined,
    state_id: clinic.state_id || undefined,
    status: clinic.status || 'pending',
    businessHours: mapClinicHoursToBusinessHours(_hours),
    services: clinic.services || [],
  },
  mode: 'onChange',
});

<div className="col-span-6">
  <FormField
    control={form.control}
    name="services"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Clinic Services</FormLabel>
        <FormDescription>Select services provided.</FormDescription>
        <div className="grid grid-cols-3 gap-4">
          {categories.map((service) => (
            <Button
              key={service.slug}
              type="button"
              variant={field.value?.includes(service.slug) ? 'default' : 'outline'}
              onClick={() => {
                if (field.value?.includes(service.slug)) {
                  field.onChange(field.value.filter((v) => v !== service.slug));
                } else {
                  field.onChange([...(field.value || []), service.slug]);
                }
              }}
              className="flex flex-col items-start">
              <span className="font-semibold">{service.name}</span>
              <span className="text-xs text-gray-500">{service.description}</span>
            </Button>
          ))}
        </div>
        <FormMessage />
      </FormItem>
    )}
  />
</div>;
