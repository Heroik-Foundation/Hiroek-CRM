import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    IoChevronBack,
    IoCheckmarkCircle,
} from "react-icons/io5";
import {
    LuDownload,
    LuFileText,
    LuMaximize2,
} from "react-icons/lu";
import useAudienceSegment from "../../hooks/useAudienceSegment";
import { toast } from "@heroui/react";

export default function ExportData() {
    const navigate = useNavigate();

    // Filters state
    const [includeEmails, setIncludeEmails] = useState(true);
    const [includePhones, setIncludePhones] = useState(false);
    const [filterDateEvent, setFilterDateEvent] = useState("Last 30 days or Events");
    const [isExporting, setIsExporting] = useState(false);
    const [exportProgress, setExportProgress] = useState(45);
    const [isPreviewExpanded, setIsPreviewExpanded] = useState(false);
    const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);

    // Load actual audience data
    const { useGetAudienceSegmentCustomer } = useAudienceSegment();
    const { data: audienceData } = useGetAudienceSegmentCustomer({
        segment: "all",
        limit: 100,
    });

    const customersList = useMemo(() => {
        if (!audienceData) return [];
        if (Array.isArray(audienceData)) return audienceData;
        const dObj = audienceData as Record<string, unknown>;
        if (Array.isArray(dObj.data)) return dObj.data;
        if (Array.isArray(dObj.results)) return dObj.results;
        if (Array.isArray(dObj.customers)) return dObj.customers;
        return [];
    }, [audienceData]);

    const previewRows = useMemo(() => {
        if (customersList.length > 0) {
            return customersList.slice(0, 4).map((c: Record<string, unknown>, idx: number) => ({
                id: idx,
                name: String(c.fullname || c.name || "Sarah Jenkins"),
                email: String(c.email || "sarah.j@example.com"),
                phone: String(c.phone || c.phoneNumber || "+44 (555) 123-4567"),
            }));
        }
        return [
            { id: 1, name: "Sarah Jenkins", email: "sarah.j@example.com", phone: "+44 (555) 123-4567" },
            { id: 2, name: "Marcus Chen", email: "m.chen@acme.corp", phone: "+44 (555) 987-6543" },
            { id: 3, name: "Elena Rodriguez", email: "erodriguez@startup.io", phone: "+44 (555) 456-7890" },
            { id: 4, name: "David Kim", email: "dkim@techventures.net", phone: "+44 (555) 234-5678" },
        ];
    }, [customersList]);

    const downloadHistory = [
        { date: "Oct 24, 2023 - 14:30", fileName: "users_export_last30.csv", admin: "Admin User" },
        { date: "Oct 20, 2023 - 09:15", fileName: "q3_marketing_leads.xlsx", admin: "System Auto" },
        { date: "Oct 15, 2023 - 16:45", fileName: "b2b_contacts_all.csv", admin: "Admin User" },
    ];

    const handleTriggerExport = () => {
        setIsExporting(true);
        setExportProgress(10);

        const interval = setInterval(() => {
            setExportProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setIsExporting(false);

                    // Generate downloadable CSV
                    const headers = ["Name", "Email", "Phone"];
                    const rows = previewRows.map((r) => [r.name, r.email, r.phone]);
                    const csvContent =
                        "data:text/csv;charset=utf-8," +
                        [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement("a");
                    link.setAttribute("href", encodedUri);
                    link.setAttribute("download", `users_export_${Date.now()}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);

                    toast.success("Dataset exported successfully!");
                    return 100;
                }
                return prev + 30;
            });
        }, 300);
    };

    return (
        <div className="w-full flex flex-col gap-6 pb-12">
            {/* Page Header */}
            <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3.5">
                    <button
                        type="button"
                        onClick={() => navigate("/dashboard/audience")}
                        className="w-9 h-9 rounded-xl bg-[#2E0F74] text-white flex items-center justify-center shrink-0 cursor-pointer hover:bg-[#37137F] transition-colors shadow-xs"
                    >
                        <IoChevronBack size={18} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-[#2E0F74] tracking-tight">
                            Export Data
                        </h1>
                        <p className="text-xs text-gray-500 font-medium mt-0.5">
                            Configure and download your mapped datasets.
                        </p>
                    </div>
                </div>

                {/* Export Ready Badge */}
                <div className="bg-[#EFEBFA] text-[#37137F] font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-2xs">
                    <IoCheckmarkCircle size={16} className="text-[#37137F]" />
                    <span>Export Ready - Your data is ready for download.</span>
                </div>
            </div>

            {/* Top Grid: Filters & Export Progress Card */}
            <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                {/* Left Card: Filters */}
                <div className="lg:col-span-5 bg-white rounded-2xl md:rounded-3xl p-6 border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col justify-between gap-5">
                    <div>
                        <h2 className="text-base font-bold text-gray-900 tracking-tight">
                            Filters
                        </h2>

                        <div className="mt-4 flex flex-col gap-2.5">
                            <span className="text-xs font-semibold text-gray-500">
                                Include Fields
                            </span>
                            <div className="flex flex-col gap-2">
                                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={includeEmails}
                                        onChange={(e) => setIncludeEmails(e.target.checked)}
                                        className="w-4 h-4 rounded text-[#2E0F74] accent-[#2E0F74] border-gray-300 cursor-pointer"
                                    />
                                    <span className="text-xs font-semibold text-gray-800">
                                        Emails
                                    </span>
                                </label>
                                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={includePhones}
                                        onChange={(e) => setIncludePhones(e.target.checked)}
                                        className="w-4 h-4 rounded text-[#2E0F74] accent-[#2E0F74] border-gray-300 cursor-pointer"
                                    />
                                    <span className="text-xs font-semibold text-gray-800">
                                        Phone Numbers
                                    </span>
                                </label>
                            </div>
                        </div>

                        <div className="mt-5 flex flex-col gap-2">
                            <label className="text-xs font-semibold text-gray-500">
                                Enter Date or Event
                            </label>
                            <input
                                type="text"
                                value={filterDateEvent}
                                onChange={(e) => setFilterDateEvent(e.target.value)}
                                placeholder="Last 30 days or Events"
                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#2E0F74] focus:ring-1 focus:ring-[#2E0F74] transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Right Card: Exporting users & progress */}
                <div className="lg:col-span-7 bg-white rounded-2xl md:rounded-3xl p-6 border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col justify-between gap-5">
                    <div>
                        <h2 className="text-base font-bold text-gray-900 tracking-tight">
                            Exporting 14,205 matching users
                        </h2>

                        <div className="mt-4 flex flex-col gap-2">
                            <div className="flex justify-between items-center text-xs font-bold text-gray-800">
                                <span>Progress</span>
                                <span>{exportProgress}%</span>
                            </div>
                            <div className="w-full h-2.5 rounded-full bg-gray-100 overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-[#2E0F74] transition-all duration-300 ease-out"
                                    style={{ width: `${exportProgress}%` }}
                                />
                            </div>
                            <p className="text-xs text-gray-400 font-medium mt-1">
                                Your list will take about 2 minutes to generate.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleTriggerExport}
                        disabled={isExporting}
                        className="w-full py-3 bg-[#2E0F74] hover:bg-[#37137F] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors disabled:opacity-50"
                    >
                        <LuDownload size={15} />
                        <span>{isExporting ? "Preparing Export..." : "Export Data"}</span>
                    </button>
                </div>
            </div>

            {/* Middle Card: Data Preview */}
            <div className="w-full bg-white rounded-2xl md:rounded-3xl p-6 border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col gap-4">
                <div className="w-full flex justify-between items-center">
                    <h2 className="text-base font-bold text-gray-900 tracking-tight">
                        Data Preview
                    </h2>
                    <button
                        type="button"
                        onClick={() => setIsPreviewExpanded(!isPreviewExpanded)}
                        className="text-xs font-bold text-[#2E0F74] hover:text-[#37137F] flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                        <LuMaximize2 size={13} />
                        <span>{isPreviewExpanded ? "Collapse" : "Expand"}</span>
                    </button>
                </div>

                <div className="w-full overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 text-xs font-bold text-gray-900">
                                <th className="py-3 px-4">Name</th>
                                <th className="py-3 px-4">Email</th>
                                <th className="py-3 px-4">Phone</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-xs text-gray-800 font-medium">
                            {previewRows.map((row) => (
                                <tr key={row.id} className="hover:bg-gray-50/60 transition-colors">
                                    <td className="py-3.5 px-4 font-semibold text-gray-900">
                                        {row.name}
                                    </td>
                                    <td className="py-3.5 px-4">{row.email}</td>
                                    <td className="py-3.5 px-4">{row.phone}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Bottom Card: Download History */}
            <div className="w-full bg-white rounded-2xl md:rounded-3xl p-6 border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col gap-4">
                <div className="w-full flex justify-between items-center">
                    <h2 className="text-base font-bold text-gray-900 tracking-tight">
                        Download History
                    </h2>
                    <button
                        type="button"
                        onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
                        className="text-xs font-bold text-[#2E0F74] hover:text-[#37137F] flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                        <LuMaximize2 size={13} />
                        <span>{isHistoryExpanded ? "Collapse" : "Expand"}</span>
                    </button>
                </div>

                <div className="w-full overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 text-xs font-bold text-gray-900">
                                <th className="py-3 px-4">Date</th>
                                <th className="py-3 px-4">File Name</th>
                                <th className="py-3 px-4">Admin</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-xs text-gray-800 font-medium">
                            {downloadHistory.map((item, idx) => (
                                <tr key={idx} className="hover:bg-gray-50/60 transition-colors">
                                    <td className="py-3.5 px-4 text-gray-600">{item.date}</td>
                                    <td className="py-3.5 px-4 font-semibold text-gray-900 flex items-center gap-2">
                                        <LuFileText size={15} className="text-gray-400" />
                                        <span>{item.fileName}</span>
                                    </td>
                                    <td className="py-3.5 px-4 text-gray-600">{item.admin}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
