import { apiSlice } from './apiSlice';

export const userProfileApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    getUserProfile: builder.query({
      query: () => '/users/me/',
      providesTags: ['User'],
      transformResponse: (raw: any) => ({
        id:                 raw.id,
        firstName:          raw.first_name,
        lastName:           raw.last_name,
        username:           raw.username,
        email:              raw.email,
        phone:              raw.phone,
        bio:                raw.bio,
        avatarUrl:          raw.avatar,
        isVerified:         raw.is_verified,
        birthCountry:       raw.birth_country,
        currentCountry:     raw.current_country,
        destinationCountry: raw.destination_country,
        city:               raw.city,
        stateProvince:      raw.state_province,
        migrationStatus:    raw.migration_status,
        membershipPlan:     raw.membership_plan,
        currency:           raw.currency,
        acceptedTerms:      raw.accepted_terms,
        createdAt:          raw.created_at,
        picture:            raw.avatar,
        phoneNumber:        raw.phone,
      }),
    }),

    savePersonalInformation: builder.mutation({
      query: (data) => ({
        url:    '/users/me/',
        method: 'PATCH',
        body: {
          first_name:          data.firstName,
          last_name:           data.lastName,
          phone:               data.phoneNumber,
          bio:                 data.bio,
          city:                data.city,
          state_province:      data.stateProvince,
          current_country:     data.currentCountry,
          destination_country: data.destinationCountry,
          migration_status:    data.migrationStatus,
        },
      }),
      invalidatesTags: ['User'],
    }),

    saveGeolocation: builder.mutation({
      query: (data: { city: string; current_country?: string }) => ({
        url:    '/users/me/',
        method: 'PATCH',
        body: {
          city:            data.city,
          current_country: data.current_country,
        },
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useGetUserProfileQuery,
  useSavePersonalInformationMutation,
  useSaveGeolocationMutation,
} = userProfileApiSlice;