import { create } from "zustand";
import { persist } from "zustand/middleware";

interface LayoutState {
  leftCollapsed: boolean;
  rightCollapsed: boolean;
  toggleLeft: () => void;
  toggleRight: () => void;
  setLeftCollapsed: (value: boolean) => void;
  setRightCollapsed: (value: boolean) => void;
}

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set) => ({
      leftCollapsed: false,
      rightCollapsed: false,
      toggleLeft: () => set((state) => ({ leftCollapsed: !state.leftCollapsed })),
      toggleRight: () => set((state) => ({ rightCollapsed: !state.rightCollapsed })),
      setLeftCollapsed: (value) => set({ leftCollapsed: value }),
      setRightCollapsed: (value) => set({ rightCollapsed: value }),
    }),
    { name: "animation-os-layout" },
  ),
);
