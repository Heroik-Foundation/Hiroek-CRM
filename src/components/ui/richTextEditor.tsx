import { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
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
} from "react-icons/lu";

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    minHeight?: string;
    onBlur?: () => void;
}

export default function RichTextEditor({
    value,
    onChange,
    placeholder = "Type your message body here...",
    className = "",
    minHeight = "160px",
    onBlur,
}: RichTextEditorProps) {
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [linkUrl, setLinkUrl] = useState("");

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
            }),
            Underline,
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
            // If empty (e.g. only <p></p>), treat as empty string
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
                    "prose max-w-none focus:outline-none min-h-[140px] p-3 text-xs sm:text-sm text-gray-800 leading-relaxed",
            },
        },
    });

    // Synchronize content if controlled value changes from outside (e.g. reset or template)
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
    };

    const applyLink = () => {
        if (!linkUrl.trim()) {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
        } else {
            const formatted = linkUrl.startsWith("http://") || linkUrl.startsWith("https://")
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
            className={`w-full border border-gray-200 rounded-xl overflow-hidden focus-within:border-[#2E0F74] focus-within:ring-1 focus-within:ring-[#2E0F74] transition-all bg-white flex flex-col ${className}`}
        >
            {/* WYSIWYG Toolbar */}
            <div className="flex flex-wrap items-center gap-1 p-2 bg-[#F9FAFB] border-b border-gray-200 select-none">
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
