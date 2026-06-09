import { apiSlice } from "./apiSlice";
import { VEHICLE_TEMPLATES } from "@/components/dashboard/airport-pickup/riders-pickup/vehicle-stats";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Airport {
    id: string;
    label: string;
    value: string;
    country: string;
    lat: number;
    lng: number;
}

export interface AirportsResponse {
    airports: Airport[];
    supported_countries: string[];
}

export interface DriverDetails {
    full_name: string;
    profile_photo: string | null;
    vehicle_display: string;
    vehicle_colour: string;
    vehicle_model: string;
    license_plate_number: string;
    front_view_picture: string | null;
    rating: number;
    total_trips: number;
}

export interface AirportPickupDetails {
    flight_number: string;
    arrival_datetime: string;
    airport: string;
    terminal: string;
    pickup_point: string;
    num_passengers: number;
    num_bags: number;
    special_requests: string;
    distance_to_terminal_km?: number | null;
    waiting_time_min?: number | null;
    suggested_pickup_spot?: string;
    flight_status?: string;
    actual_landing_time?: string | null;
    driver_arrived_at?: string | null;
    passenger_picked_up_at?: string | null;
}

export interface ServiceRequest {
    id: string;
    requester: string;
    requester_name: string;
    provider: string | null;
    provider_name: string | null;
    service_type: string;
    description: string;
    country_code: string;
    city: string;
    scheduled_at: string | null;
    status: "pending" | "accepted" | "in_progress" | "completed" | "cancelled";
    price: string | null;
    currency: string;
    notes: string;
    created_at: string;
    updated_at: string;
    airport_pickup_details: AirportPickupDetails | null;
    driver_details: DriverDetails | null;
    review: { id: string; rating: number; comment: string; created_at: string } | null;

    // Distance tracking fields
    pickup_address?: string | null;
    arrival_address?: string | null;
    distance_km?: number | null;
    estimated_duration_min?: number | null;
    distance_price_multiplier?: number;
    original_base_price?: string | null;
    distance_calculation_method?: string;
}

export interface BookAirportPickupPayload {
    service_type: "airport_pickup";
    destination: string;  // This goes to notes in backend
    airport_pickup_details: {
        airport: string;
        terminal: string;
        pickup_point: string;
        arrival_date: string;        // "YYYY-MM-DD"
        estimated_arrival_time: string; // "HH:MM" or "HH:MM:SS"
        flight_number?: string;
        num_passengers?: number;
        num_bags?: number;
        special_requests?: string;
    };
}

export interface SubmitReviewPayload {
    serviceId: string;
    rating: number;
    comment: string;
}

// Pricing response from GET /api/services/pricing/
export interface VehiclePriceItem {
    id: string;
    price: number;
}

export interface VehiclePricingResponse {
    currency: string;
    country_code: string;
    vehicles: VehiclePriceItem[];
}

export interface VehicleOption {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    capacity: number;
    luggage: number;
}

export interface ConfirmVehiclePayload {
    serviceRequestId: string;
    vehicle_type: string;
}

export interface ConfirmVehicleResponse {
    id: string;
    vehicle_type: string;
    price: string;
    currency: string;
    base_price?: string;
    distance_km?: number | null;
}

export interface CalculateDistancePayload {
    pickup_address: string;
    pickup_city: string;
    pickup_country: string;
    arrival_address: string;
    arrival_city: string;
    arrival_country: string;
    vehicle_type?: string;
}

export interface CalculateDistanceResponse {
    distance_km: number;
    duration_min: number;
    distance_type: string;
    base_price: number;
    calculated_price: number;
    long_distance_fee: number;
    total_price: number;
    price_per_km: number;
    is_long_distance: boolean;
    pickup_coords?: [number, number];
    arrival_coords?: [number, number];
    api_response_time_ms?: number;
}

export interface GeocodeAddressPayload {
    address: string;
    city: string;
    country: string;
}

export interface GeocodeAddressResponse {
    latitude: number;
    longitude: number;
    address: string;
}

export interface UpdateTripStatusPayload {
    status: "en_route" | "arrived" | "picked_up" | "completed";
    notes?: string;
}

export interface TripStatusResponse {
    service_id: string;
    status: string;
    message: string;
}

// ─── API Slice ────────────────────────────────────────────────────────────────

export const riderApiSlice = apiSlice.injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({

        // GET /api/services/airports/
        getAirports: builder.query<AirportsResponse, string | void>({
            query: (country) => {
                const params = country ? `?country=${country}` : "";
                return `/services/airports/${params}`;
            },
        }),

        // GET /api/services/pricing/
        getVehiclePricing: builder.query<VehiclePricingResponse, void>({
            query: () => "/services/pricing/",
        }),

        // POST /api/services/calculate-distance/
        calculateDistance: builder.mutation<CalculateDistanceResponse, CalculateDistancePayload>({
            query: (payload) => ({
                url: "/services/calculate-distance/",
                method: "POST",
                body: payload,
            }),
        }),

        // POST /api/services/geocode/
        geocodeAddress: builder.mutation<GeocodeAddressResponse, GeocodeAddressPayload>({
            query: (payload) => ({
                url: "/services/geocode/",
                method: "POST",
                body: payload,
            }),
        }),

        // POST /api/services/ — create the service request (book pickup)
        bookAirportPickup: builder.mutation<ServiceRequest, BookAirportPickupPayload>({
            query: (payload) => ({
                url: "/services/",
                method: "POST",
                body: payload,
            }),
            invalidatesTags: ["Service"],
        }),

        // GET /api/services/ — list my own requests
        getMyServiceRequests: builder.query<ServiceRequest[], void>({
            query: () => "/services/",
            providesTags: ["Service"],
        }),

        // GET /api/services/<pk>/ — single request (contains driver_details)
        getServiceRequest: builder.query<ServiceRequest, string>({
            query: (id) => `/services/${id}/`,
            providesTags: (_result, _error, id) => [{ type: "Service", id }],
        }),

        // PATCH /api/services/<pk>/confirm-vehicle/
        confirmVehicle: builder.mutation<ConfirmVehicleResponse, ConfirmVehiclePayload>({
            query: ({ serviceRequestId, vehicle_type }) => ({
                url: `/services/${serviceRequestId}/confirm-vehicle/`,
                method: "PATCH",
                body: { vehicle_type },
            }),
            invalidatesTags: (_result, _error, { serviceRequestId }) => [
                { type: "Service", id: serviceRequestId },
            ],
        }),

        // PATCH /api/services/<pk>/update-distance/
        updateServiceDistance: builder.mutation<ServiceRequest, {
            serviceRequestId: string;
            pickup_address: string;
            arrival_address: string;
        }>({
            query: ({ serviceRequestId, pickup_address, arrival_address }) => ({
                url: `/services/${serviceRequestId}/update-distance/`,
                method: "PATCH",
                body: { pickup_address, arrival_address },
            }),
            invalidatesTags: (_result, _error, { serviceRequestId }) => [
                { type: "Service", id: serviceRequestId },
            ],
        }),

        // GET /api/services/<pk>/track-driver/
        trackDriverLocation: builder.query<any, string>({
            query: (serviceRequestId) => `/services/${serviceRequestId}/track-driver/`,
            providesTags: (_result, _error, id) => [{ type: "Service", id }],
        }),

        // PATCH /api/services/<pk>/trip-status/
        updateTripStatus: builder.mutation<TripStatusResponse, {
            serviceRequestId: string;
            payload: UpdateTripStatusPayload;
        }>({
            query: ({ serviceRequestId, payload }) => ({
                url: `/services/${serviceRequestId}/trip-status/`,
                method: "PATCH",
                body: payload,
            }),
            invalidatesTags: (_result, _error, { serviceRequestId }) => [
                { type: "Service", id: serviceRequestId },
            ],
        }),

        // POST /api/services/<pk>/review/
        submitReview: builder.mutation<void, SubmitReviewPayload>({
            query: ({ serviceId, rating, comment }) => ({
                url: `/services/${serviceId}/review/`,
                method: "POST",
                body: { rating, comment },
            }),
            invalidatesTags: (_result, _error, { serviceId }) => [
                { type: "Service", id: serviceId },
            ],
        }),

        // Vehicle types — merges static templates with live API prices.
        getVehicleTypes: builder.query<VehicleOption[], void>({
            queryFn: async (_arg, _api, _extraOptions, baseQuery) => {
                const result = await baseQuery("/services/pricing/");
                if (result.error) {
                    return {
                        data: VEHICLE_TEMPLATES.map((v) => ({ ...v, price: 0 })),
                    };
                }
                const pricing = result.data as VehiclePricingResponse;
                const priceMap = Object.fromEntries(
                    pricing.vehicles.map((v) => [v.id, v.price])
                );
                const merged: VehicleOption[] = VEHICLE_TEMPLATES.map((template) => ({
                    ...template,
                    price: priceMap[template.id] ?? 0,
                }));
                return { data: merged };
            },
        }),

        // GET /api/services/available/ — list available (unclaimed) service requests for drivers
        getAvailableServiceRequests: builder.query<ServiceRequest[], void>({
            query: () => "/services/available/",
            providesTags: ["Service"],
        }),

        // POST /api/services/<pk>/claim/ — driver claims a service request
        claimServiceRequest: builder.mutation<ServiceRequest, string>({
            query: (serviceRequestId) => ({
                url: `/services/${serviceRequestId}/claim/`,
                method: "POST",
            }),
            invalidatesTags: (_result, _error, serviceRequestId) => [
                { type: "Service", id: serviceRequestId },
                "Service",
            ],
        }),
    }),
});

export const {
    useGetAirportsQuery,
    useGetVehiclePricingQuery,
    useCalculateDistanceMutation,
    useGeocodeAddressMutation,
    useBookAirportPickupMutation,
    useGetMyServiceRequestsQuery,
    useGetServiceRequestQuery,
    useConfirmVehicleMutation,
    useUpdateServiceDistanceMutation,
    useTrackDriverLocationQuery,
    useUpdateTripStatusMutation,
    useSubmitReviewMutation,
    useGetVehicleTypesQuery,
    useGetAvailableServiceRequestsQuery,
    useClaimServiceRequestMutation,
} = riderApiSlice;