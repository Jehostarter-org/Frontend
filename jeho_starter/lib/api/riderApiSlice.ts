import { apiSlice } from "./apiSlice";

export const riderApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        bookAirportPickup: builder.mutation({
            query: (bookingData) => ({
                url: '/rider/book/airport/pickup',
                method: 'POST',
                body: bookingData,
            }),
        }),
        getRideDetail: builder.query({
            query: (rideId: string) => `/rider/detail/${rideId}`,
        }),
        getVehicleTypes: builder.query({
            query: () => '/rider/vehicle/type',
        }),
    }),
});

export const {
    useBookAirportPickupMutation,
    useGetRideDetailQuery,
    useGetVehicleTypesQuery,
} = riderApiSlice;
