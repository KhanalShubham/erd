import React, { useState, useEffect, useRef } from 'react';
import {
  FolderKanban,
  Plus,
  Upload,
  Download,
  Trash2,
  Copy,
  ExternalLink,
  Search,
  X,
  Clock,
  Database,
  Layers,
  CheckCircle,
} from 'lucide-react';
import { useProjectStore } from '../../stores/projectStore';
import { useErdStore } from '../../stores/erdStore';

export const ProjectsModal: React.FC = () => {
  const {
    isProjectsModalOpen,
    setProjectsModalOpen,
    savedProjects,
    listSavedProjects,
    currentProjectId,
    loadProject,
    deleteProject,
    duplicateProject,
    createNewProject,
    importProjectJson,
    exportProjectJson,
  } = useProjectStore();

  const { entities, relationships, resetToBlank } = useErdStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [newProjectName, setNewProjectName] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isProjectsModalOpen) {
      listSavedProjects();
    }
  }, [isProjectsModalOpen, listSavedProjects]);

  if (!isProjectsModalOpen) return null;

  const filteredProjects = savedProjects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLoad = (id: string) => {
    const data = loadProject(id);
    if (data) {
      useErdStore.setState({
        entities: data.entities,
        relationships: data.relationships,
      });
      setProjectsModalOpen(false);
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    createNewProject(newProjectName.trim());
    resetToBlank();
    setNewProjectName('');
    setIsCreatingNew(false);
    setProjectsModalOpen(false);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const result = importProjectJson(content);
        if (result) {
          useErdStore.setState({
            entities: result.entities,
            relationships: result.relationships,
          });
          listSavedProjects();
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-[#FAF9F5] border-2 border-zinc-900 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-[6px_6px_0px_#18181B] overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Modal Header */}
        <div className="p-5 border-b-2 border-zinc-900 flex items-center justify-between gap-4 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FEF08A] text-zinc-900 border-2 border-zinc-900 flex items-center justify-center shadow-[1px_1px_0px_#18181B]">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 font-mono">Project Manager</h2>
              <p className="text-xs text-zinc-600 font-handwriting text-sm">
                Manage, save, duplicate, and export your database designs locally
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCreatingNew(!isCreatingNew)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold shadow-[2px_2px_0px_#18181B] transition-colors border border-zinc-900"
            >
              <Plus className="w-4 h-4" />
              <span>New Project</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-zinc-100 text-zinc-800 text-xs font-semibold border border-zinc-900 shadow-[1px_1px_0px_#18181B] transition-colors"
              title="Import ERD JSON"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import</span>
            </button>
            <input
              type="file"
              accept=".json"
              ref={fileInputRef}
              onChange={handleImportFile}
              className="hidden"
            />

            <button
              onClick={() => setProjectsModalOpen(false)}
              className="p-1.5 rounded-lg border border-zinc-900 bg-white hover:bg-zinc-100 text-zinc-800 text-xs font-bold ml-2 shadow-[1px_1px_0px_#18181B]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Create New Inline Form */}
        {isCreatingNew && (
          <form
            onSubmit={handleCreate}
            className="p-4 bg-white border-b-2 border-zinc-900 flex items-center gap-3 animate-in fade-in duration-150"
          >
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Enter new project name (e.g., FinTech Payment Gateway)..."
              autoFocus
              className="flex-1 px-3.5 py-1.5 rounded-lg bg-[#FAF9F5] border-2 border-zinc-900 text-xs font-mono text-zinc-900 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!newProjectName.trim()}
              className="px-4 py-1.5 rounded-lg bg-[#FEF08A] text-zinc-900 border-2 border-zinc-900 font-bold text-xs shadow-[2px_2px_0px_#18181B] disabled:opacity-50"
            >
              Create
            </button>
            <button
              type="button"
              onClick={() => setIsCreatingNew(false)}
              className="px-3 py-1.5 rounded-lg bg-white border border-zinc-900 text-zinc-700 text-xs font-semibold shadow-[1px_1px_0px_#18181B]"
            >
              Cancel
            </button>
          </form>
        )}

        {/* Search Bar */}
        <div className="p-3 border-b border-zinc-300 bg-white">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search saved projects by name..."
              className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-[#FAF9F5] border border-zinc-400 text-xs font-mono text-zinc-900 focus:outline-none focus:border-zinc-900"
            />
          </div>
        </div>

        {/* Projects List Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Database className="w-10 h-10 text-zinc-400 mx-auto" />
              <p className="text-sm font-semibold text-zinc-700 font-mono">No saved projects found</p>
              <p className="text-xs text-zinc-600 font-handwriting text-sm max-w-sm mx-auto">
                Save your current work using the Save button in the navbar, or create a new blank project above.
              </p>
            </div>
          ) : (
            filteredProjects.map((project) => {
              const isActive = project.id === currentProjectId;
              return (
                <div
                  key={project.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isActive
                      ? 'bg-white border-2 border-zinc-900 shadow-[3px_3px_0px_#18181B]'
                      : 'bg-white border border-zinc-300 hover:border-zinc-900'
                  }`}
                >
                  {/* Left: Info */}
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-zinc-900 font-mono truncate">
                        {project.name}
                      </h3>
                      {isActive && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#FEF08A] text-zinc-900 border border-zinc-900 text-[10px] font-bold font-mono shadow-[1px_1px_0px_#18181B]">
                          <CheckCircle className="w-2.5 h-2.5" />
                          Active
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-zinc-600 font-mono text-[11px]">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-zinc-500" />
                        {formatDate(project.updatedAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-zinc-700" />
                        {project.entitiesCount} {project.entitiesCount === 1 ? 'Entity' : 'Entities'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Database className="w-3.5 h-3.5 text-zinc-700" />
                        {project.relationshipsCount}{' '}
                        {project.relationshipsCount === 1 ? 'Relationship' : 'Relationships'}
                      </span>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {!isActive && (
                      <button
                        onClick={() => handleLoad(project.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FEF08A] hover:bg-yellow-300 text-zinc-900 border border-zinc-900 text-xs font-bold transition-colors shadow-[1px_1px_0px_#18181B]"
                        title="Load project onto canvas"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Load</span>
                      </button>
                    )}

                    <button
                      onClick={() => duplicateProject(project.id)}
                      className="p-1.5 rounded-lg bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-400 transition-colors shadow-[1px_1px_0px_#18181B]"
                      title="Duplicate project"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => exportProjectJson(entities, relationships)}
                      className="p-1.5 rounded-lg bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-400 transition-colors shadow-[1px_1px_0px_#18181B]"
                      title="Export JSON"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Delete project "${project.name}"?`)) {
                          deleteProject(project.id);
                        }
                      }}
                      className="p-1.5 rounded-lg bg-white hover:bg-rose-50 text-zinc-500 hover:text-rose-600 border border-zinc-400 transition-colors shadow-[1px_1px_0px_#18181B]"
                      title="Delete project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Note */}
        <div className="p-3 bg-white border-t-2 border-zinc-900 text-center text-xs text-zinc-600 font-handwriting text-sm">
          Projects are automatically stored locally in your browser session. Use "Export JSON" to share or keep permanent backups.
        </div>
      </div>
    </div>
  );
};
