import { apiSlice } from "./apiSlice";

// Type definitions for property filters
export interface PropertyFilters {
  moveInDate?: string;
  budget?: number;
  amenities?: string[];
  propertyType?: string;
  duration?: string;
}

export const propertyApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    
    // POST /property/list - Search properties with filters
    searchProperties: builder.mutation<any[], PropertyFilters>({
      query: (filters = {}) => ({
        url: "/property/list",
        method: "POST",
        body: filters,
      }),
      invalidatesTags: ["Property"],
    }),

    // GET /property/view/all - Get all properties
    getAllProperties: builder.query<any[], void>({
      query: () => "/property/view/all",
      providesTags: ["Property"],
    }),

    // GET /property/view - Get properties (general view)
    getProperties: builder.query<any[], void>({
      query: () => "/property/view",
      providesTags: ["Property"],
    }),

    // GET /property/view/:id - Get property by ID
    getPropertyById: builder.query({
      query: (id) => `/property/view/${id}`,
      providesTags: ["Property"],
    }),

  }),
});

export const {
  useSearchPropertiesMutation,
  useGetAllPropertiesQuery,
  useLazyGetAllPropertiesQuery,
  useGetPropertiesQuery,
  useLazyGetPropertiesQuery,
  useGetPropertyByIdQuery,
  useLazyGetPropertyByIdQuery,
} = propertyApiSlice;