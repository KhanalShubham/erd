import { create } from 'zustand';
import type { Entity, Relationship } from '../types/erd';
import { SqlGenerator } from '../engine/sql/SqlGenerator';
import { RelationalEngine } from '../engine/database/RelationalEngine';

export interface ProjectMetadata {
  id: string;
  name: string;
  updatedAt: number;
  entitiesCount: number;
  relationshipsCount: number;
}

export interface ProjectData {
  version: string;
  metadata: ProjectMetadata;
  entities: Entity[];
  relationships: Relationship[];
  settings?: Record<string, any>;
}

interface ProjectStoreState {
  currentProjectId: string;
  currentProjectName: string;
  savedProjects: ProjectMetadata[];
  isProjectsModalOpen: boolean;

  setProjectsModalOpen: (open: boolean) => void;
  createNewProject: (name?: string) => void;
  saveProject: (entities: Entity[], relationships: Relationship[]) => void;
  loadProject: (id: string) => { entities: Entity[]; relationships: Relationship[] } | null;
  deleteProject: (id: string) => void;
  duplicateProject: (id: string) => void;
  renameCurrentProject: (name: string) => void;
  exportProjectJson: (entities: Entity[], relationships: Relationship[]) => void;
  importProjectJson: (jsonString: string) => { entities: Entity[]; relationships: Relationship[] } | null;
  exportSqlFile: (entities: Entity[], relationships: Relationship[]) => void;
  listSavedProjects: () => void;
}

const STORAGE_PREFIX = 'erd_lab_proj_';
const CATALOG_KEY = 'erd_lab_projects_list';

export const useProjectStore = create<ProjectStoreState>((set, get) => ({
  currentProjectId: 'default_project',
  currentProjectName: 'University LMS Database Design',
  savedProjects: [],
  isProjectsModalOpen: false,

  setProjectsModalOpen: (open) => set({ isProjectsModalOpen: open }),

  listSavedProjects: () => {
    try {
      const raw = localStorage.getItem(CATALOG_KEY);
      if (raw) {
        set({ savedProjects: JSON.parse(raw) });
      } else {
        set({ savedProjects: [] });
      }
    } catch {
      set({ savedProjects: [] });
    }
  },

  createNewProject: (name = 'New Database Schema') => {
    const newId = `proj_${Date.now()}`;
    set({
      currentProjectId: newId,
      currentProjectName: name,
    });
  },

  saveProject: (entities, relationships) => {
    const { currentProjectId, currentProjectName } = get();
    const meta: ProjectMetadata = {
      id: currentProjectId,
      name: currentProjectName,
      updatedAt: Date.now(),
      entitiesCount: entities.length,
      relationshipsCount: relationships.length,
    };

    const projectData: ProjectData = {
      version: '1.0.0',
      metadata: meta,
      entities,
      relationships,
    };

    try {
      localStorage.setItem(`${STORAGE_PREFIX}${currentProjectId}`, JSON.stringify(projectData));

      // update project list
      const rawList = localStorage.getItem(CATALOG_KEY);
      const list: ProjectMetadata[] = rawList ? JSON.parse(rawList) : [];
      const updatedList = [meta, ...list.filter((p) => p.id !== currentProjectId)];
      localStorage.setItem(CATALOG_KEY, JSON.stringify(updatedList));
      set({ savedProjects: updatedList });
    } catch (e) {
      console.error('Error saving project:', e);
    }
  },

  loadProject: (id) => {
    try {
      const raw = localStorage.getItem(`${STORAGE_PREFIX}${id}`);
      if (!raw) return null;
      const data: ProjectData = JSON.parse(raw);
      set({ currentProjectId: data.metadata.id, currentProjectName: data.metadata.name });
      return { entities: data.entities, relationships: data.relationships };
    } catch {
      return null;
    }
  },

  deleteProject: (id) => {
    try {
      localStorage.removeItem(`${STORAGE_PREFIX}${id}`);
      const rawList = localStorage.getItem(CATALOG_KEY);
      const list: ProjectMetadata[] = rawList ? JSON.parse(rawList) : [];
      const updatedList = list.filter((p) => p.id !== id);
      localStorage.setItem(CATALOG_KEY, JSON.stringify(updatedList));
      set({ savedProjects: updatedList });
    } catch (e) {
      console.error('Error deleting project:', e);
    }
  },

  duplicateProject: (id) => {
    try {
      const raw = localStorage.getItem(`${STORAGE_PREFIX}${id}`);
      if (!raw) return;
      const data: ProjectData = JSON.parse(raw);
      const newId = `proj_${Date.now()}`;
      const newName = `${data.metadata.name} (Copy)`;
      const newMeta: ProjectMetadata = {
        ...data.metadata,
        id: newId,
        name: newName,
        updatedAt: Date.now(),
      };
      const duplicatedData: ProjectData = {
        ...data,
        metadata: newMeta,
      };
      localStorage.setItem(`${STORAGE_PREFIX}${newId}`, JSON.stringify(duplicatedData));
      const rawList = localStorage.getItem(CATALOG_KEY);
      const list: ProjectMetadata[] = rawList ? JSON.parse(rawList) : [];
      const updatedList = [newMeta, ...list];
      localStorage.setItem(CATALOG_KEY, JSON.stringify(updatedList));
      set({ savedProjects: updatedList });
    } catch (e) {
      console.error('Error duplicating project:', e);
    }
  },

  renameCurrentProject: (name) => {
    set({ currentProjectName: name });
    const { currentProjectId, savedProjects } = get();
    const updated = savedProjects.map((p) =>
      p.id === currentProjectId ? { ...p, name, updatedAt: Date.now() } : p
    );
    try {
      localStorage.setItem(CATALOG_KEY, JSON.stringify(updated));
      const raw = localStorage.getItem(`${STORAGE_PREFIX}${currentProjectId}`);
      if (raw) {
        const data: ProjectData = JSON.parse(raw);
        data.metadata.name = name;
        data.metadata.updatedAt = Date.now();
        localStorage.setItem(`${STORAGE_PREFIX}${currentProjectId}`, JSON.stringify(data));
      }
    } catch {
      // ignore
    }
    set({ savedProjects: updated });
  },

  exportProjectJson: (entities, relationships) => {
    const { currentProjectId, currentProjectName } = get();
    const projectData: ProjectData = {
      version: '1.0.0',
      metadata: {
        id: currentProjectId,
        name: currentProjectName,
        updatedAt: Date.now(),
        entitiesCount: entities.length,
        relationshipsCount: relationships.length,
      },
      entities,
      relationships,
    };

    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentProjectName.toLowerCase().replace(/\s+/g, '_')}_erd.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  importProjectJson: (jsonString) => {
    try {
      const data: ProjectData = JSON.parse(jsonString);
      if (!data.entities || !Array.isArray(data.entities)) {
        throw new Error('Invalid project structure');
      }
      set({
        currentProjectId: data.metadata?.id || `proj_${Date.now()}`,
        currentProjectName: data.metadata?.name || 'Imported ERD Project',
      });
      return {
        entities: data.entities,
        relationships: data.relationships || [],
      };
    } catch (e) {
      console.error('Failed to import ERD JSON:', e);
      return null;
    }
  },

  exportSqlFile: (entities, relationships) => {
    const tables = RelationalEngine.generateRelationalSchema(entities, relationships);
    const sql = SqlGenerator.generateDDL(tables, 'PostgreSQL');

    const blob = new Blob([sql], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${get().currentProjectName.toLowerCase().replace(/\s+/g, '_')}_schema.sql`;
    a.click();
    URL.revokeObjectURL(url);
  },
}));
