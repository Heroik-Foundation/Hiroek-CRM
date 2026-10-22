export interface EmailActionBtn {
    label: string;
    link: string;
    align: "left" | "center" | "right";
}

export interface BuildEmailOptions {
    title?: string;
    senderName?: string;
    bannerImage?: string | null;
    actionButton?: EmailActionBtn | null;
    includeContainer?: boolean;
}

/**
 * Merge base inline styles with existing inline styles on an element.
 * Existing styles (such as text-align: center or custom color) will override base defaults.
 */
function mergeInlineStyle(element: HTMLElement, baseStyleMap: Record<string, string>) {
    const existingStyle = element.getAttribute("style") || "";
    const styleObj: Record<string, string> = { ...baseStyleMap };

    if (existingStyle) {
        existingStyle.split(";").forEach((pair) => {
            const idx = pair.indexOf(":");
            if (idx > -1) {
                const key = pair.substring(0, idx).trim().toLowerCase();
                const val = pair.substring(idx + 1).trim();
                if (key && val) {
                    styleObj[key] = val;
                }
            }
        });
    }

    const mergedString = Object.entries(styleObj)
        .map(([k, v]) => `${k}: ${v}`)
        .join("; ");

    element.setAttribute("style", mergedString);
}

/**
 * Transforms raw HTML from the WYSIWYG editor into email-compatible HTML with complete inline styles.
 * Most email clients (Gmail, Outlook, Yahoo, Apple Mail) discard CSS classes like Tailwind or .tiptap.
 * This guarantees that every heading, list, quote, paragraph, and link renders identically to the editor.
 */
export function inlineEmailStyles(rawHtml: string): string {
    if (!rawHtml || !rawHtml.trim()) return "";

    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(`<div>${rawHtml}</div>`, "text/html");
        const container = doc.body.firstElementChild as HTMLElement;

        if (!container) return rawHtml;

        const defaultFont = "Poppins, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

        // Style Paragraphs - Preserve all paragraphs including empty line breaks
        container.querySelectorAll("p").forEach((el) => {
            const inner = el.innerHTML.trim();
            const isEmpty = !inner || inner === "<br>" || inner === '<br class="ProseMirror-trailingBreak">';

            mergeInlineStyle(el as HTMLElement, {
                "margin": "0 0 16px 0",
                "font-size": "14px",
                "line-height": "1.7",
                "min-height": "20px",
                "color": "#374151",
                "font-family": defaultFont,
            });

            if (isEmpty) {
                el.innerHTML = "<br />";
            }
        });

        // Style Headings with prominent scale and spacing
        container.querySelectorAll("h1").forEach((el) => {
            mergeInlineStyle(el as HTMLElement, {
                "margin": "24px 0 12px 0",
                "font-size": "26px",
                "font-weight": "700",
                "line-height": "1.3",
                "color": "#111827",
                "font-family": defaultFont,
            });
        });

        container.querySelectorAll("h2").forEach((el) => {
            mergeInlineStyle(el as HTMLElement, {
                "margin": "20px 0 10px 0",
                "font-size": "20px",
                "font-weight": "700",
                "line-height": "1.35",
                "color": "#1F2937",
                "font-family": defaultFont,
            });
        });

        container.querySelectorAll("h3").forEach((el) => {
            mergeInlineStyle(el as HTMLElement, {
                "margin": "16px 0 8px 0",
                "font-size": "16px",
                "font-weight": "600",
                "line-height": "1.4",
                "color": "#374151",
                "font-family": defaultFont,
            });
        });

        // Style Lists
        container.querySelectorAll("ul").forEach((el) => {
            mergeInlineStyle(el as HTMLElement, {
                "margin": "8px 0 14px 0",
                "padding-left": "24px",
                "list-style-type": "disc",
                "color": "#374151",
                "font-family": defaultFont,
            });
        });

        container.querySelectorAll("ol").forEach((el) => {
            mergeInlineStyle(el as HTMLElement, {
                "margin": "8px 0 14px 0",
                "padding-left": "24px",
                "list-style-type": "decimal",
                "color": "#374151",
                "font-family": defaultFont,
            });
        });

        container.querySelectorAll("li").forEach((el) => {
            mergeInlineStyle(el as HTMLElement, {
                "margin-bottom": "6px",
                "line-height": "1.6",
                "font-size": "14px",
                "color": "#374151",
                "font-family": defaultFont,
            });
        });

        // Style Blockquotes
        container.querySelectorAll("blockquote").forEach((el) => {
            mergeInlineStyle(el as HTMLElement, {
                "border-left": "4px solid #7047EB",
                "padding": "10px 16px",
                "margin": "16px 0",
                "font-style": "italic",
                "color": "#4B5563",
                "background-color": "#F8F6FE",
                "border-radius": "0 8px 8px 0",
                "font-family": defaultFont,
            });
        });

        // Style Horizontal Rules
        container.querySelectorAll("hr").forEach((el) => {
            mergeInlineStyle(el as HTMLElement, {
                "border": "none",
                "border-top": "1px solid #E5E7EB",
                "margin": "24px 0",
            });
        });

        // Style Inline Code
        container.querySelectorAll("code").forEach((el) => {
            mergeInlineStyle(el as HTMLElement, {
                "background-color": "#F3F4F6",
                "border-radius": "4px",
                "padding": "2px 6px",
                "font-family": "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                "font-size": "12.5px",
                "color": "#2E0F74",
            });
        });

        // Style Links
        container.querySelectorAll("a").forEach((el) => {
            mergeInlineStyle(el as HTMLElement, {
                "color": "#7047EB",
                "text-decoration": "underline",
                "font-weight": "600",
                "word-break": "break-word",
            });
        });

        // Style Marks / Highlights
        container.querySelectorAll("mark").forEach((el) => {
            mergeInlineStyle(el as HTMLElement, {
                "background-color": "#FEF08A",
                "padding": "2px 4px",
                "border-radius": "3px",
                "color": "#1F2937",
            });
        });

        return container.innerHTML;
    } catch {
        return rawHtml;
    }
}

/**
 * Builds the complete, bulletproof HTML email ready for sending or live client preview.
 */
export function buildFullEmailHtml(
    rawBody: string,
    options: BuildEmailOptions = {}
): string {
    const {
        bannerImage,
        actionButton,
        includeContainer = false,
    } = options;

    const inlinedContent = inlineEmailStyles(rawBody);

    let parts = "";

    // Banner Image
    if (bannerImage) {
        parts += `<div style="margin-bottom: 20px; text-align: center;"><img src="${bannerImage}" alt="Banner" style="max-width: 100%; height: auto; border-radius: 12px; display: inline-block; border: 0;" /></div>`;
    }

    // Message Body (clean inlined content without bulky outer wrapper)
    parts += inlinedContent;

    // Action Button
    if (actionButton && actionButton.label.trim()) {
        const link = actionButton.link.trim() || "#";
        const formattedLink =
            link.startsWith("http://") || link.startsWith("https://") || link === "#"
                ? link
                : `https://${link}`;

        const alignStyle =
            actionButton.align === "center"
                ? "text-align: center;"
                : actionButton.align === "right"
                    ? "text-align: right;"
                    : "text-align: left;";

        parts += `<div style="margin-top: 24px; margin-bottom: 12px; ${alignStyle}"><a href="${formattedLink}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #2E0F74; color: #ffffff; padding: 12px 28px; font-weight: bold; font-size: 14px; text-decoration: none; border-radius: 12px; box-shadow: 0 2px 6px rgba(46, 15, 116, 0.25); font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">${actionButton.label.trim()}</a></div>`;
    }

    if (!includeContainer) {
        return parts;
    }

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F8FAFC; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <div style="background-color: #F8FAFC; padding: 32px 12px; min-height: 100%;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #E2E8F0; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.04);">
            <tr>
                <td style="padding: 32px 28px 36px 28px; color: #1F2937; font-size: 14px; line-height: 1.65; font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                    ${parts}
                </td>
            </tr>
        </table>
    </div>
</body>
</html>
    `.trim();
}

/**
 * Converts rich text editor HTML into clean, human-readable email text.
 * The backend campaign service embeds messages into email templates that escape HTML
 * (causing <div style="..."> and <h1> tags to appear as visible code in inboxes).
 * This function extracts headings, paragraphs, lists, quotes, and links cleanly
 * so NO HTML code ever appears in the recipient's email.
 */
export function convertHtmlToCleanEmailText(
    rawHtml: string,
    options: BuildEmailOptions = {}
): string {
    if (!rawHtml || !rawHtml.trim()) return "";

    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(`<div>${rawHtml}</div>`, "text/html");
        const container = doc.body.firstElementChild as HTMLElement;

        if (!container) return rawHtml.replace(/<[^>]*>/g, "").trim();

        // Convert headings with clean spacing
        container.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach((heading) => {
            const text = heading.textContent?.trim() || "";
            if (text) {
                heading.replaceWith(doc.createTextNode(`\n\n${text}\n\n`));
            } else {
                heading.remove();
            }
        });

        // Convert bullet lists
        container.querySelectorAll("ul").forEach((ul) => {
            const items: string[] = [];
            ul.querySelectorAll("li").forEach((li) => {
                const text = li.textContent?.trim();
                if (text) items.push(`• ${text}`);
            });
            ul.replaceWith(doc.createTextNode(`\n\n${items.join("\n")}\n\n`));
        });

        // Convert numbered lists
        container.querySelectorAll("ol").forEach((ol) => {
            const items: string[] = [];
            ol.querySelectorAll("li").forEach((li, idx) => {
                const text = li.textContent?.trim();
                if (text) items.push(`${idx + 1}. ${text}`);
            });
            ol.replaceWith(doc.createTextNode(`\n\n${items.join("\n")}\n\n`));
        });

        // Convert blockquotes
        container.querySelectorAll("blockquote").forEach((quote) => {
            const text = quote.textContent?.trim() || "";
            if (text) {
                quote.replaceWith(doc.createTextNode(`\n\n> ${text}\n\n`));
            } else {
                quote.remove();
            }
        });

        // Convert horizontal rules
        container.querySelectorAll("hr").forEach((hr) => {
            hr.replaceWith(doc.createTextNode("\n\n---\n\n"));
        });

        // Convert links: display Text (URL) or just URL
        container.querySelectorAll("a").forEach((a) => {
            const text = a.textContent?.trim() || "";
            const href = a.getAttribute("href")?.trim() || "";
            if (text && href && !href.startsWith("#") && !text.includes(href)) {
                a.replaceWith(doc.createTextNode(`${text} (${href})`));
            } else if (text) {
                a.replaceWith(doc.createTextNode(text));
            } else if (href) {
                a.replaceWith(doc.createTextNode(href));
            }
        });

        // Convert line breaks and paragraphs
        container.querySelectorAll("br").forEach((br) => {
            br.replaceWith(doc.createTextNode("\n"));
        });

        container.querySelectorAll("p").forEach((p) => {
            const text = p.textContent?.trim() || "";
            if (text) {
                p.replaceWith(doc.createTextNode(`\n\n${text}\n\n`));
            } else {
                p.replaceWith(doc.createTextNode("\n"));
            }
        });

        // Extract pure text content (strips any residual HTML tags)
        let cleanText = container.textContent || "";

        // Normalize multiple line breaks to max 3
        cleanText = cleanText
            .replace(/\r\n/g, "\n")
            .replace(/\n{4,}/g, "\n\n\n")
            .trim();

        // Append Call to Action button link if configured
        if (options.actionButton && options.actionButton.label.trim()) {
            const link = options.actionButton.link.trim() || "";
            const label = options.actionButton.label.trim();
            const formattedLink =
                link.startsWith("http://") || link.startsWith("https://")
                    ? link
                    : link
                        ? `https://${link}`
                        : "";

            if (formattedLink) {
                cleanText += `\n\n${label}: ${formattedLink}`;
            } else {
                cleanText += `\n\n[ ${label} ]`;
            }
        }

        return cleanText;
    } catch {
        return rawHtml.replace(/<[^>]*>/g, "").trim();
    }
}
