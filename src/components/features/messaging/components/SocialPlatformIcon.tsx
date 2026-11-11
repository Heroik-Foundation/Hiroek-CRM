import { useId } from "react";
import type { SocialPlatformId } from "../types";

interface SocialPlatformIconProps {
    platform: SocialPlatformId;
    size?: number;
    className?: string;
}

export default function SocialPlatformIcon({
    platform,
    size = 28,
    className = "",
}: SocialPlatformIconProps) {
    const rawId = useId();
    const gradId = `ig-grad-${rawId.replace(/:/g, "")}`;

    const props = {
        width: size,
        height: size,
        viewBox: "0 0 32 32",
        fill: "none",
        xmlns: "http://www.w3.org/2000/svg",
        className: `shrink-0 ${className}`,
    };

    switch (platform) {
        case "instagram":
            return (
                <svg {...props}>
                    <defs>
                        <linearGradient id={gradId} x1="0%" y1="100%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#f09433" />
                            <stop offset="25%" stopColor="#e6683c" />
                            <stop offset="50%" stopColor="#dc2743" />
                            <stop offset="75%" stopColor="#cc2366" />
                            <stop offset="100%" stopColor="#bc1888" />
                        </linearGradient>
                    </defs>
                    <rect width="32" height="32" rx="8" fill={`url(#${gradId})`} />
                    <rect
                        x="7.5"
                        y="7.5"
                        width="17"
                        height="17"
                        rx="4.8"
                        stroke="#FFFFFF"
                        strokeWidth="2"
                        fill="none"
                    />
                    <circle cx="16" cy="16" r="4" stroke="#FFFFFF" strokeWidth="2" fill="none" />
                    <circle cx="21.2" cy="10.8" r="1.2" fill="#FFFFFF" />
                </svg>
            );
        case "facebook":
            return (
                <svg {...props}>
                    <rect width="32" height="32" rx="8" fill="#1877F2" />
                    <path
                        d="M17.8 26.5v-8.8h2.95l.44-3.42H17.8v-2.18c0-.99.27-1.66 1.69-1.66h1.8V7.39c-.31-.04-1.38-.14-2.63-.14-2.6 0-4.38 1.59-4.38 4.5v2.53h-2.96v3.42h2.96v8.8h3.52z"
                        fill="#FFFFFF"
                    />
                </svg>
            );
        case "tiktok":
            return (
                <svg {...props}>
                    <rect width="32" height="32" rx="8" fill="#000000" />
                    <path
                        d="M22.1 12.2a4.6 4.6 0 0 1-2.7-1.4 4.5 4.5 0 0 1-.95-2.1h-2.85v11.5a2.55 2.55 0 1 1-1.85-2.45v-2.92a5.45 5.45 0 1 0 4.72 5.4v-5.85a7.4 7.4 0 0 0 4.33 1.38v-2.85a4.6 4.6 0 0 1-.7-.77z"
                        fill="#FFFFFF"
                    />
                </svg>
            );
        case "linkedin":
            return (
                <svg {...props}>
                    <rect width="32" height="32" rx="8" fill="#0A66C2" />
                    <circle cx="10.3" cy="10.4" r="1.65" fill="#FFFFFF" />
                    <rect x="8.9" y="13.4" width="2.8" height="9.9" rx="0.4" fill="#FFFFFF" />
                    <path
                        d="M14.1 13.4h2.68v1.35h.04c.37-.71 1.29-1.46 2.66-1.46 2.84 0 3.37 1.87 3.37 4.3v5.71h-2.8v-5.06c0-1.21-.02-2.76-1.68-2.76-1.68 0-1.94 1.31-1.94 2.67v5.15h-2.8V13.4z"
                        fill="#FFFFFF"
                    />
                </svg>
            );
        case "x":
            return (
                <svg {...props}>
                    <rect width="32" height="32" rx="8" fill="#000000" />
                    <path
                        d="M19.86 8.5h2.68l-5.85 6.69L23.56 23.5h-5.39l-4.22-5.52-4.83 5.52H6.44l6.26-7.15L6.1 8.5h5.53l3.81 5.04L19.86 8.5zm-.94 13.48h1.48L11.24 9.93H9.65l9.27 12.05z"
                        fill="#FFFFFF"
                    />
                </svg>
            );
        case "snapchat":
            return (
                <svg {...props}>
                    <rect width="32" height="32" rx="8" fill="#FFFC00" />
                    <path
                        d="M16 7.7c-2.85 0-4.7 1.85-4.7 4.6 0 .48.07 1.15.14 1.75-.3.12-.68.1-.92-.03-.27-.14-.53-.08-.68.12-.17.24-.05.6.27.8.37.22.92.42 1.28.63.1.06.14.17.1.27-.36 1.12-1.24 2.18-2.62 2.78-.41.18-.56.54-.33.83.24.3.79.49 1.51.6.17.03.31.15.35.33.07.29.17.6.44.71.27.1.65-.04 1.1-.04.44 0 .89.1 1.4.43.63.42 1.36.83 2.65.83s2.02-.41 2.65-.83c.51-.33.96-.43 1.4-.43.45 0 .83.14 1.1.04.27-.11.37-.42.44-.71.04-.18.18-.3.35-.33.72-.11 1.27-.3 1.51-.6.23-.29.08-.65-.33-.83-1.38-.6-2.26-1.66-2.62-2.78-.04-.1 0-.21.1-.27.36-.21.91-.41 1.28-.63.32-.2.44-.56.27-.8-.15-.2-.41-.26-.68-.12-.24.13-.62.15-.92.03.07-.6.14-1.27.14-1.75 0-2.75-1.85-4.6-4.7-4.6z"
                        fill="#FFFFFF"
                        stroke="#000000"
                        strokeWidth="1.25"
                        strokeLinejoin="round"
                    />
                </svg>
            );
        case "strava":
            return (
                <svg {...props}>
                    <rect width="32" height="32" rx="8" fill="#FC4C02" />
                    <polygon
                        points="14.4,7.2 8.9,18.1 12.1,18.1 14.4,13.5 16.7,18.1 19.9,18.1"
                        fill="#FFFFFF"
                    />
                    <polygon
                        points="19.3,18.1 17.7,21.4 16.1,18.1 13.7,18.1 17.7,25.8 21.7,18.1"
                        fill="#FFFFFF"
                        fillOpacity="0.72"
                    />
                </svg>
            );
    }
}

