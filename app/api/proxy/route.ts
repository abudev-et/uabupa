import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = 'https://ethiopianpassportapiu.ethiopianairlines.com';
const API_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJKV1RfQ1VSUkVOVF9VU0VSIjoiQW5vbnltb3VzQGV0aGlvcGlhbmFpcmxpbmVzLmNvbSIsIm5iZiI6MTczMjA4MjQzNSwiZXhwIjoxNzQyNDUwNDM1LCJpYXQiOjE3MzIwODI0MzV9.9trNDDeFAMR6ByGB5Hhv8k5Q-16RGpPuGKmCpw95niY';

// Common headers for all requests
const commonHeaders = {
    'accept': 'application/json, text/plain, */*',
    'accept-language': 'en-US,en;q=0.9',
    'authorization': `Bearer ${API_TOKEN}`,
    'content-type': 'application/json;charset=UTF-8',
    'origin': 'https://www.ethiopianpassportservices.gov.et',
    'referer': 'https://www.ethiopianpassportservices.gov.et/',
};

// CORS headers for responses
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function POST(request: NextRequest) {
    try {
        // Parse the request body
        const body = await request.json();
        const { endpoint, data } = body;

        // Validate endpoint
        if (!endpoint) {
            return NextResponse.json(
                { error: 'Endpoint is required' },
                { 
                    status: 400,
                    headers: corsHeaders
                }
            );
        }

        // Validate data
        if (!data) {
            return NextResponse.json(
                { error: 'Request data is required' },
                { 
                    status: 400,
                    headers: corsHeaders
                }
            );
        }

        // Forward the request to the actual API
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: commonHeaders,
            body: JSON.stringify(data),
            cache: 'no-store',
        });

        // Get the response data
        const responseData = await response.json();

        // Return the response with CORS headers
        return NextResponse.json(responseData, {
            status: response.status,
            headers: corsHeaders
        });
    } catch (error) {
        console.error('Proxy error:', error);
        
        // Handle different types of errors
        if (error instanceof SyntaxError) {
            return NextResponse.json(
                { error: 'Invalid JSON in request body' },
                { 
                    status: 400,
                    headers: corsHeaders
                }
            );
        }

        return NextResponse.json(
            { 
                error: 'Failed to process request',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { 
                status: 500,
                headers: corsHeaders
            }
        );
    }
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders
    });
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