import { apiSlice } from './apiSlice';
import type { Product } from './productsApiSlice';

export interface SavedListing {
  id: string;
  listing: Product;
  saved_at: string;
}

function normaliseListing(item: any): Product {
  return {
    id:            item.id,
    title:         item.title,
    description:   item.description   ?? '',
    price:         item.price,
    currency:      item.currency       ?? item.shop?.currency ?? 'USD',
    category:      item.category       ?? '',
    category_name: item.category_name  ?? item.category ?? 'Marketplace',
    category_slug: item.category_slug  ?? item.category?.slug ?? '',
    shop_name:     item.shop?.name     ?? item.shop_name ?? '',
    shop_id:       item.shop?.id       ?? item.shop_id   ?? '',
    images:        item.images         ?? [],
    is_available:  item.is_available   ?? true,
    is_boosted:    item.is_boosted     ?? false,
    country_code:  item.shop?.country_code ?? item.country_code ?? '',
    city:          item.shop?.city         ?? item.city          ?? '',
    created_at:    item.created_at     ?? '',
  };
}

export const savedListingsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSavedListings: builder.query<SavedListing[], void>({
      query: () => '/shops/saved/',
      transformResponse: (raw: any) => {
        const items = Array.isArray(raw) ? raw : (raw?.results ?? []);
        return items.map((item: any) => ({
          id:       item.id,
          saved_at: item.saved_at,
          listing:  normaliseListing(item.listing),
        }));
      },
      providesTags: [{ type: 'SavedListing', id: 'LIST' }],
    }),

    bookmarkListing: builder.mutation<
      { saved: boolean; listing?: Product; detail?: string },
      string
    >({
      query: (listingId) => ({
        url:    `/shops/listings/${listingId}/bookmark/`,
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'SavedListing', id: 'LIST' }],
    }),

    unbookmarkListing: builder.mutation<{ saved: boolean; detail?: string }, string>({
      query: (listingId) => ({
        url:    `/shops/listings/${listingId}/bookmark/`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'SavedListing', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetSavedListingsQuery,
  useBookmarkListingMutation,
  useUnbookmarkListingMutation,
} = savedListingsApiSlice;
