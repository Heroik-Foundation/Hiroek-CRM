export interface IUser {
    _id: string;
    id: string;
    isActive: boolean;
    isAdmin: boolean;
    blocked: boolean;
    isDeleted: boolean;
    isAccountSetup: boolean;
    role: string;
    blockedUsers: string[];
    following: string[];
    followers: string[];
    importedContacts: string[];
    fcm_tokens: string[] | null;
    email: string;
    fullname: string;
    photo: string | null;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

export interface IOrganizer {
    _id: string;
    pinSet: boolean;
    eventsPerYear: number;
    isVerified: boolean;
    accountClaimed: boolean;

    name: string;
    address: string;
    email: string;
    telephone: string;
    bio: string;
    logo: string;

    userId: string;

    createdAt: string;
    updatedAt: string;

    __v: number;

    bankAccountId: string;
    bankAccountName: string;
    bankAccountNumber: string;
    bankName: string;
    sortCode: string;

    blocked: boolean;
    ownerId: string;

    currentPlan: string;
    subscription: string;
}

export interface ITeamMember {
    _id: string;
    user: { _id?: string; fullname?: string; email?: string; photo?: string };
    account: string;
    accountType: string;
    role: "admin" | "owner" | string;
    permissions: string[];
    createdAt: string;
    updatedAt: string;
    __v: number;
    fullname?: string;
    email?: string;
    status?: string;
}

export interface ITeamMembersResponse {
    data: ITeamMember[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
}
