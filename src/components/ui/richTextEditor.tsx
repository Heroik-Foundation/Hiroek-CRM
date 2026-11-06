import { useEffect, useState, useRef } from "react";
import { useEditor, EditorContent, ReactNodeViewRenderer, NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import { Node, Extension, mergeAttributes } from "@tiptap/core";
import { Spinner, toast } from "@heroui/react";
import {
    LuBold,
    LuItalic,
    LuUnderline,
    LuStrikethrough,
    LuHeading1,
    LuHeading2,
    LuHeading3,
    LuList,
    LuListOrdered,
    LuQuote,
    LuCode,
    LuAlignLeft,
    LuAlignCenter,
    LuAlignRight,
    LuAlignJustify,
    LuLink,
    LuLink2Off,
    LuUndo,
    LuRedo,
    LuMinus,
    LuCheck,
    LuX,
    LuBaseline,
    LuHighlighter,
    LuRemoveFormatting,
    LuImage,
    LuMousePointerClick,
    LuPencil,
    LuTrash2,
    LuUpload,
    LuExternalLink,
} from "react-icons/lu";

// ─── TypeScript Augmentations ────────────────────────────────────────────────
declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        fontSize: {
            setFontSize: (fontSize: string) => ReturnType;
            unsetFontSize: () => ReturnType;
        };
        customImage: {
            setImage: (options: {
                src: string;
                alt?: string;
                alignment?: "left" | "center" | "right";
                width?: string;
            }) => ReturnType;
        };
        emailButton: {
            setButton: (options: {
                text: string;
                url: string;
                alignment?: "left" | "center" | "right";
                backgroundColor?: string;
                textColor?: string;
            }) => ReturnType;
        };
    }
}

// ─── Font Size Extension ─────────────────────────────────────────────────────
export const FontSize = Extension.create({
    name: "fontSize",
    addOptions() {
        return {
            types: ["textStyle"],
        };
    },
    addGlobalAttributes() {
        return [
            {
                types: this.options.types,
                attributes: {
                    fontSize: {
                        default: null,
                        parseHTML: (element) => element.style.fontSize?.replace(/['"]+/g, "") || null,
                        renderHTML: (attributes) => {
                            if (!attributes.fontSize) {
                                return {};
                            }
                            return {
                                style: `font-size: ${attributes.fontSize}`,
                            };
                        },
                    },
                },
            },
        ];
    },
    addCommands() {
        return {
            setFontSize:
                (fontSize: string) =>
                ({ chain }: any) => {
                    return chain().setMark("textStyle", { fontSize }).run();
                },
            unsetFontSize:
                () =>
                ({ chain }: any) => {
                    return chain().setMark("textStyle", { fontSize: null }).removeEmptyTextStyle().run();
                },
        };
    },
});

// ─── Custom Image Node View Component ────────────────────────────────────────
function ImageNodeView({ node, updateAttributes, deleteNode, selected }: NodeViewProps) {
    const { src, alt, alignment = "center", width = "100%" } = node.attrs;
    const [isHovered, setIsHovered] = useState(false);

    const alignClass =
        alignment === "left"
            ? "justify-start text-left"
            : alignment === "right"
            ? "justify-end text-right"
            : "justify-center text-center";

    return (
        <NodeViewWrapper
            className="my-3 relative group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className={`w-full flex ${alignClass}`}>
                <div
                    className={`relative inline-block rounded-xl overflow-hidden border transition-all ${
                        selected || isHovered
                            ? "ring-2 ring-[#7047EB] border-purple-300 shadow-md"
                            : "border-gray-200"
                    }`}
                    style={{ maxWidth: width, width: width === "100%" ? "100%" : "auto" }}
                >
                    <img
                        src={src}
                        alt={alt || "Message content"}
                        className="w-full h-auto block rounded-xl object-contain max-h-[500px]"
                    />

                    {/* Floating Controls Bar */}
                    {(selected || isHovered) && (
                        <div
                            className="absolute top-2 right-2 bg-gray-900/90 text-white backdrop-blur-xs rounded-xl p-1.5 flex items-center gap-1 shadow-lg z-20 animate-fadeIn"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Alignment buttons */}
                            <button
                                type="button"
                                onClick={() => updateAttributes({ alignment: "left" })}
                                className={`p-1 rounded-md text-xs hover:bg-white/20 transition cursor-pointer ${
                                    alignment === "left" ? "bg-white/30 text-white" : "text-gray-300"
                                }`}
                                title="Align Left"
                            >
                                <LuAlignLeft size={13} />
                            </button>
                            <button
                                type="button"
                                onClick={() => updateAttributes({ alignment: "center" })}
                                className={`p-1 rounded-md text-xs hover:bg-white/20 transition cursor-pointer ${
                                    alignment === "center" ? "bg-white/30 text-white" : "text-gray-300"
                                }`}
                                title="Align Center"
                            >
                                <LuAlignCenter size={13} />
                            </button>
                            <button
                                type="button"
                                onClick={() => updateAttributes({ alignment: "right" })}
                                className={`p-1 rounded-md text-xs hover:bg-white/20 transition cursor-pointer ${
                                    alignment === "right" ? "bg-white/30 text-white" : "text-gray-300"
                                }`}
                                title="Align Right"
                            >
                                <LuAlignRight size={13} />
                            </button>

                            <div className="w-[1px] h-3 bg-white/20 mx-0.5" />

                            {/* Width selector */}
                            <button
                                type="button"
                                onClick={() => updateAttributes({ width: "50%" })}
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold hover:bg-white/20 transition cursor-pointer ${
                                    width === "50%" ? "bg-white/30 text-white" : "text-gray-300"
                                }`}
                                title="Medium (50%)"
                            >
                                50%
                            </button>
                            <button
                                type="button"
                                onClick={() => updateAttributes({ width: "75%" })}
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold hover:bg-white/20 transition cursor-pointer ${
                                    width === "75%" ? "bg-white/30 text-white" : "text-gray-300"
                                }`}
                                title="Large (75%)"
                            >
                                75%
                            </button>
                            <button
                                type="button"
                                onClick={() => updateAttributes({ width: "100%" })}
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold hover:bg-white/20 transition cursor-pointer ${
                                    width === "100%" ? "bg-white/30 text-white" : "text-gray-300"
                                }`}
                                title="Full Width (100%)"
                            >
                                100%
                            </button>

                            <div className="w-[1px] h-3 bg-white/20 mx-0.5" />

                            {/* Delete Button */}
                            <button
                                type="button"
                                onClick={deleteNode}
                                className="p-1 rounded-md text-red-400 hover:bg-red-500/30 hover:text-red-200 transition cursor-pointer"
                                title="Remove Image"
                            >
                                <LuTrash2 size={13} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </NodeViewWrapper>
    );
}

// ─── Custom Image Node Extension ─────────────────────────────────────────────
export const CustomImage = Node.create({
    name: "customImage",
    group: "block",
    selectable: true,
    draggable: true,
    atom: true,

    addAttributes() {
        return {
            src: {
                default: null,
            },
            alt: {
                default: "",
            },
            alignment: {
                default: "center",
                parseHTML: (element) => element.getAttribute("data-align") || "center",
                renderHTML: (attributes) => ({ "data-align": attributes.alignment }),
            },
            width: {
                default: "100%",
                parseHTML: (element) => element.getAttribute("data-width") || "100%",
                renderHTML: (attributes) => ({ "data-width": attributes.width }),
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: "div[data-type='image-block']",
                getAttrs: (element) => {
                    const el = element as HTMLElement;
                    const img = el.querySelector("img");
                    return {
                        src: img?.getAttribute("src") || el.getAttribute("data-src"),
                        alt: img?.getAttribute("alt") || "",
                        alignment: el.getAttribute("data-align") || "center",
                        width: el.getAttribute("data-width") || "100%",
                    };
                },
            },
            {
                tag: "img[src]",
                getAttrs: (element) => {
                    const el = element as HTMLElement;
                    const parent = el.parentElement;
                    const align = parent?.getAttribute("data-align") || (parent?.style.textAlign as string) || "center";
                    return {
                        src: el.getAttribute("src"),
                        alt: el.getAttribute("alt") || "",
                        alignment: align,
                        width: el.getAttribute("data-width") || "100%",
                    };
                },
            },
        ];
    },

    renderHTML({ node, HTMLAttributes }) {
        const align = node?.attrs?.alignment || HTMLAttributes["data-align"] || "center";
        const width = node?.attrs?.width || HTMLAttributes["data-width"] || "100%";
        const src = node?.attrs?.src || HTMLAttributes.src;
        const alt = node?.attrs?.alt || HTMLAttributes.alt || "";
        const alignStyle =
            align === "left"
                ? "text-align: left; margin: 16px 0;"
                : align === "right"
                ? "text-align: right; margin: 16px 0;"
                : "text-align: center; margin: 16px 0;";

        return [
            "div",
            mergeAttributes(HTMLAttributes, {
                "data-type": "image-block",
                "data-align": align,
                "data-width": width,
                style: alignStyle,
            }),
            [
                "img",
                {
                    src,
                    alt,
                    style: `max-width: ${width}; width: auto; height: auto; border-radius: 10px; display: inline-block; vertical-align: middle; border: 0; box-shadow: 0 1px 3px rgba(0,0,0,0.08);`,
                },
            ],
        ];
    },

    addNodeView() {
        return ReactNodeViewRenderer(ImageNodeView);
    },

    addCommands() {
        return {
            setImage:
                (options: { src: string; alt?: string; alignment?: "left" | "center" | "right"; width?: string }) =>
                ({ commands }: any) => {
                    return commands.insertContent({
                        type: this.name,
                        attrs: options,
                    });
                },
        };
    },
});

// ─── Custom Button Node View Component ───────────────────────────────────────
const BUTTON_COLORS = [
    { label: "Deep Purple", color: "#2E0F74" },
    { label: "Brand Violet", color: "#7047EB" },
    { label: "Emerald Green", color: "#16A34A" },
    { label: "Royal Blue", color: "#2563EB" },
    { label: "Crimson Red", color: "#DC2626" },
    { label: "Amber Orange", color: "#D97706" },
    { label: "Dark Gray", color: "#1F2937" },
];

function ButtonNodeView({ node, updateAttributes, deleteNode, selected }: NodeViewProps) {
    const {
        text = "Click Here",
        url = "#",
        alignment = "center",
        backgroundColor = "#2E0F74",
        textColor = "#ffffff",
    } = node.attrs;
    const [isHovered, setIsHovered] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(text);
    const [editUrl, setEditUrl] = useState(url);
    const [editBg, setEditBg] = useState(backgroundColor);

    const alignClass =
        alignment === "left"
            ? "justify-start text-left"
            : alignment === "right"
            ? "justify-end text-right"
            : "justify-center text-center";

    return (
        <NodeViewWrapper
            className="my-4 relative group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className={`w-full flex ${alignClass}`}>
                <div className="relative inline-block">
                    {/* The Button */}
                    <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.preventDefault()}
                        style={{
                            backgroundColor,
                            color: textColor,
                        }}
                        className={`inline-flex items-center justify-center px-6 py-3 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all select-none cursor-pointer ${
                            selected || isHovered ? "ring-2 ring-[#7047EB] ring-offset-2 scale-102" : ""
                        }`}
                    >
                        <span>{text}</span>
                    </a>

                    {/* Floating Controls Bar */}
                    {(selected || isHovered) && !isEditing && (
                        <div
                            className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900/90 text-white backdrop-blur-xs rounded-xl p-1.5 flex items-center gap-1 shadow-lg z-20 whitespace-nowrap animate-fadeIn"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                type="button"
                                onClick={() => updateAttributes({ alignment: "left" })}
                                className={`p-1 rounded-md text-xs hover:bg-white/20 transition cursor-pointer ${
                                    alignment === "left" ? "bg-white/30 text-white" : "text-gray-300"
                                }`}
                                title="Align Left"
                            >
                                <LuAlignLeft size={13} />
                            </button>
                            <button
                                type="button"
                                onClick={() => updateAttributes({ alignment: "center" })}
                                className={`p-1 rounded-md text-xs hover:bg-white/20 transition cursor-pointer ${
                                    alignment === "center" ? "bg-white/30 text-white" : "text-gray-300"
                                }`}
                                title="Align Center"
                            >
                                <LuAlignCenter size={13} />
                            </button>
                            <button
                                type="button"
                                onClick={() => updateAttributes({ alignment: "right" })}
                                className={`p-1 rounded-md text-xs hover:bg-white/20 transition cursor-pointer ${
                                    alignment === "right" ? "bg-white/30 text-white" : "text-gray-300"
                                }`}
                                title="Align Right"
                            >
                                <LuAlignRight size={13} />
                            </button>

                            <div className="w-[1px] h-3 bg-white/20 mx-0.5" />

                            <button
                                type="button"
                                onClick={() => {
                                    setEditText(text);
                                    setEditUrl(url);
                                    setEditBg(backgroundColor);
                                    setIsEditing(true);
                                }}
                                className="p-1 rounded-md text-xs text-gray-300 hover:text-white hover:bg-white/20 transition cursor-pointer flex items-center gap-1"
                                title="Edit Button"
                            >
                                <LuPencil size={12} />
                                <span className="text-[11px] font-medium">Edit</span>
                            </button>

                            <div className="w-[1px] h-3 bg-white/20 mx-0.5" />

                            <button
                                type="button"
                                onClick={deleteNode}
                                className="p-1 rounded-md text-red-400 hover:bg-red-500/30 hover:text-red-200 transition cursor-pointer"
                                title="Remove Button"
                            >
                                <LuTrash2 size={13} />
                            </button>
                        </div>
                    )}

                    {/* Inline Quick Edit Dialog */}
                    {isEditing && (
                        <div
                            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 p-3 bg-white border border-gray-200 rounded-2xl shadow-xl z-30 flex flex-col gap-2 text-left animate-fadeIn"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between pb-1 border-b border-gray-100">
                                <span className="text-xs font-bold text-gray-800">Edit Button</span>
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="text-gray-400 hover:text-gray-600 p-0.5 rounded cursor-pointer"
                                >
                                    <LuX size={14} />
                                </button>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase">Button Text</label>
                                <input
                                    type="text"
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                    className="px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg outline-none focus:border-[#2E0F74]"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase">Target URL</label>
                                <input
                                    type="text"
                                    value={editUrl}
                                    onChange={(e) => setEditUrl(e.target.value)}
                                    className="px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg outline-none focus:border-[#2E0F74]"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase">Color</label>
                                <div className="flex items-center gap-1.5">
                                    {BUTTON_COLORS.map((c) => (
                                        <button
                                            key={c.color}
                                            type="button"
                                            onClick={() => setEditBg(c.color)}
                                            className={`w-5 h-5 rounded-md cursor-pointer border transition-transform ${
                                                editBg === c.color ? "scale-115 border-gray-800 shadow-xs" : "border-gray-200"
                                            }`}
                                            style={{ backgroundColor: c.color }}
                                            title={c.label}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center justify-end gap-1.5 pt-1">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="px-2.5 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100 rounded-lg cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        updateAttributes({
                                            text: editText.trim() || "Click Here",
                                            url: editUrl.trim() || "#",
                                            backgroundColor: editBg,
                                        });
                                        setIsEditing(false);
                                    }}
                                    className="px-3 py-1 text-xs font-bold bg-[#2E0F74] text-white hover:bg-[#37137F] rounded-lg shadow-2xs cursor-pointer"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </NodeViewWrapper>
    );
}

// ─── Custom Email Button Node Extension ──────────────────────────────────────
export const EmailButton = Node.create({
    name: "emailButton",
    group: "block",
    atom: true,
    selectable: true,
    draggable: true,

    addAttributes() {
        return {
            text: {
                default: "Click Here",
                parseHTML: (element) => element.getAttribute("data-text") || element.textContent?.trim() || "Click Here",
                renderHTML: (attributes) => ({ "data-text": attributes.text }),
            },
            url: {
                default: "https://",
                parseHTML: (element) => element.getAttribute("data-url") || element.querySelector("a")?.getAttribute("href") || "#",
                renderHTML: (attributes) => ({ "data-url": attributes.url }),
            },
            alignment: {
                default: "center",
                parseHTML: (element) => element.getAttribute("data-align") || "center",
                renderHTML: (attributes) => ({ "data-align": attributes.alignment }),
            },
            backgroundColor: {
                default: "#2E0F74",
                parseHTML: (element) => element.getAttribute("data-bg") || "#2E0F74",
                renderHTML: (attributes) => ({ "data-bg": attributes.backgroundColor }),
            },
            textColor: {
                default: "#ffffff",
                parseHTML: (element) => element.getAttribute("data-text-color") || "#ffffff",
                renderHTML: (attributes) => ({ "data-text-color": attributes.textColor }),
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: "div[data-type='email-button']",
                getAttrs: (element) => {
                    const el = element as HTMLElement;
                    const a = el.querySelector("a");
                    return {
                        text: el.getAttribute("data-text") || a?.textContent?.trim() || "Click Here",
                        url: el.getAttribute("data-url") || a?.getAttribute("href") || "#",
                        alignment: el.getAttribute("data-align") || "center",
                        backgroundColor: el.getAttribute("data-bg") || "#2E0F74",
                        textColor: el.getAttribute("data-text-color") || "#ffffff",
                    };
                },
            },
        ];
    },

    renderHTML({ node, HTMLAttributes }) {
        const align = node?.attrs?.alignment || HTMLAttributes["data-align"] || "center";
        const bg = node?.attrs?.backgroundColor || HTMLAttributes["data-bg"] || "#2E0F74";
        const color = node?.attrs?.textColor || HTMLAttributes["data-text-color"] || "#ffffff";
        const text = node?.attrs?.text || HTMLAttributes["data-text"] || "Click Here";
        const url = node?.attrs?.url || HTMLAttributes["data-url"] || "#";
        const alignStyle =
            align === "left"
                ? "text-align: left;"
                : align === "right"
                ? "text-align: right;"
                : "text-align: center;";

        return [
            "div",
            mergeAttributes(HTMLAttributes, {
                "data-type": "email-button",
                "data-align": align,
                "data-bg": bg,
                "data-text-color": color,
                "data-text": text,
                "data-url": url,
                style: `margin: 20px 0; ${alignStyle}`,
            }),
            [
                "a",
                {
                    href: url,
                    target: "_blank",
                    rel: "noopener noreferrer",
                    "data-type": "email-button-link",
                    style: `display: inline-block; background-color: ${bg}; color: ${color}; padding: 12px 28px; font-weight: 700; font-size: 14px; text-decoration: none; border-radius: 10px; font-family: Poppins, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif; box-shadow: 0 2px 6px rgba(46, 15, 116, 0.2);`,
                },
                text,
            ],
        ];
    },

    addNodeView() {
        return ReactNodeViewRenderer(ButtonNodeView);
    },

    addCommands() {
        return {
            setButton:
                (options: {
                    text: string;
                    url: string;
                    alignment?: "left" | "center" | "right";
                    backgroundColor?: string;
                    textColor?: string;
                }) =>
                ({ commands }: any) => {
                    return commands.insertContent({
                        type: this.name,
                        attrs: options,
                    });
                },
        };
    },
});

// ─── Component Props ─────────────────────────────────────────────────────────
export interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    minHeight?: string;
    onBlur?: () => void;
    onUploadImage?: (file: File) => Promise<string | null>;
}

const TEXT_COLORS = [
    { label: "Default", color: "#1F2937" },
    { label: "Deep Purple", color: "#2E0F74" },
    { label: "Brand Violet", color: "#7047EB" },
    { label: "Crimson Red", color: "#DC2626" },
    { label: "Emerald Green", color: "#16A34A" },
    { label: "Royal Blue", color: "#2563EB" },
    { label: "Amber Orange", color: "#D97706" },
    { label: "Muted Gray", color: "#6B7280" },
];

const HIGHLIGHT_COLORS = [
    { label: "Yellow", color: "#FEF08A" },
    { label: "Soft Purple", color: "#EDE9FE" },
    { label: "Soft Green", color: "#DCFCE7" },
    { label: "Soft Pink", color: "#FCE7F3" },
    { label: "Soft Blue", color: "#E0F2FE" },
    { label: "Soft Orange", color: "#FFEDD5" },
];

const FONT_SIZES = [
    { label: "Font Size", value: "" },
    { label: "12px - Small", value: "12px" },
    { label: "14px - Normal", value: "14px" },
    { label: "16px - Medium", value: "16px" },
    { label: "18px - Large", value: "18px" },
    { label: "20px - Extra Large", value: "20px" },
    { label: "24px - Heading 2", value: "24px" },
    { label: "28px - Heading 1", value: "28px" },
    { label: "32px - Display", value: "32px" },
    { label: "Default Size", value: "default" },
];

// ─── Main RichTextEditor Component ───────────────────────────────────────────
export default function RichTextEditor({
    value,
    onChange,
    placeholder = "Type your message body here...",
    className = "",
    minHeight = "180px",
    onBlur,
    onUploadImage,
}: RichTextEditorProps) {
    // Modal states
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [linkUrl, setLinkUrl] = useState("");
    const [linkText, setLinkText] = useState("");
    const [isLinkTextRequired, setIsLinkTextRequired] = useState(false);

    const [isColorMenuOpen, setIsColorMenuOpen] = useState(false);
    const [isHighlightMenuOpen, setIsHighlightMenuOpen] = useState(false);

    // Image Modal states
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [imageTab, setImageTab] = useState<"upload" | "url">("upload");
    const [imageUrlInput, setImageUrlInput] = useState("");
    const [imageAltInput, setImageAltInput] = useState("");
    const [imageAlignment, setImageAlignment] = useState<"left" | "center" | "right">("center");
    const [imageWidth, setImageWidth] = useState<"100%" | "75%" | "50%">("100%");
    const [isUploadingLocalImage, setIsUploadingLocalImage] = useState(false);
    const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);

    // Button Modal states
    const [isButtonModalOpen, setIsButtonModalOpen] = useState(false);
    const [buttonTextInput, setButtonTextInput] = useState("Register Now");
    const [buttonUrlInput, setButtonUrlInput] = useState("https://");
    const [buttonAlignment, setButtonAlignment] = useState<"left" | "center" | "right">("center");
    const [buttonBgColor, setButtonBgColor] = useState("#2E0F74");

    const colorMenuRef = useRef<HTMLDivElement>(null);
    const highlightMenuRef = useRef<HTMLDivElement>(null);
    const imageFileInputRef = useRef<HTMLInputElement>(null);

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
            }),
            Underline,
            TextStyle,
            FontSize,
            Color,
            Highlight.configure({ multicolor: true }),
            TextAlign.configure({
                types: ["heading", "paragraph"],
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: "text-[#7047EB] underline font-medium hover:text-[#2E0F74]",
                    target: "_blank",
                    rel: "noopener noreferrer",
                },
            }),
            Placeholder.configure({
                placeholder,
                emptyEditorClass: "is-editor-empty",
            }),
            CustomImage,
            EmailButton,
        ],
        content: value || "",
        onUpdate: ({ editor: ed }) => {
            const html = ed.getHTML();
            if (ed.isEmpty) {
                onChange("");
            } else {
                onChange(html);
            }
        },
        onBlur: () => {
            onBlur?.();
        },
        editorProps: {
            attributes: {
                class:
                    "tiptap focus:outline-none min-h-[160px] p-4 text-xs sm:text-sm text-gray-800 leading-relaxed font-sans",
            },
            handleDrop: (_view, event, _slice, moved) => {
                if (!moved && event.dataTransfer?.files?.length) {
                    const files = Array.from(event.dataTransfer.files).filter((f) =>
                        f.type.startsWith("image/")
                    );
                    if (files.length > 0) {
                        event.preventDefault();
                        files.forEach(async (file) => {
                            if (onUploadImage) {
                                const url = await onUploadImage(file);
                                if (url && editor) {
                                    editor
                                        .chain()
                                        .focus()
                                        .setImage({
                                            src: url,
                                            alt: file.name,
                                            alignment: "center",
                                            width: "100%",
                                        })
                                        .run();
                                }
                            }
                        });
                        return true;
                    }
                }
                return false;
            },
        },
    });

    // Close popovers on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                colorMenuRef.current &&
                !colorMenuRef.current.contains(event.target as HTMLElement)
            ) {
                setIsColorMenuOpen(false);
            }
            if (
                highlightMenuRef.current &&
                !highlightMenuRef.current.contains(event.target as HTMLElement)
            ) {
                setIsHighlightMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Synchronize content if controlled value changes from outside
    useEffect(() => {
        if (!editor) return;
        const currentHtml = editor.getHTML();
        if (value !== currentHtml && (value || !editor.isEmpty)) {
            if (!value && !editor.isEmpty) {
                editor.commands.clearContent();
            } else if (value && value !== currentHtml) {
                editor.commands.setContent(value);
            }
        }
    }, [value, editor]);

    if (!editor) {
        return null;
    }

    // ─── Responsive Link Handlers ─────────────────────────────────────────────
    const openLinkDialog = () => {
        const { from, to } = editor.state.selection;
        const selectedText = editor.state.doc.textBetween(from, to);
        const previousUrl = editor.getAttributes("link").href || "";

        setLinkUrl(previousUrl);
        setLinkText(selectedText || "");
        setIsLinkTextRequired(!selectedText);
        setIsLinkModalOpen(true);
        setIsColorMenuOpen(false);
        setIsHighlightMenuOpen(false);
    };

    const applyLink = () => {
        const trimmedUrl = linkUrl.trim();
        if (!trimmedUrl) {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
        } else {
            const formatted =
                trimmedUrl.startsWith("http://") || trimmedUrl.startsWith("https://")
                    ? trimmedUrl
                    : `https://${trimmedUrl}`;

            const { from, to } = editor.state.selection;
            const hasSelection = from !== to;

            if (!hasSelection) {
                const label = linkText.trim() || formatted;
                editor
                    .chain()
                    .focus()
                    .insertContent(`<a href="${formatted}" target="_blank" rel="noopener noreferrer">${label}</a>`)
                    .run();
            } else {
                editor
                    .chain()
                    .focus()
                    .extendMarkRange("link")
                    .setLink({ href: formatted })
                    .run();
            }
        }
        setIsLinkModalOpen(false);
        setLinkUrl("");
        setLinkText("");
    };

    const removeLink = () => {
        editor.chain().focus().extendMarkRange("link").unsetLink().run();
        setIsLinkModalOpen(false);
        setLinkUrl("");
        setLinkText("");
    };

    // ─── Image Insertion Handlers ─────────────────────────────────────────────
    const handleFileSelectForImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const allowed = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"];
        if (!allowed.includes(file.type.toLowerCase())) {
            toast.danger("Please select a valid image (PNG, JPG, GIF, WebP)");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.danger("Image size must be 5MB or less");
            return;
        }

        setIsUploadingLocalImage(true);
        try {
            if (onUploadImage) {
                const url = await onUploadImage(file);
                if (url) {
                    setUploadedImagePreview(url);
                    setImageUrlInput(url);
                    if (!imageAltInput) setImageAltInput(file.name);
                    toast.success("Image uploaded!");
                } else {
                    toast.danger("Failed to upload image");
                }
            } else {
                // Fallback to data URL
                const reader = new FileReader();
                reader.onload = (evt) => {
                    const dataUrl = evt.target?.result as string;
                    setUploadedImagePreview(dataUrl);
                    setImageUrlInput(dataUrl);
                    if (!imageAltInput) setImageAltInput(file.name);
                };
                reader.readAsDataURL(file);
            }
        } catch {
            toast.danger("Error uploading image");
        } finally {
            setIsUploadingLocalImage(false);
        }
        e.target.value = "";
    };

    const insertImageToEditor = () => {
        const src = imageUrlInput.trim();
        if (!src) {
            toast.danger("Please select an image to upload or enter an image URL");
            return;
        }
        editor
            .chain()
            .focus()
            .setImage({
                src,
                alt: imageAltInput.trim() || "Image",
                alignment: imageAlignment,
                width: imageWidth,
            })
            .run();

        setIsImageModalOpen(false);
        setImageUrlInput("");
        setImageAltInput("");
        setUploadedImagePreview(null);
        toast.success("Image added to message!");
    };

    // ─── Button Insertion Handlers ────────────────────────────────────────────
    const insertButtonToEditor = () => {
        const text = buttonTextInput.trim() || "Click Here";
        let url = buttonUrlInput.trim() || "#";
        if (url !== "#" && !url.startsWith("http://") && !url.startsWith("https://")) {
            url = `https://${url}`;
        }

        editor
            .chain()
            .focus()
            .setButton({
                text,
                url,
                alignment: buttonAlignment,
                backgroundColor: buttonBgColor,
                textColor: "#ffffff",
            })
            .run();

        setIsButtonModalOpen(false);
        setButtonTextInput("Register Now");
        setButtonUrlInput("https://");
        toast.success("Button added to message!");
    };

    const toolBtnClass = (isActive: boolean, disabled: boolean = false) =>
        `p-1.5 rounded-lg text-xs transition-colors flex items-center justify-center cursor-pointer ${
            disabled
                ? "text-gray-300 cursor-not-allowed"
                : isActive
                ? "bg-[#2E0F74] text-white shadow-2xs"
                : "text-gray-600 hover:text-[#2E0F74] hover:bg-purple-50"
        }`;

    const currentFontSize = editor.getAttributes("textStyle").fontSize || "";

    return (
        <div
            className={`w-full border border-gray-200 rounded-xl overflow-hidden focus-within:border-[#2E0F74] focus-within:ring-1 focus-within:ring-[#2E0F74] transition-all bg-white flex flex-col shadow-2xs ${className}`}
        >
            {/* Hidden file input for images */}
            <input
                type="file"
                ref={imageFileInputRef}
                onChange={handleFileSelectForImage}
                accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
                className="hidden"
            />

            {/* WYSIWYG Toolbar */}
            <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 p-2 bg-[#F9FAFB] border-b border-gray-200 select-none relative">
                {/* Undo / Redo */}
                <button
                    type="button"
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                    title="Undo (Ctrl+Z)"
                    className={toolBtnClass(false, !editor.can().undo())}
                >
                    <LuUndo size={14} />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                    title="Redo (Ctrl+Y)"
                    className={toolBtnClass(false, !editor.can().redo())}
                >
                    <LuRedo size={14} />
                </button>

                <div className="w-[1px] h-4 bg-gray-200 mx-0.5" />

                {/* Headings */}
                <button
                    type="button"
                    onClick={() => editor.chain().focus().setParagraph().run()}
                    title="Normal text"
                    className={toolBtnClass(editor.isActive("paragraph") && !editor.isActive("heading"))}
                >
                    <span className="text-[11px] font-bold px-1">P</span>
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    title="Heading 1"
                    className={toolBtnClass(editor.isActive("heading", { level: 1 }))}
                >
                    <LuHeading1 size={14} />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    title="Heading 2"
                    className={toolBtnClass(editor.isActive("heading", { level: 2 }))}
                >
                    <LuHeading2 size={14} />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    title="Heading 3"
                    className={toolBtnClass(editor.isActive("heading", { level: 3 }))}
                >
                    <LuHeading3 size={14} />
                </button>

                <div className="w-[1px] h-4 bg-gray-200 mx-0.5" />

                {/* Font Size Dropdown */}
                <select
                    value={currentFontSize}
                    onChange={(e) => {
                        const val = e.target.value;
                        if (!val || val === "default") {
                            editor.chain().focus().unsetFontSize().run();
                        } else {
                            editor.chain().focus().setFontSize(val).run();
                        }
                    }}
                    className="bg-white border border-gray-200 text-gray-700 font-semibold text-xs px-2 py-1 rounded-lg outline-none cursor-pointer hover:border-[#2E0F74] focus:border-[#2E0F74] shadow-2xs h-7"
                    title="Change Font Size"
                >
                    {FONT_SIZES.map((f) => (
                        <option key={f.value} value={f.value}>
                            {f.label}
                        </option>
                    ))}
                </select>

                <div className="w-[1px] h-4 bg-gray-200 mx-0.5" />

                {/* Text Formatting */}
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    title="Bold (Ctrl+B)"
                    className={toolBtnClass(editor.isActive("bold"))}
                >
                    <LuBold size={14} />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    title="Italic (Ctrl+I)"
                    className={toolBtnClass(editor.isActive("italic"))}
                >
                    <LuItalic size={14} />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    title="Underline (Ctrl+U)"
                    className={toolBtnClass(editor.isActive("underline"))}
                >
                    <LuUnderline size={14} />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    title="Strikethrough"
                    className={toolBtnClass(editor.isActive("strike"))}
                >
                    <LuStrikethrough size={14} />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    title="Inline Code"
                    className={toolBtnClass(editor.isActive("code"))}
                >
                    <LuCode size={14} />
                </button>

                <div className="w-[1px] h-4 bg-gray-200 mx-0.5" />

                {/* Text Color Picker */}
                <div className="relative" ref={colorMenuRef}>
                    <button
                        type="button"
                        onClick={() => {
                            setIsColorMenuOpen(!isColorMenuOpen);
                            setIsHighlightMenuOpen(false);
                        }}
                        title="Text Color"
                        className={`flex items-center gap-0.5 p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                            isColorMenuOpen ? "bg-[#2E0F74] text-white" : "text-gray-600 hover:text-[#2E0F74] hover:bg-purple-50"
                        }`}
                    >
                        <LuBaseline size={14} />
                        <span
                            className="w-2 h-2 rounded-full border border-gray-300 ml-0.5"
                            style={{
                                backgroundColor:
                                    editor.getAttributes("textStyle").color || "#1F2937",
                            }}
                        />
                    </button>

                    {isColorMenuOpen && (
                        <div className="absolute top-full left-0 mt-1 z-30 bg-white border border-gray-200 rounded-xl shadow-lg p-2.5 flex flex-col gap-2 min-w-[160px] animate-fadeIn">
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-1">
                                Text Color
                            </span>
                            <div className="grid grid-cols-4 gap-1.5">
                                {TEXT_COLORS.map((c) => (
                                    <button
                                        key={c.color}
                                        type="button"
                                        onClick={() => {
                                            editor.chain().focus().setColor(c.color).run();
                                            setIsColorMenuOpen(false);
                                        }}
                                        title={c.label}
                                        className="w-6 h-6 rounded-md border border-gray-200 hover:scale-110 transition-transform cursor-pointer flex items-center justify-center"
                                        style={{ backgroundColor: c.color }}
                                    >
                                        {editor.getAttributes("textStyle").color === c.color && (
                                            <LuCheck size={12} className="text-white drop-shadow-xs" />
                                        )}
                                    </button>
                                ))}
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    editor.chain().focus().unsetColor().run();
                                    setIsColorMenuOpen(false);
                                }}
                                className="text-[11px] font-medium text-gray-600 hover:text-[#2E0F74] hover:bg-purple-50 px-2 py-1 rounded-md text-left transition-colors cursor-pointer"
                            >
                                Reset to Default Color
                            </button>
                        </div>
                    )}
                </div>

                {/* Highlight Color Picker */}
                <div className="relative" ref={highlightMenuRef}>
                    <button
                        type="button"
                        onClick={() => {
                            setIsHighlightMenuOpen(!isHighlightMenuOpen);
                            setIsColorMenuOpen(false);
                        }}
                        title="Highlight Color"
                        className={`flex items-center gap-0.5 p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                            editor.isActive("highlight") || isHighlightMenuOpen
                                ? "bg-amber-100 text-amber-900 border border-amber-300"
                                : "text-gray-600 hover:text-[#2E0F74] hover:bg-purple-50"
                        }`}
                    >
                        <LuHighlighter size={14} />
                    </button>

                    {isHighlightMenuOpen && (
                        <div className="absolute top-full left-0 mt-1 z-30 bg-white border border-gray-200 rounded-xl shadow-lg p-2.5 flex flex-col gap-2 min-w-[160px] animate-fadeIn">
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-1">
                                Highlight
                            </span>
                            <div className="grid grid-cols-3 gap-1.5">
                                {HIGHLIGHT_COLORS.map((c) => (
                                    <button
                                        key={c.color}
                                        type="button"
                                        onClick={() => {
                                            editor
                                                .chain()
                                                .focus()
                                                .toggleHighlight({ color: c.color })
                                                .run();
                                            setIsHighlightMenuOpen(false);
                                        }}
                                        title={c.label}
                                        className="h-6 rounded-md border border-gray-200 hover:scale-105 transition-transform cursor-pointer flex items-center justify-center text-[10px] font-semibold text-gray-800"
                                        style={{ backgroundColor: c.color }}
                                    >
                                        Aa
                                    </button>
                                ))}
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    editor.chain().focus().unsetHighlight().run();
                                    setIsHighlightMenuOpen(false);
                                }}
                                className="text-[11px] font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded-md text-left transition-colors cursor-pointer"
                            >
                                Remove Highlight
                            </button>
                        </div>
                    )}
                </div>

                {/* Clear Formatting */}
                <button
                    type="button"
                    onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
                    title="Clear Formatting"
                    className={toolBtnClass(false)}
                >
                    <LuRemoveFormatting size={14} />
                </button>

                <div className="w-[1px] h-4 bg-gray-200 mx-0.5" />

                {/* Alignment */}
                <button
                    type="button"
                    onClick={() => editor.chain().focus().setTextAlign("left").run()}
                    title="Align Left"
                    className={toolBtnClass(editor.isActive({ textAlign: "left" }))}
                >
                    <LuAlignLeft size={14} />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().setTextAlign("center").run()}
                    title="Align Center"
                    className={toolBtnClass(editor.isActive({ textAlign: "center" }))}
                >
                    <LuAlignCenter size={14} />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().setTextAlign("right").run()}
                    title="Align Right"
                    className={toolBtnClass(editor.isActive({ textAlign: "right" }))}
                >
                    <LuAlignRight size={14} />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().setTextAlign("justify").run()}
                    title="Align Justify"
                    className={toolBtnClass(editor.isActive({ textAlign: "justify" }))}
                >
                    <LuAlignJustify size={14} />
                </button>

                <div className="w-[1px] h-4 bg-gray-200 mx-0.5" />

                {/* Lists & Quotes */}
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    title="Bullet List"
                    className={toolBtnClass(editor.isActive("bulletList"))}
                >
                    <LuList size={14} />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    title="Numbered List"
                    className={toolBtnClass(editor.isActive("orderedList"))}
                >
                    <LuListOrdered size={14} />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    title="Blockquote"
                    className={toolBtnClass(editor.isActive("blockquote"))}
                >
                    <LuQuote size={14} />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().setHorizontalRule().run()}
                    title="Horizontal Divider"
                    className={toolBtnClass(false)}
                >
                    <LuMinus size={14} />
                </button>

                <div className="w-[1px] h-4 bg-gray-200 mx-0.5" />

                {/* Link Tool */}
                <button
                    type="button"
                    onClick={openLinkDialog}
                    title="Insert Link"
                    className={toolBtnClass(editor.isActive("link"))}
                >
                    <LuLink size={14} />
                </button>
                {editor.isActive("link") && (
                    <button
                        type="button"
                        onClick={removeLink}
                        title="Remove Link"
                        className={toolBtnClass(false)}
                    >
                        <LuLink2Off size={14} />
                    </button>
                )}

                <div className="w-[1px] h-4 bg-gray-200 mx-0.5" />

                {/* Insert Image Tool */}
                <button
                    type="button"
                    onClick={() => {
                        setIsImageModalOpen(true);
                        setImageUrlInput("");
                        setUploadedImagePreview(null);
                    }}
                    title="Insert Image (Upload or URL)"
                    className="p-1.5 rounded-lg text-xs transition-colors flex items-center gap-1 cursor-pointer text-gray-700 hover:text-[#2E0F74] hover:bg-purple-50 font-medium"
                >
                    <LuImage size={14} className="text-[#7047EB]" />
                    <span className="hidden md:inline text-[11px] font-semibold">Image</span>
                </button>

                {/* Insert CTA Button Tool */}
                <button
                    type="button"
                    onClick={() => setIsButtonModalOpen(true)}
                    title="Insert Call-To-Action Button"
                    className="p-1.5 rounded-lg text-xs transition-colors flex items-center gap-1 cursor-pointer text-gray-700 hover:text-[#2E0F74] hover:bg-purple-50 font-medium"
                >
                    <LuMousePointerClick size={14} className="text-[#7047EB]" />
                    <span className="hidden md:inline text-[11px] font-semibold">Button</span>
                </button>
            </div>

            {/* ─── Fully Responsive Link Input Popover ────────────────────────── */}
            {isLinkModalOpen && (
                <div className="p-3 bg-purple-50/80 border-b border-purple-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 animate-fadeIn">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#2E0F74] shrink-0">
                        <LuLink size={15} />
                        <span>Link:</span>
                    </div>

                    {isLinkTextRequired && (
                        <input
                            type="text"
                            value={linkText}
                            onChange={(e) => setLinkText(e.target.value)}
                            placeholder="Display text (e.g. Visit Website)"
                            className="w-full sm:w-48 px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-[#2E0F74] text-gray-800"
                        />
                    )}

                    <input
                        type="url"
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        placeholder="https://example.com"
                        className="flex-1 min-w-0 px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-[#2E0F74] text-gray-800"
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                applyLink();
                            } else if (e.key === "Escape") {
                                setIsLinkModalOpen(false);
                            }
                        }}
                        autoFocus
                    />

                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                        <button
                            type="button"
                            onClick={applyLink}
                            className="px-3 py-1.5 rounded-lg bg-[#2E0F74] text-white hover:bg-[#37137F] text-xs font-semibold cursor-pointer shadow-2xs flex items-center gap-1"
                        >
                            <LuCheck size={14} />
                            <span>Apply</span>
                        </button>
                        {editor.isActive("link") && (
                            <button
                                type="button"
                                onClick={removeLink}
                                className="px-2.5 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold cursor-pointer"
                                title="Remove Link"
                            >
                                Remove
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => setIsLinkModalOpen(false)}
                            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200 cursor-pointer"
                            title="Cancel"
                        >
                            <LuX size={15} />
                        </button>
                    </div>
                </div>
            )}

            {/* ─── Responsive Insert Image Modal ─────────────────────────────── */}
            {isImageModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn">
                    <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-gray-100 flex flex-col gap-4 text-left animate-zoomIn">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#7047EB] flex items-center justify-center">
                                    <LuImage size={18} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm text-gray-900">Insert Image</h3>
                                    <p className="text-[11px] text-gray-500">Position images anywhere in your message</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsImageModalOpen(false)}
                                className="text-gray-400 hover:text-gray-700 p-1 rounded-lg cursor-pointer"
                            >
                                <LuX size={18} />
                            </button>
                        </div>

                        {/* Tabs: Upload vs Link */}
                        <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
                            <button
                                type="button"
                                onClick={() => setImageTab("upload")}
                                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                                    imageTab === "upload"
                                        ? "bg-white text-[#2E0F74] shadow-xs"
                                        : "text-gray-500 hover:text-gray-800"
                                }`}
                            >
                                <LuUpload size={13} />
                                <span>Upload File</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setImageTab("url")}
                                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                                    imageTab === "url"
                                        ? "bg-white text-[#2E0F74] shadow-xs"
                                        : "text-gray-500 hover:text-gray-800"
                                }`}
                            >
                                <LuExternalLink size={13} />
                                <span>Image URL</span>
                            </button>
                        </div>

                        {imageTab === "upload" ? (
                            <div className="flex flex-col gap-3">
                                {uploadedImagePreview ? (
                                    <div className="relative rounded-2xl overflow-hidden border border-purple-200 bg-purple-50/40 p-2 flex flex-col items-center gap-2">
                                        <img
                                            src={uploadedImagePreview}
                                            alt="Preview"
                                            className="max-h-40 rounded-xl object-contain"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setUploadedImagePreview(null);
                                                setImageUrlInput("");
                                            }}
                                            className="text-xs font-semibold text-red-600 hover:underline cursor-pointer"
                                        >
                                            Change image
                                        </button>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => imageFileInputRef.current?.click()}
                                        className="border-2 border-dashed border-gray-200 hover:border-[#7047EB] rounded-2xl p-6 flex flex-col items-center justify-center gap-2 text-center cursor-pointer transition hover:bg-purple-50/30"
                                    >
                                        {isUploadingLocalImage ? (
                                            <div className="flex flex-col items-center gap-2 text-[#7047EB]">
                                                <Spinner size="md" color="current" />
                                                <span className="text-xs font-bold">Uploading image to server CDN...</span>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="w-10 h-10 rounded-full bg-purple-100 text-[#7047EB] flex items-center justify-center">
                                                    <LuUpload size={20} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-gray-800">
                                                        Click to browse or drop image here
                                                    </span>
                                                    <span className="text-[10px] text-gray-400 mt-0.5">
                                                        PNG, JPG, GIF, WebP up to 5MB
                                                    </span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-semibold text-gray-700">Image Web Address</label>
                                <input
                                    type="url"
                                    value={imageUrlInput}
                                    onChange={(e) => setImageUrlInput(e.target.value)}
                                    placeholder="https://example.com/photo.jpg"
                                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl outline-none focus:border-[#2E0F74]"
                                />
                            </div>
                        )}

                        {/* Alignment & Width controls */}
                        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-gray-500 uppercase">Position</label>
                                <div className="flex items-center bg-gray-100 p-1 rounded-xl gap-1">
                                    {(["left", "center", "right"] as const).map((align) => (
                                        <button
                                            key={align}
                                            type="button"
                                            onClick={() => setImageAlignment(align)}
                                            className={`flex-1 py-1 rounded-lg text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                                                imageAlignment === align
                                                    ? "bg-[#2E0F74] text-white shadow-2xs"
                                                    : "text-gray-600 hover:text-gray-900"
                                            }`}
                                            title={`Align ${align}`}
                                        >
                                            {align === "left" && <LuAlignLeft size={14} />}
                                            {align === "center" && <LuAlignCenter size={14} />}
                                            {align === "right" && <LuAlignRight size={14} />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-gray-500 uppercase">Width</label>
                                <div className="flex items-center bg-gray-100 p-1 rounded-xl gap-1">
                                    {(["100%", "75%", "50%"] as const).map((w) => (
                                        <button
                                            key={w}
                                            type="button"
                                            onClick={() => setImageWidth(w)}
                                            className={`flex-1 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                                                imageWidth === w
                                                    ? "bg-[#2E0F74] text-white shadow-2xs"
                                                    : "text-gray-600 hover:text-gray-900"
                                            }`}
                                        >
                                            {w}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Modal Actions */}
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => setIsImageModalOpen(false)}
                                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={insertImageToEditor}
                                disabled={isUploadingLocalImage || !imageUrlInput.trim()}
                                className="px-5 py-2.5 text-xs font-bold bg-[#2E0F74] text-white hover:bg-[#37137F] rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Insert Image
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── Responsive Insert Button Modal ────────────────────────────── */}
            {isButtonModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn">
                    <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-gray-100 flex flex-col gap-4 text-left animate-zoomIn">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#7047EB] flex items-center justify-center">
                                    <LuMousePointerClick size={18} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm text-gray-900">Insert CTA Button</h3>
                                    <p className="text-[11px] text-gray-500">Add an action button and position it anywhere</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsButtonModalOpen(false)}
                                className="text-gray-400 hover:text-gray-700 p-1 rounded-lg cursor-pointer"
                            >
                                <LuX size={18} />
                            </button>
                        </div>

                        <div className="flex flex-col gap-3">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-gray-700">Button Text</label>
                                <input
                                    type="text"
                                    value={buttonTextInput}
                                    onChange={(e) => setButtonTextInput(e.target.value)}
                                    placeholder="e.g. Register Now, Buy Tickets"
                                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl outline-none focus:border-[#2E0F74]"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-gray-700">Target URL</label>
                                <input
                                    type="url"
                                    value={buttonUrlInput}
                                    onChange={(e) => setButtonUrlInput(e.target.value)}
                                    placeholder="https://example.com/event"
                                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl outline-none focus:border-[#2E0F74]"
                                />
                            </div>

                            {/* Position & Color row */}
                            <div className="grid grid-cols-2 gap-3 pt-1">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase">Position</label>
                                    <div className="flex items-center bg-gray-100 p-1 rounded-xl gap-1">
                                        {(["left", "center", "right"] as const).map((align) => (
                                            <button
                                                key={align}
                                                type="button"
                                                onClick={() => setButtonAlignment(align)}
                                                className={`flex-1 py-1 rounded-lg text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                                                    buttonAlignment === align
                                                        ? "bg-[#2E0F74] text-white shadow-2xs"
                                                        : "text-gray-600 hover:text-gray-900"
                                                }`}
                                                title={`Align ${align}`}
                                            >
                                                {align === "left" && <LuAlignLeft size={14} />}
                                                {align === "center" && <LuAlignCenter size={14} />}
                                                {align === "right" && <LuAlignRight size={14} />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase">Color</label>
                                    <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                                        {BUTTON_COLORS.map((c) => (
                                            <button
                                                key={c.color}
                                                type="button"
                                                onClick={() => setButtonBgColor(c.color)}
                                                className={`w-6 h-6 rounded-lg cursor-pointer border transition-transform ${
                                                    buttonBgColor === c.color
                                                        ? "scale-115 border-gray-800 shadow-xs"
                                                        : "border-gray-200"
                                                }`}
                                                style={{ backgroundColor: c.color }}
                                                title={c.label}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Live Mini Preview */}
                            <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col gap-1">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Preview</span>
                                <div
                                    className={`w-full flex ${
                                        buttonAlignment === "left"
                                            ? "justify-start"
                                            : buttonAlignment === "right"
                                            ? "justify-end"
                                            : "justify-center"
                                    }`}
                                >
                                    <div
                                        style={{ backgroundColor: buttonBgColor }}
                                        className="px-5 py-2.5 rounded-xl font-bold text-xs text-white shadow-md inline-block"
                                    >
                                        {buttonTextInput.trim() || "Button"}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Actions */}
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => setIsButtonModalOpen(false)}
                                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={insertButtonToEditor}
                                className="px-5 py-2.5 text-xs font-bold bg-[#2E0F74] text-white hover:bg-[#37137F] rounded-xl shadow-xs transition cursor-pointer"
                            >
                                Insert Button
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Editor Canvas */}
            <div style={{ minHeight }} className="w-full flex-1 cursor-text bg-white">
                <EditorContent editor={editor} />
            </div>
        </div>
    );
}
