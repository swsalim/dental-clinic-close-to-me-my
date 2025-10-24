# Supabase Caching System

This document describes the comprehensive caching system implemented for Supabase calls to reduce function execution time and improve application performance.

## Overview

The caching system provides:
- **Centralized cache management** for all Supabase queries
- **Automatic cache invalidation** strategies for data updates
- **Configurable cache durations** based on data volatility
- **Type-safe cache utilities** with TypeScript support
- **Backward compatibility** with existing code

## Architecture

### Core Components

1. **Cache Utility (`lib/cache/supabase-cache.ts`)**
   - Centralized cache configuration
   - Generic cache wrappers
   - Cache key generators
   - Cache invalidation utilities

2. **Cached Helper Functions**
   - `helpers/clinics-cached.ts` - Cached clinic queries
   - `helpers/doctors-cached.ts` - Cached doctor queries
   - `helpers/states-cached.ts` - Cached state queries
   - `helpers/areas-cached.ts` - Cached area queries
   - `helpers/services-cached.tsx` - Cached service queries

3. **Cache Invalidation (`lib/cache/cache-invalidation.ts`)**
   - Strategic cache invalidation patterns
   - Data-specific invalidation strategies
   - Bulk operation support

## Cache Configuration

### Cache Durations

```typescript
export const CACHE_CONFIG = {
  STATIC: {
    revalidate: 3600, // 1 hour - for rarely changing data
    tags: ['static-data'],
  },
  SEMI_STATIC: {
    revalidate: 1800, // 30 minutes - for occasionally changing data
    tags: ['semi-static-data'],
  },
  DYNAMIC: {
    revalidate: 300, // 5 minutes - for frequently changing data
    tags: ['dynamic-data'],
  },
  REALTIME: {
    revalidate: 60, // 1 minute - for real-time data
    tags: ['realtime-data'],
  },
};
```

### Cache Tags

```typescript
export const CACHE_TAGS = {
  CLINICS: 'clinics',
  CLINIC_DETAILS: 'clinic-details',
  DOCTORS: 'doctors',
  DOCTOR_DETAILS: 'doctor-details',
  STATES: 'states',
  AREAS: 'areas',
  SERVICES: 'services',
  REVIEWS: 'reviews',
  // ... more tags
};
```

## Usage Examples

### Basic Cached Function

```typescript
import { createClinicCache } from '@/lib/cache/supabase-cache';

export const getClinicBySlugCached = createClinicCache(
  async (slug: string, status: string = 'approved') => {
    const supabase = await createServerClient();
    // Your Supabase query here
    const { data, error } = await supabase
      .from('clinics')
      .select('*')
      .eq('slug', slug)
      .single();
    
    return data;
  },
  'clinic-by-slug',
  CACHE_CONFIG.SEMI_STATIC,
);
```

### Using Cached Functions

```typescript
import { getClinicBySlugCached } from '@/helpers/clinics-cached';

// This will use the cached version
const clinic = await getClinicBySlugCached('example-clinic', 'approved');
```

### Cache Invalidation

```typescript
import { CacheInvalidationStrategies } from '@/lib/cache/cache-invalidation';

// Invalidate caches when a clinic is updated
await CacheInvalidationStrategies.onClinicChange('clinic-slug');

// Invalidate all clinic-related caches
await CacheInvalidationStrategies.onClinicChange();
```

## Migration Guide

### Step 1: Update Imports

Replace existing imports with cached versions:

```typescript
// Before
import { getClinicBySlug } from '@/helpers/clinics';

// After
import { getClinicBySlug } from '@/helpers/clinics-cached';
```

### Step 2: Add Cache Invalidation to API Routes

```typescript
import { CacheInvalidationStrategies } from '@/lib/cache/cache-invalidation';

export async function POST(request: NextRequest) {
  try {
    // Your existing logic
    const result = await createClinic(data);
    
    // Add cache invalidation
    await CacheInvalidationStrategies.onClinicChange();
    
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
```

### Step 3: Update Database Service

```typescript
import { CacheInvalidationStrategies } from '@/lib/cache/cache-invalidation';

export class DatabaseService {
  async createClinic(data: ClinicData) {
    const clinic = await this.supabase
      .from('clinics')
      .insert(data)
      .select()
      .single();
    
    // Invalidate caches after successful creation
    await CacheInvalidationStrategies.onClinicChange();
    
    return clinic;
  }
}
```

## Performance Benefits

### Before Caching
- Every request triggers a database query
- High database load
- Slower response times
- Higher costs

### After Caching
- Repeated requests served from cache
- Reduced database load
- Faster response times
- Lower costs

## Cache Invalidation Strategies

### Automatic Invalidation

The system provides automatic cache invalidation for:

1. **Clinic Changes**
   - Creation, update, deletion
   - Status changes (approved/rejected)
   - Image updates
   - Service updates
   - Category updates

2. **Doctor Changes**
   - Creation, update, deletion
   - Status changes
   - Image updates
   - Specialty updates

3. **Review Changes**
   - Creation, update, deletion
   - Status changes

4. **Static Data Changes**
   - States, areas, services
   - Categories, specialties

### Manual Invalidation

```typescript
import { CacheInvalidationUtils } from '@/lib/cache/cache-invalidation';

// Invalidate specific clinic and related data
await CacheInvalidationUtils.invalidateClinicAndRelated('clinic-slug');

// Invalidate by data type and operation
await CacheInvalidationUtils.invalidateByDataType('clinic', 'clinic-id', 'update');
```

## Best Practices

### 1. Choose Appropriate Cache Duration

- **Static data** (states, areas): Use `CACHE_CONFIG.STATIC`
- **Semi-static data** (clinics, doctors): Use `CACHE_CONFIG.SEMI_STATIC`
- **Dynamic data** (reviews, bookings): Use `CACHE_CONFIG.DYNAMIC`
- **Real-time data** (live status): Use `CACHE_CONFIG.REALTIME`

### 2. Invalidate Caches Strategically

- Invalidate specific caches when possible
- Use bulk invalidation for mass operations
- Consider data relationships when invalidating

### 3. Monitor Cache Performance

- Use Next.js cache metrics
- Monitor cache hit rates
- Adjust cache durations based on usage patterns

### 4. Handle Cache Misses Gracefully

```typescript
export const getClinicBySlugCached = createClinicCache(
  async (slug: string) => {
    try {
      const supabase = await createServerClient();
      const { data, error } = await supabase
        .from('clinics')
        .select('*')
        .eq('slug', slug)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Cache miss or error:', error);
      // Fallback to non-cached version if needed
      return null;
    }
  },
  'clinic-by-slug',
  CACHE_CONFIG.SEMI_STATIC,
);
```

## Troubleshooting

### Common Issues

1. **Stale Data**
   - Check cache invalidation is properly implemented
   - Verify cache tags are correct
   - Ensure invalidation is called after data updates

2. **Cache Not Working**
   - Verify function is using cached version
   - Check cache configuration
   - Ensure proper imports

3. **Performance Issues**
   - Monitor cache hit rates
   - Adjust cache durations
   - Consider cache size limits

### Debug Tools

```typescript
import { revalidateTag } from 'next/cache';

// Manually invalidate specific cache
await revalidateTag('clinic-details');

// Check cache status (in development)
console.log('Cache status:', process.env.NODE_ENV);
```

## Future Enhancements

1. **Redis Integration** - For distributed caching
2. **Cache Analytics** - Detailed performance metrics
3. **Smart Invalidation** - AI-powered cache invalidation
4. **Cache Warming** - Proactive cache population
5. **Edge Caching** - CDN-level caching

## Conclusion

The Supabase caching system provides a robust, scalable solution for improving application performance while maintaining data consistency. By following the guidelines and best practices outlined in this document, you can effectively reduce function execution time and improve user experience.
