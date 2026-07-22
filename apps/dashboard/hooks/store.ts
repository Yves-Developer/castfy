import { create } from "zustand";
import type { TsidebarPages } from "@/types";

interface LoginStore {
  close: () => void;
  isOpen: boolean;
  open: () => void;
}
export const useLoginStore = create<LoginStore>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));

interface SidebarStore {
  activePage: TsidebarPages;

  setActivePage: (page: TsidebarPages) => void;
}
export const useSibebarStore = create<SidebarStore>((set) => ({
  activePage: "ai",
  setActivePage: (page: TsidebarPages) => set({ activePage: page }),
}));
