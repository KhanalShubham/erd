import { create } from 'zustand';
import type { Entity, Relationship, Attribute, EntityType } from '../types/erd';
import type { SystemScenario } from '../types/system';
import { lmsSystem } from '../data/systems/lms';

interface HistorySnapshot {
  entities: Entity[];
  relationships: Relationship[];
}

interface ErdStoreState {
  entities: Entity[];
  relationships: Relationship[];
  selectedEntityId: string | null;
  selectedAttributeId: string | null;
  selectedRelationshipId: string | null;
  highlightedFk: { sourceTable: string; sourceColumn: string; targetTable: string; targetColumn: string } | null;
  recentlyAddedAttrId: string | null;
  recentlyToggledPkId: string | null;
  recentlyCreatedEntityId: string | null;
  activeViewMode: 'erd' | 'relational';

  // Undo / Redo stacks
  past: HistorySnapshot[];
  future: HistorySnapshot[];

  // View mode
  setActiveViewMode: (mode: 'erd' | 'relational') => void;

  // Selection
  setSelectedEntity: (id: string | null) => void;
  setSelectedAttribute: (id: string | null) => void;
  setSelectedRelationship: (id: string | null) => void;
  setHighlightedFk: (fk: { sourceTable: string; sourceColumn: string; targetTable: string; targetColumn: string } | null) => void;
  setRecentlyAddedAttrId: (id: string | null) => void;
  setRecentlyToggledPkId: (id: string | null) => void;
  setRecentlyCreatedEntityId: (id: string | null) => void;

  // CRUD Entities
  addEntity: (name?: string, type?: EntityType, position?: { x: number; y: number }) => string;
  updateEntity: (id: string, updates: Partial<Entity>) => void;
  deleteEntity: (id: string) => void;

  // CRUD Attributes
  addAttribute: (entityId: string, attr?: Partial<Attribute>) => string;
  updateAttribute: (entityId: string, attrId: string, updates: Partial<Attribute>) => void;
  deleteAttribute: (entityId: string, attrId: string) => void;
  togglePrimaryKey: (entityId: string, attrId: string) => void;

  // CRUD Relationships
  addRelationship: (rel: Omit<Relationship, 'id'>) => string;
  updateRelationship: (id: string, updates: Partial<Relationship>) => void;
  deleteRelationship: (id: string) => void;

  // M:N Resolution
  resolveManyToMany: (relId: string, associativeName?: string) => string | null;

  // History
  undo: () => void;
  redo: () => void;
  saveHistorySnapshot: () => void;

  // Scenario loading
  loadScenario: (scenario: SystemScenario) => void;
  resetToBlank: () => void;
}

export const useErdStore = create<ErdStoreState>((set, get) => ({
  entities: lmsSystem.canonicalEntities,
  relationships: lmsSystem.canonicalRelationships,
  selectedEntityId: null,
  selectedAttributeId: null,
  selectedRelationshipId: null,
  highlightedFk: null,
  recentlyAddedAttrId: null,
  recentlyToggledPkId: null,
  recentlyCreatedEntityId: null,
  activeViewMode: 'erd',
  past: [],
  future: [],

  setActiveViewMode: (mode) => set({ activeViewMode: mode }),
  setRecentlyAddedAttrId: (id) => set({ recentlyAddedAttrId: id }),
  setRecentlyToggledPkId: (id) => set({ recentlyToggledPkId: id }),
  setRecentlyCreatedEntityId: (id) => set({ recentlyCreatedEntityId: id }),

  saveHistorySnapshot: () => {
    const { entities, relationships, past } = get();
    set({
      past: [...past.slice(-25), { entities: JSON.parse(JSON.stringify(entities)), relationships: JSON.parse(JSON.stringify(relationships)) }],
      future: [],
    });
  },

  setSelectedEntity: (id) => set({ selectedEntityId: id, selectedRelationshipId: null }),
  setSelectedAttribute: (id) => set({ selectedAttributeId: id }),
  setSelectedRelationship: (id) => set({ selectedRelationshipId: id, selectedEntityId: null, selectedAttributeId: null }),
  setHighlightedFk: (fk) => set({ highlightedFk: fk }),

  addEntity: (name = 'NEW_ENTITY', type: EntityType = 'strong', position = { x: 250, y: 180 }) => {
    get().saveHistorySnapshot();
    const id = `ent_${Date.now()}`;
    const newEntity: Entity = {
      id,
      name: name.toUpperCase().replace(/\s+/g, '_'),
      type,
      position,
      attributes: [
        {
          id: `attr_${Date.now()}_pk`,
          entityId: id,
          name: `${name.replace(/\s+/g, '')}ID`,
          type: 'simple',
          dataType: 'INTEGER',
          isPrimaryKey: true,
          isForeignKey: false,
          isNullable: false,
          isUnique: true,
        },
      ],
    };
    set((state) => ({
      entities: [...state.entities, newEntity],
      selectedEntityId: id,
      recentlyCreatedEntityId: id,
    }));
    setTimeout(() => {
      if (get().recentlyCreatedEntityId === id) {
        set({ recentlyCreatedEntityId: null });
      }
    }, 1500);
    return id;
  },

  updateEntity: (id, updates) => {
    get().saveHistorySnapshot();
    set((state) => ({
      entities: state.entities.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    }));
  },

  deleteEntity: (id) => {
    get().saveHistorySnapshot();
    set((state) => ({
      entities: state.entities.filter((e) => e.id !== id),
      relationships: state.relationships.filter((r) => r.sourceEntityId !== id && r.targetEntityId !== id),
      selectedEntityId: state.selectedEntityId === id ? null : state.selectedEntityId,
    }));
  },

  addAttribute: (entityId, partialAttr = {}) => {
    get().saveHistorySnapshot();
    const attrId = `attr_${Date.now()}`;
    const newAttr: Attribute = {
      id: attrId,
      entityId,
      name: partialAttr.name || 'newAttribute',
      type: partialAttr.type || 'simple',
      dataType: partialAttr.dataType || 'VARCHAR',
      isPrimaryKey: partialAttr.isPrimaryKey || false,
      isForeignKey: partialAttr.isForeignKey || false,
      isNullable: partialAttr.isNullable ?? true,
      isUnique: partialAttr.isUnique || false,
      defaultValue: partialAttr.defaultValue,
      domain: partialAttr.domain,
      compositeChildren: partialAttr.compositeChildren,
      derivedFormula: partialAttr.derivedFormula,
    };

    set((state) => ({
      entities: state.entities.map((e) => {
        if (e.id !== entityId) return e;
        return {
          ...e,
          attributes: [...e.attributes, newAttr],
        };
      }),
      selectedAttributeId: attrId,
      recentlyAddedAttrId: attrId,
    }));
    setTimeout(() => {
      if (get().recentlyAddedAttrId === attrId) {
        set({ recentlyAddedAttrId: null });
      }
    }, 1500);
    return attrId;
  },

  updateAttribute: (entityId, attrId, updates) => {
    get().saveHistorySnapshot();
    set((state) => ({
      entities: state.entities.map((e) => {
        if (e.id !== entityId) return e;
        return {
          ...e,
          attributes: e.attributes.map((a) => {
            if (a.id === attrId) {
              const merged = { ...a, ...updates };
              if (updates.isPrimaryKey === true) {
                merged.isPrimaryKey = true;
                merged.isForeignKey = false;
                merged.isNullable = false;
                merged.isUnique = true;
              }
              if (updates.isForeignKey === true) {
                merged.isForeignKey = true;
                merged.isPrimaryKey = false;
              }
              return merged;
            }
            if (updates.isPrimaryKey === true && a.isPrimaryKey) {
              return { ...a, isPrimaryKey: false };
            }
            return a;
          }),
        };
      }),
    }));
  },

  deleteAttribute: (entityId, attrId) => {
    get().saveHistorySnapshot();
    set((state) => ({
      entities: state.entities.map((e) => {
        if (e.id !== entityId) return e;
        return {
          ...e,
          attributes: e.attributes.filter((a) => a.id !== attrId),
        };
      }),
      selectedAttributeId: state.selectedAttributeId === attrId ? null : state.selectedAttributeId,
    }));
  },

  togglePrimaryKey: (entityId, attrId) => {
    get().saveHistorySnapshot();
    set((state) => ({
      entities: state.entities.map((e) => {
        if (e.id !== entityId) return e;
        const targetAttr = e.attributes.find((a) => a.id === attrId);
        const willBePk = targetAttr ? !targetAttr.isPrimaryKey : false;

        return {
          ...e,
          attributes: e.attributes.map((a) => {
            if (a.id === attrId) {
              return {
                ...a,
                isPrimaryKey: willBePk,
                isForeignKey: willBePk ? false : a.isForeignKey,
                isNullable: willBePk ? false : a.isNullable,
                isUnique: willBePk ? true : a.isUnique,
              };
            }
            if (willBePk && a.isPrimaryKey) {
              return {
                ...a,
                isPrimaryKey: false,
              };
            }
            return a;
          }),
        };
      }),
      recentlyToggledPkId: attrId,
    }));
    setTimeout(() => {
      if (get().recentlyToggledPkId === attrId) {
        set({ recentlyToggledPkId: null });
      }
    }, 1500);
  },

  addRelationship: (rel) => {
    get().saveHistorySnapshot();
    const id = `rel_${Date.now()}`;
    const newRel: Relationship = {
      ...rel,
      id,
    };
    set((state) => ({
      relationships: [...state.relationships, newRel],
      selectedRelationshipId: id,
    }));
    return id;
  },

  updateRelationship: (id, updates) => {
    get().saveHistorySnapshot();
    set((state) => ({
      relationships: state.relationships.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    }));
  },

  deleteRelationship: (id) => {
    get().saveHistorySnapshot();
    set((state) => ({
      relationships: state.relationships.filter((r) => r.id !== id),
      selectedRelationshipId: state.selectedRelationshipId === id ? null : state.selectedRelationshipId,
    }));
  },

  resolveManyToMany: (relId, associativeName) => {
    const { relationships, entities } = get();
    const rel = relationships.find((r) => r.id === relId);
    if (!rel) return null;

    const source = entities.find((e) => e.id === rel.sourceEntityId);
    const target = entities.find((e) => e.id === rel.targetEntityId);
    if (!source || !target) return null;

    get().saveHistorySnapshot();

    const name = associativeName || `${source.name}_${target.name}`;
    const assocId = `ent_assoc_${Date.now()}`;

    // Source PK and Target PK
    const sourcePk = source.attributes.find((a) => a.isPrimaryKey) || source.attributes[0];
    const targetPk = target.attributes.find((a) => a.isPrimaryKey) || target.attributes[0];

    const midX = (source.position.x + target.position.x) / 2;
    const midY = (source.position.y + target.position.y) / 2;

    const assocEntity: Entity = {
      id: assocId,
      name: name.toUpperCase(),
      type: 'associative',
      description: `Associative entity resolving M:N relationship between ${source.name} and ${target.name}`,
      position: { x: midX, y: midY },
      attributes: [
        {
          id: `attr_${Date.now()}_fk1`,
          entityId: assocId,
          name: sourcePk ? sourcePk.name : `${source.name}ID`,
          type: 'simple',
          dataType: sourcePk ? sourcePk.dataType : 'INTEGER',
          isPrimaryKey: true,
          isForeignKey: true,
          isNullable: false,
          isUnique: false,
          referencedEntityId: source.id,
        },
        {
          id: `attr_${Date.now()}_fk2`,
          entityId: assocId,
          name: targetPk ? targetPk.name : `${target.name}ID`,
          type: 'simple',
          dataType: targetPk ? targetPk.dataType : 'INTEGER',
          isPrimaryKey: true,
          isForeignKey: true,
          isNullable: false,
          isUnique: false,
          referencedEntityId: target.id,
        },
        // Preserve any relationship attributes
        ...rel.attributes.map((a, idx) => ({
          ...a,
          id: `attr_${Date.now()}_rel_${idx}`,
          entityId: assocId,
          isPrimaryKey: false,
        })),
      ],
    };

    // Create 1:N from Source to Assoc, and 1:N from Target to Assoc
    const rel1: Relationship = {
      id: `rel_${Date.now()}_1`,
      name: 'participates in',
      sourceEntityId: source.id,
      targetEntityId: assocId,
      cardinality: '1:N',
      sourceOptionality: '1',
      targetOptionality: '0',
      sourceMax: '1',
      targetMax: 'N',
      attributes: [],
    };

    const rel2: Relationship = {
      id: `rel_${Date.now()}_2`,
      name: 'includes',
      sourceEntityId: target.id,
      targetEntityId: assocId,
      cardinality: '1:N',
      sourceOptionality: '1',
      targetOptionality: '0',
      sourceMax: '1',
      targetMax: 'N',
      attributes: [],
    };

    set((state) => ({
      entities: [...state.entities, assocEntity],
      relationships: [...state.relationships.filter((r) => r.id !== relId), rel1, rel2],
      selectedEntityId: assocId,
      selectedRelationshipId: null,
      recentlyCreatedEntityId: assocId,
    }));

    setTimeout(() => {
      if (get().recentlyCreatedEntityId === assocId) {
        set({ recentlyCreatedEntityId: null });
      }
    }, 2500);

    return assocId;
  },

  undo: () => {
    const { past, future, entities, relationships } = get();
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    set({
      entities: previous.entities,
      relationships: previous.relationships,
      past: newPast,
      future: [{ entities, relationships }, ...future],
      selectedEntityId: null,
      selectedRelationshipId: null,
    });
  },

  redo: () => {
    const { past, future, entities, relationships } = get();
    if (future.length === 0) return;
    const next = future[0];
    const newFuture = future.slice(1);
    set({
      entities: next.entities,
      relationships: next.relationships,
      past: [...past, { entities, relationships }],
      future: newFuture,
      selectedEntityId: null,
      selectedRelationshipId: null,
    });
  },

  loadScenario: (scenario) => {
    get().saveHistorySnapshot();
    set({
      entities: scenario.canonicalEntities.length > 0 ? scenario.canonicalEntities : (scenario.initialEntities || []),
      relationships: scenario.canonicalRelationships,
      selectedEntityId: null,
      selectedAttributeId: null,
      selectedRelationshipId: null,
    });
  },

  resetToBlank: () => {
    get().saveHistorySnapshot();
    set({
      entities: [],
      relationships: [],
      selectedEntityId: null,
      selectedAttributeId: null,
      selectedRelationshipId: null,
    });
  },
}));
