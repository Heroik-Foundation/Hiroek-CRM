import { useState, useMemo } from "react";
import { Formik, Form } from "formik";
import { LoadingLayout } from "../../layout";
import { CustomButton, FormikField } from "../../ui";
import { UserRolesCard } from "../../cards";
import { useNavigate } from "react-router-dom";
import useRoles, { getMemberUserId } from "../../../hooks/settings/useRoles";
import type { ITeamMember } from "../../../type/user";
import { BiErrorCircle, BiTrash, BiX } from "react-icons/bi";
import { Spinner, toast } from "@heroui/react";
import { useAtomValue } from "jotai";
import { userAtom } from "../../../utils/atom/user";

const ROLE_OPTIONS = [
    { label: "Creator", value: "owner" },
    { label: "Admin", value: "admin" },
    { label: "Viewer", value: "viewer" },
];

export default function GetUsersRole() {
    const navigate = useNavigate();
    const user = useAtomValue(userAtom);
    const { useGetUsersRoles, deleteTeamMember, updateTeamMember } = useRoles();
    const { data, isLoading } = useGetUsersRoles();

    // Modal states
    const [memberToDelete, setMemberToDelete] = useState<ITeamMember | null>(null);
    const [memberToEdit, setMemberToEdit] = useState<ITeamMember | null>(null);
    const [updatingMemberId, setUpdatingMemberId] = useState<string | null>(null);

    /** 🗑️ Delete Handler */
    const handleDeleteConfirm = () => {
        if (!memberToDelete) return;
        const memberUserId = getMemberUserId(memberToDelete);
        if (!memberUserId) {
            toast.danger("Could not determine team member user ID");
            return;
        }

        deleteTeamMember.mutate(memberUserId, {
            onSuccess: () => {
                setMemberToDelete(null);
            },
        });
    };

    const handleRoleChange = (member: ITeamMember, newRole: string) => {
        const memberUserId = getMemberUserId(member) || member._id;
        if (!memberUserId) return;

        setUpdatingMemberId(memberUserId);
        updateTeamMember.mutate(
            {
                memberUserId,
                data: { role: newRole },
            },
            {
                onSettled: () => {
                    setUpdatingMemberId(null);
                },
            },
        );
    };

    /** 📲 Send Scanner Handler -> Navigate to Scanner Page */
    const handleSendScanner = (member: ITeamMember) => {
        navigate("/dashboard/ticket-scanner", { state: { member } });
    };

    const rawMembers = data?.data || [];

    // Synthesize creator/owner card from logged-in organizer if not already included in list
    const ownerItem: ITeamMember | null = useMemo(() => {
        if (!user) return null;
        return {
            _id: user._id || user.userId || "owner",
            user: {
                _id: user.userId || user._id,
                fullname: user.name || "Creator",
                email: user.email || "",
                photo: user.logo || null,
            },
            fullname: user.name || "Creator",
            email: user.email || "",
            account: user._id,
            accountType: "organizer",
            role: "owner",
            permissions: ["Full Access"],
            createdAt: user.createdAt || "",
            updatedAt: user.updatedAt || "",
            __v: 0,
        };
    }, [user]);

    const members: ITeamMember[] = useMemo(() => {
        const hasOwner = rawMembers.some(
            (m) =>
                (m.role || "").toLowerCase() === "owner" ||
                (m.role || "").toLowerCase() === "creator",
        );
        if (ownerItem && !hasOwner) {
            return [ownerItem, ...rawMembers];
        }
        return rawMembers;
    }, [ownerItem, rawMembers]);

    return (
        <LoadingLayout loading={isLoading}>
            <section className="flex-1 rounded-2xl p-5 sm:p-6 bg-white border border-gray-100 shadow-xs flex flex-col gap-6">
                {/* Header & Add Button */}
                <div className="w-full flex justify-between items-start sm:items-center gap-4 flex-wrap">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                            User Roles & Permissions
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
                            Manage Team Access And Permissions
                        </p>
                    </div>

                    {/* Desktop Add Button */}
                    <button
                        type="button"
                        onClick={() =>
                            navigate("/dashboard/settings?tab=permissions&action=add")
                        }
                        className="hidden sm:inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-[#37137F] hover:bg-[#2c0f66] text-white text-sm font-bold transition shadow-xs cursor-pointer active:scale-95"
                    >
                        + Add Team Member
                    </button>
                </div>

                {/* Mobile Full-Width Add Button */}
                <button
                    type="button"
                    onClick={() =>
                        navigate("/dashboard/settings?tab=permissions&action=add")
                    }
                    className="sm:hidden w-full py-3.5 px-5 rounded-2xl bg-[#37137F] hover:bg-[#2c0f66] text-white text-sm font-bold transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                    + Add Team Member
                </button>

                {/* Team Members List */}
                <div className="w-full flex flex-col gap-3 sm:gap-4">
                    {members.length > 0 ? (
                        members.map((item, index) => {
                            const itemId = getMemberUserId(item) || item?._id || String(index);
                            return (
                                <UserRolesCard
                                    key={itemId}
                                    member={item}
                                    onEdit={(m) => setMemberToEdit(m)}
                                    onDelete={(m) => setMemberToDelete(m)}
                                    onRoleChange={handleRoleChange}
                                    onSendScanner={handleSendScanner}
                                    isDeleting={
                                        Boolean(
                                            deleteTeamMember.isPending &&
                                            memberToDelete &&
                                            getMemberUserId(memberToDelete) === itemId
                                        )
                                    }
                                    isUpdating={
                                        updateTeamMember.isPending &&
                                        updatingMemberId === itemId
                                    }
                                />
                            );
                        })
                    ) : (
                        <div className="py-12 px-4 text-center flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                            <div className="w-14 h-14 rounded-full bg-purple-50 text-[#37137F] flex items-center justify-center mb-3">
                                <svg
                                    className="w-7 h-7"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                    />
                                </svg>
                            </div>
                            <h4 className="text-base font-semibold text-gray-900 mb-1">
                                No team members yet
                            </h4>
                            <p className="text-sm text-gray-500 max-w-sm mb-4">
                                Add team members to delegate event operations, ticket scanning, and role-based permissions.
                            </p>
                            <CustomButton
                                onClick={() =>
                                    navigate(
                                        "/dashboard/settings?tab=permissions&action=add",
                                    )
                                }
                            >
                                + Add First Team Member
                            </CustomButton>
                        </div>
                    )}
                </div>

                {/* 📋 Permission Levels Breakdown Card (Matching Mockup) */}
                <div className="w-full bg-[#ECEAF8] rounded-2xl p-5 sm:p-6 flex flex-col gap-2.5 mt-2">
                    <h4 className="text-sm sm:text-base font-bold text-[#37137F]">
                        Permission Levels
                    </h4>
                    <div className="flex flex-col gap-1.5 text-xs sm:text-sm text-[#4A209B]">
                        <p>
                            <span className="font-bold text-[#37137F]">Owner:</span> Full Access To All Features.
                        </p>
                        <p>
                            <span className="font-bold text-[#37137F]">Admin:</span> Manage Events, View Analytics & Reports, Manage Team, Scan Tickets.
                        </p>
                        <p>
                            <span className="font-bold text-[#37137F]">Viewer:</span> Read-Only Access To Dashboard, Scan Tickets.
                        </p>
                    </div>
                </div>

                {/* ⚠️ DELETE CONFIRMATION WARNING MODAL */}
                {memberToDelete && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
                        <div className="bg-white rounded-2xl max-w-md w-full p-6 flex flex-col gap-4 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-150">
                            {/* Modal Header */}
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100">
                                        <BiErrorCircle size={26} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">
                                            Delete Team Member
                                        </h3>
                                        <p className="text-xs text-gray-500">
                                            Permanent action warning
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => !deleteTeamMember.isPending && setMemberToDelete(null)}
                                    disabled={deleteTeamMember.isPending}
                                    className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition disabled:opacity-50"
                                >
                                    <BiX size={22} />
                                </button>
                            </div>

                            {/* Member Highlight Card */}
                            {(() => {
                                const uObj = typeof memberToDelete.user === "object" ? memberToDelete.user : null;
                                const memberName =
                                    memberToDelete.fullname ||
                                    uObj?.fullname ||
                                    "Team Member";
                                const memberEmail =
                                    memberToDelete.email || uObj?.email || "No email";
                                return (
                                    <div className="bg-gray-50 border border-gray-200/80 rounded-xl p-3.5 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-[#37137F15] text-[#37137F] font-bold text-sm flex items-center justify-center shrink-0">
                                            {memberName.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-semibold text-gray-900 truncate">
                                                {memberName}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate">
                                                {memberEmail}
                                            </p>
                                        </div>
                                        <span className="capitalize text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-[#37137F]">
                                            {memberToDelete.role || "Member"}
                                        </span>
                                    </div>
                                );
                            })()}

                            {/* Warning Body */}
                            <div className="bg-red-50/60 border border-red-200/70 rounded-xl p-3.5 text-xs text-red-800 flex flex-col gap-1">
                                <p className="font-semibold flex items-center gap-1.5 text-red-900">
                                    <span>⚠️</span> Are you sure you want to delete this member?
                                </p>
                                <p className="text-red-700 leading-relaxed">
                                    This member will immediately lose all access to this account, dashboard, and resources. This action cannot be reversed.
                                </p>
                            </div>

                            {/* Modal Action Buttons */}
                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setMemberToDelete(null)}
                                    disabled={deleteTeamMember.isPending}
                                    className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDeleteConfirm}
                                    disabled={deleteTeamMember.isPending}
                                    className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition flex items-center gap-2 disabled:opacity-50 shadow-xs"
                                >
                                    {deleteTeamMember.isPending ? (
                                        <>
                                            <Spinner size="sm" color="current" />
                                            <span>Deleting...</span>
                                        </>
                                    ) : (
                                        <>
                                            <BiTrash size={16} />
                                            <span>Yes, Delete Member</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ✏️ EDIT MEMBER DETAILS MODAL (Formik) */}
                {memberToEdit && (() => {
                    const uObj = typeof memberToEdit.user === "object" ? memberToEdit.user : null;
                    const initialValues = {
                        fullname: memberToEdit.fullname || uObj?.fullname || "",
                        email: memberToEdit.email || uObj?.email || "",
                        role: (memberToEdit.role || "viewer").toLowerCase(),
                    };

                    return (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
                            <div className="bg-white rounded-2xl max-w-lg w-full p-6 flex flex-col gap-5 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
                                {/* Header */}
                                <div className="flex items-start justify-between border-b border-gray-100 pb-3">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">
                                            Edit Member Details
                                        </h3>
                                        <p className="text-xs text-gray-500">
                                            Update role and contact information
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => !updateTeamMember.isPending && setMemberToEdit(null)}
                                        disabled={updateTeamMember.isPending}
                                        className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition"
                                    >
                                        <BiX size={24} />
                                    </button>
                                </div>

                                {/* Formik Form */}
                                <Formik
                                    initialValues={initialValues}
                                    enableReinitialize
                                    onSubmit={(values) => {
                                        const memberUserId = memberToEdit?.user?._id;
                                        if (!memberUserId) {
                                            toast.danger("Could not determine team member user ID");
                                            return;
                                        }

                                        updateTeamMember.mutate(
                                            {
                                                memberUserId,
                                                data: values,
                                            },
                                            {
                                                onSuccess: () => {
                                                    setMemberToEdit(null);
                                                },
                                            },
                                        );
                                    }}
                                >
                                    {() => (
                                        <Form className="flex flex-col gap-4">
                                            <FormikField
                                                name="fullname"
                                                label="Full Name"
                                                placeholder="e.g. Jane Doe"
                                            />

                                            <FormikField
                                                name="email"
                                                label="Email Address"
                                                type="email"
                                                placeholder="e.g. jane@example.com"
                                            />

                                            <FormikField
                                                as="select"
                                                options={ROLE_OPTIONS}
                                                name="role"
                                                label="Assigned Role"
                                            />


                                            {/* Action Buttons */}
                                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 mt-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setMemberToEdit(null)}
                                                    disabled={updateTeamMember.isPending}
                                                    className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
                                                >
                                                    Cancel
                                                </button>
                                                <CustomButton
                                                    type="submit"
                                                    loading={updateTeamMember.isPending}
                                                >
                                                    Save Changes
                                                </CustomButton>
                                            </div>
                                        </Form>
                                    )}
                                </Formik>
                            </div>
                        </div>
                    );
                })()}
            </section>
        </LoadingLayout>
    );
}
