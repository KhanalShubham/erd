import React, { useState } from 'react';
import {
  Compass,
  GraduationCap,
  Layers,
  Award,
  GitMerge,
  Save,
  FileCode,
  FolderKanban,
  Edit2,
  Check,
  Home,
  Bot,
  BookOpen,
} from 'lucide-react';
import { useLearningStore } from '../../stores/learningStore';
import { useErdStore } from '../../stores/erdStore';
import { useProjectStore } from '../../stores/projectStore';

export const Navbar: React.FC = () => {
  const {
    activeMode,
    setActiveMode,
    currentSystem,
    toggleSystemExplorer,
    toggleAiTutor,
    toggleSolutionModal,
  } = useLearningStore();

  const { entities, relationships } = useErdStore();
  const {
    currentProjectName,
    renameCurrentProject,
    saveProject,
    exportSqlFile,
    setProjectsModalOpen,
  } = useProjectStore();

  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(currentProjectName);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = () => {
    saveProject(entities, relationships);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <header className="h-12 px-4 bg-white border-b border-zinc-200 flex items-center justify-between gap-3 shrink-0 z-40 text-xs select-none">
      {/* Brand & Active Scenario */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => setActiveMode('dashboard')}
          className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
          title="Home Dashboard"
        >
          <span className="font-mono font-black text-sm tracking-tight text-zinc-950">
            ERD<span className="bg-[#FEF08A] px-1 py-0.2 rounded border border-zinc-900 ml-0.5">Lab</span>
          </span>
        </button>

        <div className="h-3.5 w-[1px] bg-zinc-300 mx-1 hidden sm:block" />

        {/* Current Scenario / Project Name */}
        <div className="flex items-center gap-1.5 min-w-0">
          {isEditingName ? (
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onBlur={() => {
                setIsEditingName(false);
                if (tempName.trim()) renameCurrentProject(tempName.trim());
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setIsEditingName(false);
                  if (tempName.trim()) renameCurrentProject(tempName.trim());
                }
              }}
              autoFocus
              className="px-2 py-0.5 rounded border border-zinc-300 text-xs font-medium text-zinc-900 focus:outline-none focus:border-zinc-900"
            />
          ) : (
            <div className="flex items-center gap-1.5 truncate">
              <button
                onClick={() => toggleSystemExplorer(true)}
                className="font-medium text-zinc-800 hover:text-black truncate flex items-center gap-1"
                title="Change Scenario"
              >
                <span className="truncate max-w-[140px] sm:max-w-xs">{currentSystem.name}</span>
                <Compass className="w-3 h-3 text-zinc-400 shrink-0" />
              </button>

              <button
                onClick={() => {
                  setTempName(currentProjectName);
                  setIsEditingName(true);
                }}
                className="text-zinc-400 hover:text-zinc-700 p-0.5"
                title="Rename Project"
              >
                <Edit2 className="w-2.5 h-2.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mode Switcher Navigation (Clean Minimalist Pills) */}
      <nav className="flex items-center gap-1 bg-zinc-100 p-0.5 rounded border border-zinc-200">
        <button
          onClick={() => setActiveMode('dashboard')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-all ${
            activeMode === 'dashboard'
              ? 'bg-white text-zinc-950 font-bold shadow-2xs border border-zinc-200'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
          title="Dashboard"
        >
          <Home className="w-3 h-3" />
          <span className="hidden md:inline">Dashboard</span>
        </button>

        <button
          onClick={() => setActiveMode('guided')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-all ${
            activeMode === 'guided'
              ? 'bg-white text-zinc-950 font-bold shadow-2xs border border-zinc-200'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
          title="Guided Step-by-Step Learning"
        >
          <GraduationCap className="w-3 h-3" />
          <span>Guided Learn</span>
        </button>

        <button
          onClick={() => setActiveMode('builder')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-all ${
            activeMode === 'builder'
              ? 'bg-white text-zinc-950 font-bold shadow-2xs border border-zinc-200'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
          title="Free ERD Canvas"
        >
          <Layers className="w-3 h-3" />
          <span>Builder</span>
        </button>

        <button
          onClick={() => setActiveMode('challenge')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-all ${
            activeMode === 'challenge'
              ? 'bg-white text-zinc-950 font-bold shadow-2xs border border-zinc-200'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
          title="Design Challenges"
        >
          <Award className="w-3 h-3" />
          <span className="hidden sm:inline">Challenges</span>
        </button>

        <button
          onClick={() => setActiveMode('normalization')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-all ${
            activeMode === 'normalization'
              ? 'bg-white text-zinc-950 font-bold shadow-2xs border border-zinc-200'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
          title="Normalization Lab"
        >
          <GitMerge className="w-3 h-3" />
          <span className="hidden md:inline">Normalization</span>
        </button>
      </nav>

      {/* Right Tools: AI Tutor, Solution, Projects, Save, SQL */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={() => toggleSolutionModal(true)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white hover:bg-zinc-100 text-zinc-900 border border-zinc-900 font-mono font-bold shadow-[1px_1px_0px_#18181B] transition-transform active:scale-95 cursor-pointer"
          title="Study Authoritative Relational Solution & Model"
        >
          <BookOpen className="w-3.5 h-3.5 text-amber-600" />
          <span className="hidden sm:inline">Solution</span>
        </button>

        <button
          onClick={() => toggleAiTutor(true)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#F6E77A] hover:bg-yellow-300 text-zinc-950 border border-zinc-900 font-mono font-bold shadow-[1px_1px_0px_#18181B] transition-transform active:scale-95 cursor-pointer"
          title="Open AI Database Tutor Notebook"
        >
          <Bot className="w-3.5 h-3.5 text-zinc-950" />
          <span>AI Tutor</span>
        </button>

        <div className="h-4 w-[1px] bg-zinc-300 mx-0.5" />

        <button
          onClick={() => setProjectsModalOpen(true)}
          className="flex items-center gap-1 px-2 py-1 rounded hover:bg-zinc-100 text-zinc-700 hover:text-zinc-950 transition-colors font-medium"
          title="Saved Projects"
        >
          <FolderKanban className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Projects</span>
        </button>

        <button
          onClick={() => exportSqlFile(entities, relationships)}
          className="flex items-center gap-1 px-2 py-1 rounded hover:bg-zinc-100 text-zinc-700 hover:text-zinc-950 transition-colors font-medium"
          title="Export SQL Schema DDL"
        >
          <FileCode className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">SQL</span>
        </button>

        <button
          onClick={handleSave}
          className="flex items-center gap-1 px-2.5 py-1 rounded border border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-800 transition-colors font-medium shadow-2xs"
          title="Save to LocalStorage"
        >
          {saveSuccess ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700">Saved</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5 text-zinc-600" />
              <span>Save</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
