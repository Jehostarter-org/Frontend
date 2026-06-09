// /lib/api/propertyApi.ts (not propertyApiSlice.ts)

import axios from 'axios';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000'}/api`;

const getAuthHeader = () => {
    const token = localStorage.getItem('access_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const propertyApi = {
    createProperty: async (data: any) => {
        const response = await axios.post(`${API_BASE_URL}/services/properties/`, data, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    updateProperty: async (id: string, data: any) => {
        const response = await axios.patch(`${API_BASE_URL}/services/properties/${id}/`, data, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    getProperties: async () => {
        const response = await axios.get(`${API_BASE_URL}/services/properties/`, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    getProperty: async (id: string) => {
        const response = await axios.get(`${API_BASE_URL}/services/properties/${id}/`, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    deleteProperty: async (id: string) => {
        const response = await axios.delete(`${API_BASE_URL}/services/properties/${id}/`, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    publishProperty: async (id: string) => {
        const response = await axios.post(`${API_BASE_URL}/services/properties/${id}/publish/`, {}, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    uploadImages: async (id: string, formData: FormData) => {
        const response = await axios.post(`${API_BASE_URL}/services/properties/${id}/upload-images/`, formData, {
            headers: {
                ...getAuthHeader(),
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    searchProperties: async (filters: any) => {
        const response = await axios.post(`${API_BASE_URL}/services/properties/search/`, filters, {
            headers: getAuthHeader(),
        });
        return response.data;
    },
};

export default propertyApi;