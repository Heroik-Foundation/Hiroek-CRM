import { useEffect, useState, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
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
} from "react-icons/lu";

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    minHeight?: string;
    onBlur?: () => void;
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

export default function RichTextEditor({
    value,
    onChange,
    placeholder = "Type your message body here...",
    className = "",
    minHeight = "180px",
    onBlur,
}: RichTextEditorProps) {
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [linkUrl, setLinkUrl] = useState("");
    const [isColorMenuOpen, setIsColorMenuOpen] = useState(false);
    const [isHighlightMenuOpen, setIsHighlightMenuOpen] = useState(false);

    const colorMenuRef = useRef<HTMLDivElement>(null);
    const highlightMenuRef = useRef<HTMLDivElement>(null);

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
        },
    });

    // Close popovers on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                colorMenuRef.current &&
                !colorMenuRef.current.contains(event.target as Node)
            ) {
                setIsColorMenuOpen(false);
            }
            if (
                highlightMenuRef.current &&
                !highlightMenuRef.current.contains(event.target as Node)
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

    const openLinkDialog = () => {
        const previousUrl = editor.getAttributes("link").href || "";
        setLinkUrl(previousUrl);
        setIsLinkModalOpen(true);
        setIsColorMenuOpen(false);
        setIsHighlightMenuOpen(false);
    };

    const applyLink = () => {
        if (!linkUrl.trim()) {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
        } else {
            const formatted =
                linkUrl.startsWith("http://") || linkUrl.startsWith("https://")
                    ? linkUrl.trim()
                    : `https://${linkUrl.trim()}`;
            editor
                .chain()
                .focus()
                .extendMarkRange("link")
                .setLink({ href: formatted })
                .run();
        }
        setIsLinkModalOpen(false);
        setLinkUrl("");
    };

    const removeLink = () => {
        editor.chain().focus().extendMarkRange("link").unsetLink().run();
        setIsLinkModalOpen(false);
        setLinkUrl("");
    };

    const toolBtnClass = (isActive: boolean, disabled: boolean = false) =>
        `p-1.5 rounded-lg text-xs transition-colors flex items-center justify-center cursor-pointer ${
            disabled
                ? "text-gray-300 cursor-not-allowed"
                : isActive
                ? "bg-[#2E0F74] text-white shadow-2xs"
                : "text-gray-600 hover:text-[#2E0F74] hover:bg-purple-50"
        }`;

    return (
        <div
            className={`w-full border border-gray-200 rounded-xl overflow-hidden focus-within:border-[#2E0F74] focus-within:ring-1 focus-within:ring-[#2E0F74] transition-all bg-white flex flex-col shadow-2xs ${className}`}
        >
            {/* WYSIWYG Toolbar */}
            <div className="flex flex-wrap items-center gap-1 p-2 bg-[#F9FAFB] border-b border-gray-200 select-none relative">
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

                <div className="w-[1px] h-4 bg-gray-200 mx-1" />

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

                <div className="w-[1px] h-4 bg-gray-200 mx-1" />

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

                <div className="w-[1px] h-4 bg-gray-200 mx-1" />

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

                <div className="w-[1px] h-4 bg-gray-200 mx-1" />

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

                <div className="w-[1px] h-4 bg-gray-200 mx-1" />

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

                <div className="w-[1px] h-4 bg-gray-200 mx-1" />

                {/* Link */}
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
            </div>

            {/* Quick Link Input Popover */}
            {isLinkModalOpen && (
                <div className="flex items-center gap-2 p-2 bg-purple-50/70 border-b border-purple-100 animate-fadeIn">
                    <LuLink size={14} className="text-[#2E0F74] shrink-0 ml-1" />
                    <input
                        type="url"
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        placeholder="https://example.com"
                        className="flex-1 px-2.5 py-1 text-xs bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-[#2E0F74] text-gray-800"
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
                    <button
                        type="button"
                        onClick={applyLink}
                        className="p-1 rounded-lg bg-[#2E0F74] text-white hover:bg-[#37137F] cursor-pointer"
                        title="Apply link"
                    >
                        <LuCheck size={14} />
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsLinkModalOpen(false)}
                        className="p-1 rounded-lg text-gray-500 hover:bg-gray-200 cursor-pointer"
                        title="Cancel"
                    >
                        <LuX size={14} />
                    </button>
                </div>
            )}

            {/* Editor Canvas */}
            <div style={{ minHeight }} className="w-full flex-1 cursor-text bg-white">
                <EditorContent editor={editor} />
            </div>
        </div>
    );
}
