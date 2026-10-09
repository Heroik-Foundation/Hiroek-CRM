import { useState, useRef, useEffect } from "react";
import { BiTrash, BiShow, BiSolidChevronDownCircle, BiUserCircle } from "react-icons/bi";
import type { ITeamMember } from "../../type/user";

export interface UserRolesCardProps {
    member?: ITeamMember;
    onEdit?: (member: ITeamMember) => void;
    onDelete?: (member: ITeamMember) => void;
    onRoleChange?: (member: ITeamMember, newRole: string) => void;
    onSendScanner?: (member: ITeamMember) => void;
    isDeleting?: boolean;
    isUpdating?: boolean;
}

export default function UserRolesCard({
    member,
    onEdit,
    onDelete,
    onRoleChange,
    onSendScanner,
    isDeleting = false,
    isUpdating = false,
}: UserRolesCardProps) {
    if (!member) return null;

    const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsRoleDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const userObj = typeof member.user === "object" ? member.user : null;
    const name =
        member.fullname ||
        userObj?.fullname

    const email = member.email || userObj?.email || "";
    const photo = userObj?.photo || null;
    const rawRole = String(member.role || "viewer").toLowerCase();
    const isOwner = rawRole === "owner" || rawRole === "creator";

    // Display formatted role title
    const displayRole = isOwner
        ? "Creator"
        : rawRole === "admin"
            ? "Admin"
            : "Viewer";

    // Permissions summary line matching mockup
    const getPermissionsText = () => {
        if (isOwner) return "Full Access";
        if (Array.isArray(member.permissions) && member.permissions.length > 0) {
            return member.permissions
                .map((p) =>
                    p
                        .split(/[_-]/)
                        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                        .join(" "),
                )
                .join(", ");
        }
        if (rawRole === "admin") return "Manage Events, View Analytics";
        return "View Analytics, View Events, View Reports";
    };

    return (
        <div className="relative w-full bg-white rounded-2xl border border-gray-200/80 hover:border-purple-200 p-4 sm:p-5 pt-8 sm:pt-5 transition shadow-2xs flex justify-between items-start sm:items-center gap-3 sm:gap-4">
            {/* 👁️ Eye Icon: Top-Left on Mobile, Top-Right on Desktop */}
            <button
                type="button"
                onClick={() => onEdit?.(member)}
                className="absolute top-3 left-4 sm:left-auto sm:right-5 sm:top-4 text-[#37137F] hover:opacity-75 transition cursor-pointer p-0.5"
                title="View / Edit Member Details"
            >
                <BiShow size={20} />
            </button>

            {/* 👤 Left Side: Avatar + Details */}
            <div className="flex items-center gap-3.5 min-w-0 flex-1">
                {photo ? (
                    <img
                        src={photo}
                        alt={name}
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover shrink-0 border border-gray-100"
                    />
                ) : (
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#EAE8F7] text-[#37137F] flex items-center justify-center shrink-0">
                        <BiUserCircle size={36} className="text-[#37137F]" />
                    </div>
                )}

                <div className="flex flex-col min-w-0">
                    <h4 className="text-sm sm:text-base font-bold text-gray-900 truncate">
                        {name}
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-500 font-medium truncate">
                        {email}
                    </p>
                    <p className="text-[11px] sm:text-xs text-gray-500 font-medium mt-0.5 truncate">
                        {getPermissionsText()}
                    </p>
                </div>
            </div>

            {/* ⚙️ Right Side Actions */}
            {isOwner ? (
                /* Creator Badge / Selector (Static / Full Access) */
                <div className="shrink-0">
                    <div className="border border-gray-200 rounded-xl px-3.5 py-1.5 sm:px-4 sm:py-2 flex items-center gap-2 font-bold text-xs sm:text-sm text-[#37137F] bg-white shadow-2xs">
                        <span>Creator</span>
                        <BiSolidChevronDownCircle size={17} className="text-[#37137F] shrink-0" />
                    </div>
                </div>
            ) : (
                /* Admin / Viewer Actions:
                   On Mobile: Flex column items-end [Role (v)] -> [Send Scanner] -> [Delete User]
                   On Desktop: Flex row items-center [Send Scanner] -> [Role (v)] -> [Trash Button]
                */
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-3 shrink-0">
                    {/* Role Dropdown */}
                    <div className="order-1 sm:order-2 relative" ref={dropdownRef}>
                        <button
                            type="button"
                            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                            disabled={isUpdating}
                            className="border border-gray-200 hover:border-[#37137F] rounded-xl px-3.5 py-1.5 sm:px-4 sm:py-2 flex items-center gap-2 font-bold text-xs sm:text-sm text-[#37137F] bg-white transition cursor-pointer shadow-2xs disabled:opacity-60"
                        >
                            <span>{displayRole}</span>
                            <BiSolidChevronDownCircle
                                size={17}
                                className={`text-[#37137F] shrink-0 transition-transform ${isRoleDropdownOpen ? "rotate-180" : ""
                                    }`}
                            />
                        </button>

                        {isRoleDropdownOpen && (
                            <div className="absolute right-0 mt-1.5 w-32 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-30 animate-in fade-in zoom-in-95 duration-150">
                                {[
                                    { label: "Admin", value: "admin" },
                                    { label: "Viewer", value: "viewer" },
                                ].map((r) => {
                                    const isSelected = rawRole === r.value;
                                    return (
                                        <button
                                            key={r.value}
                                            type="button"
                                            onClick={() => {
                                                if (!isSelected && onRoleChange) {
                                                    onRoleChange(member, r.value);
                                                }
                                                setIsRoleDropdownOpen(false);
                                            }}
                                            className={`w-full text-left px-3.5 py-2 text-xs font-semibold transition cursor-pointer ${isSelected
                                                ? "bg-[#37137F15] text-[#37137F]"
                                                : "text-gray-700 hover:bg-gray-50"
                                                }`}
                                        >
                                            {r.label}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Send Scanner Button */}
                    <button
                        type="button"
                        onClick={() => onSendScanner?.(member)}
                        className="order-2 sm:order-1 py-1.5 px-3.5 sm:py-2 sm:px-4 rounded-xl bg-[#37137F] hover:bg-[#2c0f66] text-white font-bold text-xs sm:text-sm transition cursor-pointer shadow-xs active:scale-95 text-center whitespace-nowrap"
                    >
                        Send Scanner
                    </button>

                    {/* Delete User Button:
                       Mobile shows light pink/red pill with 'Delete User' text
                       Desktop shows square button with red trash icon
                    */}
                    <button
                        type="button"
                        onClick={() => onDelete?.(member)}
                        disabled={isDeleting}
                        className="order-3 sm:order-3 py-1.5 px-3.5 sm:p-0 sm:w-10 sm:h-10 rounded-xl bg-[#FDE8E8] hover:bg-[#FBD5D5] sm:bg-red-50 sm:hover:bg-red-100 text-[#E02424] font-bold text-xs flex items-center justify-center transition cursor-pointer active:scale-95 disabled:opacity-50 text-center whitespace-nowrap"
                        title="Delete User"
                    >
                        <span className="sm:hidden">Delete User</span>
                        <BiTrash size={18} className="hidden sm:block text-[#E02424]" />
                    </button>
                </div>
            )}
        </div>
    );
}
