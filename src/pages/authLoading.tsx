import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { tokenStorage } from "../config/httpService";
import { FiCheckCircle, FiAlertCircle, FiArrowRight } from "react-icons/fi";

export default function AuthLoading() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("Authenticating your session...");

    useEffect(() => {
        const processToken = async () => {
            try {
                // 1. Check query parameters
                const queryToken =
                    searchParams.get("token") ||
                    searchParams.get("access_token") ||
                    searchParams.get("accessToken") ||
                    searchParams.get("authToken") ||
                    searchParams.get("jwt");

                const refreshToken =
                    searchParams.get("refresh_token") ||
                    searchParams.get("refreshToken") ||
                    searchParams.get("refresh");

                const redirectPath =
                    searchParams.get("redirect") ||
                    searchParams.get("next") ||
                    "/dashboard";

                // 2. Check hash fragment (common in OAuth redirects)
                let hashToken: string | null = null;
                if (typeof window !== "undefined" && window.location.hash) {
                    const hashParams = new URLSearchParams(
                        window.location.hash.replace(/^#/, "")
                    );
                    hashToken =
                        hashParams.get("token") ||
                        hashParams.get("access_token") ||
                        hashParams.get("accessToken");
                }

                const token = queryToken || hashToken;

                if (token) {
                    // Save access token
                    tokenStorage.setAccess(token);

                    if (refreshToken) {
                        tokenStorage.setRefresh(refreshToken);
                    }

                    setStatus("success");
                    setMessage("Authentication successful! Redirecting to dashboard...");

                    // Brief smooth transition
                    const timer = setTimeout(() => {
                        navigate(redirectPath, { replace: true });
                    }, 800);

                    return () => clearTimeout(timer);
                } else {
                    // Check if user already has an active token in storage
                    const existingToken = tokenStorage.getAccess();
                    if (existingToken) {
                        setStatus("success");
                        setMessage("Active session detected. Proceeding to dashboard...");
                        const timer = setTimeout(() => {
                            navigate(redirectPath, { replace: true });
                        }, 800);
                        return () => clearTimeout(timer);
                    }

                    setStatus("error");
                    setMessage(
                        "No authentication token was found in the URL. Please provide a valid ?token= parameter or sign in again."
                    );
                }
            } catch (err: any) {
                setStatus("error");
                setMessage(
                    err?.message || "Failed to process token from URL."
                );
            }
        };

        processToken();
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-linear-to-br from-[#12072B] via-[#1E0F45] to-[#0A031A] text-white p-6 relative overflow-hidden">
            {/* Background Glow Accents */}
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#7B1B62]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#261353]/30 rounded-full blur-3xl pointer-events-none" />

            {/* Central Card */}
            <div className="w-full max-w-md bg-white/4 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center relative z-10">
                {/* Brand Header */}
                <div className="flex flex-col items-center mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-linear-to-tr from-[#261353] to-[#E11D48] flex items-center justify-center shadow-lg shadow-purple-900/40 mb-3 border border-white/20">
                        <span className="text-2xl font-black text-white tracking-wider">
                            H
                        </span>
                    </div>
                    <h1 className="text-xl font-extrabold tracking-tight text-white">
                        Hiroek
                    </h1>
                    <p className="text-xs text-white/50 font-medium">
                        Creator Platform
                    </p>
                </div>

                {/* Status Indicator & Message */}
                <div className="my-4 flex flex-col items-center gap-4 w-full">
                    {status === "loading" && (
                        <div className="relative w-16 h-16 flex items-center justify-center">
                            <div className="w-14 h-14 rounded-full border-4 border-white/10 border-t-[#E11D48] border-r-[#7B1B62] animate-spin" />
                        </div>
                    )}

                    {status === "success" && (
                        <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 animate-pulse">
                            <FiCheckCircle size={28} />
                        </div>
                    )}

                    {status === "error" && (
                        <div className="w-14 h-14 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
                            <FiAlertCircle size={28} />
                        </div>
                    )}

                    <div className="flex flex-col gap-1.5 px-2">
                        <h2 className="text-base font-bold text-white">
                            {status === "loading"
                                ? "Verifying Token"
                                : status === "success"
                                    ? "Authenticated"
                                    : "Authentication Required"}
                        </h2>
                        <p className="text-xs text-white/70 leading-relaxed max-w-xs">
                            {message}
                        </p>
                    </div>
                </div>

                {/* Error Actions */}
                {status === "error" && (
                    <div className="w-full flex flex-col gap-2.5 mt-4 pt-4 border-t border-white/10">
                        <button
                            onClick={() => navigate("/dashboard")}
                            className="w-full py-3 px-4 bg-linear-to-r from-[#261353] to-[#E11D48] hover:opacity-90 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                        >
                            <span>Go to Dashboard</span>
                            <FiArrowRight size={14} />
                        </button>
                        <button
                            onClick={() => navigate("/")}
                            className="w-full py-2.5 px-4 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white font-medium text-xs rounded-xl transition-colors"
                        >
                            Return to Welcome
                        </button>
                    </div>
                )}

                {/* Progress bar on loading */}
                {status === "loading" && (
                    <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden mt-6">
                        <div className="w-full h-full bg-linear-to-r from-[#261353] via-[#E11D48] to-[#261353] animate-pulse" />
                    </div>
                )}
            </div>

            {/* Footer */}
            <p className="text-[11px] text-white/30 mt-6 font-medium">
                Hiroek Security &bull; Token Session Validator
            </p>
        </div>
    );
}
