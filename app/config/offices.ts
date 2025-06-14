import { OfficeConfig } from '../types';

export const offices: OfficeConfig[] = [
    {
        id: 24,
        name: "Addis Ababa Main Office",
        deliverySiteId: 1,
        durationId: 781,
        region: "Addis Ababa",
        city: "Addis Ababa"
    },
    {
        id: 28,
        name: "Hawassa Office",
        deliverySiteId: 16,
        durationId: 941,
        region: "Sidama",
        city: "Hawassa"
    },
    {
        id: 34,
        name: "Dire Dawa Office",
        deliverySiteId: 14,
        durationId: 1167,
        region: "Dire Dawa",
        city: "Dire Dawa"
    }
];

export const getOfficeById = (id: number): OfficeConfig | undefined => {
    return offices.find(office => office.id === id);
}; 