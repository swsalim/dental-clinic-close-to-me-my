# Migration Guide: Updating Existing Functions to Use Caching

This guide shows how to migrate your existing Supabase functions to use the new caching system.

## Step 1: Update Imports

### Before (Original Functions)
```typescript
// In your component or page
import { getClinicBySlug, getClinics } from '@/helpers/clinics';
import { getDoctorBySlug, getDoctors } from '@/helpers/doctors';
import { getStateListings } from '@/helpers/states';
```

### After (Cached Functions)
```typescript
// In your component or page
import { getClinicBySlug, getClinics } from '@/helpers/clinics-cached';
import { getDoctorBySlug, getDoctors } from '@/helpers/doctors-cached';
import { getStateListings } from '@/helpers/states-cached';
```

## Step 2: Update API Routes

### Before (No Cache Invalidation)
```typescript
// app/api/clinics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = createAdminClient();
    
    const { data, error } = await supabase
      .from('clinics')
      .insert(body)
      .select()
      .single();
    
    if (error) throw error;
    
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create clinic' }, { status: 500 });
  }
}
```

### After (With Cache Invalidation)
```typescript
// app/api/clinics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { CacheInvalidationStrategies } from '@/lib/cache/cache-invalidation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = createAdminClient();
    
    const { data, error } = await supabase
      .from('clinics')
      .insert(body)
      .select()
      .single();
    
    if (error) throw error;
    
    // Invalidate clinic caches after successful creation
    await CacheInvalidationStrategies.onClinicChange();
    
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create clinic' }, { status: 500 });
  }
}
```

## Step 3: Update Database Service

### Before (No Cache Invalidation)
```typescript
// services/database.service.ts
export class DatabaseService {
  async createClinic(data: ClinicData) {
    const { error, data: clinic } = await this.supabase
      .from('clinics')
      .insert({
        ...data,
        images: null,
        rating: 0,
        review_count: 0,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create clinic: ${error.message}`);
    }

    return clinic;
  }
}
```

### After (With Cache Invalidation)
```typescript
// services/database.service.ts
import { CacheInvalidationStrategies } from '@/lib/cache/cache-invalidation';

export class DatabaseService {
  async createClinic(data: ClinicData) {
    const { error, data: clinic } = await this.supabase
      .from('clinics')
      .insert({
        ...data,
        images: null,
        rating: 0,
        review_count: 0,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create clinic: ${error.message}`);
    }

    // Invalidate clinic caches after successful creation
    await CacheInvalidationStrategies.onClinicChange();

    return clinic;
  }
}
```

## Step 4: Update Component Usage

### Before (Direct Database Calls)
```typescript
// components/listing/recent-clinics-list.tsx
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function RecentClinicsList() {
  const [clinics, setClinics] = useState<Partial<Clinic>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchRecentClinics() {
      try {
        const { data, error } = await supabase
          .from('clinics')
          .select(`
            id,
            name,
            slug,
            address,
            phone,
            postal_code,
            rating,
            images:clinic_images(image_url, imagekit_file_id),
            open_on_public_holidays,
            hours:clinic_hours(*),
            special_hours:clinic_special_hours(*),
            area:areas!inner(name),
            state:states!inner(name)
          `)
          .eq('is_active', true)
          .order('modified_at', { ascending: false })
          .limit(8);

        if (error) throw error;
        setClinics((data as unknown as Partial<Clinic>[]) || []);
      } catch (error) {
        console.error('Error fetching recent clinics:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRecentClinics();
  }, [supabase]);

  // ... rest of component
}
```

### After (Using Cached Functions)
```typescript
// components/listing/recent-clinics-list.tsx
'use client';

import { useEffect, useState } from 'react';
import { getClinics } from '@/helpers/clinics-cached';

export function RecentClinicsList() {
  const [clinics, setClinics] = useState<Partial<Clinic>[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRecentClinics() {
      try {
        // Use cached function instead of direct database call
        const { data } = await getClinics({
          limit: 8,
          // Add any other filters as needed
        });

        setClinics(data || []);
      } catch (error) {
        console.error('Error fetching recent clinics:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRecentClinics();
  }, []);

  // ... rest of component
}
```

## Step 5: Update Server Components

### Before (Direct Database Calls)
```typescript
// app/(listing)/[state]/[area]/page.tsx
import { createServerClient } from '@/lib/supabase';

export default async function AreaPage({ params }: { params: { state: string; area: string } }) {
  const supabase = await createServerClient();
  
  const { data: clinics } = await supabase
    .from('clinics')
    .select(`
      *,
      area:areas(*),
      state:states(*),
      categories:clinic_category_relations(
        category:clinic_categories(*)
      )
    `)
    .eq('area.slug', params.area)
    .eq('state.slug', params.state)
    .eq('is_active', true)
    .eq('status', 'approved');

  return (
    <div>
      {/* Render clinics */}
    </div>
  );
}
```

### After (Using Cached Functions)
```typescript
// app/(listing)/[state]/[area]/page.tsx
import { getClinics } from '@/helpers/clinics-cached';
import { getAreaBySlug } from '@/helpers/areas-cached';

export default async function AreaPage({ params }: { params: { state: string; area: string } }) {
  // Use cached functions for better performance
  const [areaData, { data: clinics }] = await Promise.all([
    getAreaBySlug(params.area, 0, 20),
    getClinics({
      // Add filters based on your needs
      limit: 20,
    })
  ]);

  return (
    <div>
      {/* Render clinics */}
    </div>
  );
}
```

## Step 6: Update Dashboard Components

### Before (Direct Database Calls)
```typescript
// app/(dashboard)/dashboard/page.tsx
import { createServerClient } from '@/lib/supabase';
import { subDays, addDays } from 'date-fns';

export default async function Dashboard() {
  const supabase = await createServerClient();
  const now = new Date();
  const date = {
    from: subDays(now, 7),
    to: now,
  };

  const adjustedToDate = addDays(date.to, 1).toISOString();
  const adjustedFromDate = date.from.toISOString();

  const [clinicsResponse, doctorsResponse] = await Promise.all([
    supabase
      .from('clinics')
      .select(`
        id,
        name,
        slug,
        website,
        images,
        area:area_id(name, slug),
        state:state_id(name, slug),
        is_active
      `)
      .lt('created_at', adjustedToDate)
      .gt('created_at', adjustedFromDate)
      .order('name', { ascending: true }),
    supabase.from('clinic_doctors').select('*').order('name', { ascending: true }),
  ]);

  // ... rest of component
}
```

### After (Using Cached Functions)
```typescript
// app/(dashboard)/dashboard/page.tsx
import { getClinics } from '@/helpers/clinics-cached';
import { getDoctors } from '@/helpers/doctors-cached';
import { subDays, addDays } from 'date-fns';

export default async function Dashboard() {
  const now = new Date();
  const date = {
    from: subDays(now, 7),
    to: now,
  };

  // Use cached functions for better performance
  const [clinicsResponse, doctorsResponse] = await Promise.all([
    getClinics({
      limit: 50,
      // Add date filters if needed
    }),
    getDoctors({
      limit: 50,
    }),
  ]);

  // ... rest of component
}
```

## Step 7: Update Form Submissions

### Before (No Cache Invalidation)
```typescript
// components/forms/submit-clinic-form.tsx
const handleSubmit = async (data: FormData) => {
  try {
    const response = await fetch('/api/clinics', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (response.ok) {
      // Success handling
    }
  } catch (error) {
    // Error handling
  }
};
```

### After (With Cache Invalidation)
```typescript
// components/forms/submit-clinic-form.tsx
const handleSubmit = async (data: FormData) => {
  try {
    const response = await fetch('/api/clinics', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (response.ok) {
      // Cache will be automatically invalidated by the API route
      // Success handling
    }
  } catch (error) {
    // Error handling
  }
};
```

## Step 8: Update Static Generation

### Before (Direct Database Calls)
```typescript
// app/(listing)/[state]/[area]/page.tsx
export async function generateStaticParams() {
  const supabase = await createServerClient();
  
  const { data: areas } = await supabase
    .from('areas')
    .select('slug, state:states(slug)');

  return areas?.map((area) => ({
    state: area.state.slug,
    area: area.slug,
  })) || [];
}
```

### After (Using Cached Functions)
```typescript
// app/(listing)/[state]/[area]/page.tsx
import { getAreaListings } from '@/helpers/areas-cached';

export async function generateStaticParams() {
  const areas = await getAreaListings();

  return areas.map((area) => ({
    state: area.state.slug,
    area: area.slug,
  }));
}
```

## Benefits of Migration

1. **Improved Performance**: Cached functions reduce database load and response times
2. **Better User Experience**: Faster page loads and interactions
3. **Reduced Costs**: Lower database usage and function execution time
4. **Automatic Cache Management**: Smart invalidation keeps data fresh
5. **Backward Compatibility**: Existing code continues to work

## Testing the Migration

1. **Verify Functionality**: Ensure all features work as expected
2. **Check Performance**: Monitor response times and database usage
3. **Test Cache Invalidation**: Verify caches are properly invalidated
4. **Monitor Errors**: Watch for any cache-related issues

## Rollback Plan

If issues arise, you can easily rollback by:

1. Reverting import statements to original helper functions
2. Removing cache invalidation calls from API routes
3. The original functions remain unchanged and functional

This migration provides significant performance improvements while maintaining full backward compatibility.
