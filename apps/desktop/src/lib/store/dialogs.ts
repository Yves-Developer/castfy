import { create } from "zustand";
import type { TSettingPages } from "@/types";

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

interface NewDemoStore {
  close: () => void;
  isOpen: boolean;
  open: () => void;
}
export const useNewDemoStore = create<NewDemoStore>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));

interface NewFolderStore {
  close: () => void;
  isOpen: boolean;
  open: () => void;
}
export const useNewFolderStore = create<NewFolderStore>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));

interface SettingsStore {
  activePage: TSettingPages;
  close: () => void;
  isOpen: boolean;
  open: () => void;
  setActivePage: (page: TSettingPages) => void;
}
export const useSettingsStore = create<SettingsStore>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  activePage: "profile",
  setActivePage: (page: TSettingPages) =>
    set({ activePage: page, isOpen: true }),
}));
