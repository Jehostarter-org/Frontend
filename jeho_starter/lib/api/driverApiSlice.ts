import { apiSlice } from "./apiSlice";

export const driverApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        registerDriver: builder.mutation({
            query: (driverData) => ({
                url: '/driver/register',
                method: 'POST',
                body: driverData,
            }),
        }),
        setAvailabilityLocation: builder.mutation({
            query: (availabilityData: { pickupLocation: string; availabilitySchedule: string }) => ({
                url: '/driver/availability-location',
                method: 'POST',
                body: availabilityData,
            }),
        }),
    }),
});

export const {
    useRegisterDriverMutation,
    useSetAvailabilityLocationMutation,
} = driverApiSlice;
