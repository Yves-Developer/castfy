import { create } from "zustand";

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
