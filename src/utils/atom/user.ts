import { atom } from "jotai"; 
import type { IOrganizer, IMembershipInfo } from "../../type/user";

// Centralized atom to avoid circular imports between component and hooks
export const userAtom = atom<IOrganizer>(); 
export const membershipAtom = atom<IMembershipInfo | null>(null);
