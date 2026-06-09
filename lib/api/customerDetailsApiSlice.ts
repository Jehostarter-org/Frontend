import { apiSlice } from './apiSlice';

export interface CustomerDetails {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  nationality: string;
  passportNumber: string;
  visaType: string;
  visaExpiryDate: string;
  airportLocation?: string;
  arrivalDate?: string;
  arrivalTime?: string;
  flightNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export const customerDetailsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCustomerDetails: builder.query<CustomerDetails, void>({
      query: () => '/customer/details',
    }),
    updateCustomerDetails: builder.mutation<CustomerDetails, Partial<CustomerDetails>>({
      query(body) {
        return {
          url: '/customer/details',
          method: 'PATCH',
          body,
        };
      },
    }),
  }),
});

export const useCustomerDetailsQuery = customerDetailsApiSlice.endpoints.getCustomerDetails.useQuery;
export const useUpdateCustomerDetailsMutation = customerDetailsApiSlice.endpoints.updateCustomerDetails.useMutation;