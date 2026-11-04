export type MessageView =
    | "choose_option"
    | "verify_email"
    | "ready_to_send"
    | "authenticate_domain"
    | "compose"
    | "recipients";

export interface RecipientItem {
    id: string;
    sNo: number;
    name: string;
    username: string;
    email: string;
    phone: string;
    location: string;
    rawCustomer: Record<string, unknown>;
}

export interface VerifiedSender {
    id?: string;
    senderName: string;
    emailPrefix?: string;
    email: string;
    domain?: string;
    replyTo?: string;
    isBusinessDomain?: boolean;
    verified: boolean;
    verifiedAt?: string;
}

export interface DnsRecordItem {
    type: string;
    host?: string;
    name?: string;
    desc?: string;
    value: string;
    status?: string;
    ttl?: string | number;
}

export interface SendingDomainRecord {
    id?: string;
    _id?: string;
    type?: "platform_subdomain" | "custom";
    isActive?: boolean;
    status?: "pending" | "verifying" | "verified" | "failed" | "suspended";
    domain?: string;
    address?: string;
    fromName?: string;
    replyTo?: string;
    canSend?: boolean;
    failureReason?: string;
    suspensionReason?: string;
    verifiedAt?: string;
    dnsRecords?: DnsRecordItem[];
}

export interface SendingDomainStatusResponse {
    canSetUp?: boolean;
    canAddCustomDomain?: boolean;
    setUpBlockedReason?: string;
    sendingDomain?: SendingDomainRecord | null;
    sendingDomains?: SendingDomainRecord[];
}

export interface DomainAvailabilityResponse {
    name?: string;
    domain?: string;
    available?: boolean;
    reason?: "too_short" | "too_long" | "invalid_characters" | "reserved" | "not_allowed" | "taken";
    message?: string;
}

export interface SetupSendingDomainPayload {
    name: string;
    fromName?: string;
    replyTo?: string;
}

export interface ConnectCustomDomainPayload {
    domain: string;
}

export interface UpdateSenderProfilePayload {
    fromName?: string;
    replyTo?: string;
    localPart?: string;
}

