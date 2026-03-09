export type BedStatus = 'Available' | 'Occupied';

export interface Bed {
    _id?: string;
    bedId?: string;
    roomId: string;
    bedNumber: string;
    status: BedStatus;
}
