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
    user: { _id?: string; fullname?: string; email?: string; photo?: string; phone?: string; telephone?: string };
    account: string;
    accountType: string;
    role: "admin" | "owner" | string;
    permissions: string[];
    createdAt: string;
    updatedAt: string;
    __v: number;
    fullname?: string;
    email?: string;
    phone?: string;
    telephone?: string;
    status?: string;
}

export interface ITeamMembersResponse {
    data: ITeamMember[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
}

export type MembershipRole = "owner" | "admin" | "viewer" | "view" | string;

export interface IMembershipInfo {
    _id?: string;
    accountType?: "Organization" | "EventPartner" | string;
    role: MembershipRole;
    permissions: string[];
    user?: Partial<IUser> | null;
    account?: Partial<IOrganizer> | null;
}

export interface IMembershipApiResponse {
    accountType?: string;
    role?: string;
    permissions?: string[] | string;
    user?: Partial<IUser>;
    account?: Partial<IOrganizer>;
    data?: IMembershipInfo;
    membership?: IMembershipInfo;
}

export function normalizeMembership(res: any): IMembershipInfo | null {
    if (!res) return null;
    const target = res.data?.role ? res.data : (res.membership?.role ? res.membership : (res.role ? res : res.data || res.membership));
    if (!target) return null;

    let permissionsArray: string[] = [];
    if (Array.isArray(target.permissions)) {
        permissionsArray = target.permissions;
    } else if (typeof target.permissions === "string" && target.permissions) {
        permissionsArray = [target.permissions];
    }

    const rawRole = String(target.role || (target.isAdmin ? "admin" : "owner") || "viewer").toLowerCase();

    return {
        _id: target._id || target.id,
        accountType: target.accountType,
        role: rawRole,
        permissions: permissionsArray,
        user: target.user || null,
        account: target.account || null,
    };
}
