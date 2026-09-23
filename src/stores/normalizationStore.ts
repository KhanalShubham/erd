import { create } from 'zustand';
import type { NormalizationStage, FunctionalDependency, NormalFormLevel } from '../types/normalization';
import { NormalizationEngine } from '../engine/normalization/NormalizationEngine';

interface NormalizationStoreState {
  currentLevel: NormalFormLevel;
  stages: NormalizationStage[];
  dependencies: FunctionalDependency[];

  setCurrentLevel: (level: NormalFormLevel) => void;
  nextLevel: () => void;
  prevLevel: () => void;
}

const canonicalStages = NormalizationEngine.getCanonicalStages();
const canonicalFds = NormalizationEngine.getCanonicalDependencies();

export const useNormalizationStore = create<NormalizationStoreState>((set) => ({
  currentLevel: 'UNF',
  stages: canonicalStages,
  dependencies: canonicalFds,

  setCurrentLevel: (level) => set({ currentLevel: level }),
  nextLevel: () =>
    set((state) => {
      const order: NormalFormLevel[] = ['UNF', '1NF', '2NF', '3NF'];
      const currentIdx = order.indexOf(state.currentLevel);
      if (currentIdx < order.length - 1) {
        return { currentLevel: order[currentIdx + 1] };
      }
      return state;
    }),
  prevLevel: () =>
    set((state) => {
      const order: NormalFormLevel[] = ['UNF', '1NF', '2NF', '3NF'];
      const currentIdx = order.indexOf(state.currentLevel);
      if (currentIdx > 0) {
        return { currentLevel: order[currentIdx - 1] };
      }
      return state;
    }),
}));
