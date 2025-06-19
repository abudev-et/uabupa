'use client';

import { VStack, Box, Container, Button, Heading, Text, useToast, FormControl, FormLabel, Input, Select, Alert, AlertIcon, AlertTitle, AlertDescription, Divider, Card } from '@chakra-ui/react';
import { usePassportForm } from './services/usePassportForm';
import { useState } from 'react';
import { submitAppointment, submitRequest, submitPayment } from './services/passport-api';

// Inline office data (example, replace with your own)
const offices = [
    { id: 24, name: 'Main Office', city: 'Addis Ababa', durationId: 781, deliverySiteId: 1 },
    { id: 28, name: 'Hawassa', city: 'Hawassa', durationId: 941, deliverySiteId: 16 },
    { id: 34, name: 'Dire Dawa', city: 'Dire Dawa', durationId: 1167, deliverySiteId: 14 },
    { id: 32, name: 'Adama', city: 'Adama', durationId: 1061, deliverySiteId: 12 },
];

export default function Home() {
    const {
        isLoading,
        appointmentDate,
        setAppointmentDate,
        officeId,
        setOfficeId,
        userData,
        errorMessage,
        orderId,
        requestId,
        appointmentId,
        handleFileUpload,
        handleSubmit,
    } = usePassportForm(offices);

    const [multiCount, setMultiCount] = useState(20);
    const [multiResults, setMultiResults] = useState<any[]>([]);
    const [multiSummary, setMultiSummary] = useState<{ success: number; fail: number }>({ success: 0, fail: 0 });

    // Helper for multiple requests
    async function handleMultipleRequests() {
        setMultiResults([]);
        setMultiSummary({ success: 0, fail: 0 });
        const results: any[] = [];
        const promises = Array.from({ length: multiCount }, async (_, i) => {
            try {
                // Use the same logic as handleSubmit, but do not reset form or show toasts
                const selectedOffice = offices.find(o => o.id === parseInt(officeId));
                if (!selectedOffice || !userData || !appointmentDate || !officeId) throw new Error('Missing data');
                const appointmentData = {
                    id: 0,
                    date: appointmentDate,
                    durationId: selectedOffice.durationId,
                    dateTimeFormat: 'yyyy-MM-dd',
                    noOfApplicants: 1,
                    officeId: selectedOffice.id,
                    requestTypeId: 2,
                    isUrgent: true,
                    processDays: 2
                };
                const appointmentResponse = await submitAppointment(appointmentData);
                if (!appointmentResponse?.appointmentResponses?.[0]?.id) throw new Error('Invalid appointment response');
                const appointmentId = appointmentResponse.appointmentResponses[0].id;
                const requestData = {
                    requestId: 0,
                    requestMode: 1,
                    processDays: 2,
                    officeId: selectedOffice.id,
                    deliverySiteId: selectedOffice.deliverySiteId,
                    requestTypeId: 2,
                    appointmentIds: [appointmentId],
                    userName: '',
                    deliveryDate: '',
                    status: 0,
                    confirmationNumber: '',
                    applicants: [{
                        personId: 0,
                        firstName: userData.firstName,
                        middleName: userData.middleName,
                        lastName: userData.lastName,
                        geezFirstName: userData.geezFirstName,
                        geezMiddleName: userData.geezMiddleName,
                        geezLastName: userData.geezLastName,
                        dateOfBirth: userData.birthDate,
                        gender: +userData.gender,
                        nationalityId: 1,
                        height: '',
                        eyeColor: '',
                        hairColor: 'Black',
                        occupationId: null,
                        birthPlace: userData.birthplace,
                        birthCertificateId: '',
                        photoPath: '',
                        employeeID: '',
                        applicationNumber: '',
                        organizationID: '',
                        isUnder18: false,
                        isAdoption: false,
                        passportNumber: '',
                        isDatacorrected: false,
                        passportPageId: 1,
                        correctionType: 0,
                        maritalStatus: 0,
                        phoneNumber: userData.phone,
                        email: userData.email || '',
                        requestReason: 0,
                        address: {
                            personId: 0,
                            addressId: 0,
                            city: 'SHASHEMENE',
                            region: 'Oromia',
                            state: '',
                            zone: '',
                            wereda: '',
                            kebele: '',
                            street: '',
                            houseNo: '',
                            poBox: '0000',
                            requestPlace: ''
                        },
                        familyRequests: []
                    }]
                };
                const requestResponse = await submitRequest(requestData);
                if (!requestResponse?.serviceResponseList?.[0]?.requestId) throw new Error('Invalid request response');
                const paymentData = {
                    FirstName: userData.firstName,
                    LastName: userData.lastName,
                    Email: userData.email || '',
                    Phone: userData.phone,
                    Amount: 20000,
                    Currency: 'ETB',
                    City: selectedOffice.city,
                    Country: 'ET',
                    Channel: 'Mobile',
                    PaymentOptionsId: 17,
                    requestId: requestResponse.serviceResponseList[0].requestId
                };
                const paymentResponse = await submitPayment(paymentData);
                if (!paymentResponse?.orderId) throw new Error('No orderId');
                results.push({ success: true, orderId: paymentResponse.orderId });
                return { success: true, orderId: paymentResponse.orderId };
            } catch (error: any) {
                results.push({ success: false, error: error.message });
                return { success: false, error: error.message };
            }
        });
        const allResults = await Promise.all(promises);
        setMultiResults(allResults);
        setMultiSummary({
            success: allResults.filter(r => r.success).length,
            fail: allResults.filter(r => !r.success).length,
        });
    }

    return (
        <Container maxW="container.sm" py={10}>
            <VStack spacing={8} align="stretch">
                <Box textAlign="center">
                    <Heading as="h1" size="2xl" mb={4}>
                        Passport Application (Minimal)
                    </Heading>
                    <Text fontSize="lg" color="gray.600">
                        Upload your JSON file and submit a single passport application request
                    </Text>
                </Box>
                {errorMessage && (
                    <Text color="red.500" fontWeight="bold" mb={2}>{errorMessage}</Text>
                )}
                {appointmentId && (
                    <Text color="green.600" fontWeight="bold" mb={1}>Appointment submitted successfully!</Text>
                )}
                {requestId && (
                    <Text color="green.600" fontWeight="bold" mb={1}>Request submitted successfully!</Text>
                )}
                {orderId && (
                    <Text color="green.600" fontWeight="bold" mb={2}>Payment successful!</Text>
                )}
                {orderId && (
                    <Text color="green.600" fontWeight="bold" mb={4}>Order ID: {orderId}</Text>
                )}
                <Card>
                    <form onSubmit={handleSubmit}>
                        <VStack spacing={6} align="stretch">
                            <FormControl isRequired>
                                <FormLabel>User Data (JSON File)</FormLabel>
                                <Input
                                    type="file"
                                    accept=".json"
                                    onChange={handleFileUpload}
                                    p={1}
                                />
                                <Text fontSize="sm" color="gray.500" mt={1}>
                                    Upload a JSON file containing user information
                                </Text>
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel>Office Location</FormLabel>
                                <Select
                                    value={officeId}
                                    onChange={(e) => setOfficeId(e.target.value)}
                                >
                                    {offices.map(office => (
                                        <option key={office.id} value={office.id}>
                                            {office.name} ({office.city})
                                        </option>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel>Appointment Date</FormLabel>
                                <Input
                                    type="date"
                                    value={appointmentDate}
                                    onChange={(e) => setAppointmentDate(e.target.value)}
                                />
                            </FormControl>
                            {userData && (
                                <Box>
                                    <Heading size="sm" mb={2}>User Information Preview</Heading>
                                        <Text fontSize="sm">
                                            Name: {userData.firstName} {userData.middleName} {userData.lastName}
                                        </Text>
                                        <Text fontSize="sm">
                                            Geez Name: {userData.geezFirstName} {userData.geezMiddleName} {userData.geezLastName}
                                        </Text>
                                        <Text fontSize="sm">
                                            Date of Birth: {userData.birthDate}
                                        </Text>
                                        <Text fontSize="sm">
                                            Gender: {userData.gender === 1 ? 'Male' : 'Female'}
                                        </Text>
                                        <Text fontSize="sm">
                                            Birth Place: {userData.birthplace}
                                        </Text>
                                        <Text fontSize="sm">
                                            Phone: {userData.phone}
                                        </Text>
                                        {userData.email && (
                                            <Text fontSize="sm">
                                                Email: {userData.email}
                                            </Text>
                                        )}
                                </Box>
                            )}
                            <Divider />
                                <Button
                                    type="submit"
                                    colorScheme="blue"
                                    size="lg"
                                >
                                    Submit Single Request
                                </Button>
                        </VStack>
                    </form>
                </Card>
                <Box>
                    <FormControl>
                        <FormLabel>Number of Requests</FormLabel>
                        <Input type="number" min={1} max={100} value={multiCount} onChange={e => setMultiCount(Number(e.target.value))} w="120px" />
                    </FormControl>
                    <Button mt={2} colorScheme="purple" onClick={handleMultipleRequests}>
                        Send Multiple Requests
                    </Button>
                    {(multiResults.length > 0) && (
                        <Box mt={2}>
                            <Text>Success: {multiSummary.success} / Fail: {multiSummary.fail}</Text>
                            {multiResults.filter(r => r.success && r.orderId).length > 0 && (
                                <Box mt={2}>
                                    <Text fontWeight="bold">Order IDs:</Text>
                                    {multiResults.filter(r => r.success && r.orderId).map((r, idx) => (
                                        <Text key={idx} fontSize="sm">{r.orderId}</Text>
                                    ))}
                                </Box>
                            )}
                        </Box>
                    )}
                </Box>
            </VStack>
        </Container>
    );
} 