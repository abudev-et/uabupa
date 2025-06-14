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
    date: string;
    officeId: number;
    durationId: number;
    requestTypeId: number;
    isUrgent: boolean;
    processDays: number;
}

export interface RequestData {
    officeId: number;
    deliverySiteId: number;
    requestTypeId: number;
    appointmentIds: number[];
    applicants: Array<{
        firstName: string;
        middleName: string;
        lastName: string;
        geezFirstName: string;
        geezMiddleName: string;
        geezLastName: string;
        dateOfBirth: string;
        gender: number; // Keep as number for form input, convert to string enum when sending to API
        birthplace: string;
        phone: string;
        email?: string;
        address: {
            city: string;
            region: string;
            poBox: string;
        };
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
} 