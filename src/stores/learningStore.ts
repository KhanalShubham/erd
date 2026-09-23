import { create } from 'zustand';
import type { SystemScenario } from '../types/system';
import { lmsSystem } from '../data/systems/lms';

export type AppMode = 'dashboard' | 'guided' | 'builder' | 'challenge' | 'normalization';

interface LearningStoreState {
  activeMode: AppMode;
  currentSystem: SystemScenario;
  guidedStepIndex: number;
  revealedHintsCount: Record<number, number>;
  completedSteps: number[];
  isRequirementsDrawerOpen: boolean;
  isSystemExplorerOpen: boolean;
  isKeysLabOpen: boolean;
  isAdvancedLabOpen: boolean;
  isAiTutorOpen: boolean;
  activeBottomTab: 'relational' | 'sandbox' | 'sql' | 'validation' | 'explainer';
  isBottomDockExpanded: boolean;

  // Actions
  setActiveMode: (mode: AppMode) => void;
  setCurrentSystem: (system: SystemScenario) => void;
  setGuidedStepIndex: (idx: number) => void;
  nextGuidedStep: () => void;
  prevGuidedStep: () => void;
  revealNextHint: (stepNumber: number) => void;
  toggleRequirementsDrawer: (open?: boolean) => void;
  toggleSystemExplorer: (open?: boolean) => void;
  toggleKeysLab: (open?: boolean) => void;
  toggleAdvancedLab: (open?: boolean) => void;
  toggleAiTutor: (open?: boolean) => void;
  setActiveBottomTab: (tab: 'relational' | 'sandbox' | 'sql' | 'validation' | 'explainer') => void;
  toggleBottomDock: (expanded?: boolean) => void;
}

export const useLearningStore = create<LearningStoreState>((set) => ({
  activeMode: 'dashboard',
  currentSystem: lmsSystem,
  guidedStepIndex: 0,
  revealedHintsCount: { 1: 1, 2: 1 },
  completedSteps: [1],
  isRequirementsDrawerOpen: true,
  isSystemExplorerOpen: false,
  isKeysLabOpen: false,
  isAdvancedLabOpen: false,
  isAiTutorOpen: false,
  activeBottomTab: 'relational',
  isBottomDockExpanded: false,

  setActiveMode: (mode) => set({ activeMode: mode }),
  setCurrentSystem: (system) =>
    set({
      currentSystem: system,
      guidedStepIndex: 0,
      revealedHintsCount: {},
      completedSteps: [],
    }),
  setGuidedStepIndex: (idx) => set({ guidedStepIndex: idx }),
  nextGuidedStep: () =>
    set((state) => {
      const next = Math.min(state.guidedStepIndex + 1, 10);
      const stepNum = next + 1;
      return {
        guidedStepIndex: next,
        completedSteps: Array.from(new Set([...state.completedSteps, stepNum])),
      };
    }),
  prevGuidedStep: () =>
    set((state) => ({
      guidedStepIndex: Math.max(state.guidedStepIndex - 1, 0),
    })),
  revealNextHint: (stepNumber) =>
    set((state) => {
      const currentCount = state.revealedHintsCount[stepNumber] || 0;
      return {
        revealedHintsCount: {
          ...state.revealedHintsCount,
          [stepNumber]: currentCount + 1,
        },
      };
    }),
  toggleRequirementsDrawer: (open) =>
    set((state) => ({
      isRequirementsDrawerOpen: open !== undefined ? open : !state.isRequirementsDrawerOpen,
    })),
  toggleSystemExplorer: (open) =>
    set((state) => ({
      isSystemExplorerOpen: open !== undefined ? open : !state.isSystemExplorerOpen,
    })),
  toggleKeysLab: (open) =>
    set((state) => ({
      isKeysLabOpen: open !== undefined ? open : !state.isKeysLabOpen,
    })),
  toggleAdvancedLab: (open) =>
    set((state) => ({
      isAdvancedLabOpen: open !== undefined ? open : !state.isAdvancedLabOpen,
    })),
  toggleAiTutor: (open) =>
    set((state) => ({
      isAiTutorOpen: open !== undefined ? open : !state.isAiTutorOpen,
    })),
  setActiveBottomTab: (tab) =>
    set({
      activeBottomTab: tab,
      isBottomDockExpanded: true,
    }),
  toggleBottomDock: (expanded) =>
    set((state) => ({
      isBottomDockExpanded: expanded !== undefined ? expanded : !state.isBottomDockExpanded,
    })),
}));
