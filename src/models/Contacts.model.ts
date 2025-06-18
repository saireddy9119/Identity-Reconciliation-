export interface Contact {
    id: number;
    phoneNumber: string | null;
    email: string | null;
    linkedId?: number | null;
    linkPrecedence: 'primary' | 'secondary';
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
}

export interface IdentifyRequestBody {
    email: string | null;
    phoneNumber: string | null;
}