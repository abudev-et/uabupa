import { NextRequest, NextResponse } from 'next/server';

const SCHEDULE_BASE_URL = 'https://ethiopianpassportapiu.ethiopianairlines.com';
const PAYMENT_BASE_URL = 'https://ethiopianpassportapi.ethiopianairlines.com';
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJKV1RfQ1VSUkVOVF9VU0VSIjoiQW5vbnltb3VzQGV0aGlvcGlhbmFpcmxpbmVzLmNvbSIsIm5iZiI6MTczMjA4MjQzNSwiZXhwIjoxNzQyNDUwNDM1LCJpYXQiOjE3MzIwODI0MzV9.9trNDDeFAMR6ByGB5Hhv8k5Q-16RGpPuGKmCpw95niY';

// Common headers for all requests - exactly matching content.js
const commonHeaders = {
    'accept': 'application/json, text/plain, */*',
    'accept-language': 'en-US,en;q=0.9',
    'authorization': `Bearer ${AUTH_TOKEN}`,
    'content-type': 'application/json;charset=UTF-8',
    'origin': 'https://www.ethiopianpassportservices.gov.et',
    'referer': 'https://www.ethiopianpassportservices.gov.et/',
    'sec-ch-ua': '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'cross-site'
};

// CORS headers for responses
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Enhanced fetch function with retry logic from content.js
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`Attempt ${attempt} for ${url}`);
            const response = await fetch(url, {
                ...options,
                headers: {
                    ...commonHeaders,
                    ...options.headers
                },
                credentials: 'include'
            });
            
            const responseText = await response.text();
            console.log(`Response from ${url}:`, responseText);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}, message: ${responseText}`);
            }
            
            try {
                return JSON.parse(responseText);
            } catch (e) {
                console.error('Failed to parse JSON response:', e);
                throw new Error('Invalid JSON response from server');
            }
        } catch (error) {
            console.error(`Attempt ${attempt} failed:`, error);
            lastError = error;
            
            if (attempt < maxRetries) {
                const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
                console.log(`Waiting ${delay}ms before retry...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    
    throw lastError;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { endpoint, data } = body;

        // Determine which base URL to use
        let fullUrl = endpoint;
        if (endpoint.startsWith('/')) {
            // For relative URLs, use the appropriate base URL
            if (endpoint.includes('/Payment/')) {
                fullUrl = `${PAYMENT_BASE_URL}${endpoint}`;
            } else {
                fullUrl = `${SCHEDULE_BASE_URL}${endpoint}`;
            }
        }

        console.log('Making request to:', fullUrl);
        console.log('Request data:', data);

        // Add delay for payment requests
        if (fullUrl.includes('/Payment/')) {
            console.log('Waiting 3 seconds before payment request...');
            await new Promise(resolve => setTimeout(resolve, 3000));
        }

        const response = await fetchWithRetry(fullUrl, {
            method: 'POST',
            body: JSON.stringify(data)
        });

        console.log('Response:', response);
        return NextResponse.json(response, { headers: corsHeaders });

    } catch (error: any) {
        console.error('Proxy error:', error);
        return NextResponse.json(
            { error: error.message || 'Proxy error' },
            { status: 500, headers: corsHeaders }
        );
    }
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

// Handle GET requests (for testing the proxy)
export async function GET() {
    return NextResponse.json(
        { message: 'Proxy is working' },
        { 
            status: 200,
            headers: corsHeaders
        }
    );
} 