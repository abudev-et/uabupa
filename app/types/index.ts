export type Gender = 'Male' | 'Female';

export interface UserData {
    firstName: string;
    middleName: string;
    lastName: string;
    geezFirstName: string;
    geezMiddleName: string;
    geezLastName: string;
    birthDate: string;
    gender: number; // Keep as number for form input, convert to string enum when sending to API
    birthplace: string;
    phone: string;
    email?: string;
}

export interface OfficeConfig {
    id: number;
    name: string;
    deliverySiteId: number;
    durationId: number;
    region: string;
    city: string;
}

export interface AppointmentData {
    id: number;
    date: string;
    durationId: number;
    dateTimeFormat: string;
    noOfApplicants: number;
    officeId: number;
    requestTypeId: number;
    isUrgent: boolean;
    processDays: number;
}

export interface RequestData {
    requestId: number;
    requestMode: number;
    processDays: number;
    officeId: number;
    deliverySiteId: number;
    requestTypeId: number;
    appointmentIds: number[];
    userName: string;
    deliveryDate: string;
    status: number;
    confirmationNumber: string;
    applicants: Array<{
        personId: number;
        firstName: string;
        middleName: string;
        lastName: string;
        geezFirstName: string;
        geezMiddleName: string;
        geezLastName: string;
        dateOfBirth: string;
        gender: number;
        nationalityId: number;
        height: string;
        eyeColor: string;
        hairColor: string;
        occupationId: number | null;
        birthPlace: string;
        birthCertificateId: string;
        photoPath: string;
        employeeID: string;
        applicationNumber: string;
        organizationID: string;
        isUnder18: boolean;
        isAdoption: boolean;
        passportNumber: string;
        isDatacorrected: boolean;
        passportPageId: number;
        correctionType: number;
        maritalStatus: number;
        phoneNumber: string;
        email: string;
        requestReason: number;
        address: {
            personId: number;
            addressId: number;
            city: string;
            region: string;
            state: string;
            zone: string;
            wereda: string;
            kebele: string;
            street: string;
            houseNo: string;
            poBox: string;
            requestPlace: string;
        };
        familyRequests: any[];
    }>;
}

export interface PaymentData {
    FirstName: string;
    LastName: string;
    Email: string;
    Phone: string;
    Amount: number;
    Currency: string;
    City: string;
    Country: string;
    Channel: string;
    PaymentOptionsId: number;
    requestId: number;
} 