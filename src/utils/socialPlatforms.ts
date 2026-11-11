import type { SocialPlatformId } from "../components/features/messaging/types";

export interface SocialPlatformConfig {
    id: SocialPlatformId;
    name: string;
    shortCode: string;
    urlPlaceholder: string;
    usernamePlaceholder: string;
    accentColor: string;
    badgeTextColor: string;
}

export const SOCIAL_PLATFORMS: SocialPlatformConfig[] = [
    {
        id: "instagram",
        name: "Instagram",
        shortCode: "IG",
        urlPlaceholder: "https://instagram.com/yourbrand",
        usernamePlaceholder: "@yourbrand",
        accentColor: "#E1306C",
        badgeTextColor: "#FFFFFF",
    },
    {
        id: "facebook",
        name: "Facebook",
        shortCode: "f",
        urlPlaceholder: "https://facebook.com/yourbrand",
        usernamePlaceholder: "@yourbrand",
        accentColor: "#1877F2",
        badgeTextColor: "#FFFFFF",
    },
    {
        id: "tiktok",
        name: "TikTok",
        shortCode: "TT",
        urlPlaceholder: "https://tiktok.com/@yourbrand",
        usernamePlaceholder: "@yourbrand",
        accentColor: "#000000",
        badgeTextColor: "#FFFFFF",
    },
    {
        id: "linkedin",
        name: "LinkedIn",
        shortCode: "in",
        urlPlaceholder: "https://linkedin.com/company/yourbrand",
        usernamePlaceholder: "yourbrand",
        accentColor: "#0A66C2",
        badgeTextColor: "#FFFFFF",
    },
    {
        id: "x",
        name: "X",
        shortCode: "X",
        urlPlaceholder: "https://x.com/yourbrand",
        usernamePlaceholder: "@yourbrand",
        accentColor: "#000000",
        badgeTextColor: "#FFFFFF",
    },
    {
        id: "snapchat",
        name: "Snapchat",
        shortCode: "SC",
        urlPlaceholder: "https://snapchat.com/add/yourbrand",
        usernamePlaceholder: "@yourbrand",
        accentColor: "#FFFC00",
        badgeTextColor: "#111827",
    },
    {
        id: "strava",
        name: "Strava",
        shortCode: "ST",
        urlPlaceholder: "https://strava.com/clubs/yourbrand",
        usernamePlaceholder: "yourbrand",
        accentColor: "#FC4C02",
        badgeTextColor: "#FFFFFF",
    },
];

export const SOCIAL_PLATFORM_MAP: Record<SocialPlatformId, SocialPlatformConfig> =
    SOCIAL_PLATFORMS.reduce(
        (acc, p) => {
            acc[p.id] = p;
            return acc;
        },
        {} as Record<SocialPlatformId, SocialPlatformConfig>
    );

export function normalizeSocialUrl(url: string): string {
    const trimmed = url.trim();
    if (!trimmed) return "";
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
}

export function deriveFallbackUsername(platform: SocialPlatformId, url: string): string {
    const config = SOCIAL_PLATFORM_MAP[platform];
    const cleanUrl = url.trim().replace(/\/+$/, "");
    if (!cleanUrl) return config.name;

    try {
        const parsed = new URL(normalizeSocialUrl(cleanUrl));
        const segments = parsed.pathname.split("/").filter(Boolean);
        const last = segments[segments.length - 1];
        if (last) {
            if (platform === "linkedin" || platform === "strava") {
                return last;
            }
            return last.startsWith("@") ? last : `@${last}`;
        }
    } catch {
        // ignore URL parse error
    }
    return config.name;
}

export function escapeHtml(str: string): string {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

/**
 * Generates self-contained SVG markup for each social platform for use in email HTML footers.
 */
export function getSocialPlatformSvgString(platform: SocialPlatformId, size = 22): string {
    const common = `width="${size}" height="${size}" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle; flex-shrink: 0;"`;

    switch (platform) {
        case "instagram":
            return `<svg ${common}>
                <defs>
                    <linearGradient id="hiroek-ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
                        <stop offset="0%" stop-color="#f09433" />
                        <stop offset="25%" stop-color="#e6683c" />
                        <stop offset="50%" stop-color="#dc2743" />
                        <stop offset="75%" stop-color="#cc2366" />
                        <stop offset="100%" stop-color="#bc1888" />
                    </linearGradient>
                </defs>
                <rect width="32" height="32" rx="8" fill="url(#hiroek-ig-grad)" />
                <rect x="7.5" y="7.5" width="17" height="17" rx="4.8" stroke="#FFFFFF" stroke-width="2" fill="none" />
                <circle cx="16" cy="16" r="4" stroke="#FFFFFF" stroke-width="2" fill="none" />
                <circle cx="21.2" cy="10.8" r="1.2" fill="#FFFFFF" />
            </svg>`;
        case "facebook":
            return `<svg ${common}>
                <rect width="32" height="32" rx="8" fill="#1877F2" />
                <path d="M17.8 26.5v-8.8h2.95l.44-3.42H17.8v-2.18c0-.99.27-1.66 1.69-1.66h1.8V7.39c-.31-.04-1.38-.14-2.63-.14-2.6 0-4.38 1.59-4.38 4.5v2.53h-2.96v3.42h2.96v8.8h3.52z" fill="#FFFFFF" />
            </svg>`;
        case "tiktok":
            return `<svg ${common}>
                <rect width="32" height="32" rx="8" fill="#000000" />
                <path d="M22.1 12.2a4.6 4.6 0 0 1-2.7-1.4 4.5 4.5 0 0 1-.95-2.1h-2.85v11.5a2.55 2.55 0 1 1-1.85-2.45v-2.92a5.45 5.45 0 1 0 4.72 5.4v-5.85a7.4 7.4 0 0 0 4.33 1.38v-2.85a4.6 4.6 0 0 1-.7-.77z" fill="#FFFFFF" />
            </svg>`;
        case "linkedin":
            return `<svg ${common}>
                <rect width="32" height="32" rx="8" fill="#0A66C2" />
                <circle cx="10.3" cy="10.4" r="1.65" fill="#FFFFFF" />
                <rect x="8.9" y="13.4" width="2.8" height="9.9" rx="0.4" fill="#FFFFFF" />
                <path d="M14.1 13.4h2.68v1.35h.04c.37-.71 1.29-1.46 2.66-1.46 2.84 0 3.37 1.87 3.37 4.3v5.71h-2.8v-5.06c0-1.21-.02-2.76-1.68-2.76-1.68 0-1.94 1.31-1.94 2.67v5.15h-2.8V13.4z" fill="#FFFFFF" />
            </svg>`;
        case "x":
            return `<svg ${common}>
                <rect width="32" height="32" rx="8" fill="#000000" />
                <path d="M19.86 8.5h2.68l-5.85 6.69L23.56 23.5h-5.39l-4.22-5.52-4.83 5.52H6.44l6.26-7.15L6.1 8.5h5.53l3.81 5.04L19.86 8.5zm-.94 13.48h1.48L11.24 9.93H9.65l9.27 12.05z" fill="#FFFFFF" />
            </svg>`;
        case "snapchat":
            return `<svg ${common}>
                <rect width="32" height="32" rx="8" fill="#FFFC00" />
                <path d="M16 7.7c-2.85 0-4.7 1.85-4.7 4.6 0 .48.07 1.15.14 1.75-.3.12-.68.1-.92-.03-.27-.14-.53-.08-.68.12-.17.24-.05.6.27.8.37.22.92.42 1.28.63.1.06.14.17.1.27-.36 1.12-1.24 2.18-2.62 2.78-.41.18-.56.54-.33.83.24.3.79.49 1.51.6.17.03.31.15.35.33.07.29.17.6.44.71.27.1.65-.04 1.1-.04.44 0 .89.1 1.4.43.63.42 1.36.83 2.65.83s2.02-.41 2.65-.83c.51-.33.96-.43 1.4-.43.45 0 .83.14 1.1.04.27-.11.37-.42.44-.71.04-.18.18-.3.35-.33.72-.11 1.27-.3 1.51-.6.23-.29.08-.65-.33-.83-1.38-.6-2.26-1.66-2.62-2.78-.04-.1 0-.21.1-.27.36-.21.91-.41 1.28-.63.32-.2.44-.56.27-.8-.15-.2-.41-.26-.68-.12-.24.13-.62.15-.92.03.07-.6.14-1.27.14-1.75 0-2.75-1.85-4.6-4.7-4.6z" fill="#FFFFFF" stroke="#000000" stroke-width="1.25" stroke-linejoin="round" />
            </svg>`;
        case "strava":
            return `<svg ${common}>
                <rect width="32" height="32" rx="8" fill="#FC4C02" />
                <polygon points="14.4,7.2 8.9,18.1 12.1,18.1 14.4,13.5 16.7,18.1 19.9,18.1" fill="#FFFFFF" />
                <polygon points="19.3,18.1 17.7,21.4 16.1,18.1 13.7,18.1 17.7,25.8 21.7,18.1" fill="#FFFFFF" fill-opacity="0.72" />
            </svg>`;
    }
}

const SOCIAL_ICON_CACHE_KEY = "hiroek_social_icon_urls_v1";

export function getCachedSocialIconUrl(platform: SocialPlatformId): string | null {
    try {
        const raw = localStorage.getItem(SOCIAL_ICON_CACHE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as Partial<Record<SocialPlatformId, string>>;
        const url = parsed[platform];
        return typeof url === "string" && url.startsWith("http") ? url : null;
    } catch {
        return null;
    }
}

export function setCachedSocialIconUrl(platform: SocialPlatformId, url: string): void {
    try {
        const raw = localStorage.getItem(SOCIAL_ICON_CACHE_KEY);
        const parsed = raw ? (JSON.parse(raw) as Record<string, string>) : {};
        parsed[platform] = url;
        localStorage.setItem(SOCIAL_ICON_CACHE_KEY, JSON.stringify(parsed));
    } catch {
        // ignore storage errors
    }
}

/**
 * Converts a social platform SVG icon into a crisp 64x64 PNG File for email-safe image hosting.
 */
export async function generateSocialIconPngFile(
    platform: SocialPlatformId,
    size = 64
): Promise<File | null> {
    if (typeof document === "undefined") return null;

    const svgString = getSocialPlatformSvgString(platform, size);
    const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;

    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            try {
                const canvas = document.createElement("canvas");
                canvas.width = size;
                canvas.height = size;
                const ctx = canvas.getContext("2d");
                if (!ctx) {
                    resolve(null);
                    return;
                }
                ctx.clearRect(0, 0, size, size);
                ctx.drawImage(img, 0, 0, size, size);
                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            resolve(null);
                            return;
                        }
                        resolve(new File([blob], `social-${platform}.png`, { type: "image/png" }));
                    },
                    "image/png",
                    1
                );
            } catch {
                resolve(null);
            }
        };
        img.onerror = () => resolve(null);
        img.src = dataUrl;
    });
}

/**
 * Ensures an email-safe HTTPS PNG URL exists for the given social platform.
 */
export async function ensureSocialIconUploaded(
    platform: SocialPlatformId,
    uploadImage?: (file: File) => Promise<string | null>
): Promise<string | null> {
    const cached = getCachedSocialIconUrl(platform);
    if (cached) return cached;
    if (!uploadImage) return null;

    const file = await generateSocialIconPngFile(platform, 64);
    if (!file) return null;

    try {
        const uploadedUrl = await uploadImage(file);
        if (uploadedUrl && uploadedUrl.startsWith("http")) {
            setCachedSocialIconUrl(platform, uploadedUrl);
            return uploadedUrl;
        }
    } catch {
        // ignore upload failure and use HTML badge fallback
    }
    return null;
}


