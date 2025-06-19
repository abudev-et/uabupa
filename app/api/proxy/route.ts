import { NextRequest, NextResponse } from 'next/server';

const endpointMap: Record<string, string> = {
  '/Schedule/api/V1.0/Schedule/SubmitAppointment': 'https://ethiopianpassportapiu.ethiopianairlines.com/Schedule/api/V1.0/Schedule/SubmitAppointment',
  '/Request/api/V1.0/Request/SubmitRequest': 'https://ethiopianpassportapiu.ethiopianairlines.com/Request/api/V1.0/Request/SubmitRequest',
  '/Payment/api/V1.0/Payment/OrderRequest': 'https://ethiopianpassportapi.ethiopianairlines.com/Payment/api/V1.0/Payment/OrderRequest',
};

const commonHeaders = {
  'accept': 'application/json, text/plain, */*',
  'accept-language': 'en-US,en;q=0.9',
  'authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJKV1RfQ1VSUkVOVF9VU0VSIjoiQW5vbnltb3VzQGV0aGlvcGlhbmFpcmxpbmVzLmNvbSIsIm5iZiI6MTczMjA4MjQzNSwiZXhwIjoxNzQyNDUwNDM1LCJpYXQiOjE3MzIwODI0MzV9.9trNDDeFAMR6ByGB5Hhv8k5Q-16RGpPuGKmCpw95niY',
  'content-type': 'application/json;charset=UTF-8',
  'origin': 'https://www.ethiopianpassportservices.gov.et',
  'referer': 'https://www.ethiopianpassportservices.gov.et/',
  'sec-ch-ua': '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"Windows"',
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'cross-site',
};

export async function POST(req: NextRequest) {
  try {
    const { endpoint, data } = await req.json();
    const url = endpointMap[endpoint];
    if (!url) {
      return NextResponse.json({ error: 'Invalid endpoint' }, { status: 400 });
    }
    const apiRes = await fetch(url, {
      method: 'POST',
      headers: commonHeaders,
      body: JSON.stringify(data),
    });
    const text = await apiRes.text();
    try {
      return NextResponse.json(JSON.parse(text), { status: apiRes.status });
    } catch {
      return new NextResponse(text, { status: apiRes.status });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Proxy error' }, { status: 500 });
  }
} 