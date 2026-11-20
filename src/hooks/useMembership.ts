import { useAtomValue } from "jotai";
import { membershipAtom, userAtom } from "../utils/atom/user";
import { useMemo } from "react";

export function useMembership() {
    const membership = useAtomValue(membershipAtom);
    const user = useAtomValue(userAtom);

    // Support optional dev testing override via localStorage (e.g. localStorage.setItem("hiroek_test_role", "admin"))
    const testRole = typeof window !== "undefined"
        ? (localStorage.getItem("hiroek_test_role") || localStorage.getItem("hiroekuserrole"))
        : null;

    const rawRole = useMemo(() => {
        if (testRole) return testRole.trim().toLowerCase();
        if (membership?.role) return String(membership.role).trim().toLowerCase();
        if ((user as any)?.role) return String((user as any).role).trim().toLowerCase();
        // If user object has ownerId and userId matching or exists without membership:
        if (user?._id) return "owner";
        return "viewer";
    }, [membership, user, testRole]);

    const isOwner = rawRole === "owner" || rawRole === "creator";
    const isAdmin = rawRole === "admin";
    const isViewer = rawRole === "viewer" || rawRole === "view" || (!isOwner && !isAdmin);

    // Human-friendly role tag (e.g., "Admin", "View" / "Viewer", "Owner")
    const roleTag = useMemo(() => {
        if (isOwner) return "Owner";
        if (isAdmin) return "Admin";
        if (isViewer) {
            return rawRole === "view" ? "View" : "Viewer";
        }
        return rawRole ? rawRole.charAt(0).toUpperCase() + rawRole.slice(1) : "Member";
    }, [isOwner, isAdmin, isViewer, rawRole]);

    // User display name
    const displayName = useMemo(() => {
        return (
            membership?.user?.fullname ||
            (membership?.user as any)?.name ||
            user?.name ||
            "Team Member"
        );
    }, [membership, user]);

    // Subtitle / Account representation
    const displaySubtitle = useMemo(() => {
        return membership?.account?.name || user?.name || "Hiroek CRM";
    }, [membership, user]);

    // Avatar image
    const displayAvatar = useMemo(() => {
        return membership?.user?.photo || user?.logo || null;
    }, [membership, user]);

    // Permissions check
    const hasPermission = (permission: string): boolean => {
        if (isOwner) return true;
        const perms = membership?.permissions || [];
        if (perms.includes("client.*") || perms.includes("*")) {
            return true;
        }
        if (perms.includes(permission)) {
            return true;
        }
        // Fallback defaults for admin
        if (isAdmin) {
            if (permission.startsWith("analytics.") || permission === "ticket.scan" || permission.startsWith("community.")) {
                return true;
            }
        }
        return false;
    };

    /**
     * RESTRICTIONS:
     * "make sure both admin and users can't access the settings, and any thing to do with password, and user information update"
     * Only the Owner has access to Settings, Password Management, and User Information Updates.
     */
    const canAccessSettings = isOwner;
    const canUpdateUserInfo = isOwner;
    const canChangePassword = isOwner;
    const canManageTeam = isOwner;

    // Feature permissions
    const canScanTickets = isOwner || isAdmin || hasPermission("ticket.scan");
    const canSendMessages = isOwner || isAdmin || hasPermission("community.create") || hasPermission("community.announcement");
    const canViewAnalytics = isOwner || isAdmin || isViewer || hasPermission("analytics.view");
    const canViewDonations = isOwner || isAdmin || isViewer || hasPermission("donations.view");

    return {
        membership,
        user,
        rawRole,
        isOwner,
        isAdmin,
        isViewer,
        roleTag,
        displayName,
        displaySubtitle,
        displayAvatar,
        hasPermission,
        canAccessSettings,
        canUpdateUserInfo,
        canChangePassword,
        canManageTeam,
        canScanTickets,
        canSendMessages,
        canViewAnalytics,
        canViewDonations,
    };
}

export default useMembership;
