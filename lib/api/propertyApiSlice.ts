// /lib/api/propertyApiSlice.ts

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface PropertyData {
  id?: string;
  propertyTitle: string;
  propertyType: string;
  rentalType: string;
  description: string;
  address: string;
  nearestLandmark: string;
  city: string;
  state: string;
  country?: string;
  bedrooms: number | string;
  bathrooms: number | string;
  amenities: string[];
  images: (string | File)[];
  availableFrom: string;
  priceAmount: string | number;
  priceType: string;
  securityDeposit: boolean;
  minStayDuration: string | number;
  maxStayDuration: string | number;
  houseRules: string[];
}

export const propertyApi = createApi({
  reducerPath: 'propertyApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000'}/api`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('access_token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Properties'],
  endpoints: (builder) => ({
    createProperty: builder.mutation<PropertyData, Partial<PropertyData>>({
      query: (body) => ({
        url: '/services/properties/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Properties'],
    }),

    updateProperty: builder.mutation<PropertyData, { id: string; body: Partial<PropertyData> }>({
      query: ({ id, body }) => ({
        url: `/services/properties/${id}/`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Properties'],
    }),

    getProperties: builder.query<{ results: PropertyData[]; count: number }, void>({
      query: () => '/services/properties/',
      providesTags: ['Properties'],
    }),

    getProperty: builder.query<PropertyData, string>({
      query: (id) => `/services/properties/${id}/`,
    }),

    deleteProperty: builder.mutation<void, string>({
      query: (id) => ({
        url: `/services/properties/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Properties'],
    }),

    publishProperty: builder.mutation<void, string>({
      query: (id) => ({
        url: `/services/properties/${id}/publish/`,
        method: 'POST',
      }),
      invalidatesTags: ['Properties'],
    }),

    uploadImages: builder.mutation<{ images: string[] }, { id: string; formData: FormData }>({
      query: ({ id, formData }) => ({
        url: `/services/properties/${id}/upload-images/`,
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Properties'],
    }),

    searchProperties: builder.mutation<
      { results: PropertyData[]; total: number; page: number; totalPages: number },
      {
        city?: string;
        state?: string;
        propertyType?: string;
        maxPrice?: number;
        minPrice?: number;
        bedrooms?: number;
        bathrooms?: number;
        amenities?: string[];
        duration?: string;
        rentalType?: string;
        moveInDate?: string;
      }
    >({
      query: (filters) => ({
        url: '/services/properties/search/',
        method: 'POST',
        body: filters,
      }),
    }),
  }),
});

export const {
  useCreatePropertyMutation,
  useUpdatePropertyMutation,
  useGetPropertiesQuery,
  useGetPropertyQuery,
  useDeletePropertyMutation,
  usePublishPropertyMutation,
  useUploadImagesMutation,
  useSearchPropertiesMutation,
} = propertyApi;