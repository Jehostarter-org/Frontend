import { apiSlice } from './apiSlice';

export interface Place {
  place_id: string;
  name: string;
  vicinity: string;
  rating?: number;
  types: string[];
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  photos?: Array<{
    photo_reference: string;
  }>;
  opening_hours?: {
    open_now: boolean;
  };
  price_level?: number;
}

export interface PlacesResponse {
  results: Place[];
  status: string;
  next_page_token?: string;
}

export interface PlaceDetails {
  place_id: string;
  name: string;
  formatted_address: string;
  formatted_phone_number?: string;
  website?: string;
  rating?: number;
  reviews?: Array<{
    author_name: string;
    rating: number;
    text: string;
    time: number;
  }>;
  opening_hours?: {
    open_now: boolean;
    weekday_text?: string[];
  };
  photos?: Array<{
    photo_reference: string;
  }>;
}

export const placesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    searchNearbyPlaces: builder.query<
      PlacesResponse,
      { location: string; radius: number; type: 'hospital' | 'pharmacy' | 'bus_station' | 'taxi_stand' | 'supermarket' | 'grocery_or_supermarket' }
    >({
      query: ({ location, radius, type }) => ({
        url: `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location}&radius=${radius}&type=${type}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`,
        method: 'GET',
      }),
    }),
    getPlaceDetails: builder.query<PlaceDetails, { placeId: string }>({
      query: ({ placeId }) => ({
        url: `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,website,rating,reviews,opening_hours,photos&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`,
        method: 'GET',
      }),
    }),
    // New endpoints integration
    checkGoldEligibilityDestination: builder.query({
      query: () => "/plan/gold/eligibility/check/destination",
      providesTags: ["Geolocation"],
    }),
    checkEligibilityHome: builder.query({
      query: () => "/plan/eligibility/check/home",
      providesTags: ["Geolocation"],
    }),
  }),
});

export const { 
  useGetPlaceDetailsQuery,
  useSearchNearbyPlacesQuery, 
  useCheckEligibilityHomeQuery,
  useCheckGoldEligibilityDestinationQuery,
} = placesApiSlice;
