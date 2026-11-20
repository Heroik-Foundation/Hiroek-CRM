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
    LuMail,
    LuCheck,
} from "react-icons/lu";
import { toast, Spinner } from "@heroui/react";
import useRecipients from "../../hooks/useRecipients";

export default function ImportData() {
    const navigate = useNavigate();

    // Steps: "upload" | "importing" | "summary"
    const [step, setStep] = useState<"upload" | "importing" | "summary">("upload");

    // Selected file state
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [showUploadAlert, setShowUploadAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Active Import tracking
    const [activeImportId, setActiveImportId] = useState<string | null>(null);
    const [fallbackProgress, setFallbackProgress] = useState(15);

    // API Hooks
    const {
        useUploadRecipientFile,
        useGetImportStatus,
        useConfirmImport,
        useCancelImport,
        useGetImportReport,
        useGetRecentImports,
        downloadFailedRowsCsv,
    } = useRecipients();

    const uploadMutation = useUploadRecipientFile();
    const confirmMutation = useConfirmImport();
    const cancelMutation = useCancelImport();
    const { data: recentImports } = useGetRecentImports();

    // Query status of active import
    const { data: importStatus } = useGetImportStatus(activeImportId, step === "importing");

    // Query report when in summary view
    const { data: reportData, isLoading: isReportLoading } = useGetImportReport(
        activeImportId,
        step === "summary"
    );

    // Smooth progress simulation while backend processes file
    useEffect(() => {
        let timer: ReturnType<typeof setInterval>;
        if (step === "importing") {
            timer = setInterval(() => {
                setFallbackProgress((prev) => {
                    if (prev >= 95) return prev;
                    return prev + 5;
                });
            }, 800);
        } else {
            setFallbackProgress(15);
        }
        return () => clearInterval(timer);
    }, [step]);

    // React to status changes
    useEffect(() => {
        if (!importStatus) return;

        // If backend reports ready, auto-confirm consent to finish saving
        if (importStatus.status === "ready" && activeImportId && !confirmMutation.isPending) {
            confirmMutation.mutate(activeImportId);
        }

        // Once completed, transition to summary
        if (importStatus.status === "completed") {
            setStep("summary");
        }

        // If failed
        if (importStatus.status === "failed") {
            setAlertMessage(importStatus.failureReason || "File import failed during processing.");
            setShowUploadAlert(true);
            setStep("upload");
        }
    }, [importStatus, activeImportId, confirmMutation]);

    const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const maxMb = 50;
        if (file.size > maxMb * 1024 * 1024) {
            setAlertMessage(`File exceeds ${maxMb}MB limit. Please choose a smaller file.`);
            setShowUploadAlert(true);
            return;
        }

        const validExts = [".csv", ".xlsx", ".json"];
        const hasValidExt = validExts.some((ext) => file.name.toLowerCase().endsWith(ext));
        if (!hasValidExt) {
            setAlertMessage("Unsupported format. Please upload a .csv, .xlsx, or .json file.");
            setShowUploadAlert(true);
            return;
        }

        setSelectedFile(file);
        setShowUploadAlert(false);
        toast.success(`Selected: ${file.name}`);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            const maxMb = 50;
            if (file.size > maxMb * 1024 * 1024) {
                setAlertMessage(`File exceeds ${maxMb}MB limit. Please choose a smaller file.`);
                setShowUploadAlert(true);
                return;
            }
            setSelectedFile(file);
            setShowUploadAlert(false);
            toast.success(`Selected: ${file.name}`);
        }
    };

    const handleStartImport = async () => {
        if (!selectedFile) {
            toast.danger("Please select or drop a file to import");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("file", selectedFile);

            const result = await uploadMutation.mutateAsync(formData);
            const importId = result?.id || result?.importId || (result as any)?._id || (result as any)?.data?.id;

            if (importId) {
                setActiveImportId(importId);
                setStep("importing");
            } else {
                // If direct synchronous completion or fallback
                toast.success("File uploaded successfully");
                setStep("importing");
            }
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || "Failed to start import";
            setAlertMessage(msg);
            setShowUploadAlert(true);
        }
    };

    const handleCancelImport = () => {
        if (activeImportId) {
            cancelMutation.mutate(activeImportId);
        }
        setStep("upload");
        setActiveImportId(null);
    };

    const handleViewReportFromHistory = (imp: any) => {
        const id = imp.id || imp._id;
        setActiveImportId(id);
        setStep("summary");
    };

    // Calculate progress percentage
    const currentPercent =
        typeof importStatus?.percent === "number"
            ? importStatus.percent
            : importStatus?.status === "completed"
            ? 100
            : fallbackProgress;

    // ─── STEP 2: IMPORTING FILE ─────────────────────────────────────────────
    if (step === "importing") {
        const circumference = 2 * Math.PI * 52;
        const strokeDashoffset = circumference - (currentPercent / 100) * circumference;

        return (
            <div className="w-full min-h-[80vh] flex flex-col justify-center items-center py-8">
                <div className="w-full max-w-2xl flex flex-col items-center gap-6">
                    {/* Header */}
                    <div className="text-center">
                        <h1 className="text-2xl sm:text-3xl font-bold text-[#2E0F74] tracking-tight">
                            Importing File...
                        </h1>
                        <p className="text-xs text-gray-500 font-medium mt-1">
                            {selectedFile?.name || importStatus?.fileName || "contacts.csv"}
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
                                {Math.round(currentPercent)}%
                            </span>
                        </div>

                        {/* Right Details & Activity Log */}
                        <div className="flex-1 w-full flex flex-col gap-5">
                            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                                <div>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                                        STATUS
                                    </span>
                                    <span className="text-sm font-bold text-gray-900 capitalize">
                                        {importStatus?.status || "Processing"}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                                        FILE SIZE
                                    </span>
                                    <span className="text-xs font-bold text-[#2E0F74]">
                                        {selectedFile
                                            ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`
                                            : "Analyzing"}
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
                                        <span>File uploaded securely to /api/recipients/imports</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <IoCheckmarkCircle className="text-emerald-500 shrink-0" size={16} />
                                        <span>Parsing and reading data records</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-700">
                                        {currentPercent >= 60 ? (
                                            <IoCheckmarkCircle className="text-emerald-500 shrink-0" size={16} />
                                        ) : (
                                            <LuRefreshCw className="animate-spin text-purple-600 shrink-0" size={14} />
                                        )}
                                        <span>Validating email formats and phone numbers</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-700 font-semibold">
                                        {currentPercent >= 100 ? (
                                            <IoCheckmarkCircle className="text-emerald-500 shrink-0" size={16} />
                                        ) : (
                                            <LuRefreshCw className="animate-spin text-blue-500 shrink-0" size={14} />
                                        )}
                                        <span>Saving contacts into recipient database...</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Action */}
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={handleCancelImport}
                            disabled={cancelMutation.isPending}
                            className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-semibold text-xs px-6 py-2.5 rounded-xl cursor-pointer shadow-2xs transition-colors disabled:opacity-50"
                        >
                            {cancelMutation.isPending ? "Cancelling..." : "Cancel Upload"}
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

    // ─── STEP 3: IMPORT SUMMARY REPORT ──────────────────────────────────────
    if (step === "summary") {
        const totals = reportData?.totals || importStatus?.totals || {
            rows: importStatus?.totalRows || 0,
            imported: importStatus?.importedRows || 0,
            merged: 0,
            skipped: 0,
            failed: importStatus?.failedRows || 0,
        };

        const failedRows = reportData?.failedRows || [];

        return (
            <div className="w-full flex flex-col gap-6 pb-12 animate-in fade-in duration-150">
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
                        <div>
                            <h1 className="text-2xl font-bold text-[#2E0F74] tracking-tight">
                                Import Summary Report
                            </h1>
                            <p className="text-xs text-gray-500 font-medium mt-0.5">
                                {selectedFile?.name || "Import completed successfully"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Download Report / Failed Rows CSV */}
                        <button
                            type="button"
                            onClick={() => {
                                if (activeImportId) {
                                    downloadFailedRowsCsv(activeImportId);
                                } else {
                                    toast.info("No active import ID to download failed rows");
                                }
                            }}
                            className="text-xs font-semibold px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
                        >
                            <LuDownload size={15} />
                            <span>Download Failed Rows CSV</span>
                        </button>

                        {/* Send Campaign Now */}
                        <button
                            type="button"
                            onClick={() => navigate("/dashboard/messaging")}
                            className="text-xs font-bold px-4 py-2 rounded-xl bg-[#2E0F74] hover:bg-[#37137F] text-white flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
                        >
                            <LuMail size={15} />
                            <span>Send Campaign to Contacts</span>
                        </button>
                    </div>
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
                            {isReportLoading ? (
                                <Spinner size="sm" />
                            ) : (
                                totals.rows?.toLocaleString() || "0"
                            )}
                        </span>
                    </div>

                    {/* Card 2: Successfully Imported / Merged */}
                    <div className="bg-white rounded-2xl md:rounded-3xl p-6 border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col justify-between">
                        <div className="flex items-center gap-2 text-gray-400">
                            <IoCheckmarkCircle size={16} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">
                                SUCCESSFULLY IMPORTED
                            </span>
                        </div>
                        <span className="text-3xl font-bold text-[#2E0F74] tracking-tight mt-3">
                            {isReportLoading ? (
                                <Spinner size="sm" />
                            ) : (
                                (totals.imported ?? totals.merged ?? 0).toLocaleString()
                            )}
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
                            {isReportLoading ? (
                                <Spinner size="sm" />
                            ) : (
                                totals.failed?.toLocaleString() || failedRows.length.toLocaleString()
                            )}
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
                            {failedRows.length > 0
                                ? `Showing ${failedRows.length} failed record(s)`
                                : "0 failed rows"}
                        </span>
                    </div>

                    {failedRows.length > 0 ? (
                        <div className="w-full overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-100 text-xs font-bold text-gray-900">
                                        <th className="py-3 px-4">Row Number</th>
                                        <th className="py-3 px-4">Contact Info (Email/Phone)</th>
                                        <th className="py-3 px-4">Error Reason</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-xs text-gray-800 font-medium">
                                    {failedRows.map((row, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50/60 transition-colors">
                                            <td className="py-3.5 px-4 font-semibold text-gray-700">
                                                #{row.rowNumber || row.row || idx + 1}
                                            </td>
                                            <td className="py-3.5 px-4 text-gray-800 font-medium">
                                                {row.contact || row.email || row.phone || "-"}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-semibold border border-red-200">
                                                    <IoAlertCircle size={13} className="shrink-0" />
                                                    <span>{row.reason || row.error || "Validation error"}</span>
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="w-full py-8 text-center flex flex-col items-center gap-2 bg-emerald-50/40 rounded-2xl border border-emerald-100">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                <LuCheck size={20} />
                            </div>
                            <h4 className="text-sm font-bold text-emerald-800">
                                All contacts imported successfully!
                            </h4>
                            <p className="text-xs text-emerald-600 max-w-sm">
                                No rows failed validation. Your contacts are ready to receive campaigns.
                            </p>
                        </div>
                    )}
                </div>

                {/* Back / Import another button */}
                <div className="w-full flex justify-between items-center pt-2">
                    <button
                        type="button"
                        onClick={() => {
                            setSelectedFile(null);
                            setActiveImportId(null);
                            setStep("upload");
                        }}
                        className="text-xs font-semibold text-gray-600 hover:text-gray-900 cursor-pointer"
                    >
                        ← Import Another File
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate("/dashboard/messaging")}
                        className="bg-[#2E0F74] hover:bg-[#37137F] text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                        Proceed to Messaging
                    </button>
                </div>
            </div>
        );
    }

    // ─── STEP 1: UPLOAD DATA ────────────────────────────────────────────────
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
                        Import contact files (.csv, .xlsx, .json up to 50MB) to send campaigns to attendees.
                    </p>
                </div>
            </div>

            {/* Dismissible Alert Banner */}
            {showUploadAlert && (
                <div className="w-full bg-white border border-red-200 rounded-2xl p-4 shadow-sm flex items-start justify-between gap-3 animate-in fade-in duration-150">
                    <div className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 mt-0.5">
                            <IoAlertCircle size={15} />
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-red-600">
                                Upload Notice
                            </h4>
                            <p className="text-xs text-gray-500 font-medium mt-0.5">
                                {alertMessage || "File too large (Max 50MB). Please compress your file or select a different source."}
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
                onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                }}
                onDrop={handleDrop}
                className={`w-full border-2 border-dashed ${
                    selectedFile
                        ? "border-[#2E0F74] bg-[#F7F5FC]"
                        : "border-gray-300 hover:border-[#2E0F74] bg-white"
                } rounded-3xl p-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all group shadow-[0_4px_24px_rgba(0,0,0,0.02)]`}
            >
                <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-[#EFEBFA] text-gray-400 group-hover:text-[#2E0F74] flex items-center justify-center transition-colors">
                    <LuCloudUpload size={24} />
                </div>
                <span className="text-base font-bold text-gray-900 text-center">
                    {selectedFile ? selectedFile.name : "Drag & Drop Files Here"}
                </span>
                <span className="text-xs text-gray-400 font-medium text-center">
                    {selectedFile
                        ? `File ready: ${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`
                        : "Supports .csv, .xlsx, or .json up to 50MB"}
                </span>
                <div className="flex items-center gap-3 mt-1">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            fileInputRef.current?.click();
                        }}
                        className="bg-[#2E0F74] hover:bg-[#37137F] text-white font-semibold text-xs px-6 py-2.5 rounded-xl cursor-pointer shadow-xs transition-colors"
                    >
                        {selectedFile ? "Change File" : "Browse Files"}
                    </button>
                    {selectedFile && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedFile(null);
                            }}
                            className="text-xs text-red-500 hover:text-red-700 font-semibold cursor-pointer px-2"
                        >
                            Remove
                        </button>
                    )}
                </div>
            </div>

            {/* Recent Imports History Section */}
            {Array.isArray(recentImports) && recentImports.length > 0 && (
                <div className="w-full bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-base font-bold text-gray-900 tracking-tight">
                            Recent Imports History
                        </h3>
                        <span className="text-xs text-gray-400 font-medium">
                            {recentImports.length} past import(s)
                        </span>
                    </div>

                    <div className="w-full overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-gray-100 font-bold text-gray-900">
                                    <th className="py-2.5 px-3">File Name</th>
                                    <th className="py-2.5 px-3">Status</th>
                                    <th className="py-2.5 px-3">Total Rows</th>
                                    <th className="py-2.5 px-3">Date</th>
                                    <th className="py-2.5 px-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                                {recentImports.slice(0, 5).map((item: any, idx: number) => {
                                    const id = item.id || item._id;
                                    const status = item.status || "completed";
                                    return (
                                        <tr key={id || idx} className="hover:bg-gray-50/60">
                                            <td className="py-3 px-3 font-semibold text-gray-900">
                                                {item.fileName || item.filename || "contacts.csv"}
                                            </td>
                                            <td className="py-3 px-3">
                                                <span
                                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                                        status === "completed"
                                                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                            : status === "failed"
                                                            ? "bg-red-50 text-red-700 border border-red-200"
                                                            : "bg-blue-50 text-blue-700 border border-blue-200"
                                                    }`}
                                                >
                                                    {status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-3">
                                                {item.totals?.rows ?? item.totalRows ?? "-"}
                                            </td>
                                            <td className="py-3 px-3 text-gray-500">
                                                {item.createdAt
                                                    ? new Date(item.createdAt).toLocaleDateString()
                                                    : "-"}
                                            </td>
                                            <td className="py-3 px-3 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => handleViewReportFromHistory(item)}
                                                    className="text-xs text-[#2E0F74] hover:underline font-bold cursor-pointer"
                                                >
                                                    View Report
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Bottom Proceed Button */}
            <div className="w-full flex justify-end mt-4">
                <button
                    type="button"
                    onClick={handleStartImport}
                    disabled={!selectedFile || uploadMutation.isPending}
                    className="bg-[#2E0F74] hover:bg-[#37137F] text-white font-bold text-xs px-8 py-3 rounded-xl flex items-center gap-2 cursor-pointer shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {uploadMutation.isPending ? (
                        <>
                            <Spinner size="sm" color="current" />
                            <span>Uploading File...</span>
                        </>
                    ) : (
                        <>
                            <span>Proceed to Import</span>
                            <IoChevronForward size={14} />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
