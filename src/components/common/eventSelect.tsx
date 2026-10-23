import { useState, useRef, useEffect, useMemo } from "react";
import { IoSearch, IoChevronDown, IoCloseCircle, IoCheckmark } from "react-icons/io5";
import useEvents, { type EventItem } from "../../hooks/useEvents";
import useTicketScans from "../../hooks/useTicketScans";

export interface EventOption {
    id?: string;
    name: string;
    photo?: string;
    description?: string;
    raw?: EventItem;
}

export interface EventSelectProps {
    /** Currently selected event value (matches event name or id, or "All Events") */
    value?: string;
    /** Optional currently selected event ID specifically */
    selectedId?: string;
    /**
     * Callback when selection changes
     * @param event The EventItem object (or null if "All Events" is selected)
     * @param eventId The event._id (or undefined if "All Events")
     * @param eventName The event title/name string (e.g. "Tech Summit 2026" or "All Events")
     */
    onChange?: (event: EventItem | null, eventId?: string, eventName?: string) => void;
    /** Button visual style: "pill" (primary purple button) | "outline" (white background with border) */
    variant?: "pill" | "outline";
    /** Whether to show the "All Events" option at the top. Default: true */
    includeAllOption?: boolean;
    /** Label for the "All Events" option. Default: "All Events" */
    allOptionLabel?: string;
    /** Optional label displayed above the select component */
    label?: string;
    /** Placeholder text when nothing is selected */
    placeholder?: string;
    /** Additional class names for the container */
    className?: string;
    /** Additional class names for the trigger button */
    buttonClassName?: string;
    /** Additional class names for the dropdown menu */
    dropdownClassName?: string;
    /** Custom list of events (bypasses automatic API fetching if provided) */
    customEvents?: EventItem[];
    /** Whether to automatically fetch events from GET /api/events. Default: true */
    autoFetch?: boolean;
    /** Disable the dropdown */
    disabled?: boolean;
}

/**
 * Reusable EventSelect Component
 * Lists events retrieved from GET /api/events (https://dev.hiroek.io/api-docs/#tag/events/GET/api/events)
 * with an integrated search filter.
 */
export default function EventSelect({
    value = "All Events",
    selectedId,
    onChange,
    variant = "pill",
    includeAllOption = true,
    allOptionLabel = "All Events",
    label,
    placeholder = "All Events",
    className = "",
    buttonClassName = "",
    dropdownClassName = "",
    customEvents,
    autoFetch = true,
    disabled = false,
}: EventSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Fetch events using GET /api/events
    const { useGetEvents } = useEvents();
    const { useGetAllEvents } = useTicketScans();

    const { data: eventsData, isLoading: isEventsLoading } = useGetEvents(
        { pageSize: 100 },
        autoFetch && !customEvents
    );

    // Supplementary fetch for fallback safety
    const { data: fallbackEventsData } = useGetAllEvents();

    // Normalize and consolidate event options
    const allEvents: EventOption[] = useMemo(() => {
        if (customEvents) {
            return customEvents.map((ev) => ({
                id: ev._id ?? ev.id,
                name: (ev.name ?? ev.title ?? "Untitled Event").trim(),
                photo: ev.photo,
                description: ev.description,
                raw: ev,
            }));
        }

        const map = new Map<string, EventOption>();

        // 1. Process GET /api/events response
        const raw =
            (eventsData as any)?.events ??
            (eventsData as any)?.result ??
            (eventsData as any)?.data ??
            (Array.isArray(eventsData) ? eventsData : []);

        if (Array.isArray(raw)) {
            raw.forEach((ev: any) => {
                const id = ev._id ?? ev.id;
                const name = (ev.name ?? ev.title ?? "").trim();
                if (name && !map.has(name)) {
                    map.set(name, {
                        id,
                        name,
                        photo: ev.photo,
                        description: ev.description,
                        raw: ev,
                    });
                }
            });
        }

        // 2. Process fallback events if any extra exist
        const fallbackRaw =
            (fallbackEventsData as any)?.events ??
            (fallbackEventsData as any)?.result ??
            (fallbackEventsData as any)?.data ??
            (Array.isArray(fallbackEventsData) ? fallbackEventsData : []);

        if (Array.isArray(fallbackRaw)) {
            fallbackRaw.forEach((ev: any) => {
                const id = ev._id ?? ev.id;
                const name = (ev.name ?? ev.title ?? "").trim();
                if (name && !map.has(name)) {
                    map.set(name, {
                        id,
                        name,
                        photo: ev.photo,
                        description: ev.description,
                        raw: ev,
                    });
                }
            });
        }

        return Array.from(map.values());
    }, [customEvents, eventsData, fallbackEventsData]);

    // Filter events based on search term
    const filteredEvents = useMemo(() => {
        if (!searchTerm.trim()) return allEvents;
        const q = searchTerm.toLowerCase().trim();
        return allEvents.filter(
            (ev) =>
                ev.name.toLowerCase().includes(q) ||
                (ev.description && ev.description.toLowerCase().includes(q))
        );
    }, [allEvents, searchTerm]);

    // Handle outside clicks and keyboard escape
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setIsOpen(false);
            }
        }
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            document.addEventListener("keydown", handleKeyDown);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen]);

    // Focus search input when dropdown opens
    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                searchInputRef.current?.focus();
            }, 60);
            return () => clearTimeout(timer);
        } else {
            setSearchTerm("");
        }
    }, [isOpen]);

    // Determine current display label
    const currentDisplayLabel = useMemo(() => {
        if (!value || value === allOptionLabel) {
            return allOptionLabel;
        }
        const matched = allEvents.find(
            (e) => e.id === value || e.name === value || (selectedId && e.id === selectedId)
        );
        return matched ? matched.name : value || placeholder;
    }, [value, selectedId, allEvents, allOptionLabel, placeholder]);

    const handleSelectAll = () => {
        onChange?.(null, undefined, allOptionLabel);
        setIsOpen(false);
    };

    const handleSelectEvent = (option: EventOption) => {
        onChange?.(option.raw ?? null, option.id, option.name);
        setIsOpen(false);
    };

    const baseButtonClass =
        variant === "pill"
            ? "bg-[#37137F] hover:bg-[#2e0e6c] text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center justify-between gap-2.5 cursor-pointer shadow-xs transition-all duration-150 active:scale-[0.98]"
            : "bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 text-xs font-medium px-3.5 py-2 rounded-xl flex items-center justify-between gap-2.5 cursor-pointer shadow-2xs hover:border-gray-300 transition-all duration-150";

    return (
        <div ref={containerRef} className={`relative inline-block ${className}`}>
            {label && (
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    {label}
                </span>
            )}

            <button
                type="button"
                onClick={() => !disabled && setIsOpen((prev) => !prev)}
                disabled={disabled}
                className={`${baseButtonClass} ${disabled ? "opacity-60 cursor-not-allowed" : ""} ${buttonClassName}`}
                aria-expanded={isOpen}
                aria-haspopup="listbox"
            >
                <span className="truncate max-w-[200px] sm:max-w-[260px]">{currentDisplayLabel}</span>
                <IoChevronDown
                    size={14}
                    className={`transition-transform duration-200 shrink-0 ${isOpen ? "rotate-180" : ""}`}
                />
            </button>

            {isOpen && (
                <div
                    className={`absolute left-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden py-2 animate-in fade-in zoom-in-95 duration-100 ${dropdownClassName}`}
                >
                    {/* Integrated Search Input */}
                    <div className="px-3 pb-2 pt-1 border-b border-gray-100">
                        <div className="relative flex items-center bg-gray-50 rounded-xl px-2.5 py-1.5 border border-gray-200/70 focus-within:border-[#37137F] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#37137F]/10 transition-all">
                            <IoSearch className="text-gray-400 text-sm shrink-0 mr-2" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Search events..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-transparent text-xs text-gray-800 placeholder-gray-400 outline-none"
                            />
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={() => setSearchTerm("")}
                                    className="text-gray-400 hover:text-gray-600 transition-colors ml-1 p-0.5 cursor-pointer"
                                    aria-label="Clear search"
                                >
                                    <IoCloseCircle size={14} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Header info */}
                    <div className="px-3 py-1.5 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        <span>Available Events</span>
                        <span>
                            {filteredEvents.length} {filteredEvents.length === 1 ? "event" : "events"}
                        </span>
                    </div>

                    {/* Scrollable List */}
                    <div className="max-h-60 overflow-y-auto px-1.5 space-y-0.5">
                        {/* "All Events" option */}
                        {includeAllOption && !searchTerm && (
                            <button
                                type="button"
                                onClick={handleSelectAll}
                                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                                    currentDisplayLabel === allOptionLabel
                                        ? "bg-[#37137F]/10 text-[#37137F] font-bold"
                                        : "text-gray-700 hover:bg-gray-50"
                                }`}
                            >
                                <div className="flex items-center gap-2 truncate">
                                    <span className="w-2 h-2 rounded-full bg-[#37137F]" />
                                    <span className="truncate">{allOptionLabel}</span>
                                </div>
                                {currentDisplayLabel === allOptionLabel && (
                                    <IoCheckmark className="text-[#37137F] text-sm shrink-0" />
                                )}
                            </button>
                        )}

                        {/* Loading / Empty / Items */}
                        {isEventsLoading && allEvents.length === 0 ? (
                            <div className="px-3 py-5 text-center text-xs text-gray-400 flex flex-col items-center gap-2">
                                <div className="w-4 h-4 border-2 border-[#37137F] border-t-transparent rounded-full animate-spin" />
                                <span>Loading events...</span>
                            </div>
                        ) : filteredEvents.length === 0 ? (
                            <div className="px-3 py-5 text-center text-xs text-gray-400 flex flex-col items-center gap-1.5">
                                <span>No events match "{searchTerm}"</span>
                                <button
                                    type="button"
                                    onClick={() => setSearchTerm("")}
                                    className="text-[11px] font-semibold text-[#37137F] hover:underline cursor-pointer"
                                >
                                    Clear search
                                </button>
                            </div>
                        ) : (
                            filteredEvents.map((evt) => {
                                const isSelected =
                                    (evt.id && (value === evt.id || selectedId === evt.id)) ||
                                    value === evt.name;

                                return (
                                    <button
                                        key={evt.id ?? evt.name}
                                        type="button"
                                        onClick={() => handleSelectEvent(evt)}
                                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                                            isSelected
                                                ? "bg-[#37137F]/10 text-[#37137F] font-bold"
                                                : "text-gray-700 hover:bg-gray-50"
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5 truncate min-w-0 pr-2">
                                            {evt.photo ? (
                                                <img
                                                    src={evt.photo}
                                                    alt={evt.name}
                                                    className="w-5 h-5 rounded-md object-cover shrink-0 border border-gray-200"
                                                    onError={(e) => {
                                                        (e.target as HTMLElement).style.display = "none";
                                                    }}
                                                />
                                            ) : (
                                                <span className="w-5 h-5 rounded-md bg-purple-50 text-[#37137F] flex items-center justify-center shrink-0 text-[10px] font-bold">
                                                    {evt.name.charAt(0).toUpperCase()}
                                                </span>
                                            )}
                                            <span className="truncate">{evt.name}</span>
                                        </div>
                                        {isSelected && (
                                            <IoCheckmark className="text-[#37137F] text-sm shrink-0" />
                                        )}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
