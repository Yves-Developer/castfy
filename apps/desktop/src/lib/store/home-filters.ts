import { create } from "zustand";

/**
 * The library's search text and sort order, shared by the sidebar search, the
 * sort menu and the list. Kept in memory rather than in the URL: the app
 * routes on the hash, and query params written beside it piled up and
 * overwrote one another.
 */
interface HomeFilters {
  /** last_created, last_updated or alphabetically. */
  order: string;
  query: string;
  setOrder: (order: string) => void;
  setQuery: (query: string) => void;
}

export const useHomeFilters = create<HomeFilters>((set) => ({
  order: "last_created",
  query: "",
  setOrder: (order) => set({ order }),
  setQuery: (query) => set({ query }),
}));
