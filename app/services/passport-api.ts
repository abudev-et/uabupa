const endpointMap = {
    appointment: '/Schedule/api/V1.0/Schedule/SubmitAppointment',
    request: '/Request/api/V1.0/Request/SubmitRequest',
    payment: '/Payment/api/V1.0/Payment/OrderRequest',
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
    'sec-fetch-site': 'cross-site'
};

async function fetchWithRetry(url: string, options: any, maxRetries = 3): Promise<any> {
    let lastError;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const response = await fetch(url, options);
            const responseText = await response.text();
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}, message: ${responseText}`);
            }
            try {
                return JSON.parse(responseText);
            } catch (e) {
                throw new Error('Invalid JSON response from server');
            }
        } catch (error) {
            lastError = error;
            if (attempt < maxRetries) {
                const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    throw lastError;
}

export async function submitAppointment(appointmentData: any): Promise<any> {
    return fetchWithRetry('/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            endpoint: endpointMap.appointment,
            data: appointmentData,
        }),
    });
}

export async function submitRequest(requestData: any): Promise<any> {
    return fetchWithRetry('/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            endpoint: endpointMap.request,
            data: requestData,
        }),
    });
}

export async function submitPayment(paymentData: any): Promise<any> {
    return fetchWithRetry('/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            endpoint: endpointMap.payment,
            data: paymentData,
        }),
    });
} 