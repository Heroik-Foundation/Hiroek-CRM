import { atom } from "jotai"; 
import type { IOrganizer } from "../../type/user";

// Centralized atom to avoid circular imports between component and hooks
export const userAtom = atom<IOrganizer>(); 