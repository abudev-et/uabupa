'use client';

import { useState, useRef } from 'react';
import {
    Box,
    Container,
    Button,
    VStack,
    Heading,
    Text,
    useToast,
    FormControl,
    FormLabel,
    Input,
    Select,
    Card,
    CardBody,
    Stack,
    StackDivider,
    useColorModeValue,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
} from '@chakra-ui/react';
import { offices } from './config/offices';
import { passportService } from './services/api';
import { UserData, AppointmentData, RequestData, PaymentData } from './types';

export default function Home() {
    const toast = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [appointmentDate, setAppointmentDate] = useState('');
    const [officeId, setOfficeId] = useState('24');
    const [userData, setUserData] = useState<UserData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isAutoClicking, setIsAutoClicking] = useState(false);
    const [orderId, setOrderId] = useState<string | null>(null);
    const [requestId, setRequestId] = useState<string | null>(null);
    const [appointmentId, setAppointmentId] = useState<string | null>(null);
    const clickIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const fileText = await readFileAsText(file);
            const parsedData = JSON.parse(fileText);
            
            if (!Array.isArray(parsedData) || parsedData.length === 0) {
                throw new Error('Invalid JSON format. Expected an array with at least one user.');
            }

            setUserData(parsedData[0]);
            setError(null);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to parse JSON file');
            setUserData(null);
        }
    };

    const readFileAsText = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = event => resolve(event.target?.result as string);
            reader.onerror = error => reject(error);
            reader.readAsText(file);
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(null);

        if (!userData || !appointmentDate || !officeId) {
            setError('Please provide all required information');
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            const selectedOffice = offices.find(o => o.id === parseInt(officeId))!;
            let appointmentId;
            let requestResponse;

            // Step 1: Submit appointment
            console.log('Starting appointment submission...');
            const appointmentData: AppointmentData = {
                id: 0,
                date: appointmentDate,
                durationId: selectedOffice.durationId,
                dateTimeFormat: "yyyy-MM-dd",
                noOfApplicants: 1,
                officeId: parseInt(officeId),
                requestTypeId: 2,
                isUrgent: true,
                processDays: 2
            };

            const appointmentResponse = await fetch('/api/proxy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    endpoint: '/Schedule/api/V1.0/Schedule/SubmitAppointment',
                    data: appointmentData
                })
            }).then(res => res.json());

            if (!appointmentResponse?.appointmentResponses?.[0]?.id) {
                throw new Error('Invalid appointment response format');
            }

            appointmentId = appointmentResponse.appointmentResponses[0].id;
            setAppointmentId(appointmentId);
            toast({
                title: 'Appointment Submitted',
                description: `Appointment ID: ${appointmentId}`,
                status: 'success',
                duration: 3000,
                isClosable: true,
            });

            // Step 2: Submit request immediately after appointment
            console.log('Starting request submission...');
            const requestData: RequestData = {
                requestId: 0,
                requestMode: 1,
                processDays: 2,
                officeId: parseInt(officeId),
                deliverySiteId: selectedOffice.deliverySiteId,
                requestTypeId: 2,
                appointmentIds: [appointmentId],
                userName: "",
                deliveryDate: "",
                status: 0,
                confirmationNumber: "",
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
                    height: "",
                    eyeColor: "",
                    hairColor: "Black",
                    occupationId: null,
                    birthPlace: userData.birthplace,
                    birthCertificateId: "",
                    photoPath: "",
                    employeeID: "",
                    applicationNumber: "",
                    organizationID: "",
                    isUnder18: false,
                    isAdoption: false,
                    passportNumber: "",
                    isDatacorrected: false,
                    passportPageId: 1,
                    correctionType: 0,
                    maritalStatus: 0,
                    phoneNumber: userData.phone,
                    email: userData.email || "",
                    requestReason: 0,
                    address: {
                        personId: 0,
                        addressId: 0,
                        city: selectedOffice.city,
                        region: selectedOffice.region,
                        state: "",
                        zone: "",
                        wereda: "",
                        kebele: "",
                        street: "",
                        houseNo: "",
                        poBox: "0000",
                        requestPlace: ""
                    },
                    familyRequests: []
                }]
            };

            requestResponse = await fetch('/api/proxy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    endpoint: '/Request/api/V1.0/Request/SubmitRequest',
                    data: requestData
                })
            }).then(res => res.json());

            if (!requestResponse?.serviceResponseList?.[0]?.requestId) {
                throw new Error('Invalid request response format');
            }

            const requestId = requestResponse.serviceResponseList[0].requestId;
            setRequestId(requestId);
            toast({
                title: 'Request Submitted',
                description: `Request ID: ${requestId}`,
                status: 'success',
                duration: 3000,
                isClosable: true,
            });

            // Step 3: Process payment immediately after request
            console.log('Starting payment processing...');
            const paymentData: PaymentData = {
                FirstName: userData.firstName,
                LastName: userData.lastName,
                Email: userData.email || "",
                Phone: userData.phone,
                Amount: 20000,
                Currency: "ETB",
                City: selectedOffice.city,
                Country: "ET",
                Channel: "Mobile",
                PaymentOptionsId: 17,
                requestId: requestId
            };

            const paymentResponse = await fetch('/api/proxy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    endpoint: '/Payment/api/V1.0/Payment/OrderRequest',
                    data: paymentData
                })
            }).then(res => res.json());

            if (paymentResponse?.orderId) {
                setOrderId(paymentResponse.orderId);
                toast({
                    title: 'Payment Successful',
                    description: `Order ID: ${paymentResponse.orderId}`,
                    status: 'success',
                    duration: 5000,
                    isClosable: true,
                });
            }

            // Reset form
            setUserData(null);
            setAppointmentDate('');
            setOfficeId('24');
            if (e.target instanceof HTMLInputElement) {
                e.target.value = '';
            }

        } catch (error: any) {
            console.error('Submission error:', error);
            setErrorMessage(error.message || 'An error occurred while processing your request');
            toast({
                title: 'Error',
                description: error.message || 'An error occurred while processing your request',
                status: 'error',
                duration: 5000,
                position: 'top',
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Function to start auto-clicking
    const startAutoClicking = (duration: number) => {
        if (isAutoClicking) return; // Prevent multiple auto-click sessions
        
        setIsAutoClicking(true);
        const submitButton = document.querySelector('button[type="submit"]') as HTMLButtonElement;
        
        // Click every 100ms (faster than before)
        clickIntervalRef.current = setInterval(() => {
            if (submitButton && !submitButton.disabled) {
                submitButton.click();
            }
        }, 100); // Changed from 500ms to 100ms

        // Stop after specified duration
        setTimeout(() => {
            if (clickIntervalRef.current) {
                clearInterval(clickIntervalRef.current);
                clickIntervalRef.current = null;
            }
            setIsAutoClicking(false);
        }, duration * 1000);
    };

    // Function to stop auto-clicking
    const stopAutoClicking = () => {
        if (clickIntervalRef.current) {
            clearInterval(clickIntervalRef.current);
            clickIntervalRef.current = null;
        }
        setIsAutoClicking(false);
    };

    return (
        <Container maxW="container.md" py={10}>
            <VStack spacing={8} align="stretch">
                <Box textAlign="center">
                    <Heading as="h1" size="2xl" mb={4}>
                        Passport Application
                    </Heading>
                    <Text fontSize="lg" color="gray.600">
                        Upload your JSON file and complete the application process
                    </Text>
                </Box>

                {/* Status Cards */}
                {(appointmentId || requestId || orderId) && (
                    <Card>
                        <CardBody>
                            <Stack spacing={4}>
                                <Heading size="md">Application Status</Heading>
                                {appointmentId && (
                                    <Box p={3} bg="green.50" borderRadius="md">
                                        <Text fontWeight="bold" color="green.600">✓ Appointment Submitted</Text>
                                        <Text fontSize="sm">ID: {appointmentId}</Text>
                                    </Box>
                                )}
                                {requestId && (
                                    <Box p={3} bg="green.50" borderRadius="md">
                                        <Text fontWeight="bold" color="green.600">✓ Request Submitted</Text>
                                        <Text fontSize="sm">ID: {requestId}</Text>
                                    </Box>
                                )}
                                {orderId && (
                                    <Box p={3} bg="green.50" borderRadius="md">
                                        <Text fontWeight="bold" color="green.600">✓ Payment Successful</Text>
                                        <Text fontSize="sm">Order ID: {orderId}</Text>
                                    </Box>
                                )}
                            </Stack>
                        </CardBody>
                    </Card>
                )}

                {/* Error Alert */}
                {errorMessage && (
                    <Alert status="error">
                        <AlertIcon />
                        <AlertTitle>Error!</AlertTitle>
                        <AlertDescription>{errorMessage}</AlertDescription>
                    </Alert>
                )}

                <Card>
                    <CardBody>
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
                                    <Stack divider={<StackDivider />} spacing={2}>
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
                                    </Stack>
                                </Box>
                            )}

                            {/* Auto-click buttons */}
                            <div className="flex gap-4 justify-center mb-4">
                                <Button
                                    colorScheme="green"
                                    onClick={() => startAutoClicking(5)}
                                    isDisabled={isAutoClicking || !userData || !appointmentDate || !officeId}
                                >
                                    Auto Click (5s)
                                </Button>
                                <Button
                                    colorScheme="blue"
                                    onClick={() => startAutoClicking(10)}
                                    isDisabled={isAutoClicking || !userData || !appointmentDate || !officeId}
                                >
                                    Auto Click (10s)
                                </Button>
                                <Button
                                    colorScheme="purple"
                                    onClick={() => startAutoClicking(15)}
                                    isDisabled={isAutoClicking || !userData || !appointmentDate || !officeId}
                                >
                                    Auto Click (15s)
                                </Button>
                                {isAutoClicking && (
                                    <Button
                                        colorScheme="red"
                                        onClick={stopAutoClicking}
                                    >
                                        Stop Auto Click
                                    </Button>
                                )}
                            </div>

                            <Button
                                type="submit"
                                colorScheme="blue"
                                size="lg"
                                onClick={handleSubmit}
                                isDisabled={!userData || !appointmentDate || !officeId}
                            >
                                Submit Application
                            </Button>
                        </VStack>
                    </CardBody>
                </Card>
            </VStack>
        </Container>
    );
} 