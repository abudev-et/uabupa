import { useState } from 'react';
import { useToast } from '@chakra-ui/react';
import { submitAppointment, submitRequest, submitPayment } from './passport-api';

export function usePassportForm(offices: any[]) {
    const toast = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [appointmentDate, setAppointmentDate] = useState('');
    const [officeId, setOfficeId] = useState('24');
    const [userData, setUserData] = useState<any | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [orderId, setOrderId] = useState<string | null>(null);
    const [requestId, setRequestId] = useState<string | null>(null);
    const [appointmentId, setAppointmentId] = useState<string | null>(null);

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
            setErrorMessage(null);
        } catch (error: any) {
            setErrorMessage(error.message || 'Failed to parse JSON file');
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
            setErrorMessage('Please provide all required information');
            return;
        }
        try {
            setIsLoading(true);
            const selectedOffice = offices.find(o => o.id === parseInt(officeId));
            if (!selectedOffice) throw new Error('Invalid office selected');
            // Step 1: Submit appointment
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
            if (!appointmentResponse?.appointmentResponses?.[0]?.id) {
                throw new Error('Invalid appointment response format');
            }
            const appointmentId = appointmentResponse.appointmentResponses[0].id;
            setAppointmentId(appointmentId);
            toast({
                title: 'Appointment Submitted',
                description: `Appointment ID: ${appointmentId}`,
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            // Step 2: Submit request
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
            // Step 3: Process payment
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
        } catch (error: any) {
            setErrorMessage(error.message || 'An error occurred while processing your request');
            toast({
                title: 'Error',
                description: error.message || 'An error occurred while processing your request',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return {
        isLoading,
        appointmentDate,
        setAppointmentDate,
        officeId,
        setOfficeId,
        userData,
        setUserData,
        errorMessage,
        orderId,
        requestId,
        appointmentId,
        handleFileUpload,
        handleSubmit,
    };
} 