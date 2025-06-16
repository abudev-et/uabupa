import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const AUTH_TOKEN = process.env.NEXT_PUBLIC_API_AUTH_TOKEN;

if (!BASE_URL || !AUTH_TOKEN) {
    throw new Error('Missing required environment variables');
}

// Common headers for all requests
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

        if (!response.ok) {
            throw new Error(`API request failed: ${response.statusText}`);
        }

        // Get the response data
        const responseData = await response.json();

        // Return the response with CORS headers
        return NextResponse.json(responseData, {
            status: response.status,
            headers: corsHeaders
        });
    } catch (error: any) {
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
                error: error.message,
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