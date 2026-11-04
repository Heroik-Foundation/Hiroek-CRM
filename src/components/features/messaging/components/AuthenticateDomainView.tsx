import { LuGlobe, LuClock, LuArrowRight, LuCheck, LuCopy, LuMail, LuShieldCheck, LuGauge } from "react-icons/lu";
import { Spinner } from "@heroui/react";
import type { DnsRecordItem } from "../types";

interface AuthenticateDomainViewProps {
    domainStep: 1 | 2 | 3 | 4 | 5;
    businessDomain: string;
    onDomainChange: (val: string) => void;
    senderProfileName: string;
    onSenderProfileNameChange: (val: string) => void;
    senderProfileEmail: string;
    onSenderProfileEmailChange: (val: string) => void;
    senderProfileReplyTo: string;
    onSenderProfileReplyToChange: (val: string) => void;
    dnsRecords: DnsRecordItem[];
    emailBalanceFormatted: string;
    onContinueStep1: () => void;
    onAddedRecordsStep2: () => void;
    onContinueStep3: () => void;
    onSaveSenderProfileStep4: () => void;
    onCreateCampaignStep5: () => void;
    onBackToOptions: () => void;
    onGoToStep: (step: 1 | 2 | 3 | 4 | 5) => void;
    onCopyDnsRecord: (text: string, label: string) => void;
    isConnectingDomain?: boolean;
    isCheckingDns?: boolean;
    isUpdatingProfile?: boolean;
}

const DOMAIN_STEPS = [
    { num: 1, label: "1. Enter Domain" },
    { num: 2, label: "2. DNS Setup" },
    { num: 3, label: "3. Verification" },
    { num: 4, label: "4. Sender Profile" },
    { num: 5, label: "5. Complete" },
];

export default function AuthenticateDomainView({
    domainStep,
    businessDomain,
    onDomainChange,
    senderProfileName,
    onSenderProfileNameChange,
    senderProfileEmail,
    onSenderProfileEmailChange,
    senderProfileReplyTo,
    onSenderProfileReplyToChange,
    dnsRecords,
    emailBalanceFormatted,
    onContinueStep1,
    onAddedRecordsStep2,
    onContinueStep3,
    onSaveSenderProfileStep4,
    onCreateCampaignStep5,
    onBackToOptions,
    onGoToStep,
    onCopyDnsRecord,
    isConnectingDomain = false,
    isCheckingDns = false,
    isUpdatingProfile = false,
}: AuthenticateDomainViewProps) {
    const cleanDomain = businessDomain || "yourbusiness.com";

    return (
        <div className="w-full flex flex-col items-center justify-center py-6 sm:py-8">
            {/* Top Stepper Bar */}
            <div className="w-full max-w-3xl mx-auto flex items-center justify-center gap-1 sm:gap-3 py-3 px-2 border-b border-gray-100 mb-6 select-none overflow-x-auto">
                {DOMAIN_STEPS.map((s, idx) => {
                    const isCompletedOrActive = domainStep >= s.num;
                    return (
                        <div key={s.num} className="flex items-center gap-1.5 shrink-0">
                            <span
                                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                                    isCompletedOrActive
                                        ? "bg-[#2E0F74] text-white shadow-2xs"
                                        : "border border-gray-300 text-gray-400 bg-white"
                                }`}
                            >
                                {s.num}
                            </span>
                            <span
                                className={`text-[11px] sm:text-xs font-semibold whitespace-nowrap ${
                                    isCompletedOrActive ? "text-gray-900" : "text-gray-400"
                                }`}
                            >
                                {s.label}
                            </span>
                            {idx < DOMAIN_STEPS.length - 1 && (
                                <span className="text-gray-300 mx-1 text-xs">·</span>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Main Card Container */}
            <div className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-9 shadow-sm border border-gray-100 flex flex-col text-left">
                {/* ── STEP 1: ENTER DOMAIN ── */}
                {domainStep === 1 && (
                    <div className="w-full flex flex-col text-left">
                        <span className="w-fit px-2.5 py-0.5 rounded-md bg-[#EDE9FE] text-[#4F46E5] text-[10px] font-bold tracking-wider uppercase mb-2.5">
                            STEP 1 — ENTER DOMAIN
                        </span>
                        <h1 className="text-xl sm:text-2xl font-bold text-[#2E0F74] tracking-tight mb-3">
                            Authenticate your domain
                        </h1>

                        <div className="border-l-2 border-[#7047EB] pl-3 py-0.5 my-2">
                            <span className="text-xs sm:text-sm font-medium text-gray-700">
                                Enter the domain you use to send emails from.
                            </span>
                        </div>

                        <div className="flex flex-col gap-1.5 mt-5">
                            <label className="text-xs font-bold text-gray-800">
                                Domain
                            </label>
                            <div className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 bg-white focus-within:border-[#2E0F74] focus-within:ring-1 focus-within:ring-[#2E0F74] transition-all">
                                <LuGlobe size={16} className="text-gray-400 shrink-0" />
                                <input
                                    type="text"
                                    value={businessDomain}
                                    onChange={(e) => onDomainChange(e.target.value.toLowerCase().trim())}
                                    placeholder="yourbusiness.com"
                                    className="w-full bg-transparent text-xs sm:text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none"
                                />
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mt-0.5">
                                <LuClock size={12} className="text-gray-400 shrink-0" />
                                <span>
                                    Root domains (e.g. yourbusiness.com) or subdomains (e.g. mail.yourbusiness.com) are supported.
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mt-8">
                            <button
                                type="button"
                                onClick={onContinueStep1}
                                disabled={isConnectingDomain}
                                className="bg-[#2E0F74] hover:bg-[#37137F] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-xs sm:text-sm px-6 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer transition-all shadow-xs"
                            >
                                {isConnectingDomain ? (
                                    <>
                                        <Spinner size="sm" color="current" />
                                        <span>Connecting...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Continue</span>
                                        <LuArrowRight size={14} />
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={onBackToOptions}
                                className="text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
                            >
                                ← Back to options
                            </button>
                        </div>
                    </div>
                )}

                {/* ── STEP 2: DNS SETUP ── */}
                {domainStep === 2 && (
                    <div className="w-full flex flex-col text-left">
                        <span className="w-fit px-2.5 py-0.5 rounded-md bg-[#EDE9FE] text-[#4F46E5] text-[10px] font-bold tracking-wider uppercase mb-2.5">
                            STEP 2 — ENTER DNS VERIFICATION
                        </span>
                        <h1 className="text-xl sm:text-2xl font-bold text-[#2E0F74] tracking-tight mb-3">
                            DNS Verification
                        </h1>

                        <div className="w-full bg-[#F3F0FA] rounded-2xl p-3.5 sm:p-4 my-2 border-l-4 border-[#2E0F74] flex flex-col gap-1 text-left">
                            <h4 className="text-xs sm:text-sm font-bold text-gray-900 leading-snug">
                                To verify that you own this domain, add the following DNS records to your domain provider.
                            </h4>
                            <p className="text-[11px] text-gray-600 leading-relaxed">
                                Hiroek uses dual DKIM and bounce envelope routing to guarantee enterprise email inbox placement without shared IPs.
                            </p>
                        </div>

                        {/* DNS Table */}
                        <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white mt-4">
                            <div className="bg-[#F8FAFC] border-b border-gray-100 text-[10px] font-bold text-gray-500 uppercase px-3 py-2.5 grid grid-cols-12 gap-2">
                                <span className="col-span-2">TYPE</span>
                                <span className="col-span-4">HOST / NAME</span>
                                <span className="col-span-3">VALUE / POINTS TO</span>
                                <span className="col-span-1 text-center">TTL</span>
                                <span className="col-span-2 text-right">ACTION</span>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {dnsRecords.map((r, idx) => (
                                    <div key={idx} className="p-3 grid grid-cols-12 gap-2 items-center text-xs">
                                        <div className="col-span-2">
                                            <span className="px-2 py-0.5 rounded bg-[#EDE9FE] text-[#6D28D9] font-bold text-[10px]">
                                                {r.type}
                                            </span>
                                        </div>
                                        <div className="col-span-4 flex flex-col pr-1">
                                            <div className="flex items-center gap-1 font-medium text-gray-900 break-all text-[11px]">
                                                <span>{r.host || r.name}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => onCopyDnsRecord(r.host || r.name || "", "Host")}
                                                    className="text-gray-400 hover:text-gray-600 cursor-pointer"
                                                >
                                                    <LuCopy size={11} />
                                                </button>
                                            </div>
                                            <span className="text-[9.5px] text-gray-400 mt-0.5">{r.desc}</span>
                                        </div>
                                        <div className="col-span-3 flex flex-col pr-1">
                                            <div className="flex items-center gap-1 font-medium text-gray-900 break-all text-[11px]">
                                                <span>{r.value}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => onCopyDnsRecord(r.value || "", "Value")}
                                                    className="text-gray-400 hover:text-gray-600 cursor-pointer"
                                                >
                                                    <LuCopy size={11} />
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-1 text-[9.5px] text-emerald-600 mt-0.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                                                <span>{r.status}</span>
                                            </div>
                                        </div>
                                        <div className="col-span-1 text-center text-gray-500 text-[10px]">
                                            {r.ttl}
                                        </div>
                                        <div className="col-span-2 flex justify-end">
                                            <button
                                                type="button"
                                                onClick={() => onCopyDnsRecord(`${r.host || r.name || ""} -> ${r.value || ""}`, "DNS Record")}
                                                className="px-2.5 py-1 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                                            >
                                                <LuCopy size={11} />
                                                <span>Copy</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center justify-between mt-7">
                            <button
                                type="button"
                                onClick={onAddedRecordsStep2}
                                disabled={isCheckingDns}
                                className="bg-[#2E0F74] hover:bg-[#37137F] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer transition-all shadow-xs"
                            >
                                {isCheckingDns ? (
                                    <>
                                        <Spinner size="sm" color="current" />
                                        <span>Checking DNS...</span>
                                    </>
                                ) : (
                                    <>
                                        <LuCheck size={15} />
                                        <span>I've added the records</span>
                                        <LuArrowRight size={14} />
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => onGoToStep(1)}
                                className="text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
                            >
                                ← Back to Step 1
                            </button>
                        </div>
                    </div>
                )}

                {/* ── STEP 3: VERIFICATION ── */}
                {domainStep === 3 && (
                    <div className="w-full flex flex-col text-left">
                        <span className="w-fit px-2.5 py-0.5 rounded-md bg-[#EDE9FE] text-[#4F46E5] text-[10px] font-bold tracking-wider uppercase mb-2.5">
                            STEP 3 — DOMAIN VERIFICATION
                        </span>
                        <h1 className="text-xl sm:text-2xl font-bold text-[#2E0F74] tracking-tight mb-3">
                            Domain Authentication
                        </h1>

                        <div className="text-center font-bold text-base text-gray-800 my-5">
                            Checking your domain....
                        </div>

                        <div className="w-full border border-gray-200 rounded-2xl p-5 bg-white flex flex-col gap-3 text-left shadow-2xs">
                            <div className="flex items-start gap-3.5">
                                <div className="w-10 h-10 rounded-xl bg-[#10B981] flex items-center justify-center text-white shrink-0 shadow-xs">
                                    <LuCheck size={20} strokeWidth={3} />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2.5">
                                        <h3 className="font-bold text-base text-gray-900">
                                            Domain authenticated
                                        </h3>
                                        <span className="px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803D] text-[11px] font-semibold flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#15803D]" />
                                            <span>Verified & Propagated</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-[#F8FAFC] border-l-4 border-[#10B981] p-2.5 rounded-r-xl italic text-xs text-gray-700">
                                "Your domain is ready to send emails from Hiroek."
                            </div>
                        </div>

                        <div className="flex items-center justify-between mt-7">
                            <button
                                type="button"
                                onClick={onContinueStep3}
                                className="bg-[#2E0F74] hover:bg-[#37137F] text-white font-semibold text-xs sm:text-sm px-6 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer transition-all shadow-xs"
                            >
                                <span>Continue</span>
                                <LuArrowRight size={14} />
                            </button>
                            <button
                                type="button"
                                onClick={() => onGoToStep(2)}
                                className="text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
                            >
                                ← Back to Step 2
                            </button>
                        </div>
                    </div>
                )}

                {/* ── STEP 4: SENDER PROFILE ── */}
                {domainStep === 4 && (
                    <div className="w-full flex flex-col text-left">
                        <span className="w-fit px-2.5 py-0.5 rounded-md bg-[#EDE9FE] text-[#4F46E5] text-[10px] font-bold tracking-wider uppercase mb-2.5">
                            STEP 4 — SENDER PROFILE VERIFIED
                        </span>
                        <h1 className="text-xl sm:text-2xl font-bold text-[#2E0F74] tracking-tight mb-3">
                            Sender Profile
                        </h1>

                        <div className="w-full border border-gray-100 bg-[#F9FAFB] rounded-xl p-3.5 my-2.5 flex flex-col gap-0.5 text-left">
                            <h4 className="text-xs sm:text-sm font-bold text-gray-900">
                                Your Sending Details
                            </h4>
                            <p className="text-[11px] text-gray-500">
                                Standardized sender envelope metadata for SMTP & API dispatch.
                            </p>
                        </div>

                        <div className="flex flex-col gap-4 mt-3">
                            {/* From name */}
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-semibold text-gray-800">
                                        From name
                                    </label>
                                    <span className="text-[10px] text-gray-400 font-medium">Recommended</span>
                                </div>
                                <div className="w-full bg-[#EEF2F6] rounded-xl px-3.5 py-2.5">
                                    <input
                                        type="text"
                                        value={senderProfileName}
                                        onChange={(e) => onSenderProfileNameChange(e.target.value)}
                                        placeholder="Hiroek Events"
                                        className="w-full bg-transparent text-xs sm:text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none"
                                    />
                                </div>
                                <span className="text-[10px] text-gray-400">
                                    The name your recipients will see in their inbox header.
                                </span>
                            </div>

                            {/* From email */}
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-gray-800">
                                    From email
                                </label>
                                <div className="w-full bg-[#EEF2F6] rounded-xl px-3.5 py-2.5">
                                    <input
                                        type="text"
                                        value={senderProfileEmail}
                                        onChange={(e) => onSenderProfileEmailChange(e.target.value.toLowerCase().trim())}
                                        placeholder={`hello@${cleanDomain}`}
                                        className="w-full bg-transparent text-xs sm:text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none font-mono"
                                    />
                                </div>
                                <span className="text-[10px] text-gray-400">
                                    Must use your authenticated domain (@{cleanDomain}).
                                </span>
                            </div>

                            {/* Reply-to email */}
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-gray-800">
                                    Reply-to email
                                </label>
                                <div className="w-full bg-[#EEF2F6] rounded-xl px-3.5 py-2.5">
                                    <input
                                        type="text"
                                        value={senderProfileReplyTo}
                                        onChange={(e) => onSenderProfileReplyToChange(e.target.value.toLowerCase().trim())}
                                        placeholder={`hello@${cleanDomain}`}
                                        className="w-full bg-transparent text-xs sm:text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none font-mono"
                                    />
                                </div>
                                <span className="text-[10px] text-gray-400">
                                    Where customer responses and inbound inquiries will be directed.
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mt-7">
                            <button
                                type="button"
                                onClick={onSaveSenderProfileStep4}
                                disabled={isUpdatingProfile}
                                className="bg-[#2E0F74] hover:bg-[#37137F] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-xs sm:text-sm px-6 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer transition-all shadow-xs"
                            >
                                {isUpdatingProfile ? (
                                    <>
                                        <Spinner size="sm" color="current" />
                                        <span>Saving Profile...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Save & Continue</span>
                                        <LuArrowRight size={14} />
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => onGoToStep(3)}
                                className="text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
                            >
                                ← Back to Step 3
                            </button>
                        </div>
                    </div>
                )}

                {/* ── STEP 5: COMPLETED ── */}
                {domainStep === 5 && (
                    <div className="w-full flex flex-col text-left">
                        <span className="w-fit px-2.5 py-0.5 rounded-md bg-[#EDE9FE] text-[#4F46E5] text-[10px] font-bold tracking-wider uppercase mb-2.5">
                            STEP 5 — COMPLETED
                        </span>
                        <h1 className="text-xl sm:text-2xl font-bold text-[#2E0F74] tracking-tight mb-3">
                            Completed State
                        </h1>

                        <div className="w-full bg-[#F0FDF4] border border-emerald-100 rounded-2xl p-3.5 flex items-center gap-3 my-2.5 text-left">
                            <div className="w-9 h-9 rounded-xl bg-[#10B981] flex items-center justify-center text-white shrink-0 shadow-xs">
                                <LuCheck size={18} strokeWidth={3} />
                            </div>
                            <div className="flex flex-col">
                                <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-xs sm:text-sm text-gray-900">
                                        You're ready to send
                                    </span>
                                    <span className="px-1.5 py-0.5 rounded-full bg-[#22C55E] text-white text-[9px] font-bold uppercase">
                                        Live
                                    </span>
                                </div>
                                <span className="text-[11px] text-gray-600 mt-0.5">
                                    Hiroek verified DNS authorization records are active with zero propagation errors detected.
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 my-3.5 w-full">
                            {/* Card 1: SENDING FROM */}
                            <div className="bg-[#F0EFF8] rounded-2xl p-3.5 flex flex-col justify-between border border-purple-50 text-left">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                        SENDING FROM:
                                    </span>
                                    <LuMail size={15} className="text-[#7047EB]" />
                                </div>
                                <div className="mt-2.5">
                                    <h4 className="font-bold text-xs sm:text-sm text-gray-900">
                                        {senderProfileName || "Hiroek Events"}
                                    </h4>
                                    <p className="text-[11px] text-gray-500 font-mono mt-0.5 truncate">
                                        {senderProfileEmail || `hello@${cleanDomain}`}
                                    </p>
                                </div>
                            </div>

                            {/* Card 2: DOMAIN */}
                            <div className="bg-[#F0EFF8] rounded-2xl p-3.5 flex flex-col justify-between border border-purple-50 text-left">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                        DOMAIN:
                                    </span>
                                    <LuShieldCheck size={15} className="text-[#10B981]" />
                                </div>
                                <div className="mt-2.5">
                                    <h4 className="font-bold text-xs sm:text-sm text-gray-900 truncate">
                                        {cleanDomain}
                                    </h4>
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 mt-0.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                                        <span>Authenticated</span>
                                    </div>
                                </div>
                            </div>

                            {/* Card 3: EMAIL CREDITS */}
                            <div className="bg-[#F0EFF8] rounded-2xl p-3.5 flex flex-col justify-between border border-purple-50 text-left">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                        EMAIL CREDITS:
                                    </span>
                                    <LuGauge size={15} className="text-[#7047EB]" />
                                </div>
                                <div className="mt-2.5">
                                    <h4 className="font-bold text-xs sm:text-sm text-gray-900">
                                        {emailBalanceFormatted} free emails
                                    </h4>
                                    <div className="flex items-center justify-between text-[11px] text-gray-500 mt-0.5">
                                        <span className="text-emerald-600 font-semibold">available now</span>
                                        <span>{emailBalanceFormatted} / {emailBalanceFormatted}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-5">
                            <button
                                type="button"
                                onClick={onCreateCampaignStep5}
                                className="bg-[#2E0F74] hover:bg-[#37137F] text-white font-semibold py-3 px-7 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs text-xs sm:text-sm"
                            >
                                <span>Create Campaign</span>
                                <LuArrowRight size={15} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

