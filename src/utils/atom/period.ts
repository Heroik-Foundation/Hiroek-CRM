import { atom } from "jotai";

export type PeriodLabel =
    | "Last 7 Days"
    | "Last 14 Days"
    | "Last 30 Days"
    | "Last 3 Months"
    | "Last Year"
    | "All Time";

export type PeriodSlug =
    | "weekly"
    | "biweekly"
    | "monthly"
    | "last3Months"
    | "lastYear"
    | "allTime";

export const PERIOD_MAPPING: Record<string, string> = {
    "Last 7 Days": "weekly",
    "Last 14 Days": "biweekly",
    "Last 30 Days": "monthly",
    "Last 3 Months": "last3Months",
    "Last Year": "lastYear",
    "All Time": "allTime",
};

/** Atom holding the active human-readable time range (e.g. "Last 7 Days") */
export const periodAtom = atom<string>("Last 7 Days");

/** Alias for periodAtom */
export const periodLabelAtom = periodAtom;

/** Derived atom returning the query parameter slug for backend API requests (e.g. "weekly") */
export const periodSlugAtom = atom<string>((get) => {
    const label = get(periodAtom);
    return PERIOD_MAPPING[label] ?? "weekly";
});

/** Helper to convert any period label to its slug */
export const getPeriodSlug = (label: string): string => {
    return PERIOD_MAPPING[label] ?? label;
};
