import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
    IoChevronBack,
    IoClose,
    IoCheckmarkCircle,
    IoChevronForward,
    IoAlertCircle,
} from "react-icons/io5";
import {
    LuCloudUpload,
    LuDownload,
    LuRefreshCw,
    LuFileText,
} from "react-icons/lu";
import { toast } from "@heroui/react";

export default function ImportData() {
    const navigate = useNavigate();

    // Steps: "upload" (Image 3) | "importing" (Image 4) | "summary" (Image 2)
    const [step, setStep] = useState<"upload" | "importing" | "summary">("upload");

    // Upload state
    const [showUploadAlert, setShowUploadAlert] = useState(true);
    const [uploadedFileName, setUploadedFileName] = useState("contacts_02_final.csv");
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Importing animation state
    const [progressPct, setProgressPct] = useState(65);
    const [progressMb, setProgressMb] = useState(8.1);
    const [secondsRemaining, setSecondsRemaining] = useState(45);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (step === "importing") {
            interval = setInterval(() => {
                setProgressPct((prev) => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        setTimeout(() => setStep("summary"), 800);
                        return 100;
                    }
                    const next = prev + 5;
                    setProgressMb(Number((8.1 + (next - 65) * 0.12).toFixed(1)));
                    setSecondsRemaining((s) => Math.max(0, s - 6));
                    return next;
                });
            }, 600);
        }
        return () => clearInterval(interval);
    }, [step]);

    const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setUploadedFileName(file.name);
            toast.success(`Selected file: ${file.name}`);
        }
    };

    const handleStartImport = () => {
        setProgressPct(65);
        setProgressMb(8.1);
        setSecondsRemaining(45);
        setStep("importing");
    };

    // ─── STEP 2: IMPORTING FILE (Matches Image 4) ───────────────────────────
    if (step === "importing") {
        const circumference = 2 * Math.PI * 52;
        const strokeDashoffset = circumference - (progressPct / 100) * circumference;

        return (
            <div className="w-full min-h-[80vh] flex flex-col justify-center items-center py-8">
                <div className="w-full max-w-2xl flex flex-col items-center gap-6">
                    {/* Header */}
                    <div className="text-center">
                        <h1 className="text-2xl sm:text-3xl font-bold text-[#2E0F74] tracking-tight">
                            Importing File...
                        </h1>
                        <p className="text-xs text-gray-500 font-medium mt-1">
                            {uploadedFileName}
                        </p>
                    </div>

                    {/* Progress Card */}
                    <div className="w-full bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row items-center gap-8 sm:gap-10">
                        {/* Donut progress ring */}
                        <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                                <circle
                                    cx="60"
                                    cy="60"
                                    r="52"
                                    className="stroke-gray-100"
                                    strokeWidth="10"
                                    fill="transparent"
                                />
                                <circle
                                    cx="60"
                                    cy="60"
                                    r="52"
                                    className="stroke-[#2E0F74] transition-all duration-500 ease-out"
                                    strokeWidth="10"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={strokeDashoffset}
                                    strokeLinecap="round"
                                    fill="transparent"
                                />
                            </svg>
                            <span className="absolute text-2xl font-bold text-gray-900 tracking-tight">
                                {progressPct}%
                            </span>
                        </div>

                        {/* Right Details & Activity Log */}
                        <div className="flex-1 w-full flex flex-col gap-5">
                            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                                <div>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                                        PROGRESS
                                    </span>
                                    <span className="text-sm font-bold text-gray-900">
                                        {progressMb} MB / 12.5 MB
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                                        TIME LEFT
                                    </span>
                                    <span className="text-xs font-bold text-[#2E0F74]">
                                        {secondsRemaining} secs remaining
                                    </span>
                                </div>
                            </div>

                            {/* Activity Log */}
                            <div className="flex flex-col gap-2.5">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                    ACTIVITY LOG
                                </span>
                                <div className="flex flex-col gap-2 text-xs">
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <IoCheckmarkCircle className="text-emerald-500 shrink-0" size={16} />
                                        <span>Establishing secure connection..</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <IoCheckmarkCircle className="text-emerald-500 shrink-0" size={16} />
                                        <span>Allocating storage space..</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <IoCheckmarkCircle className="text-emerald-500 shrink-0" size={16} />
                                        <span>Uploading data chunks (1/3)..</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[#2E0F74] font-semibold">
                                        <LuRefreshCw className="animate-spin text-blue-500 shrink-0" size={14} />
                                        <span>Validating email formats..</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Action */}
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={() => setStep("upload")}
                            className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-semibold text-xs px-6 py-2.5 rounded-xl cursor-pointer shadow-2xs transition-colors"
                        >
                            Cancel Upload
                        </button>
                        <button
                            type="button"
                            onClick={() => setStep("summary")}
                            className="bg-[#2E0F74] hover:bg-[#37137F] text-white font-semibold text-xs px-6 py-2.5 rounded-xl cursor-pointer shadow-xs transition-colors"
                        >
                            View Summary Report
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ─── STEP 3: IMPORT SUMMARY REPORT (Matches Image 2) ───────────────────
    if (step === "summary") {
        const failedRows = [
            { row: "#1042", contact: "invalid.email@domain", error: "Invalid email format" },
            { row: "#2198", contact: "sarah.jenkins@company.com", error: "Missing required field: Last Name" },
            { row: "#4055", contact: "555-019-283", error: "Duplicate entry found (&B: 1670)" },
            { row: "#8912", contact: "robert.d@startup.io", error: "Invalid email format" },
        ];

        return (
            <div className="w-full flex flex-col gap-6 pb-12">
                {/* Header Row */}
                <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3.5">
                        <button
                            type="button"
                            onClick={() => setStep("upload")}
                            className="w-9 h-9 rounded-xl bg-[#2E0F74] text-white flex items-center justify-center shrink-0 cursor-pointer hover:bg-[#37137F] transition-colors shadow-xs"
                        >
                            <IoChevronBack size={18} />
                        </button>
                        <h1 className="text-2xl font-bold text-[#2E0F74] tracking-tight">
                            Import Summary Report
                        </h1>
                    </div>

                    <button
                        type="button"
                        onClick={() => toast.success("Exporting import report...")}
                        className="text-xs font-semibold text-gray-700 hover:text-gray-900 flex items-center gap-2 cursor-pointer transition-colors"
                    >
                        <LuDownload size={15} />
                        <span>Import Report</span>
                    </button>
                </div>

                {/* 3 Metric Summary Cards */}
                <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Card 1: Total Records */}
                    <div className="bg-white rounded-2xl md:rounded-3xl p-6 border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col justify-between">
                        <div className="flex items-center gap-2 text-gray-400">
                            <LuFileText size={16} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">
                                TOTAL RECORDS
                            </span>
                        </div>
                        <span className="text-3xl font-bold text-gray-900 tracking-tight mt-3">
                            45,000
                        </span>
                    </div>

                    {/* Card 2: Successfully Merged */}
                    <div className="bg-white rounded-2xl md:rounded-3xl p-6 border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col justify-between">
                        <div className="flex items-center gap-2 text-gray-400">
                            <IoCheckmarkCircle size={16} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">
                                SUCCESSFULLY MERGED
                            </span>
                        </div>
                        <span className="text-3xl font-bold text-[#2E0F74] tracking-tight mt-3">
                            1,240
                        </span>
                    </div>

                    {/* Card 3: Failed Rows */}
                    <div className="bg-white rounded-2xl md:rounded-3xl p-6 border-l-4 border-l-red-500 border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col justify-between">
                        <div className="flex items-center gap-2 text-red-500">
                            <IoAlertCircle size={16} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">
                                FAILED ROWS
                            </span>
                        </div>
                        <span className="text-3xl font-bold text-red-600 tracking-tight mt-3">
                            12
                        </span>
                    </div>
                </div>

                {/* Failed Rows Detail Card */}
                <div className="w-full bg-white rounded-2xl md:rounded-3xl p-6 border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col gap-4">
                    <div className="w-full flex justify-between items-center">
                        <h2 className="text-base font-bold text-gray-900 tracking-tight">
                            Failed Rows Detail
                        </h2>
                        <span className="text-xs text-gray-400 font-medium">
                            Showing 1-4 of 12
                        </span>
                    </div>

                    <div className="w-full overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 text-xs font-bold text-gray-900">
                                    <th className="py-3 px-4">Row Number</th>
                                    <th className="py-3 px-4">Contact Info (Email/Phone)</th>
                                    <th className="py-3 px-4">Error Message</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-xs text-gray-800 font-medium">
                                {failedRows.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50/60 transition-colors">
                                        <td className="py-3.5 px-4 font-semibold text-gray-700">
                                            {row.row}
                                        </td>
                                        <td className="py-3.5 px-4 text-gray-800 font-medium">
                                            {row.contact}
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-semibold border border-red-200">
                                                <IoAlertCircle size={13} className="shrink-0" />
                                                <span>{row.error}</span>
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    // ─── STEP 1: UPLOAD DATA (Matches Image 3) ──────────────────────────────
    return (
        <div className="w-full flex flex-col gap-6 pb-12">
            {/* Page Header */}
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
                        Upload Data
                    </h1>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">
                        Select your data source or drag and drop files to begin the import process.
                    </p>
                </div>
            </div>

            {/* Dismissible Alert Banner */}
            {showUploadAlert && (
                <div className="w-full bg-white border border-red-200 rounded-2xl p-4 shadow-sm flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 mt-0.5">
                            <IoAlertCircle size={15} />
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-red-600">
                                Upload Failed
                            </h4>
                            <p className="text-xs text-gray-500 font-medium mt-0.5">
                                File too large (Max 50MB). Please compress your file or select a different source.
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowUploadAlert(false)}
                        className="text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                        <IoClose size={16} />
                    </button>
                </div>
            )}

            {/* Drag & Drop Dropzone */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelected}
                accept=".csv, .xlsx, .json"
                className="hidden"
            />
            <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-300 hover:border-[#2E0F74] rounded-3xl p-10 bg-white flex flex-col items-center justify-center gap-3 cursor-pointer transition-all group shadow-[0_4px_24px_rgba(0,0,0,0.02)]"
            >
                <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-[#EFEBFA] text-gray-400 group-hover:text-[#2E0F74] flex items-center justify-center transition-colors">
                    <LuCloudUpload size={24} />
                </div>
                <span className="text-base font-bold text-gray-900 text-center">
                    Drag & Drop Files Here
                </span>
                <span className="text-xs text-gray-400 font-medium text-center">
                    Supports .csv, .xlsx, or .json up to 50MB
                </span>
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                    }}
                    className="bg-[#2E0F74] hover:bg-[#37137F] text-white font-semibold text-xs px-6 py-2.5 rounded-xl cursor-pointer shadow-xs transition-colors mt-1"
                >
                    Browse Files
                </button>
            </div>

            {/* Connect Source Section */}
            <div className="w-full flex flex-col gap-4">
                <h3 className="text-base font-bold text-gray-900 tracking-tight">
                    Connect Source
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* HubSpot CRM */}
                    <div
                        onClick={() => toast.info("Connecting to HubSpot CRM...")}
                        className="bg-white rounded-2xl p-4 border border-gray-100 hover:border-[#2E0F74] transition-all flex items-center justify-between cursor-pointer group shadow-2xs"
                    >
                        <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 font-bold text-sm flex items-center justify-center shrink-0">
                                H
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-gray-900">
                                    HubSpot CRM
                                </h4>
                                <p className="text-[11px] text-gray-400 font-medium">
                                    Connect via OAuth
                                </p>
                            </div>
                        </div>
                        <IoChevronForward size={16} className="text-gray-400 group-hover:text-[#2E0F74] transition-colors" />
                    </div>

                    {/* Mailchimp */}
                    <div
                        onClick={() => toast.info("Connecting to Mailchimp...")}
                        className="bg-white rounded-2xl p-4 border border-gray-100 hover:border-[#2E0F74] transition-all flex items-center justify-between cursor-pointer group shadow-2xs"
                    >
                        <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-yellow-100 text-yellow-700 font-bold text-sm flex items-center justify-center shrink-0">
                                M
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-gray-900">
                                    Mailchimp
                                </h4>
                                <p className="text-[11px] text-gray-400 font-medium">
                                    Connect via API Key
                                </p>
                            </div>
                        </div>
                        <IoChevronForward size={16} className="text-gray-400 group-hover:text-[#2E0F74] transition-colors" />
                    </div>
                </div>
            </div>

            {/* Bottom Proceed Button */}
            <div className="w-full flex justify-end mt-4">
                <button
                    type="button"
                    onClick={handleStartImport}
                    className="bg-[#2E0F74] hover:bg-[#37137F] text-white font-bold text-xs px-8 py-3 rounded-xl flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
                >
                    <span>Proceed</span>
                    <IoChevronForward size={14} />
                </button>
            </div>
        </div>
    );
}
