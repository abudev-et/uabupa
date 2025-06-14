// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("Content script received message:", request);
    if (request.action === "startAutomation") {
        console.log("Starting automation process...");
        startAutomation();
    }
});

async function startAutomation() {
    try {
        console.log("Starting automation process...");
        // Get stored data
        const { appointmentDate, officeId, userData, phone, email } = await chrome.storage.local.get([
            'appointmentDate', 
            'officeId', 
            'userData',
            'token'
        ]);
        
        console.log("Retrieved data:", { appointmentDate, officeId, userData });
        
        if (!appointmentDate || !officeId || !userData) {
            throw new Error("Missing required data. Please check your input.");
        }
        
        console.log("Retrieved data:", { appointmentDate, officeId, userData });
        console.log(userData);
        console.log(+userData.gender);
        console.log(`+251${userData.phone}`);
        console.log(phone);
        
        
        // Office configuration with all correct parameters
        const officeConfig = {
            // Addis Ababa
            24: { 
                deliverySiteId: 1,
                durationId: 781,
                region: "Addis Ababa",
                city: "Addis Ababa"
            },
            28: {
                deliverySiteId: 16,
                durationId: 941,
                region: "Sidama",
                city: "Hawassa"
            },
            // Dire Dawa
            34: {
                deliverySiteId: 14,
                durationId: 1167,
                region: "Dire Dawa",
                city: "Dire Dawa"
            }
        };

        // Validate office configuration
        function getOfficeConfig(officeId) {
            const config = officeConfig[officeId];
            if (!config) {
                throw new Error(`Invalid officeId: ${officeId}. Valid options are ${Object.keys(officeConfig).join(', ')}`);
            }
            return config;
        }

        // Get office-specific parameters
        const selectedOfficeId = parseInt(officeId); // Default to Addis Ababa
        const { deliverySiteId, durationId, region, city } = getOfficeConfig(selectedOfficeId);
        console.log(durationId);
        
        console.log("Using office configuration:", {
            officeId: selectedOfficeId,
            durationId,
            deliverySiteId,
            region
        });

        // API endpoints
        const endpoints = {
            appointment: 'https://ethiopianpassportapiu.ethiopianairlines.com/Schedule/api/V1.0/Schedule/SubmitAppointment',
            request: 'https://ethiopianpassportapiu.ethiopianairlines.com/Request/api/V1.0/Request/SubmitRequest',
            payment: 'https://ethiopianpassportapi.ethiopianairlines.com/Payment/api/V1.0/Payment/OrderRequest'
        };

        // Common headers for all requests
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

        // Enhanced fetch function with retry logic
        async function fetchWithRetry(url, options, maxRetries = 3) {
            let lastError;
            
            for (let attempt = 1; attempt <= maxRetries; attempt++) {
                try {
                    console.log(`Attempt ${attempt} for ${url}`);
                    const response = await fetch(url, options);
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
                        // Wait before retrying (exponential backoff)
                        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
                        console.log(`Waiting ${delay}ms before retry...`);
                        await new Promise(resolve => setTimeout(resolve, delay));
                    }
                }
            }
            
            throw lastError;
        }

        // 1. Submit Appointment with retry
        const appointmentData = {
            "id": 0,
            "date": `${appointmentDate}`,
            "durationId": durationId,
            "dateTimeFormat": "yyyy-MM-dd",
            "noOfApplicants": 1,
            "officeId": selectedOfficeId,
            "requestTypeId": 2,
            "isUrgent": true,
            "processDays": 2      
        };

        console.log('Step 1: Submitting appointment...');
        const appointmentResponse = await fetchWithRetry(endpoints.appointment, {
            method: 'POST',
            headers: commonHeaders,
            body: JSON.stringify(appointmentData),
            credentials: 'include'
        });
        console.log('Appointment success:', appointmentResponse);

        // Add longer delay between requests
        console.log('Waiting 3 seconds before next request...');
        await new Promise(resolve => setTimeout(resolve, 3000));

        // 2. Submit Request with retry
        const requestData = {
            "requestId": 0,
            "requestMode": 1,
            "processDays": 2,
            "officeId": selectedOfficeId,
            "deliverySiteId": deliverySiteId,
            "requestTypeId": 2,
            "appointmentIds": [appointmentResponse.appointmentResponses[0].id],
            "userName": "",
            "deliveryDate": "",
            "status": 0,
            "confirmationNumber": "",
            "applicants": [{
                "personId": 0,
                "firstName": userData.firstName,
                "middleName": userData.middleName,
                "lastName": userData.lastName,
                "geezFirstName": userData.geezFirstName,
                "geezMiddleName": userData.geezMiddleName,
                "geezLastName": userData.geezLastName,
                "dateOfBirth": userData.birthDate,
                "gender": +userData.gender,
                "nationalityId": 1,
                "height": "",
                "eyeColor": "",
                "hairColor": "Black",
                "occupationId": null,
                "birthPlace": userData.birthplace,
                "birthCertificateId": "",
                "photoPath": "",
                "employeeID": "",
                "applicationNumber": "",
                "organizationID": "",
                "isUnder18": false,
                "isAdoption": false,
                "passportNumber": "",
                "isDatacorrected": false,
                "passportPageId": 1,
                "correctionType": 0,
                "maritalStatus": 0,
                "phoneNumber": userData.phone,
                "email": "",
                "requestReason": 0,
                "address": {
                    "personId": 0,
                    "addressId": 0,
                    "city": "SHASHEMENE",
                    "region": "Oromia",
                    "state": "",
                    "zone": "",
                    "wereda": "",
                    "kebele": "",
                    "street": "",
                    "houseNo": "",
                    "poBox": "0000",
                    "requestPlace": ""
                },
                "familyRequests": []
            }]
        };

        console.log('Step 2: Submitting request...');
        const requestResponse = await fetchWithRetry(endpoints.request, {
            method: 'POST',
            headers: commonHeaders,
            body: JSON.stringify(requestData),
        });
        console.log('Request success:', requestResponse);
        console.log(requestResponse.serviceResponseList[0].requestId);

        // Add longer delay between requests
        console.log('Waiting 3 seconds before payment request...');
        await new Promise(resolve => setTimeout(resolve, 3000));

        // 3. Process Payment with retry
        const paymentData = {
            "FirstName": userData.firstName,
            "LastName": userData.lastName,
            "Email": "",
            "Phone": userData.phone,
            "Amount": 20000,
            "Currency": "ETB",
            "City": "Addis Ababa",
            "Country": "ET",
            "Channel": "Mobile",
            "PaymentOptionsId": 17,
            "requestId": requestResponse.serviceResponseList[0].requestId
        };

        console.log('Step 3: Processing payment...');
        const paymentResponse = await fetchWithRetry(endpoints.payment, {
            method: 'POST',
            headers: commonHeaders,
            body: JSON.stringify(paymentData),
        });
        console.log('Payment success:', paymentResponse);

        // Send order ID back to popup if available
        if (paymentResponse && paymentResponse.orderId) {
            chrome.runtime.sendMessage({
                type: 'orderId',
                orderId: paymentResponse.orderId
            });
        }

        return {
            appointment: appointmentResponse,
            request: requestResponse,
            payment: paymentResponse
        };

    } catch (error) {
        console.error('Error in passport process:', error);
        throw error;
    }
}