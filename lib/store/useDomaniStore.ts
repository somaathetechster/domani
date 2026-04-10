"use client";
import { create } from "zustand";

export type SiteState = "loading" | "enter" | "transition" | "world";

interface DomaniStore {
  siteState:    SiteState;
  loadProgress: number;
  loadLabel:    string;
  soundEnabled: boolean;
  setSiteState:    (s: SiteState) => void;
  setLoadProgress: (p: number, label?: string) => void;
  toggleSound:     () => void;
}

export const useDomaniStore = create<DomaniStore>((set) => ({
  siteState:    "loading",
  loadProgress: 0,
  loadLabel:    "Initialising",
  soundEnabled: false,
  setSiteState:    (siteState) => set({ siteState }),
  setLoadProgress: (loadProgress, loadLabel) =>
    set((s) => ({ loadProgress, loadLabel: loadLabel ?? s.loadLabel })),
  toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
}));
