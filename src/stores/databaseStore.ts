import { create } from 'zustand';
import type { RelationalTable, DatabaseRow, IntegrityViolation } from '../types/database';
import type { Entity, Relationship } from '../types/erd';
import { RelationalEngine } from '../engine/database/RelationalEngine';
import { ConstraintValidator } from '../engine/database/ConstraintValidator';
import type { SqlDialect } from '../engine/sql/SqlGenerator';
import { lmsSystem } from '../data/systems/lms';

interface DatabaseStoreState {
  tables: RelationalTable[];
  data: Record<string, DatabaseRow[]>;
  violations: IntegrityViolation[];
  activeTableName: string | null;
  sqlDialect: SqlDialect;

  // Actions
  syncFromErd: (entities: Entity[], relationships: Relationship[]) => void;
  insertRow: (tableName: string, row: DatabaseRow) => IntegrityViolation | null;
  deleteRow: (tableName: string, index: number) => void;
  clearViolations: () => void;
  setActiveTableName: (name: string) => void;
  setSqlDialect: (dialect: SqlDialect) => void;
  loadSampleData: (sampleData: Record<string, DatabaseRow[]>) => void;
  resetData: () => void;
}

// Initial tables generated from default LMS scenario
const initialTables = RelationalEngine.generateRelationalSchema(
  lmsSystem.canonicalEntities,
  lmsSystem.canonicalRelationships
);

export const useDatabaseStore = create<DatabaseStoreState>((set, get) => ({
  tables: initialTables,
  data: lmsSystem.sampleData || {},
  violations: [],
  activeTableName: initialTables.length > 0 ? initialTables[0].name : null,
  sqlDialect: 'PostgreSQL',

  syncFromErd: (entities, relationships) => {
    const updatedTables = RelationalEngine.generateRelationalSchema(entities, relationships);
    const currentActive = get().activeTableName;
    const isCurrentActiveValid = updatedTables.some((t) => t.name === currentActive);

    set({
      tables: updatedTables,
      activeTableName: isCurrentActiveValid ? currentActive : (updatedTables[0]?.name || null),
    });
  },

  insertRow: (tableName, row) => {
    const { tables, data } = get();
    const targetTable = tables.find((t) => t.name === tableName);
    if (!targetTable) return null;

    // Run real-time integrity validation
    const violation = ConstraintValidator.validateRow(targetTable, row, tables, data);

    if (violation) {
      set((state) => ({
        violations: [violation, ...state.violations.slice(0, 19)],
      }));
      return violation;
    }

    // Insert valid row
    set((state) => {
      const currentRows = state.data[tableName] || [];
      return {
        data: {
          ...state.data,
          [tableName]: [...currentRows, row],
        },
      };
    });

    return null;
  },

  deleteRow: (tableName, index) => {
    set((state) => {
      const currentRows = state.data[tableName] || [];
      return {
        data: {
          ...state.data,
          [tableName]: currentRows.filter((_, idx) => idx !== index),
        },
      };
    });
  },

  clearViolations: () => set({ violations: [] }),
  setActiveTableName: (name) => set({ activeTableName: name }),
  setSqlDialect: (dialect) => set({ sqlDialect: dialect }),
  loadSampleData: (sampleData) => set({ data: sampleData }),
  resetData: () => set({ data: {}, violations: [] }),
}));
