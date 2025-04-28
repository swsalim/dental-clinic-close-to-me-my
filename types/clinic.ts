import { Database } from './database.types';

export interface ClinicService {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string | null;
  modified_at: string | null;
}

export interface ClinicServiceRelation {
  id: string;
  clinic_id: string;
  service_id: string;
  created_at: string | null;
  modified_at: string | null;
}

export interface ClinicStateArea {
  id: string;
  name: string;
  slug: string;
  state_id: string | null;
  created_at: string | null;
  modified_at: string | null;
}

export type ClinicServiceInsert = Omit<ClinicService, 'id' | 'created_at' | 'modified_at'>;
export type ClinicServiceUpdate = Partial<ClinicServiceInsert>;

export interface ClinicDoctor {
  id: string;
  name: string;
  bio: string | null;
  specialty: string | null;
  clinic_id: string;
  created_at: string | null;
  modified_at: string | null;
}

export type ClinicDoctorInsert = Omit<ClinicDoctor, 'id' | 'created_at' | 'modified_at'>;
export type ClinicDoctorUpdate = Partial<ClinicDoctorInsert>;

export interface ClinicHours {
  id: string;
  clinic_id: string;
  day_of_week: number;
  open_time: string | null;
  close_time: string | null;
  created_at: string | null;
  modified_at: string | null;
}

export type ClinicHoursInsert = Omit<ClinicHours, 'id' | 'created_at' | 'modified_at'>;
export type ClinicHoursUpdate = Partial<ClinicHoursInsert>;

export interface ClinicSpecialHours {
  id: string;
  clinic_id: string;
  date: string;
  is_closed: boolean | null;
  open_time: string | null;
  close_time: string | null;
  created_at: string | null;
  modified_at: string | null;
}

export type ClinicSpecialHoursInsert = Omit<
  ClinicSpecialHours,
  'id' | 'created_at' | 'modified_at'
>;
export type ClinicSpecialHoursUpdate = Partial<ClinicSpecialHoursInsert>;

export interface ClinicReview {
  id: string;
  clinic_id: string;
  author_name: string;
  rating: number | null;
  text: string | null;
  email: string | null;
  review_time: string | null;
  source: string | null;
  status: string | null;
  created_at: string | null;
  modified_at: string | null;
}

export type ClinicReviewInsert = Omit<ClinicReview, 'id' | 'created_at' | 'modified_at'>;
export type ClinicReviewUpdate = Partial<ClinicReviewInsert>;

export interface Clinic {
  id: string;
  name: string;
  address: string | null;
  neighborhood: string | null;
  city: string | null;
  postal_code: string | null;
  slug: string;
  description: string | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  latitude: number | null;
  longitude: number | null;
  location: unknown | null;
  place_id: string;
  rating: number | null;
  review_count: number | null;
  is_active: boolean | null;
  is_featured: boolean | null;
  is_permanently_closed: boolean | null;
  open_on_public_holidays: boolean | null;
  images: string[] | null;
  source: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  featured_video: string | null;
  youtube_url: string | null;
  status: string | null;
  created_at: string | null;
  modified_at: string | null;

  // Relationships
  area_id: string | null;
  state_id: string | null;
  area?: Database['public']['Tables']['areas']['Row'] | null;
  state?: Database['public']['Tables']['states']['Row'] | null;
  doctors?: ClinicDoctor[] | null;
  hours?: ClinicHours[] | null;
  special_hours?: ClinicSpecialHours[] | null;
  reviews?: ClinicReview[] | null;
}

export type ClinicInsert = Omit<
  Clinic,
  | 'id'
  | 'created_at'
  | 'modified_at'
  | 'area'
  | 'state'
  | 'doctors'
  | 'hours'
  | 'special_hours'
  | 'reviews'
>;

export type ClinicUpdate = Partial<ClinicInsert>;
