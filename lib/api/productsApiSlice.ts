import { apiSlice } from './apiSlice';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ProductImage {
  id: string;
  image: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: string;
  currency: string;
  category: string;
  category_name: string;
  category_slug: string;
  shop_name: string;
  shop_id: string;
  seller_id?: string;
  images: ProductImage[];
  is_available: boolean;
  is_boosted: boolean;
  listing_type?: string;
  condition?: string;
  country_code: string;
  city: string;
  created_at: string;
}

export interface ListingsParams {
  category?: string;
  country?: string;
  search?: string;
  ordering?: string;
  page?: number;
}

export const CATEGORY_SLUGS: Record<string, string> = {
  marketplace: 'marketplace',
  vehicles: 'vehicles',
  housing: 'housing',
  fashion: 'fashion',
  electronics: 'electronics',
  furniture: 'furniture',
  'baby-kids-store': 'baby-kids',
  books: 'books',
  'equipment-tools': 'equipment-tools',
};

function normalise(item: any): Product {
  return {
    id: item.id,
    title: item.title,
    description: item.description ?? '',
    price: item.price,
    currency: item.currency ?? item.shop?.currency ?? 'USD',
    category: item.category ?? '',
    category_name: item.category_name ?? item.category ?? 'Marketplace',
    category_slug: item.category_slug ?? item.category?.slug ?? '',
    shop_name: item.shop?.name ?? item.shop_name ?? '',
    shop_id: item.shop?.id ?? item.shop_id ?? '',
    seller_id: item.seller_id ?? item.shop?.owner_id ?? item.shop?.owner ?? '',
    images: item.images ?? [],
    is_available: item.is_available ?? true,
    is_boosted: item.is_boosted ?? false,
    listing_type: item.listing_type ?? 'sale',
    condition: item.condition ?? '',
    country_code: item.shop?.country_code ?? item.country_code ?? '',
    city: item.shop?.city ?? item.city ?? '',
    created_at: item.created_at ?? '',
  };
}

function toArray(raw: any): Product[] {
  // Handle both array response and paginated response { results: [...] }
  const items = Array.isArray(raw) ? raw : (raw?.results ?? []);
  return items.map(normalise);
}

// ── API slice ─────────────────────────────────────────────────────────────────

export const productsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    getAllProducts: builder.query<Product[], ListingsParams | void>({
      query: (params) => {
        const p = params ?? {};
        const qs = new URLSearchParams();
        if (p.category) qs.set('category', p.category);
        if (p.country) qs.set('country', p.country);
        if (p.search) qs.set('search', p.search);
        if (p.ordering) qs.set('ordering', p.ordering);
        if (p.page) qs.set('page', String(p.page));
        const query = qs.toString();
        return query ? `/shops/listings/?${query}` : '/shops/listings/';
      },
      transformResponse: toArray,
      providesTags: (result) =>
        result
          ? [
            ...result.map(({ id }) => ({ type: 'Product' as const, id })),
            { type: 'Product', id: 'LIST' },
          ]
          : [{ type: 'Product', id: 'LIST' }],
    }),

    getProductsByCategory: builder.query<Product[], string>({
      query: (category) =>
        category
          ? `/shops/listings/?category=${encodeURIComponent(category)}`
          : '/shops/listings/',
      transformResponse: toArray,
      providesTags: [{ type: 'Product', id: 'LIST' }],
    }),

    getMyProducts: builder.query<Product[], ListingsParams | void>({
      query: (params) => {
        const p = params ?? {};
        const qs = new URLSearchParams();
        if (p.search) qs.set('search', p.search);
        if (p.ordering) qs.set('ordering', p.ordering);
        if (p.page) qs.set('page', String(p.page));
        const query = qs.toString();
        return query ? `/shops/listings/my/?${query}` : '/shops/listings/my/';
      },
      transformResponse: toArray,
      providesTags: (result) =>
        result
          ? [
            ...result.map(({ id }) => ({ type: 'Product' as const, id })),
            { type: 'Product', id: 'MY_LIST' },
          ]
          : [{ type: 'Product', id: 'MY_LIST' }],
    }),

    getBoostedListings: builder.query<Product[], void>({
      query: () => '/shops/boosted/',
      transformResponse: toArray,
      providesTags: [{ type: 'Product', id: 'BOOSTED' }],
    }),

    getSingleProduct: builder.query<Product, string>({
      query: (id) => `/shops/listings/${id}/`,
      transformResponse: normalise,
      providesTags: (_result, _err, id) => [{ type: 'Product', id }],
    }),

    createListing: builder.mutation({
      query: (body: FormData | Record<string, unknown>) => ({
        url: '/shops/listings/',
        method: 'POST',
        body,
        ...(body instanceof FormData && { formData: true }),
      }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }, { type: 'Product', id: 'MY_LIST' }, 'Shop'],
    }),

    updateListing: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/shops/listings/${id}/`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _err, { id }) => [
        { type: 'Product', id },
        { type: 'Product', id: 'MY_LIST' },
        { type: 'Product', id: 'LIST' },
      ],
    }),

    deleteListing: builder.mutation({
      query: (id: string) => ({
        url: `/shops/listings/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }, { type: 'Product', id: 'MY_LIST' }],
    }),

    boostListing: builder.mutation({
      query: ({ id, duration_days }: { id: string; duration_days: number }) => ({
        url: `/shops/listings/${id}/boost/`,
        method: 'POST',
        body: { duration_days },
      }),
      invalidatesTags: (_result, _err, { id }) => [
        { type: 'Product', id },
        { type: 'Product', id: 'BOOSTED' },
      ],
    }),

    getMyShop: builder.query({
      query: () => '/shops/my/',
      providesTags: ['Shop'],
    }),

    createShop: builder.mutation({
      query: (body: FormData) => ({
        url: '/shops/create/',
        method: 'POST',
        body,
        formData: true,
      }),
      invalidatesTags: ['Shop'],
    }),

    updateShop: builder.mutation({
      query: ({ id, body }: { id: string; body: FormData | Record<string, any> }) => ({
        url: `/shops/${id}/`,
        method: 'PATCH',
        body,
        ...(body instanceof FormData && { formData: true }),
      }),
      invalidatesTags: ['Shop'],
    }),

    getCategories: builder.query<{ id: string; name: string; slug: string }[], void>({
      query: () => '/shops/categories/',
      transformResponse: (raw: any) => {
        if (Array.isArray(raw)) return raw;
        if (raw?.results) return raw.results;
        return [];
      },
    }),

  }),
});

// Export hooks
export const {
  useGetAllProductsQuery,
  useGetProductsByCategoryQuery,
  useGetMyProductsQuery,
  useGetBoostedListingsQuery,
  useGetSingleProductQuery,
  useCreateListingMutation,
  useUpdateListingMutation,
  useDeleteListingMutation,
  useBoostListingMutation,
  useGetMyShopQuery,
  useCreateShopMutation,
  useUpdateShopMutation,
  useGetCategoriesQuery,
} = productsApiSlice;

// Aliases as separate named exports
export const useAddProductMutation = productsApiSlice.endpoints.createListing.useMutation;
export const useDeleteProductMutation = productsApiSlice.endpoints.deleteListing.useMutation;