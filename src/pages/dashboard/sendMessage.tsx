import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { Column } from "../../type/table";
import useAudienceSegment from "../../hooks/useAudienceSegment";
import useCampaign, { type CampaignChannel, type ImageUploadResponse } from "../../hooks/useCampaign";
import httpService from "../../config/httpService";
import { URLS } from "../../utils/urls";
import { Spinner, toast } from "@heroui/react";
import { useAtomValue } from "jotai";
import { userAtom } from "../../utils/atom/user";
import useEmailBundles from "../../hooks/settings/useEmailBundles";
import useSendingDomain from "../../hooks/useSendingDomain";
import {
    type MessageView,
    type RecipientItem,
    type VerifiedSender,
    type DnsRecordItem,
    type SocialLinkItem,
    ChooseOptionView,
    VerifyEmailView,
    ReadyToSendView,
    AuthenticateDomainView,
    RecipientsPickerView,
    CampaignComposerView,
    EditSenderModal,
    DeleteSenderModal,
} from "../../components/features/messaging";

// HTML email is enabled by default unless explicitly disabled with VITE_CAMPAIGN_SUPPORTS_HTML=false
const CAMPAIGN_SUPPORTS_HTML = import.meta.env.VITE_CAMPAIGN_SUPPORTS_HTML !== "false";

export default function SendMessage() {
    const navigate = useNavigate();
    const currentUser = useAtomValue(userAtom);

    // Verified sender state from localStorage or initial setup
    const [verifiedSender, setVerifiedSender] = useState<VerifiedSender | null>(() => {
        try {
            const saved = localStorage.getItem("hiroek_verified_sender");
            if (saved) return JSON.parse(saved);
        } catch {
            // ignore
        }
        return null;
    });

    // View state
    const [currentView, setCurrentView] = useState<MessageView>(() => {
        try {
            const saved = localStorage.getItem("hiroek_verified_sender");
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed?.verified && parsed?.email) return "compose";
            }
        } catch {
            // ignore
        }
        return "choose_option";
    });

    // Option 1 (Individual Email Verification) state
    const [fromNameInput, setFromNameInput] = useState(() => {
        try {
            const saved = localStorage.getItem("hiroek_verified_sender");
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed?.senderName) return parsed.senderName;
            }
        } catch { }
        return "John Doe";
    });

    const [emailPrefix, setEmailPrefix] = useState(() => {
        try {
            const saved = localStorage.getItem("hiroek_verified_sender");
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed?.emailPrefix) return parsed.emailPrefix;
            }
        } catch { }
        return "";
    });

    const [confirmEmailPrefix, setConfirmEmailPrefix] = useState("");
    const [emailReplyTo, setEmailReplyTo] = useState(() => {
        try {
            const saved = localStorage.getItem("hiroek_verified_sender");
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed?.replyTo) return parsed.replyTo;
            }
        } catch { }
        return "";
    });

    // Sender settings modals state
    const [isEditSenderModalOpen, setIsEditSenderModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Option 2 (Authenticate Business Domain) state
    const [domainStep, setDomainStep] = useState<1 | 2 | 3 | 4 | 5>(1);
    const [businessDomain, setBusinessDomain] = useState(() => {
        try {
            const saved = localStorage.getItem("hiroek_verified_sender");
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed?.domain) return parsed.domain;
            }
        } catch { }
        return "yourbusiness.com";
    });

    const [senderProfileName, setSenderProfileName] = useState(() => {
        try {
            const saved = localStorage.getItem("hiroek_verified_sender");
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed?.senderName) return parsed.senderName;
            }
        } catch { }
        return "Hiroek Events";
    });

    const [senderProfileEmail, setSenderProfileEmail] = useState(() => {
        try {
            const saved = localStorage.getItem("hiroek_verified_sender");
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed?.email) return parsed.email;
            }
        } catch { }
        return "hello@yourbusiness.com";
    });

    const [senderProfileReplyTo, setSenderProfileReplyTo] = useState(() => {
        try {
            const saved = localStorage.getItem("hiroek_verified_sender");
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed?.replyTo) return parsed.replyTo;
            }
        } catch { }
        return "";
    });

    // Sync currentUser name and email if not set
    useEffect(() => {
        if (currentUser) {
            if (currentUser.name && !verifiedSender) {
                setFromNameInput(currentUser.name);
            }
            if (currentUser.email) {
                if (!emailReplyTo) {
                    setEmailReplyTo(currentUser.email);
                }
                if (!senderProfileReplyTo || senderProfileReplyTo === "hello@yourbusiness.com") {
                    setSenderProfileReplyTo(currentUser.email);
                }
            }
        }
    }, [currentUser, verifiedSender]);

    // Email balance hook
    const { useGetEmailBalance } = useEmailBundles();
    const { data: balanceData } = useGetEmailBalance();
    const balanceCount =
        (typeof balanceData?.balance === "number" ? balanceData.balance : null) ??
        (typeof balanceData?.data?.balance === "number" ? balanceData.data.balance : null) ??
        (typeof balanceData?.result?.balance === "number" ? balanceData.result.balance : null) ??
        1000;
    const balanceFormatted = Number(balanceCount).toLocaleString();

    // Sending domain hooks & endpoints
    const {
        useGetSendingDomain,
        useSetupPlatformDomain,
        useConnectCustomDomain,
        useVerifyCustomDomain,
        useUpdateSenderProfile,
        useDeleteSendingDomain,
    } = useSendingDomain();

    const { data: sendingDomainData, isLoading: isSendingDomainLoading } = useGetSendingDomain();
    const setupPlatformDomainMutation = useSetupPlatformDomain();
    const connectCustomDomainMutation = useConnectCustomDomain();
    const verifyCustomDomainMutation = useVerifyCustomDomain();
    const updateSenderProfileMutation = useUpdateSenderProfile();
    const deleteSendingDomainMutation = useDeleteSendingDomain();

    const serverSendingDomain = useMemo(() => {
        if (!sendingDomainData) return null;
        const resp = sendingDomainData as Record<string, any>;
        return resp?.sendingDomain || resp?.data?.sendingDomain || resp?.result?.sendingDomain || null;
    }, [sendingDomainData]);

    // Active sending domain ID for deletion
    const activeSendingDomainId = useMemo(() => {
        if (!sendingDomainData) return verifiedSender?.id || null;
        const resp = sendingDomainData as Record<string, any>;
        const sd = resp?.sendingDomain || resp?.data?.sendingDomain || resp?.result?.sendingDomain;
        if (sd?.id) return String(sd.id);
        if (sd?._id) return String(sd._id);
        if (Array.isArray(resp?.sendingDomains) && resp.sendingDomains.length > 0) {
            const active = resp.sendingDomains.find((d: any) => d.isActive) || resp.sendingDomains[0];
            if (active?.id) return String(active.id);
            if (active?._id) return String(active._id);
        }
        if (verifiedSender?.id) return verifiedSender.id;
        return null;
    }, [sendingDomainData, verifiedSender]);

    // Synchronize server domain status to local state
    useEffect(() => {
        if (!serverSendingDomain) return;

        if (serverSendingDomain.fromName) {
            setFromNameInput(serverSendingDomain.fromName);
            setSenderProfileName(serverSendingDomain.fromName);
        }
        if (serverSendingDomain.domain) {
            setBusinessDomain(serverSendingDomain.domain);
        }
        if (serverSendingDomain.address) {
            const addr = serverSendingDomain.address;
            setSenderProfileEmail(addr);
            if (addr.includes("@")) {
                const [local, dom] = addr.split("@");
                setEmailPrefix(local);
                setConfirmEmailPrefix(local);
                if (dom && !serverSendingDomain.domain) {
                    setBusinessDomain(dom);
                }
            }
        }
        if (serverSendingDomain.replyTo) {
            setEmailReplyTo(serverSendingDomain.replyTo);
            setSenderProfileReplyTo(serverSendingDomain.replyTo);
        }

        const isVerified =
            serverSendingDomain.canSend === true ||
            serverSendingDomain.status === "verified";

        if (isVerified) {
            const syncedSender: VerifiedSender = {
                id: serverSendingDomain.id || serverSendingDomain._id || activeSendingDomainId || undefined,
                senderName: serverSendingDomain.fromName || currentUser?.name || "Hiroek Events",
                email: serverSendingDomain.address || (serverSendingDomain.domain ? `hello@${serverSendingDomain.domain}` : "hello@hiroek.io"),
                domain: serverSendingDomain.domain,
                replyTo: serverSendingDomain.replyTo || currentUser?.email || serverSendingDomain.address,
                isBusinessDomain: serverSendingDomain.type === "custom",
                verified: true,
                verifiedAt: serverSendingDomain.verifiedAt || new Date().toISOString(),
            };

            setVerifiedSender(syncedSender);
            setFromSender(`${syncedSender.senderName} <${syncedSender.email}>`);
            try {
                localStorage.setItem("hiroek_verified_sender", JSON.stringify(syncedSender));
            } catch {
                // ignore
            }

            setCurrentView((prev) => (prev === "choose_option" ? "compose" : prev));
        }
    }, [serverSendingDomain, currentUser?.name, currentUser?.email, activeSendingDomainId]);

    // Form fields
    const [messageType, setMessageType] = useState<"notifications" | "in_app" | "email">("email");
    const [fromSender, setFromSender] = useState(() => {
        try {
            const saved = localStorage.getItem("hiroek_verified_sender");
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed?.senderName && parsed?.email) {
                    return `${parsed.senderName} <${parsed.email}>`;
                }
            }
        } catch { }
        return "Editor";
    });
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [selectedRecipientsMap, setSelectedRecipientsMap] = useState<Map<string, RecipientItem>>(new Map());
    const [isSendToAll, setIsSendToAll] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(1);
    const rowsPerPage = 10;

    // Image & Preview state
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [socialLinks, setSocialLinks] = useState<SocialLinkItem[]>([]);
    const [isBodyImageDragging, setIsBodyImageDragging] = useState(false);
    const [bodyMode, setBodyMode] = useState<"edit" | "preview">("edit");
    const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Campaign creation and image upload hooks
    const { useCreateCampaign, useUploadCampaignImage } = useCampaign();
    const createCampaignMutation = useCreateCampaign();
    const uploadImageMutation = useUploadCampaignImage();

    // Allowed image formats per API doc (PNG, JPG, GIF, WebP up to 5MB)
    const ALLOWED_IMAGE_TYPES = [
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/webp",
        "image/gif",
    ];

    // Process & upload single image file to S3 via /api/event-partners/image-upload
    const processImageFile = async (file: File) => {
        if (!ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase())) {
            toast.danger("Please select a valid image file (PNG, JPG, GIF, WebP)");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.danger("File size exceeds 5MB limit");
            return;
        }

        if (uploadedImage) {
            toast.info("Replacing existing image with new upload...");
        }

        try {
            const res = await uploadImageMutation.mutateAsync(file);
            const publicUrl =
                res?.url ||
                res?.data?.url ||
                res?.result?.url ||
                "";

            if (publicUrl) {
                setUploadedImage(publicUrl);
                toast.success("Image uploaded successfully!");
            } else {
                toast.danger("No image URL returned from upload");
            }
        } catch (err) {
            console.error("Image upload failed:", err);
        }
    };

    // Upload handler passed to RichTextEditor for inline images
    const handleUploadImageForEditor = async (file: File): Promise<string | null> => {
        if (!ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase())) {
            toast.danger("Please select a valid image file (PNG, JPG, GIF, WebP)");
            return null;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.danger("Image size must be 5MB or less");
            return null;
        }

        try {
            const res = await uploadImageMutation.mutateAsync(file);
            const publicUrl =
                res?.url ||
                res?.data?.url ||
                res?.result?.url ||
                null;
            return publicUrl;
        } catch (err) {
            console.error("Editor image upload failed:", err);
            return null;
        }
    };

    // Silent upload handler for rasterized social icon PNGs so email clients display real <img> icons
    const handleUploadSocialIcon = async (file: File): Promise<string | null> => {
        try {
            const formData = new FormData();
            formData.append("image", file);
            const response = await httpService.post<ImageUploadResponse>(
                URLS.IMAGE_UPLOAD,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            const res = response.data;
            return res?.url || res?.data?.url || res?.result?.url || null;
        } catch (err) {
            console.error("Social icon upload failed:", err);
            return null;
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            if (files.length > 1) {
                toast.warning("Only one image is allowed per message. Using the first image.");
            }
            processImageFile(files[0]);
        }
        e.target.value = "";
    };

    const handleBodyDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsBodyImageDragging(false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            const imageFiles = Array.from(files).filter((f) =>
                f.type.startsWith("image/")
            );
            if (imageFiles.length === 0) {
                toast.danger("Please drop a valid image file (PNG, JPG, GIF, WebP)");
                return;
            }
            if (imageFiles.length > 1) {
                toast.warning("Only one image is allowed per message. Using the first image.");
            }
            processImageFile(imageFiles[0]);
        }
    };

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 350);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Reset to page 1 whenever search query changes
    useEffect(() => {
        setPage(1);
    }, [debouncedSearch]);

    // Load recipients from audience endpoint
    const { useGetAudienceSegmentCustomer } = useAudienceSegment();
    const { data: audienceData, isLoading: isAudienceLoading } = useGetAudienceSegmentCustomer({
        segment: "all",
        page,
        limit: rowsPerPage,
        search: debouncedSearch.trim() || undefined,
    });

    const { data: allAudienceData } = useGetAudienceSegmentCustomer({
        segment: "all",
        limit: 1000,
    });

    const rawCustomers = useMemo(() => {
        if (!audienceData) return [];
        if (Array.isArray(audienceData)) return audienceData;
        const dObj = audienceData as Record<string, unknown>;
        if (Array.isArray(dObj.data)) return dObj.data;
        if (Array.isArray(dObj.results)) return dObj.results;
        if (Array.isArray(dObj.customers)) return dObj.customers;
        if (Array.isArray(dObj.items)) return dObj.items;
        return [];
    }, [audienceData]);

    const allCustomers = useMemo(() => {
        if (!allAudienceData) return [];
        if (Array.isArray(allAudienceData)) return allAudienceData;
        const dObj = allAudienceData as Record<string, unknown>;
        if (Array.isArray(dObj.data)) return dObj.data;
        if (Array.isArray(dObj.results)) return dObj.results;
        if (Array.isArray(dObj.customers)) return dObj.customers;
        if (Array.isArray(dObj.items)) return dObj.items;
        return [];
    }, [allAudienceData]);

    const totalCount = useMemo(() => {
        if (!audienceData) return 0;
        const dObj = audienceData as Record<string, any>;
        return (
            dObj.total ??
            dObj.pagination?.total ??
            dObj.pagination?.totalItems ??
            dObj.totalCount ??
            dObj.count ??
            (Array.isArray(rawCustomers) ? rawCustomers.length : 0)
        );
    }, [audienceData, rawCustomers]);

    const totalPages = Math.max(1, Math.ceil(totalCount / rowsPerPage));

    const displayedRecipients: RecipientItem[] = useMemo(() => {
        if (!Array.isArray(rawCustomers) || rawCustomers.length === 0) return [];
        return rawCustomers.map((item: Record<string, unknown>, idx: number) => {
            const customerId =
                item.customerId ||
                item._id ||
                item.id ||
                (typeof item.user === "object" && item.user !== null
                    ? (item.user as Record<string, unknown>)._id
                    : null) ||
                `recipient-${(page - 1) * rowsPerPage + idx + 1}`;

            const name =
                item.fullname ||
                item.name ||
                (item.firstName
                    ? `${item.firstName} ${item.lastName || ""}`.trim()
                    : null) ||
                (typeof item.user === "object" && item.user !== null
                    ? (item.user as Record<string, unknown>).fullname
                    : null) ||
                item.username ||
                item.email ||
                "Attendee";

            const email =
                item.email ||
                (typeof item.user === "object" && item.user !== null
                    ? (item.user as Record<string, unknown>).email
                    : "") ||
                "";

            const phone =
                item.phone ||
                item.phoneNumber ||
                item.mobile ||
                item.telephone ||
                (typeof item.user === "object" && item.user !== null
                    ? (item.user as Record<string, unknown>).phone
                    : "") ||
                "-";

            const location =
                item.location ||
                item.city ||
                (typeof item.user === "object" && item.user !== null
                    ? (item.user as Record<string, unknown>).location ||
                    (item.user as Record<string, unknown>).city
                    : null) ||
                "London";

            return {
                id: String(customerId),
                sNo: (page - 1) * rowsPerPage + idx + 1,
                name: String(name),
                username: String(item.username || ""),
                email: String(email),
                phone: String(phone),
                location: String(location),
                rawCustomer: item,
            };
        });
    }, [rawCustomers, page, rowsPerPage]);

    const selectedCount = isSendToAll ? totalCount : selectedRecipientsMap.size;

    const toggleSelect = (item: RecipientItem) => {
        if (isSendToAll) {
            setIsSendToAll(false);
            const next = new Map<string, RecipientItem>();
            displayedRecipients.forEach((r) => {
                if (r.id !== item.id) {
                    next.set(r.id, r);
                }
            });
            setSelectedRecipientsMap(next);
            return;
        }

        setSelectedRecipientsMap((prev) => {
            const next = new Map(prev);
            if (next.has(item.id)) {
                next.delete(item.id);
            } else {
                next.set(item.id, item);
            }
            return next;
        });
    };

    const handleSendToAllToggle = () => {
        if (isSendToAll) {
            setIsSendToAll(false);
            setSelectedRecipientsMap(new Map());
        } else {
            setIsSendToAll(true);
            setSelectedRecipientsMap(new Map());
        }
    };

    // Option 1 handler: Approve individual email
    const handleApproveEmail = async () => {
        const trimmedName = fromNameInput.trim();
        if (!trimmedName) {
            toast.danger("Please enter your sender name");
            return;
        }

        const cleanPrefix = emailPrefix.trim().toLowerCase();
        if (!cleanPrefix) {
            toast.danger("Please enter your email username");
            return;
        }

        if (!/^[a-z0-9._-]+$/.test(cleanPrefix)) {
            toast.danger("Username can only contain letters, numbers, dots, dashes and underscores");
            return;
        }

        const cleanConfirm = confirmEmailPrefix.trim().toLowerCase();
        if (!cleanConfirm) {
            toast.danger("Please confirm your email address");
            return;
        }

        if (cleanPrefix !== cleanConfirm) {
            toast.danger("Email addresses do not match");
            return;
        }

        const cleanReplyTo =
            emailReplyTo.trim().toLowerCase() ||
            currentUser?.email ||
            `${cleanPrefix}@hiroek.io`;

        try {
            const resp = await setupPlatformDomainMutation.mutateAsync({
                name: cleanPrefix,
                fromName: trimmedName,
                replyTo: cleanReplyTo,
            });

            const createdDomainId =
                resp?.sendingDomain?.id ||
                resp?.sendingDomain?._id ||
                undefined;

            const newSender: VerifiedSender = {
                id: createdDomainId,
                senderName: trimmedName,
                emailPrefix: cleanPrefix,
                email: `${cleanPrefix}@hiroek.io`,
                replyTo: cleanReplyTo,
                verified: true,
                verifiedAt: new Date().toISOString(),
            };

            try {
                localStorage.setItem("hiroek_verified_sender", JSON.stringify(newSender));
            } catch {
                // ignore
            }

            setVerifiedSender(newSender);
            setFromSender(`${newSender.senderName} <${newSender.email}>`);
            toast.success("Email address verified successfully!");
            setCurrentView("ready_to_send");
        } catch (err) {
            console.error("Failed to setup platform sending domain:", err);
        }
    };

    // Option 2 handlers: Domain DNS records
    const cleanBusinessDomain =
        businessDomain
            .trim()
            .toLowerCase()
            .replace(/^https?:\/\//, "")
            .replace(/\/.*$/, "") || "yourbusiness.com";

    const activeDnsRecords: DnsRecordItem[] = useMemo(() => {
        if (
            serverSendingDomain?.dnsRecords &&
            Array.isArray(serverSendingDomain.dnsRecords) &&
            serverSendingDomain.dnsRecords.length > 0
        ) {
            return serverSendingDomain.dnsRecords.map((r: any) => ({
                type: r.type || "CNAME",
                host: r.host || r.name || `em.${cleanBusinessDomain}`,
                desc: r.desc || "DNS Verification Record",
                value: r.value || "send.hiroekevents.net",
                status: r.status || "Ready to link",
                ttl: r.ttl || "300 (Auto)",
            }));
        }

        return [
            {
                type: "CNAME",
                host: `em.${cleanBusinessDomain}`,
                desc: "Custom Mail Delivery Subdomain",
                value: "send.hiroekevents.net",
                status: "Ready to link",
                ttl: "300 (Auto)",
            },
            {
                type: "CNAME",
                host: `s1._domainkey.${cleanBusinessDomain}`,
                desc: "DKIM Key 1 (2048-bit Rotating Key)",
                value: "dkim1.hiroekevents.net",
                status: "Ready to link",
                ttl: "300 (Auto)",
            },
            {
                type: "CNAME",
                host: `s2._domainkey.${cleanBusinessDomain}`,
                desc: "DKIM Key 2 (Automatic Fallback Redundancy)",
                value: "dkim2.hiroekevents.net",
                status: "Ready to link",
                ttl: "300 (Auto)",
            },
        ];
    }, [serverSendingDomain, cleanBusinessDomain]);

    const handleCopyDns = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied to clipboard!`);
    };

    const handleContinueDomainStep1 = async () => {
        if (!cleanBusinessDomain || !cleanBusinessDomain.includes(".")) {
            toast.danger("Please enter a valid domain (e.g. yourbusiness.com)");
            return;
        }
        setBusinessDomain(cleanBusinessDomain);
        if (!senderProfileEmail || senderProfileEmail === "hello@yourbusiness.com") {
            setSenderProfileEmail(`hello@${cleanBusinessDomain}`);
        }
        if (!senderProfileReplyTo || senderProfileReplyTo === "hello@yourbusiness.com") {
            setSenderProfileReplyTo(currentUser?.email || `hello@${cleanBusinessDomain}`);
        }

        try {
            await connectCustomDomainMutation.mutateAsync({
                domain: cleanBusinessDomain,
            });
            setDomainStep(2);
        } catch (err: any) {
            const status = err?.response?.status;
            if (status === 409 || status === 400) {
                setDomainStep(2);
            }
        }
    };

    const handleAddedRecordsStep2 = async () => {
        try {
            await verifyCustomDomainMutation.mutateAsync();
            toast.success("DNS verification check initiated");
        } catch (err) {
            console.error("DNS verification check error:", err);
        }
        setDomainStep(3);
    };

    const handleSaveSenderProfile = async () => {
        if (!senderProfileName.trim()) {
            toast.danger("Please enter your sender name");
            return;
        }
        if (!senderProfileEmail.trim()) {
            toast.danger("Please enter your sender email");
            return;
        }
        const cleanFromEmail = senderProfileEmail.trim().toLowerCase();
        const cleanReplyTo =
            senderProfileReplyTo.trim().toLowerCase() ||
            currentUser?.email ||
            cleanFromEmail;
        const localPart = cleanFromEmail.split("@")[0] || "hello";

        try {
            const resp = await updateSenderProfileMutation.mutateAsync({
                fromName: senderProfileName.trim(),
                replyTo: cleanReplyTo,
                localPart,
            });

            const domainData: VerifiedSender = {
                id: resp?.sendingDomain?.id || resp?.sendingDomain?._id || activeSendingDomainId || undefined,
                senderName: senderProfileName.trim(),
                email: cleanFromEmail,
                domain: cleanBusinessDomain,
                replyTo: cleanReplyTo,
                verified: true,
                isBusinessDomain: true,
                verifiedAt: new Date().toISOString(),
            };

            try {
                localStorage.setItem("hiroek_verified_sender", JSON.stringify(domainData));
            } catch {
                // ignore
            }

            setVerifiedSender(domainData);
            setFromSender(`${domainData.senderName} <${domainData.email}>`);
            toast.success("Sender profile saved!");
            setDomainStep(5);
        } catch (err) {
            console.error("Failed to update sender profile:", err);
        }
    };

    // Update Sender Profile from modal (PATCH /api/event-partners/sending-domain)
    const handleUpdateSenderProfileModal = async (payload: {
        fromName?: string;
        replyTo?: string;
        localPart?: string;
    }) => {
        try {
            await updateSenderProfileMutation.mutateAsync(payload);
            toast.success("Sender profile updated successfully!");

            setVerifiedSender((prev) => {
                if (!prev) return null;
                const next: VerifiedSender = {
                    ...prev,
                    senderName: payload.fromName || prev.senderName,
                    replyTo: payload.replyTo || prev.replyTo,
                };
                if (payload.localPart && prev.domain) {
                    next.email = `${payload.localPart}@${prev.domain}`;
                }
                try {
                    localStorage.setItem("hiroek_verified_sender", JSON.stringify(next));
                } catch {
                    // ignore
                }
                setFromSender(`${next.senderName} <${next.email}>`);
                return next;
            });

            if (payload.fromName) setFromNameInput(payload.fromName);
            if (payload.replyTo) setEmailReplyTo(payload.replyTo);

            setIsEditSenderModalOpen(false);
        } catch (err) {
            console.error("Failed to update sender profile:", err);
        }
    };

    // Delete Sending Domain (DELETE /api/event-partners/sending-domain/{sendingDomainId})
    const handleDeleteSendingDomain = async () => {
        const idToDelete = activeSendingDomainId;
        if (!idToDelete) {
            toast.danger("No sending domain found to delete");
            return;
        }

        try {
            await deleteSendingDomainMutation.mutateAsync(idToDelete);
            toast.success("Sending domain deleted successfully!");

            try {
                localStorage.removeItem("hiroek_verified_sender");
            } catch {
                // ignore
            }

            setVerifiedSender(null);
            setFromSender("Editor");
            setEmailPrefix("");
            setConfirmEmailPrefix("");
            setEmailReplyTo(currentUser?.email || "");
            setBusinessDomain("yourbusiness.com");
            setDomainStep(1);
            setIsDeleteModalOpen(false);
            setIsEditSenderModalOpen(false);
            setCurrentView("choose_option");
        } catch (err) {
            console.error("Failed to delete sending domain:", err);
        }
    };

    // Dispatch campaign message
    const handleSendMessage = async () => {
        if (uploadImageMutation.isPending) {
            toast.warning("Please wait for your image upload to complete before sending.");
            return;
        }
        if (!title.trim()) {
            toast.danger("Please enter a message title");
            return;
        }
        const isBodyEmpty = !body.trim() || body === "<p></p>" || body === "<p><br></p>";
        if (isBodyEmpty) {
            toast.danger("Please enter a message body");
            return;
        }
        if (selectedCount === 0) {
            toast.danger("Please select at least one recipient");
            return;
        }

        const channel: CampaignChannel =
            messageType === "notifications"
                ? "notification"
                : messageType === "in_app"
                    ? "in_app"
                    : "email";

        const targetList = isSendToAll
            ? (allCustomers.length > 0 ? allCustomers : rawCustomers)
            : Array.from(selectedRecipientsMap.values()).map((r) => r.rawCustomer || r);

        const customerIds: string[] = [];
        const importedEmails: { email: string; name?: string }[] = [];

        targetList.forEach((item: Record<string, unknown>) => {
            const rawId =
                item.customerId ||
                item._id ||
                item.id ||
                (typeof item.user === "object" && item.user !== null
                    ? (item.user as Record<string, unknown>)._id
                    : null);

            const strId = String(rawId || "").trim();

            const email = String(
                item.email ||
                (typeof item.user === "object" && item.user !== null
                    ? (item.user as Record<string, unknown>).email
                    : "") ||
                ""
            ).trim();

            const name = String(
                item.fullname ||
                item.name ||
                item.username ||
                ""
            ).trim();

            if (/^[0-9a-fA-F]{24}$/.test(strId)) {
                if (!customerIds.includes(strId)) {
                    customerIds.push(strId);
                }
            } else if (email && email.includes("@")) {
                if (!importedEmails.some((ie) => ie.email.toLowerCase() === email.toLowerCase())) {
                    importedEmails.push({
                        email,
                        name: name && name !== "Attendee" ? name : undefined,
                    });
                }
            }
        });

        const recipientsPayload: { customerIds?: string[]; importedEmails?: { email: string; name?: string }[] } = {};
        if (customerIds.length > 0) {
            recipientsPayload.customerIds = customerIds;
        }
        if (importedEmails.length > 0) {
            recipientsPayload.importedEmails = importedEmails;
        }

        if (customerIds.length === 0 && importedEmails.length === 0) {
            toast.danger("The selected recipient(s) do not have a valid customer ID or email address");
            return;
        }

        const useHtml = CAMPAIGN_SUPPORTS_HTML && (channel === "email" || channel === "in_app");

        let resolvedSocialLinks = socialLinks;
        if (channel === "email" && socialLinks.length > 0 && useHtml) {
            const { ensureSocialIconUploaded } = await import("../../utils/socialPlatforms");
            resolvedSocialLinks = await Promise.all(
                socialLinks.map(async (link) => {
                    if (link.iconUrl) return link;
                    const iconUrl = await ensureSocialIconUploaded(
                        link.platform,
                        handleUploadSocialIcon
                    );
                    return iconUrl ? { ...link, iconUrl } : link;
                })
            );
            setSocialLinks(resolvedSocialLinks);
        }

        const finalBody = useHtml
            ? (await import("../../utils/emailTemplate")).buildFullEmailHtml(body.trim(), {
                bannerImage: uploadedImage,
                socialLinks: channel === "email" ? resolvedSocialLinks : undefined,
            })
            : (await import("../../utils/styledText")).convertHtmlToStyledText(body.trim());

        const idempotencyKey = `campaign_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

        try {
            await createCampaignMutation.mutateAsync({
                idempotencyKey,
                channels: [channel],
                recipients: recipientsPayload,
                title: title.trim(),
                body: finalBody,
                // ...(useHtml ? { isHtml: true } : {}),
            });

            toast.success(
                `Message successfully dispatched to ${isSendToAll ? totalCount : targetList.length} recipient(s)!`
            );
            setTimeout(() => {
                navigate("/dashboard/audience");
            }, 1200);
        } catch (err) {
            console.error("Failed to send message:", err);
        }
    };

    // Columns for Recipient Table
    const recipientColumns: Column<RecipientItem>[] = [
        {
            id: "select",
            name: "Select",
            render: (_value, item) => {
                const checked = isSendToAll || selectedRecipientsMap.has(item.id);
                return (
                    <div className="flex items-center justify-center w-full">
                        <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleSelect(item)}
                            className="w-4 h-4 rounded text-[#2E0F74] accent-[#2E0F74] border-gray-300 cursor-pointer"
                        />
                    </div>
                );
            },
        },
        {
            id: "sNo",
            name: "S/No",
            render: (_value, item) => (
                <span className="w-7 h-7 rounded-full bg-[#F3F0FA] text-[#2E0F74] flex items-center justify-center text-xs font-bold shrink-0">
                    {item.sNo}
                </span>
            ),
        },
        {
            id: "name",
            name: "User",
            render: (_value, item) => (
                <span className="font-bold text-gray-900 text-xs sm:text-sm whitespace-nowrap">
                    {item.name}
                </span>
            ),
        },
        {
            id: "email",
            name: "Email",
            render: (_value, item) => (
                <span className="text-xs sm:text-sm font-semibold text-gray-800">
                    {item.email || "Jimmy.C@Email.Com"}
                </span>
            ),
        },
        {
            id: "phone",
            name: "Phone Number",
            render: (_value, item) => (
                <span className="text-xs sm:text-sm text-gray-600">
                    {item.phone}
                </span>
            ),
        },
        {
            id: "location",
            name: "Location",
            render: (_value, item) => (
                <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                    {item.location}
                </span>
            ),
        },
    ];

    // ─── MODALS ─────────────────────────────────────────────────────────────
    const renderModals = () => (
        <>
            <EditSenderModal
                isOpen={isEditSenderModalOpen}
                onClose={() => setIsEditSenderModalOpen(false)}
                verifiedSender={verifiedSender}
                currentAccountEmail={currentUser?.email || ""}
                onUpdateProfile={handleUpdateSenderProfileModal}
                onOpenDeleteModal={() => {
                    setIsEditSenderModalOpen(false);
                    setIsDeleteModalOpen(true);
                }}
                isUpdating={updateSenderProfileMutation.isPending}
            />
            <DeleteSenderModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                domainNameOrAddress={
                    verifiedSender?.email ||
                    verifiedSender?.domain ||
                    serverSendingDomain?.domain ||
                    serverSendingDomain?.address ||
                    "current sending domain"
                }
                onConfirmDelete={handleDeleteSendingDomain}
                isDeleting={deleteSendingDomainMutation.isPending}
            />
        </>
    );

    // ─── VIEW ROUTING ────────────────────────────────────────────────────────
    if (isSendingDomainLoading && !verifiedSender) {
        return (
            <div className="w-full flex items-center justify-center min-h-100">
                <Spinner size="lg" color="current" className="text-[#2E0F74]" />
            </div>
        );
    }

    if (currentView === "recipients") {
        return (
            <RecipientsPickerView
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                isSendToAll={isSendToAll}
                onToggleSendToAll={handleSendToAllToggle}
                selectedCount={selectedCount}
                columns={recipientColumns}
                rows={displayedRecipients}
                totalCount={totalCount}
                page={page}
                onPageChange={setPage}
                rowsPerPage={rowsPerPage}
                totalPages={totalPages}
                isLoading={isAudienceLoading}
                onDone={() => setCurrentView("compose")}
            />
        );
    }

    if (currentView === "choose_option") {
        return (
            <>
                <ChooseOptionView
                    onSelectVerifyEmail={() => setCurrentView("verify_email")}
                    onSelectAuthenticateDomain={() => {
                        setCurrentView("authenticate_domain");
                        setDomainStep(1);
                    }}
                    hasVerifiedSender={Boolean(verifiedSender?.verified)}
                    verifiedSender={verifiedSender}
                    onSkipToComposer={() => setCurrentView("compose")}
                    onEditSender={() => setIsEditSenderModalOpen(true)}
                    onDeleteSender={() => setIsDeleteModalOpen(true)}
                />
                {renderModals()}
            </>
        );
    }

    if (currentView === "verify_email") {
        return (
            <>
                <VerifyEmailView
                    fromName={fromNameInput}
                    onFromNameChange={setFromNameInput}
                    emailPrefix={emailPrefix}
                    onEmailPrefixChange={setEmailPrefix}
                    confirmEmailPrefix={confirmEmailPrefix}
                    onConfirmEmailPrefixChange={setConfirmEmailPrefix}
                    replyTo={emailReplyTo}
                    onReplyToChange={setEmailReplyTo}
                    onApprove={handleApproveEmail}
                    onBack={() => setCurrentView("choose_option")}
                    isLoading={setupPlatformDomainMutation.isPending}
                />
                {renderModals()}
            </>
        );
    }

    if (currentView === "ready_to_send") {
        return (
            <>
                <ReadyToSendView
                    senderName={verifiedSender?.senderName || "Hiroek Events"}
                    senderEmail={verifiedSender?.email || "hello@hiroek.io"}
                    replyTo={verifiedSender?.replyTo}
                    emailBalanceFormatted={balanceFormatted}
                    onCreateCampaign={() => setCurrentView("compose")}
                    onEditSender={() => setIsEditSenderModalOpen(true)}
                    onDeleteSender={() => setIsDeleteModalOpen(true)}
                />
                {renderModals()}
            </>
        );
    }

    if (currentView === "authenticate_domain") {
        return (
            <>
                <AuthenticateDomainView
                    domainStep={domainStep}
                    businessDomain={businessDomain}
                    onDomainChange={setBusinessDomain}
                    senderProfileName={senderProfileName}
                    onSenderProfileNameChange={setSenderProfileName}
                    senderProfileEmail={senderProfileEmail}
                    onSenderProfileEmailChange={setSenderProfileEmail}
                    senderProfileReplyTo={senderProfileReplyTo}
                    onSenderProfileReplyToChange={setSenderProfileReplyTo}
                    dnsRecords={activeDnsRecords}
                    emailBalanceFormatted={balanceFormatted}
                    onContinueStep1={handleContinueDomainStep1}
                    onAddedRecordsStep2={handleAddedRecordsStep2}
                    onContinueStep3={() => setDomainStep(4)}
                    onSaveSenderProfileStep4={handleSaveSenderProfile}
                    onCreateCampaignStep5={() => setCurrentView("compose")}
                    onBackToOptions={() => setCurrentView("choose_option")}
                    onGoToStep={setDomainStep}
                    onCopyDnsRecord={handleCopyDns}
                    isConnectingDomain={connectCustomDomainMutation.isPending}
                    isCheckingDns={verifyCustomDomainMutation.isPending}
                    isUpdatingProfile={updateSenderProfileMutation.isPending}
                />
                {renderModals()}
            </>
        );
    }

    // ─── COMPOSE VIEW ────────────────────────────────────────────────────────
    return (
        <>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
                multiple={false}
                className="hidden"
            />
            <CampaignComposerView
                verifiedSender={verifiedSender}
                onConfigureSender={() => setCurrentView("choose_option")}
                onEditSender={() => setIsEditSenderModalOpen(true)}
                onDeleteSender={() => setIsDeleteModalOpen(true)}
                messageType={messageType}
                onMessageTypeChange={setMessageType}
                fromSender={fromSender}
                title={title}
                onTitleChange={setTitle}
                body={body}
                onBodyChange={setBody}
                bodyMode={bodyMode}
                onBodyModeChange={setBodyMode}
                previewDevice={previewDevice}
                onPreviewDeviceChange={setPreviewDevice}
                uploadedImage={uploadedImage}
                isUploadingImage={uploadImageMutation.isPending}
                onRemoveImage={() => {
                    setUploadedImage(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                isBodyImageDragging={isBodyImageDragging}
                onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsBodyImageDragging(true);
                }}
                onDragLeave={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsBodyImageDragging(false);
                }}
                onDrop={handleBodyDrop}
                onFileInputClick={() => fileInputRef.current?.click()}
                selectedCount={selectedCount}
                onOpenRecipients={() => setCurrentView("recipients")}
                onSendMessage={handleSendMessage}
                isSending={createCampaignMutation.isPending}
                campaignSupportsHtml={CAMPAIGN_SUPPORTS_HTML}
                onUploadImage={handleUploadImageForEditor}
                onUploadSocialIcon={handleUploadSocialIcon}
                socialLinks={socialLinks}
                onSocialLinksChange={setSocialLinks}
            />
            {renderModals()}
        </>
    );
}
