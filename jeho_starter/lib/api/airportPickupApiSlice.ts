import { apiSlice } from "./apiSlice";

export const airportAuthApiSlice = apiSlice.injectEndpoints({
   endpoints: (builder) => ({
        registerDriver: builder.mutation({
            query: (driverData) => ({
                url: '/driver/register',
                method: 'POST',
                body: driverData,
            }),
        }),
        // New endpoint integration
        setupAirportPlan: builder.mutation({
            query: (airportData) => ({
                url: '/plan/airport/setup',
                method: 'POST',
                body: airportData,
            }),
        }),
    }),
});

export const { useRegisterDriverMutation, useSetupAirportPlanMutation } = airportAuthApiSlice; 
