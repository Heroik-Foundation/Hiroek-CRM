import { BiPencil, BiTrash } from "react-icons/bi";
import type { ITeamMember } from "../../type/user";

export interface UserRolesCardProps {
    member?: ITeamMember;
    onEdit?: (member: ITeamMember) => void;
    onDelete?: (member: ITeamMember) => void;
    onRoleChange?: (member: ITeamMember, newRole: string) => void;
    isDeleting?: boolean;
    isUpdating?: boolean;
}

const AVAILABLE_ROLES = [
    { label: "Admin", value: "admin" },
    { label: "Viewer", value: "viewer" },
];

export default function UserRolesCard({
    member,
    onEdit,
    onDelete,
    onRoleChange,
    isDeleting = false,
    isUpdating = false,
}: UserRolesCardProps) {
    if (!member) return null;

    const userObj = typeof member.user === "object" ? member.user : null;
    const name =
        member.fullname ||
        userObj?.fullname ||
        (typeof member.user === "string" ? `Member (${member.user.slice(-6)})` : "Team Member");

    const email = member.email || userObj?.email || "—";
    const photo = userObj?.photo || null;
    const currentRole = String(member.role || "viewer").toLowerCase();

    const getRoleBadgeStyle = (r: string) => {
        switch (r) {
            case "admin":
            case "owner":
                return "bg-purple-100 text-[#37137F] border-purple-200";
            case "viewer":
            default:
                return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    return (
        <div className="w-full border border-gray-200 hover:border-purple-200 rounded-2xl p-4 sm:p-5 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white shadow-xs transition">
            {/* User Details */}
            <div className="flex items-center gap-3.5">
                {photo ? (
                    <img
                        src={photo}
                        alt={name}
                        className="w-13 h-13 rounded-full object-cover shrink-0 border border-gray-100"
                    />
                ) : (
                    <div className="w-13 h-13 rounded-full bg-[#37137F15] text-[#37137F] font-bold text-base flex items-center justify-center shrink-0">
                        {name.charAt(0).toUpperCase()}
                    </div>
                )}
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900">{name}</p>
                        <span
                            className={`capitalize border rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${getRoleBadgeStyle(
                                currentRole,
                            )}`}
                        >
                            {member.role || "Viewer"}
                        </span>
                    </div>
                    <p className="text-xs text-gray-500">{email}</p>
                    {member.status && (
                        <span className="text-[11px] text-gray-400">
                            Status: <span className="text-gray-700 font-medium">{member.status}</span>
                        </span>
                    )}
                </div>
            </div>

            {/* Role Actions & Buttons */}
            <div className="flex flex-wrap items-center gap-2 self-end lg:self-center">
                {/* Quick Role Badges / Selectors */}
                {member.role === "owner" ? (
                    <span className="text-sm text-gray-500">Owner</span>
                ) : (
                    <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-200/70">
                        {AVAILABLE_ROLES.map((r) => {
                            const isActive = currentRole === r.value;
                            return (
                                <button
                                    key={r.value}
                                    type="button"
                                    disabled={isUpdating}
                                    onClick={() => {
                                        if (!isActive && onRoleChange) {
                                            onRoleChange(member, r.value);
                                        }
                                    }}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${isActive
                                        ? "bg-[#37137F] text-white shadow-xs"
                                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/50"
                                        } disabled:opacity-50`}
                                >
                                    {r.label}
                                </button>
                            );
                        })}
                    </div>
                )}

                {member.role !== "owner" && (
                    <button
                        type="button"
                        onClick={() => onEdit?.(member)}
                        className="h-9 px-3.5 text-xs font-semibold text-[#37137F] bg-[#37137F10] hover:bg-[#37137F20] rounded-xl flex items-center gap-1.5 transition active:scale-95"
                    >
                        <BiPencil size={15} />
                        <span>Edit</span>
                    </button>
                )}

                {member.role !== "owner" && (
                    <button
                        type="button"
                        onClick={() => onDelete?.(member)}
                        disabled={isDeleting}
                        className="h-9 w-9 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl flex items-center justify-center transition active:scale-95 disabled:opacity-50"
                        title="Delete team member"
                    >
                        <BiTrash size={17} />
                    </button>
                )}
            </div>
        </div>
    );
}
