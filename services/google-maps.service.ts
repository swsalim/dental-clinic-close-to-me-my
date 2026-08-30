import {
  AddressComponent,
  AddressType,
  Client,
  GeocodeResult,
  Place,
  PlaceInputType,
} from '@googlemaps/google-maps-services-js';

import {
  type BusinessHours,
  mapGooglePeriodsToBusinessHours,
} from '@/lib/listing/business-hours';
import { normalizeMalaysiaPhone } from '@/lib/listing/phone';

export type PlaceLookupSource = 'google' | 'ai';

export type PlaceLookupResult = {
  source: PlaceLookupSource;
  name: string;
  address: string;
  phone: string;
  postal_code: string;
  website: string;
  stateName: string;
  city: string;
  hours: BusinessHours;
};

export class GoogleMapsService {
  private readonly client: Client;
  private readonly apiKey: string;

  constructor() {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      throw new Error('Google Maps API key is missing');
    }

    this.client = new Client({});
    this.apiKey = apiKey;
  }

  private extractAddressComponent(
    result: Pick<GeocodeResult, 'address_components'> | Pick<Place, 'address_components'>,
    type: AddressType,
    shortName: boolean = false,
  ): string | null {
    const component = result.address_components?.find((c: AddressComponent) =>
      c.types.includes(type),
    );
    return component ? (shortName ? component.short_name : component.long_name) : null;
  }

  async geocodeAddress(
    address: string,
    postalCode: string,
  ): Promise<{
    lat: number;
    lng: number;
    placeId: string;
    neighborhood: string | null;
    city: string | null;
  }> {
    const addressString = [address, postalCode, 'Malaysia'].filter(Boolean).join(', ');

    const geocodeResponse = await this.client.geocode({
      params: {
        address: addressString,
        region: 'my',
        key: this.apiKey,
      },
    });

    if (!geocodeResponse.data.results?.length) {
      throw new Error('Could not geocode the provided address');
    }

    const result = geocodeResponse.data.results[0];
    const { lat, lng } = result.geometry.location;

    const neighborhood =
      this.extractAddressComponent(result, 'sublocality_level_1' as AddressType, true) ||
      this.extractAddressComponent(result, 'neighborhood' as AddressType, true) ||
      null;

    const city =
      this.extractAddressComponent(result, 'locality' as AddressType, true) ||
      this.extractAddressComponent(result, 'administrative_area_level_2' as AddressType, true) ||
      null;

    return {
      lat,
      lng,
      placeId: result.place_id || '',
      neighborhood,
      city,
    };
  }

  async lookupPlaceFromUrl(url: string, source: PlaceLookupSource = 'google'): Promise<PlaceLookupResult> {
    const resolvedUrl = await this.resolveMapsUrl(url);
    const parsed = parseMapsUrl(resolvedUrl);

    let place: Place | null = null;

    if (parsed.placeId) {
      place = await this.getPlaceDetails(parsed.placeId);
    }

    if (!place && parsed.query) {
      const placeId = await this.findPlaceId(parsed.query);
      if (placeId) {
        place = await this.getPlaceDetails(placeId);
      }
    }

    if (!place) {
      throw new Error('Could not find this Google Maps listing');
    }

    return this.mapPlaceToLookup(place, source);
  }

  async lookupPlaceByName(query: string, source: PlaceLookupSource): Promise<PlaceLookupResult> {
    const placeId = await this.findPlaceId(`${query} Malaysia`);
    if (!placeId) {
      throw new Error('Could not find this Google Maps listing');
    }
    const place = await this.getPlaceDetails(placeId);
    if (!place) {
      throw new Error('Could not find this Google Maps listing');
    }
    return this.mapPlaceToLookup(place, source);
  }

  private async resolveMapsUrl(url: string): Promise<string> {
    try {
      const response = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });
      return response.url || url;
    } catch {
      return url;
    }
  }

  private async getPlaceDetails(placeId: string): Promise<Place | null> {
    try {
      const response = await this.client.placeDetails({
        params: {
          place_id: placeId,
          fields: [
            'name',
            'formatted_address',
            'address_component',
            'formatted_phone_number',
            'international_phone_number',
            'opening_hours',
            'website',
            'place_id',
          ],
          region: 'my',
          key: this.apiKey,
        },
      });
      if (response.data.status !== 'OK' || !response.data.result) {
        return null;
      }
      return response.data.result;
    } catch (error) {
      console.error('Place details failed:', error);
      return null;
    }
  }

  private async findPlaceId(query: string): Promise<string | null> {
    try {
      const response = await this.client.findPlaceFromText({
        params: {
          input: query,
          inputtype: PlaceInputType.textQuery,
          fields: ['place_id', 'name'],
          locationbias: 'circle:200000@4.2105,101.9758',
          key: this.apiKey,
        },
      });
      return response.data.candidates?.[0]?.place_id || null;
    } catch (error) {
      console.error('Find place failed:', error);
      return null;
    }
  }

  private mapPlaceToLookup(place: Place, source: PlaceLookupSource): PlaceLookupResult {
    const addressParts = place.address_components ?? [];
    const result = { address_components: addressParts };

    const postalCode = this.extractAddressComponent(result, 'postal_code' as AddressType) || '';
    const stateName =
      this.extractAddressComponent(result, 'administrative_area_level_1' as AddressType) || '';
    const city =
      this.extractAddressComponent(result, 'locality' as AddressType) ||
      this.extractAddressComponent(result, 'sublocality_level_1' as AddressType) ||
      this.extractAddressComponent(result, 'administrative_area_level_2' as AddressType) ||
      '';

    return {
      source,
      name: place.name || '',
      address: place.formatted_address || '',
      phone: normalizeMalaysiaPhone(
        place.international_phone_number || place.formatted_phone_number || '',
      ),
      postal_code: postalCode,
      website: place.website || '',
      stateName,
      city,
      hours: mapGooglePeriodsToBusinessHours(place.opening_hours?.periods),
    };
  }
}

export function parseMapsUrl(url: string): { placeId?: string; query?: string } {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return {};
  }

  const placeId =
    parsed.searchParams.get('place_id') ||
    parsed.searchParams.get('query_place_id') ||
    url.match(/place_id[=:]([A-Za-z0-9_-]+)/)?.[1] ||
    undefined;

  const queryParam = parsed.searchParams.get('query') || parsed.searchParams.get('q') || undefined;

  const placeMatch = parsed.pathname.match(/\/maps\/place\/([^/]+)/);
  let query = queryParam;
  if (placeMatch) {
    query = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '))
      .replace(/@.*$/, '')
      .split('!')[0]
      .trim();
  }

  if (query && /^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/.test(query)) {
    query = undefined;
  }

  return { placeId: placeId || undefined, query: query || undefined };
}
