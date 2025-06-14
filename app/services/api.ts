import axios from 'axios';
import { AppointmentData, RequestData, PaymentData } from '../types';

// Retry logic for failed requests
const fetchWithRetry = async (url: string, options: any, maxRetries = 3) => {
    let lastError;
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await axios({
                method: options.method,
                url: '/api/proxy',
                data: {
                    endpoint: url,
                    data: options.data
                },
                headers: options.headers
            });
            return response.data;
        } catch (error: any) {
            // Extract specific error message from 500 responses
            if (error.response?.status === 500 && error.response?.data?.message) {
                throw new Error(error.response.data.message);
            }
            lastError = error;
            if (i === maxRetries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
    }
    throw lastError;
};

// Convert numeric gender to string enum
const getGenderEnum = (gender: number): string => {
    switch (gender) {
        case 1:
            return 'Male';
        case 2:
            return 'Female';
        default:
            return 'Male'; // Default to Male if invalid value
    }
};

export const passportService = {
    // Submit appointment request
    submitAppointment: async (data: AppointmentData) => {
        try {
            return await fetchWithRetry('/Schedule/api/V1.0/Schedule/SubmitAppointment', {
                method: 'POST',
                data
            });
        } catch (error: any) {
            throw new Error(error.message || 'Failed to submit appointment');
        }
    },

    // Submit passport request
    submitRequest: async (data: RequestData) => {
        try {
            return await fetchWithRetry('/Request/api/V1.0/Request/SubmitRequest', {
                method: 'POST',
                data
            });
        } catch (error: any) {
            throw new Error(error.message || 'Failed to submit request');
        }
    },

    // Process payment
    processPayment: async (data: PaymentData) => {
        try {
            return await fetchWithRetry('/Payment/api/V1.0/Payment/OrderRequest', {
                method: 'POST',
                data
            });
        } catch (error: any) {
            throw new Error(error.message || 'Failed to process payment');
        }
    }
}; 