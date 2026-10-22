/**
 * Converts rich-text editor HTML into PLAIN TEXT that still looks styled.
 * The backend escapes HTML, so tags can't be sent. Instead we keep:
 *  - bold / italic / bold-italic via Unicode letter variants
 *  - underline / strikethrough via combining characters
 *  - headings (bold + divider), bullet & numbered lists, quotes, dividers
 *  - paragraph spacing and intentionally empty lines
 * Colors, highlights and alignment cannot be represented in plain text.
 */

interface InlineState {
    bold: boolean;
    italic: boolean;
    underline: boolean;
    strike: boolean;
}

const BASE: InlineState = { bold: false, italic: false, underline: false, strike: false };

// Starting code points for [A, a, 0] in each Mathematical Sans-Serif style
const STYLES = {
    bold: [0x1d5d4, 0x1d5ee, 0x1d7ec],
    italic: [0x1d608, 0x1d622, null],
    boldItalic: [0x1d63c, 0x1d656, null],
} as const;

function styleChar(ch: string, s: InlineState): string {
    let out = ch;
    const code = ch.charCodeAt(0);
    const set = s.bold && s.italic ? STYLES.boldItalic : s.bold ? STYLES.bold : s.italic ? STYLES.italic : null;
    if (set) {
        if (code >= 65 && code <= 90) out = String.fromCodePoint(set[0] + (code - 65));
        else if (code >= 97 && code <= 122) out = String.fromCodePoint(set[1] + (code - 97));
        else if (code >= 48 && code <= 57 && set[2] !== null) out = String.fromCodePoint(set[2] + (code - 48));
    }
    if (s.underline && ch.trim()) out += "\u0332";
    if (s.strike && ch.trim()) out += "\u0336";
    return out;
}

function styleText(text: string, s: InlineState): string {
    if (!s.bold && !s.italic && !s.underline && !s.strike) return text;
    return Array.from(text).map((c) => styleChar(c, s)).join("");
}

function inline(node: Node, state: InlineState): string {
    if (node.nodeType === Node.TEXT_NODE) {
        return styleText((node.textContent || "").replace(/\s+/g, " "), state);
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return "";
    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();
    if (tag === "br") return "\n";

    const next = { ...state };
    if (tag === "strong" || tag === "b") next.bold = true;
    if (tag === "em" || tag === "i") next.italic = true;
    if (tag === "u") next.underline = true;
    if (tag === "s" || tag === "strike" || tag === "del") next.strike = true;

    const inner = Array.from(el.childNodes).map((c) => inline(c, next)).join("");

    if (tag === "a") {
        const href = el.getAttribute("href")?.trim() || "";
        const label = el.textContent?.trim() || "";
        if (href && !href.startsWith("#") && !label.includes(href)) return `${inner} (${href})`;
    }
    return inner;
}

const plain = (el: Element) => (el.textContent || "").replace(/\s+/g, " ").trim();

export interface StyledTextOptions {
    actionButton?: { label: string; link: string } | null;
}

export function convertHtmlToStyledText(rawHtml: string, options: StyledTextOptions = {}): string {
    if (!rawHtml || !rawHtml.trim()) return "";

    const doc = new DOMParser().parseFromString(`<div>${rawHtml}</div>`, "text/html");
    const root = doc.body.firstElementChild as HTMLElement;
    if (!root) return rawHtml.replace(/<[^>]*>/g, "").trim();

    const lines: string[] = [];

    const heading = (el: Element, level: number) => {
        const text = plain(el);
        if (!text) return;
        const shown = level === 1 ? text.toUpperCase() : text;
        lines.push(styleText(shown, { ...BASE, bold: true }));
        if (level === 1) lines.push("━".repeat(Math.min(Math.max(text.length, 12), 40)));
        if (level === 2) lines.push("─".repeat(Math.min(Math.max(text.length, 8), 30)));
        lines.push("");
    };

    const block = (el: Element) => {
        const tag = el.tagName.toLowerCase();
        switch (tag) {
            case "h1": return heading(el, 1);
            case "h2": return heading(el, 2);
            case "h3":
            case "h4":
            case "h5":
            case "h6": return heading(el, 3);
            case "p": {
                const text = Array.from(el.childNodes).map((c) => inline(c, BASE)).join("").trim();
                if (!text) lines.push(""); // intentional blank line from the editor
                else lines.push(text, "");
                return;
            }
            case "ul":
            case "ol": {
                Array.from(el.children).forEach((li, i) => {
                    const t = Array.from(li.childNodes).map((c) => inline(c, BASE)).join("").trim();
                    if (t) lines.push(tag === "ul" ? `•  ${t}` : `${i + 1}.  ${t}`);
                });
                lines.push("");
                return;
            }
            case "blockquote": {
                const t = Array.from(el.childNodes).map((c) => inline(c, { ...BASE, italic: true })).join("").trim();
                t.split("\n").forEach((l) => lines.push(`┃ ${l}`));
                lines.push("");
                return;
            }
            case "hr":
                lines.push("──────────────────────", "");
                return;
            default: {
                const t = inline(el, BASE).trim();
                if (t) lines.push(t, "");
            }
        }
    };

    Array.from(root.childNodes).forEach((n) => {
        if (n.nodeType === Node.ELEMENT_NODE) block(n as Element);
        else {
            const t = inline(n, BASE).trim();
            if (t) lines.push(t, "");
        }
    });

    let text = lines.join("\n").replace(/\n{4,}/g, "\n\n\n").trim();

    const btn = options.actionButton;
    if (btn && btn.label.trim()) {
        const link = btn.link.trim();
        const url = link && !/^https?:\/\//.test(link) ? `https://${link}` : link;
        text += `\n\n${styleText(btn.label.trim(), { ...BASE, bold: true })}${url ? `\n${url}` : ""}`;
    }
    return text;
}
