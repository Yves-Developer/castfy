import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type StageView = "browser" | "agent";

/**
 * What the studio's big area shows during a run: the live browser or the
 * agent's thread. The sidebar reads it too: with the thread on stage, the
 * sidebar's Agent tab would only repeat it, so it steps aside.
 */
export const useStageView = create<{
  view: StageView;
  set: (view: StageView) => void;
}>()(
  persist((set) => ({ view: "browser", set: (view) => set({ view }) }), {
    name: "castfy.stage-view",
    storage: createJSONStorage(() => localStorage),
  })
);
