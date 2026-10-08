import { useState } from "react";
import { Header } from "../../components/common";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";
import {
    LuLayoutGrid,
    LuCalendarDays,
    LuReceipt,
    LuWallet,
    LuDownload,
    LuMail,
} from "react-icons/lu";
import { IoIosContact } from "react-icons/io";
import {
    IoChevronDown,
    IoCalendarOutline,
    IoCashOutline,
    IoTimeOutline,
    IoPeopleOutline,
    IoCallOutline,
    IoMailOutline,
    IoEyeOutline,
} from "react-icons/io5";
import { FaArrowTrendUp } from "react-icons/fa6";
import { BiBuildingHouse } from "react-icons/bi";
import { HiOutlineSparkles } from "react-icons/hi2";
import { RiGalleryLine } from "react-icons/ri";
import { MdOutlineHistoryEdu } from "react-icons/md";
import { FiArrowRight, FiCheck, FiPlus } from "react-icons/fi";

// Client Events Dummy Data (Events Tab)
const CLIENT_EVENTS = [
    {
        id: 1,
        name: "Skyline Gala 2024",
        icon: BiBuildingHouse,
        iconBg: "bg-[#EFF6FF] text-[#2563EB]",
        date: "Oct 12, 2024",
        attendees: 342,
        revenue: "£125,000",
        status: "CONFIRMED",
        statusStyle: "bg-[#E0F2FE] text-[#0284C7]",
    },
    {
        id: 2,
        name: "Brutalist Expo",
        icon: RiGalleryLine,
        iconBg: "bg-[#ECFEFF] text-[#0891B2]",
        date: "Nov 05, 2024",
        attendees: 612,
        revenue: "£84,500",
        status: "PLANNING",
        statusStyle: "bg-[#FFE4E6] text-[#E11D48]",
    },
    {
        id: 3,
        name: "Curated Loft Open House",
        icon: HiOutlineSparkles,
        iconBg: "bg-[#EEF2FF] text-[#4F46E5]",
        date: "Dec 18, 2024",
        attendees: 184,
        revenue: "£212,000",
        status: "CONFIRMED",
        statusStyle: "bg-[#E0F2FE] text-[#0284C7]",
    },
    {
        id: 4,
        name: "Retrospective 2023",
        icon: MdOutlineHistoryEdu,
        iconBg: "bg-[#F1F5F9] text-[#475569]",
        date: "Jan 20, 2024",
        attendees: 1284,
        revenue: "£60,500",
        status: "COMPLETED",
        statusStyle: "bg-[#F1F5F9] text-[#64748B]",
    },
];

// Client Contacts Dummy Data (Client Contact Tab)
const CLIENT_CONTACT_CARDS = [
    {
        id: 1,
        company: "APEX SOLUTIONS",
        name: "Alexander Vance",
        role: "CRO, Apex Solutions",
        email: "a.vance@apexsolutions.com",
        phone: "+1 (555) 012-3456",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
        sector: "Technology & SaaS",
        budget: "$20k - $50k",
        eventReach: "1k - 25k",
        status: "Active",
        buttonText: "Message Alexander",
        buttonStyle: "bg-[#F1F3F5] text-[#261353] hover:bg-gray-200",
    },
    {
        id: 2,
        company: "WESTPOINT CORP",
        name: "Sarah Jenkins",
        role: "Marketing Manager",
        email: "sarah@westpoint.com",
        phone: "+1 (555) 012-3456",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
        sector: "Technology & SaaS",
        budget: "$10k - $20k",
        eventReach: "1k - 10k",
        status: "Active",
        buttonText: "Message Sarah",
        buttonStyle: "bg-[#261353] text-white hover:bg-[#1b0d3d]",
    },
];

// Interaction sequences for selected client
const INITIAL_INTERACTIONS = [
    {
        id: 1,
        sequence: "Quarterly Review Call",
        sequenceColor: "bg-[#EEF2FF] text-[#4F46E5]",
        date: "Oct 24, 2024 - 2:15 PM",
        completed: false,
    },
    {
        id: 2,
        sequence: "Campaign Sign-off",
        sequenceColor: "bg-[#FFF1F2] text-[#E11D48]",
        date: "Oct 24, 2024 - 11:30 AM",
        completed: false,
    },
    {
        id: 3,
        sequence: "Initial Outreach",
        sequenceColor: "bg-[#F8FAFC] text-[#475569]",
        date: "Oct 23, 2024 - 4:45 PM",
        completed: false,
    },
];

// Invoices Dummy Data (Invoice Tab)
const INVOICES_DATA = [
    {
        id: 1,
        clientName: "Lumin Media",
        invoiceId: "INV-2024-001",
        dateIssued: "Oct 12, 2025",
        dueDate: "Nov 12, 2025",
        amount: "£12,450.00",
        status: "PAID",
        statusColor: "text-[#10B981]",
    },
    {
        id: 2,
        clientName: "Elysium Events",
        invoiceId: "INV-2024-234",
        dateIssued: "Oct 10, 2025",
        dueDate: "Nov 10, 2025",
        amount: "£12,450.00",
        status: "PAID",
        statusColor: "text-[#10B981]",
    },
    {
        id: 3,
        clientName: "MetaSpace",
        invoiceId: "INV-2024-001",
        dateIssued: "Oct 12, 2025",
        dueDate: "Nov 12, 2025",
        amount: "£12,450.00",
        status: "OUTSTANDING",
        statusColor: "text-[#EF4444]",
    },
    {
        id: 4,
        clientName: "Lumin Media",
        invoiceId: "INV-2024-001",
        dateIssued: "Oct 12, 2025",
        dueDate: "Nov 12, 2025",
        amount: "£12,450.00",
        status: "PAID",
        statusColor: "text-[#10B981]",
    },
];

// Active Revenue Clients Dummy Data (My Revenue Tab)
const ACTIVE_REVENUE_CLIENTS = [
    {
        id: 1,
        name: "Alexander Vance",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
        totalRevenue: "£125,000",
    },
    {
        id: 2,
        name: "Sarah Jenkins",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
        totalRevenue: "£84,500",
    },
    {
        id: 3,
        name: "Janet Kraddle",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
        totalRevenue: "£212,000",
    },
    {
        id: 4,
        name: "Michael Chen",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
        totalRevenue: "£60,500",
    },
];

export default function Management() {
    const [activeTab, setActiveTab] = useState<
        "overview" | "events" | "contact" | "invoice" | "revenue"
    >("overview");

    const [selectedClient, setSelectedClient] = useState("Client Name");
    const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [contactPage, setContactPage] = useState(1);
    const [invoicePage, setInvoicePage] = useState(1);
    const [revenuePage, setRevenuePage] = useState(1);

    const [selectedContact, setSelectedContact] = useState("Alexander Vance");
    const [interactions, setInteractions] = useState(INITIAL_INTERACTIONS);

    const [selectedQuarter, setSelectedQuarter] = useState("Q1 - £5,000");
    const [isQuarterDropdownOpen, setIsQuarterDropdownOpen] = useState(false);

    const toggleInteraction = (id: number) => {
        setInteractions((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, completed: !item.completed } : item
            )
        );
    };

    const SUB_TABS = [
        { id: "overview" as const, label: "Overview", icon: LuLayoutGrid },
        { id: "events" as const, label: "Events", icon: LuCalendarDays },
        { id: "contact" as const, label: "Client Contact", icon: IoIosContact },
        { id: "invoice" as const, label: "Invoice", icon: LuReceipt },
        { id: "revenue" as const, label: "My Revenue", icon: LuWallet },
    ];

    const attendancePerformance = [
        { category: "Corporate", percentage: 74 },
        { category: "Weddings", percentage: 52 },
        { category: "Conferences", percentage: 51 },
        { category: "Private Gala", percentage: 38 },
    ];

    const getHeaderTitle = () => {
        switch (activeTab) {
            case "events":
                return "Events";
            case "contact":
                return "Client Management";
            case "invoice":
                return "Invoice";
            case "revenue":
                return "My Revenue";
            default:
                return "Overview";
        }
    };

    const getHeaderSubtitle = () => {
        switch (activeTab) {
            case "events":
                return "Monitor Client's Event";
            case "contact":
                return "Manage Your Clients....";
            case "invoice":
                return "Manage Your Invoice";
            case "revenue":
                return "View And Monitor Revenue";
            default:
                return "Client Management Overview";
        }
    };

    return (
        <section className="w-full flex flex-col gap-6">
            {/* Header with Title & Action Button */}
            <div className="w-full flex justify-between items-center">
                <Header title={getHeaderTitle()} body={getHeaderSubtitle()} />

                {/* Header Action Controls */}
                {activeTab === "events" && (
                    <button className="bg-[#261353] hover:bg-[#1c0d40] transition-colors text-white font-semibold text-sm px-5 py-3 rounded-xl shadow-sm">
                        Create Client Event
                    </button>
                )}

                {activeTab === "contact" && (
                    <button className="text-sm font-semibold text-gray-800 hover:text-black flex items-center gap-1.5 transition-colors">
                        <span>+ Add Client</span>
                    </button>
                )}

                {activeTab === "invoice" && (
                    <div className="flex items-center gap-3">
                        <button className="bg-[#F1F3F5] text-gray-700 hover:bg-gray-200 px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors">
                            <LuDownload size={14} />
                            <span>Export PDF</span>
                        </button>
                        <button className="bg-[#261353] hover:bg-[#1c0d40] text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-colors shadow-sm">
                            <span>+ New Invoice</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Top Row: Left Sub-Navigation Tabs + Right Content */}
            <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Sub-Navigation Menu */}
                <div className="lg:col-span-3 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col gap-1.5">
                    {SUB_TABS.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${isActive
                                        ? "bg-[#EFEBFA] text-[#261353]"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    }`}
                            >
                                <Icon size={16} />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Right Top Content Area */}
                <div className="lg:col-span-9">
                    {/* 1. OVERVIEW TAB: 2x2 Metric Cards Grid */}
                    {activeTab === "overview" && (
                        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Card 1: Total Events */}
                            <div className="bg-[#261353] text-white rounded-2xl p-5 shadow-sm flex flex-col justify-between min-h-35">
                                <div className="w-full flex justify-between items-center">
                                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                                        <IoCalendarOutline size={18} />
                                    </div>
                                    <span className="bg-[#10B98126] text-[#10B981] font-bold text-sm px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                        <FaArrowTrendUp size={10} /> 12%
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm text-white/70 font-medium">
                                        Total Events
                                    </p>
                                    <p className="text-2xl font-bold tracking-tight mt-0.5">
                                        1,284
                                    </p>
                                </div>
                            </div>

                            {/* Card 2: Total Revenue */}
                            <div className="bg-linear-to-r from-[#F0276C] to-[#D81B60] text-white rounded-2xl p-5 shadow-sm flex flex-col justify-between min-h-35">
                                <div className="w-full flex justify-between items-center">
                                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                                        <IoCashOutline size={18} />
                                    </div>
                                    <span className="bg-[#10B98126] text-[#10B981] font-bold text-sm px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                        <FaArrowTrendUp size={10} /> 8.4%
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm text-white/80 font-medium">
                                        Total Revenue
                                    </p>
                                    <p className="text-2xl font-bold tracking-tight mt-0.5">
                                        $428.5k
                                    </p>
                                </div>
                            </div>

                            {/* Card 3: Upcoming Events */}
                            <div className="bg-linear-to-r from-[#F0276C] to-[#D81B60] text-white rounded-2xl p-5 shadow-sm flex flex-col justify-between min-h-35">
                                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                                    <IoPeopleOutline size={18} />
                                </div>
                                <div>
                                    <p className="text-sm text-white/80 font-medium">
                                        Upcoming Events
                                    </p>
                                    <p className="text-2xl font-bold tracking-tight mt-0.5">
                                        42
                                    </p>
                                </div>
                            </div>

                            {/* Card 4: Past Events */}
                            <div className="bg-[#261353] text-white rounded-2xl p-5 shadow-sm flex flex-col justify-between min-h-35">
                                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                                    <IoTimeOutline size={18} />
                                </div>
                                <div>
                                    <p className="text-sm text-white/70 font-medium">
                                        Past Events
                                    </p>
                                    <p className="text-2xl font-bold tracking-tight mt-0.5">
                                        1,242
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 2. EVENTS TAB: Wide Summary Banner */}
                    {activeTab === "events" && (
                        <div className="w-full bg-linear-to-r from-[#261353] via-[#7B1B62] to-[#E11D48] rounded-2xl p-7 text-white shadow-md flex flex-col justify-between min-h-40 relative overflow-hidden">
                            <div className="w-full flex justify-end">
                                <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-white">
                                    <IoPeopleOutline size={18} />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-6 mt-4">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/70">
                                        TOTAL ATTENDEES
                                    </span>
                                    <span className="text-3xl font-extrabold tracking-tight mt-1">
                                        1,248
                                    </span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/70">
                                        TOTAL EVENTS
                                    </span>
                                    <span className="text-3xl font-extrabold tracking-tight mt-1">
                                        48
                                    </span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/70">
                                        TOTAL REVENUE
                                    </span>
                                    <span className="text-3xl font-extrabold tracking-tight mt-1">
                                        £5,000
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 3. CLIENT CONTACT TAB: 2 Client Cards + Pagination */}
                    {activeTab === "contact" && (
                        <div className="w-full flex flex-col gap-4">
                            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                                {CLIENT_CONTACT_CARDS.map((card) => {
                                    const isSelected = selectedContact === card.name;
                                    return (
                                        <div
                                            key={card.id}
                                            onClick={() => setSelectedContact(card.name)}
                                            className={`bg-white rounded-2xl p-5 border transition-all cursor-pointer shadow-sm flex flex-col justify-between gap-4 ${isSelected
                                                    ? "border-[#261353] ring-1 ring-[#261353]"
                                                    : "border-gray-100 hover:border-gray-200 hover:shadow-md"
                                                }`}
                                        >
                                            {/* Company & Active Badge */}
                                            <div className="w-full flex justify-between items-center">
                                                <span className="font-bold text-sm text-gray-900 tracking-wider uppercase">
                                                    {card.company}
                                                </span>
                                                <span className="text-[10px] font-bold text-[#10B981] bg-[#ECFDF5] px-2.5 py-0.5 rounded-full">
                                                    {card.status}
                                                </span>
                                            </div>

                                            {/* Profile Row */}
                                            <div className="flex items-start gap-3.5">
                                                <img
                                                    src={card.avatar}
                                                    alt={card.name}
                                                    className="w-12 h-12 rounded-xl object-cover border border-gray-100 shrink-0"
                                                />
                                                <div className="flex flex-col">
                                                    <h4 className="font-bold text-sm text-gray-950">
                                                        {card.name}
                                                    </h4>
                                                    <p className="text-sm text-gray-400 font-medium">
                                                        {card.role}
                                                    </p>
                                                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mt-1">
                                                        <IoMailOutline size={13} className="text-gray-400" />
                                                        <span>{card.email}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mt-0.5">
                                                        <IoCallOutline size={13} className="text-gray-400" />
                                                        <span>{card.phone}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Sector, Budget, Event Reach */}
                                            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-50 text-[11px]">
                                                <div className="flex flex-col">
                                                    <span className="text-gray-400 text-[10px] uppercase font-semibold">Sector</span>
                                                    <span className="font-semibold text-gray-800 truncate">{card.sector}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-gray-400 text-[10px] uppercase font-semibold">Budget</span>
                                                    <span className="font-semibold text-gray-800">{card.budget}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-gray-400 text-[10px] uppercase font-semibold">Event Reach</span>
                                                    <span className="font-semibold text-gray-800">{card.eventReach}</span>
                                                </div>
                                            </div>

                                            {/* Message Button */}
                                            <button
                                                className={`w-full py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors ${card.buttonStyle}`}
                                            >
                                                <LuMail size={15} />
                                                <span>{card.buttonText}</span>
                                            </button>

                                            {/* Footer Links */}
                                            <div className="w-full flex justify-between items-center text-[11px] pt-1 font-medium">
                                                <span className="text-gray-500 hover:text-gray-900 cursor-pointer">
                                                    Interaction Planner
                                                </span>
                                                <span className="text-rose-500 hover:text-rose-700 cursor-pointer">
                                                    Remove
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Pagination Controls */}
                            <div className="w-full flex justify-end items-center gap-1.5">
                                <button
                                    onClick={() => setContactPage(Math.max(1, contactPage - 1))}
                                    className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50"
                                >
                                    &lt;
                                </button>
                                <button
                                    onClick={() => setContactPage(1)}
                                    className={`w-7 h-7 rounded-lg text-sm font-semibold flex items-center justify-center ${contactPage === 1
                                            ? "bg-[#261353] text-white"
                                            : "border border-gray-200 text-gray-700 hover:bg-gray-50"
                                        }`}
                                >
                                    1
                                </button>
                                <button
                                    onClick={() => setContactPage(2)}
                                    className={`w-7 h-7 rounded-lg text-sm font-semibold flex items-center justify-center ${contactPage === 2
                                            ? "bg-[#261353] text-white"
                                            : "border border-gray-200 text-gray-700 hover:bg-gray-50"
                                        }`}
                                >
                                    2
                                </button>
                                <button
                                    onClick={() => setContactPage(Math.min(2, contactPage + 1))}
                                    className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50"
                                >
                                    &gt;
                                </button>
                            </div>
                        </div>
                    )}

                    {/* 4. INVOICE TAB: Total Invoice Card + Urgent Actions Overdue Card */}
                    {activeTab === "invoice" && (
                        <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
                            {/* Card 1: Total Invoice */}
                            <div className="md:col-span-8 bg-linear-to-r from-[#261353] to-[#D81B60] rounded-2xl p-7 text-white shadow-md flex flex-col justify-center min-h-35">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-white/70">
                                    TOTAL INVOICE
                                </span>
                                <span className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-1 text-white">
                                    $248,590.00
                                </span>
                            </div>

                            {/* Card 2: Urgent Actions */}
                            <div className="md:col-span-4 bg-[#1E0F45] rounded-2xl p-5 text-white shadow-md flex flex-col justify-between min-h-35">
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/70">
                                        URGENT ACTIONS
                                    </span>
                                    <h4 className="font-bold text-base text-white mt-1">
                                        4 Overdue Invoices
                                    </h4>
                                    <p className="text-[11px] text-white/60 mt-1 leading-snug">
                                        Action required for "Elysium Tech" and "MetaSpace".
                                    </p>
                                </div>
                                <button className="text-sm font-semibold text-white/90 hover:text-white flex items-center justify-between pt-3 transition-colors">
                                    <span>Review overdue accounts</span>
                                    <FiArrowRight size={14} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* 5. MY REVENUE TAB: Projection & Revenue Banner */}
                    {activeTab === "revenue" && (
                        <div className="w-full flex flex-col gap-2">
                            {/* Dark Purple Projection Banner */}
                            <div className="w-full bg-[#261353] rounded-2xl p-7 text-white shadow-md flex flex-col lg:flex-row justify-between gap-6 min-h-47.5">
                                {/* Left Section: Quarter Projections & Selector */}
                                <div className="flex-1 flex flex-col justify-between gap-4 lg:border-r lg:border-white/15 lg:pr-8">
                                    {/* Top: Projected Revenue Per Quarter */}
                                    <div className="flex flex-col gap-2">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-white/70">
                                            PROJECTED REVENUE PER QUARTER
                                        </span>
                                        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm font-bold text-white">
                                            <span>Q1 – £5,000</span>
                                            <span>Q2 – £5,000</span>
                                            <span>Q3 – £5,000</span>
                                            <span>Q4 – £5,000</span>
                                        </div>
                                    </div>

                                    {/* Bottom: Revenue Per Quarter Dropdown */}
                                    <div className="flex flex-col gap-1 relative">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-white/70">
                                            REVENUE PER QUARTER
                                        </span>
                                        <div
                                            onClick={() =>
                                                setIsQuarterDropdownOpen(
                                                    !isQuarterDropdownOpen
                                                )
                                            }
                                            className="flex items-center gap-2 cursor-pointer text-white hover:text-white/90 transition-colors w-fit"
                                        >
                                            <span className="text-2xl font-extrabold tracking-tight">
                                                {selectedQuarter}
                                            </span>
                                            <IoChevronDown
                                                size={18}
                                                className={`text-white transition-transform ${isQuarterDropdownOpen
                                                        ? "rotate-180"
                                                        : ""
                                                    }`}
                                            />
                                        </div>

                                        {isQuarterDropdownOpen && (
                                            <div className="absolute top-full mt-1.5 left-0 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-30 py-1 text-gray-800">
                                                {[
                                                    "Q1 – £5,000",
                                                    "Q2 – £5,000",
                                                    "Q3 – £5,000",
                                                    "Q4 – £5,000",
                                                ].map((q) => (
                                                    <div
                                                        key={q}
                                                        onClick={() => {
                                                            setSelectedQuarter(q);
                                                            setIsQuarterDropdownOpen(
                                                                false
                                                            );
                                                        }}
                                                        className="px-4 py-2 text-sm font-semibold hover:bg-gray-50 cursor-pointer"
                                                    >
                                                        {q}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Right Section: Total Projections & Total Revenue */}
                                <div className="lg:w-72 flex flex-col justify-between gap-4 lg:pl-4">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-white/70">
                                            TOTAL ANNUAL PROJECTION
                                        </span>
                                        <span className="text-3xl font-extrabold text-white tracking-tight mt-1">
                                            £20,000
                                        </span>
                                    </div>

                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-white/70">
                                            TOTAL REVENUE
                                        </span>
                                        <span className="text-3xl font-extrabold text-white tracking-tight mt-1">
                                            £200,000
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Enter Projection Link */}
                            <button className="text-[#261353] font-bold text-sm flex items-center gap-1.5 self-start mt-1 hover:underline cursor-pointer">
                                <FiPlus size={14} />
                                <span>Enter Projection</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Section: Varies by active tab */}

            {/* 1. OVERVIEW VIEW: Charts Row */}
            {activeTab === "overview" && (
                <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Revenue Over Time Chart */}
                    <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between min-h-90">
                        <div>
                            <h3 className="font-bold text-sm text-gray-900">
                                Revenue Over Time
                            </h3>
                            <p className="text-sm text-gray-400 mt-0.5">
                                Monthly fiscal growth analysis
                            </p>
                        </div>

                        <div className="w-full h-64 mt-4">
                            <ReactECharts
                                option={{
                                    tooltip: {
                                        trigger: "axis",
                                        backgroundColor: "#1F2937",
                                        borderColor: "#374151",
                                        borderWidth: 1,
                                        padding: [8, 12],
                                        textStyle: { color: "#F9FAFB", fontSize: 12 },
                                        formatter: (params: unknown) => {
                                            if (!Array.isArray(params) || params.length === 0) return "";
                                            const p = params[0] as { name: string; value: number };
                                            return `<div style="font-weight:600;color:#fff;">${p.name}</div><div>Revenue: <strong>£${Number(p.value).toLocaleString()}</strong></div>`;
                                        },
                                    },
                                    grid: {
                                        left: "3%",
                                        right: "3%",
                                        top: "10%",
                                        bottom: "10%",
                                        containLabel: true,
                                    },
                                    xAxis: {
                                        type: "category",
                                        boundaryGap: false,
                                        data: ["JAN", "MAR", "MAY", "JUL", "SEP", "NOV", "DEC"],
                                        axisLine: { show: false },
                                        axisTick: { show: false },
                                        axisLabel: { color: "#9CA3AF", fontSize: 11 },
                                    },
                                    yAxis: {
                                        type: "value",
                                        splitLine: { show: false },
                                        axisLine: { show: false },
                                        axisTick: { show: false },
                                        axisLabel: {
                                            color: "#9CA3AF",
                                            fontSize: 11,
                                            formatter: (val: number) => `£${val / 1000}k`,
                                        },
                                    },
                                    series: [
                                        {
                                            name: "Revenue",
                                            type: "line",
                                            smooth: true,
                                            showSymbol: false,
                                            lineStyle: { color: "#2563EB", width: 2.5 },
                                            areaStyle: {
                                                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                                    { offset: 0, color: "rgba(37, 99, 235, 0.25)" },
                                                    { offset: 1, color: "rgba(37, 99, 235, 0.01)" },
                                                ]),
                                            },
                                            data: [15000, 22000, 19000, 38000, 25000, 21000, 48000],
                                        },
                                    ],
                                }}
                                style={{ height: 240, width: "100%" }}
                                opts={{ renderer: "svg" }}
                                notMerge={true}
                            />
                        </div>
                    </div>

                    {/* Attendance Performance Progress Bars */}
                    <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between min-h-90">
                        <div className="flex flex-col">
                            <h3 className="font-bold text-sm text-gray-900">
                                Attendance Performance
                            </h3>
                            <p className="text-sm text-gray-400 mt-0.5">Per event</p>
                        </div>

                        <div className="flex flex-col gap-5 my-4">
                            {attendancePerformance.map((item) => (
                                <div key={item.category} className="flex flex-col gap-1.5">
                                    <div className="flex justify-between items-center text-sm font-semibold">
                                        <span className="text-gray-700">
                                            {item.category}
                                        </span>
                                        <span className="text-gray-500">
                                            {item.percentage}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-[#F1F3F5] rounded-full h-2 overflow-hidden">
                                        <div
                                            style={{ width: `${item.percentage}%` }}
                                            className="bg-[#261353] h-full rounded-full transition-all duration-500"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button className="text-sm font-semibold text-gray-700 hover:text-black self-end transition-colors">
                            View all event
                        </button>
                    </div>
                </div>
            )}

            {/* 2. EVENTS VIEW: Active Client Events Table */}
            {activeTab === "events" && (
                <div className="w-full bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col gap-4">
                    {/* Table Toolbar */}
                    <div className="w-full flex justify-between items-center">
                        <h3 className="font-bold text-base text-gray-900">
                            Active Client Events
                        </h3>
                        <div className="flex items-center gap-3">
                            {/* Client Dropdown */}
                            <div className="relative">
                                <div
                                    onClick={() =>
                                        setIsClientDropdownOpen(!isClientDropdownOpen)
                                    }
                                    className="bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-sm text-gray-700 font-semibold flex items-center gap-2 cursor-pointer hover:border-gray-300 transition-colors shadow-sm"
                                >
                                    <span>{selectedClient}</span>
                                    <IoChevronDown size={14} className="text-gray-400" />
                                </div>

                                {isClientDropdownOpen && (
                                    <div className="absolute right-0 top-full mt-1.5 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1">
                                        {[
                                            "All Clients",
                                            "Skyline Group",
                                            "Brutalist Media",
                                            "Loft Collective",
                                        ].map((client) => (
                                            <div
                                                key={client}
                                                onClick={() => {
                                                    setSelectedClient(client);
                                                    setIsClientDropdownOpen(false);
                                                }}
                                                className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                                            >
                                                {client}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Export Button */}
                            <button className="bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-sm text-gray-700 font-semibold flex items-center gap-1.5 hover:bg-gray-50 transition-colors shadow-sm">
                                <LuDownload size={14} className="text-gray-400" />
                                <span>Export</span>
                            </button>
                        </div>
                    </div>

                    {/* Events Table */}
                    <div className="w-full overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                    <th className="py-3 px-4">EVENT NAME</th>
                                    <th className="py-3 px-4">DATE</th>
                                    <th className="py-3 px-4">ATTENDEES</th>
                                    <th className="py-3 px-4">REVENUE</th>
                                    <th className="py-3 px-4">STATUS</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 text-sm">
                                {CLIENT_EVENTS.map((event) => {
                                    const EventIcon = event.icon;
                                    return (
                                        <tr
                                            key={event.id}
                                            className="hover:bg-gray-50/60 transition-colors"
                                        >
                                            {/* Event Name */}
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={`w-9 h-9 rounded-xl flex items-center justify-center ${event.iconBg}`}
                                                    >
                                                        <EventIcon size={18} />
                                                    </div>
                                                    <span className="font-semibold text-gray-900">
                                                        {event.name}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Date */}
                                            <td className="py-4 px-4 text-gray-500 font-medium">
                                                {event.date}
                                            </td>

                                            {/* Attendees Stack */}
                                            <td className="py-4 px-4">
                                                <div className="flex items-center">
                                                    <div className="flex -space-x-2 overflow-hidden">
                                                        <img
                                                            className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover"
                                                            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&auto=format&fit=crop&q=80"
                                                            alt=""
                                                        />
                                                        <img
                                                            className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover"
                                                            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&auto=format&fit=crop&q=80"
                                                            alt=""
                                                        />
                                                    </div>
                                                    <span className="ml-1.5 text-[10px] font-bold text-gray-600 bg-gray-100 rounded-full px-2 py-0.5">
                                                        +{event.attendees}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Revenue */}
                                            <td className="py-4 px-4 font-bold text-gray-900">
                                                {event.revenue}
                                            </td>

                                            {/* Status */}
                                            <td className="py-4 px-4">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider inline-block ${event.statusStyle}`}
                                                >
                                                    {event.status}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    <div className="w-full flex justify-between items-center pt-3 border-t border-gray-100 text-sm">
                        <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">
                            SHOWING 4 OF 24 EVENTS
                        </span>
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => setPage(Math.max(1, page - 1))}
                                className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50"
                            >
                                &lt;
                            </button>
                            <button
                                onClick={() => setPage(1)}
                                className={`w-7 h-7 rounded-lg text-sm font-semibold flex items-center justify-center ${page === 1
                                        ? "bg-[#261353] text-white"
                                        : "border border-gray-200 text-gray-700 hover:bg-gray-50"
                                    }`}
                            >
                                1
                            </button>
                            <button
                                onClick={() => setPage(2)}
                                className={`w-7 h-7 rounded-lg text-sm font-semibold flex items-center justify-center ${page === 2
                                        ? "bg-[#261353] text-white"
                                        : "border border-gray-200 text-gray-700 hover:bg-gray-50"
                                    }`}
                            >
                                2
                            </button>
                            <button
                                onClick={() => setPage(Math.min(2, page + 1))}
                                className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50"
                            >
                                &gt;
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 3. CLIENT CONTACT VIEW: Interaction Planner for selected client */}
            {activeTab === "contact" && (
                <div className="w-full bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col gap-4">
                    {/* Header */}
                    <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <h3 className="font-bold text-lg text-gray-900">
                            {selectedContact}
                        </h3>
                        <div className="flex items-center gap-3">
                            {/* Last 7 Days Dropdown */}
                            <div className="bg-[#261353] text-white rounded-xl px-3.5 py-1.5 text-sm font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer hover:bg-[#1c0d40] transition-colors">
                                <span>Last 7 Days</span>
                                <IoChevronDown size={14} />
                            </div>

                            {/* Enter Interaction Button */}
                            <button className="text-sm font-semibold text-gray-800 hover:text-black flex items-center gap-1 transition-colors">
                                <span>+ Enter Interaction</span>
                            </button>
                        </div>
                    </div>

                    {/* Interactions Table */}
                    <div className="w-full overflow-x-auto mt-2">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                    <th className="py-3 px-4">INTERACTION SEQUENCE</th>
                                    <th className="py-3 px-4">DATE</th>
                                    <th className="py-3 px-4 text-right">STATUS</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 text-sm">
                                {interactions.map((interaction) => (
                                    <tr
                                        key={interaction.id}
                                        className="hover:bg-gray-50/60 transition-colors"
                                    >
                                        {/* Sequence Pill */}
                                        <td className="py-4 px-4">
                                            <span
                                                className={`px-3.5 py-1.5 rounded-xl text-sm font-semibold inline-block ${interaction.sequenceColor}`}
                                            >
                                                {interaction.sequence}
                                            </span>
                                        </td>

                                        {/* Date */}
                                        <td className="py-4 px-4 text-gray-500 font-medium">
                                            {interaction.date}
                                        </td>

                                        {/* Checkbox Status */}
                                        <td className="py-4 px-4 text-right">
                                            <div
                                                onClick={() => toggleInteraction(interaction.id)}
                                                className={`w-5 h-5 rounded border ml-auto flex items-center justify-center cursor-pointer transition-colors ${interaction.completed
                                                        ? "bg-[#261353] border-[#261353] text-white"
                                                        : "border-gray-300 hover:border-gray-400 bg-white text-transparent"
                                                    }`}
                                            >
                                                <FiCheck size={12} />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* 4. INVOICES VIEW: Invoices Table */}
            {activeTab === "invoice" && (
                <div className="w-full bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col gap-4">
                    <div className="w-full overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                    <th className="py-3 px-4">CLIENT NAME</th>
                                    <th className="py-3 px-4">INVOICE ID</th>
                                    <th className="py-3 px-4">DATE ISSUED</th>
                                    <th className="py-3 px-4">DUE DATE</th>
                                    <th className="py-3 px-4">AMOUNT</th>
                                    <th className="py-3 px-4">STATUS</th>
                                    <th className="py-3 px-4 text-right"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 text-sm">
                                {INVOICES_DATA.map((inv) => (
                                    <tr
                                        key={inv.id}
                                        className="hover:bg-gray-50/60 transition-colors"
                                    >
                                        <td className="py-4 px-4 font-bold text-gray-900">
                                            {inv.clientName}
                                        </td>
                                        <td className="py-4 px-4 text-gray-500 font-medium">
                                            {inv.invoiceId}
                                        </td>
                                        <td className="py-4 px-4 text-gray-500 font-medium">
                                            {inv.dateIssued}
                                        </td>
                                        <td className="py-4 px-4 text-gray-500 font-medium">
                                            {inv.dueDate}
                                        </td>
                                        <td className="py-4 px-4 font-bold text-gray-900">
                                            {inv.amount}
                                        </td>
                                        <td className="py-4 px-4">
                                            <span
                                                className={`font-bold text-sm tracking-wider uppercase ${inv.statusColor}`}
                                            >
                                                {inv.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <button className="text-purple-600 hover:text-purple-800 transition-colors p-1">
                                                <IoEyeOutline size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    <div className="w-full flex justify-between items-center pt-3 border-t border-gray-100 text-sm">
                        <span className="text-[10px] font-bold text-gray-400 tracking-wider">
                            Showing 1 to 10 of 48 Invoices
                        </span>
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => setInvoicePage(Math.max(1, invoicePage - 1))}
                                className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50"
                            >
                                &lt;
                            </button>
                            <button
                                onClick={() => setInvoicePage(1)}
                                className={`w-7 h-7 rounded-lg text-sm font-semibold flex items-center justify-center ${invoicePage === 1
                                        ? "bg-[#261353] text-white"
                                        : "border border-gray-200 text-gray-700 hover:bg-gray-50"
                                    }`}
                            >
                                1
                            </button>
                            <button
                                onClick={() => setInvoicePage(2)}
                                className={`w-7 h-7 rounded-lg text-sm font-semibold flex items-center justify-center ${invoicePage === 2
                                        ? "bg-[#261353] text-white"
                                        : "border border-gray-200 text-gray-700 hover:bg-gray-50"
                                    }`}
                            >
                                2
                            </button>
                            <button
                                onClick={() => setInvoicePage(3)}
                                className={`w-7 h-7 rounded-lg text-sm font-semibold flex items-center justify-center ${invoicePage === 3
                                        ? "bg-[#261353] text-white"
                                        : "border border-gray-200 text-gray-700 hover:bg-gray-50"
                                    }`}
                            >
                                3
                            </button>
                            <button
                                onClick={() => setInvoicePage(Math.min(3, invoicePage + 1))}
                                className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50"
                            >
                                &gt;
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 5. MY REVENUE VIEW: Active Clients Table */}
            {activeTab === "revenue" && (
                <div className="w-full bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col gap-4">
                    {/* Toolbar */}
                    <div className="w-full flex justify-between items-center">
                        <h3 className="font-bold text-base text-gray-900">
                            Active Clients
                        </h3>
                        <div className="relative">
                            <div className="bg-white border border-gray-200 rounded-xl px-3.5 py-1.5 text-sm text-gray-700 font-semibold flex items-center gap-2 cursor-pointer shadow-sm hover:border-gray-300 transition-colors">
                                <span>Client Name</span>
                                <IoChevronDown size={14} className="text-gray-400" />
                            </div>
                        </div>
                    </div>

                    {/* Table with Dark Purple Header */}
                    <div className="w-full overflow-hidden rounded-xl border border-gray-100">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#261353] text-white text-[11px] font-bold tracking-wider uppercase">
                                    <th className="py-3.5 px-4 w-12"></th>
                                    <th className="py-3.5 px-4">CLIENT NAME</th>
                                    <th className="py-3.5 px-4 text-left">TOTAL REVENUE</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm bg-white">
                                {ACTIVE_REVENUE_CLIENTS.map((client) => (
                                    <tr
                                        key={client.id}
                                        className="hover:bg-gray-50/70 transition-colors"
                                    >
                                        {/* Eye Icon */}
                                        <td className="py-4 px-4 text-center">
                                            <button className="text-purple-600 hover:text-purple-800 transition-colors">
                                                <IoEyeOutline size={18} />
                                            </button>
                                        </td>

                                        {/* Client Name & Avatar */}
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={client.avatar}
                                                    alt={client.name}
                                                    className="w-8 h-8 rounded-full object-cover border border-gray-100"
                                                />
                                                <span className="font-bold text-sm text-gray-900">
                                                    {client.name}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Total Revenue */}
                                        <td className="py-4 px-4 font-bold text-sm text-gray-900">
                                            {client.totalRevenue}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    <div className="w-full flex justify-between items-center pt-3 border-t border-gray-100 text-sm">
                        <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">
                            SHOWING 4 OF 10 CLIENTS
                        </span>
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => setRevenuePage(Math.max(1, revenuePage - 1))}
                                className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50"
                            >
                                &lt;
                            </button>
                            <button
                                onClick={() => setRevenuePage(1)}
                                className={`w-7 h-7 rounded-lg text-sm font-semibold flex items-center justify-center ${revenuePage === 1
                                        ? "bg-[#261353] text-white"
                                        : "border border-gray-200 text-gray-700 hover:bg-gray-50"
                                    }`}
                            >
                                1
                            </button>
                            <button
                                onClick={() => setRevenuePage(2)}
                                className={`w-7 h-7 rounded-lg text-sm font-semibold flex items-center justify-center ${revenuePage === 2
                                        ? "bg-[#261353] text-white"
                                        : "border border-gray-200 text-gray-700 hover:bg-gray-50"
                                    }`}
                            >
                                2
                            </button>
                            <button
                                onClick={() => setRevenuePage(Math.min(2, revenuePage + 1))}
                                className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50"
                            >
                                &gt;
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}