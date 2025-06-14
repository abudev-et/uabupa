import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Here you can process the request data
    // This is where you'll implement your request injection logic
    
    // Example response
    return NextResponse.json({
      success: true,
      message: 'Request processed successfully',
      data: body
    }, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        // Add CORS headers if needed
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Error processing request',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, {
      status: 500
    });
  }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
} 