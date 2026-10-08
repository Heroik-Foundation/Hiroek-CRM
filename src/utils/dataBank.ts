import { Card, People } from "iconsax-reactjs";
import { BiSolidMessageEdit, BiSupport } from "react-icons/bi";
import { FaPoundSign } from "react-icons/fa";
import { HiOutlineTicket, HiTrendingUp } from "react-icons/hi";
import { IoIosContact } from "react-icons/io";
import { IoSettingsOutline } from "react-icons/io5";
import { LuHeart, LuLayoutGrid, LuMail, LuScanQrCode } from "react-icons/lu";
import { RiTargetFill } from "react-icons/ri";

export const sidebarLink = [
    {
        icon: LuLayoutGrid,
        name: "Overview",
        link: "/dashboard",
        search: ""
    },
    {
        icon: FaPoundSign,
        name: "Spending",
        link: "/dashboard/spending",
        search: ""
    },
    {
        icon: HiTrendingUp,
        name: "Trends & Predictions",
        link: "/dashboard/trends",
        search: ""
    },
    {
        icon: RiTargetFill,
        name: "Audience Segments",
        link: "/dashboard/audience",
        search: ""
    },
    {
        icon: HiOutlineTicket,
        name: "Event Revenue",
        link: "/dashboard/revenue",
        search: ""
    },
    {
        icon: LuScanQrCode,
        name: "Ticket Scans",
        link: "/dashboard/ticket",
        search: ""
    },
    {
        icon: LuHeart,
        name: "Impact & Donations",
        link: "/dashboard/impact",
        search: ""
    },
    // {
    //     icon: BsPeople,
    //     name: "Client Management",
    //     link: "/dashboard/client",
    //     search: ""
    // },
    {
        icon: BiSolidMessageEdit,
        name: "Reviews",
        link: "/dashboard/reviews",
        search: ""
    },
    {
        icon: IoSettingsOutline,
        name: "Settings",
        link: "/dashboard/settings",
        search: "?tab=profile"
    },
]

export const settingLink = [
    {
        icon: IoIosContact,
        name: "Account & Profile",
        link: "/dashboard/settings?tab=profile"
    },
    // {
    //     icon: Lock1,
    //     name: "Login & Security",
    //     link: "/dashboard/settings?tab=security"
    // },
    // {
    //     icon: Card,
    //     name: "Subscriptions & Payment",
    //     link: "/dashboard/settings?tab=subscriptions"
    // },
    {
        icon: Card,
        name: "SMS & Email Credits",
        link: "/dashboard/settings?tab=credit"
    },
    {
        icon: People,
        name: "User Roles & Permissions",
        link: "/dashboard/settings?tab=permissions"
    },
    {
        icon: BiSupport,
        name: "Support & Legal",
        link: "/dashboard/settings?tab=legal"
    },
    {
        icon: LuMail,
        name: "Messaging & Notifications",
        link: "/dashboard/settings?tab=notifications"
    }
]

export const locationData = [
    {
        city: "London",
        percentage: 40,
    },
    {
        city: "New York",
        percentage: 30,
    },
    {
        city: "Paris",
        percentage: 15,
    },
    {
        city: "Lagos",
        percentage: 10,
    },
    {
        city: "Others",
        percentage: 5,
    },
];