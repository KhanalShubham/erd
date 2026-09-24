import React, { useState } from 'react';
import { Navbar } from './components/layout/Navbar';
import { BottomDock } from './components/layout/BottomDock';
import { ErdCanvas } from './features/erd/ErdCanvas';
import { InspectorPanel } from './features/erd/inspector/InspectorPanel';
import { RequirementsReader } from './features/learning/RequirementsReader';
import { GuidedWorkflowBar } from './features/learning/GuidedWorkflowBar';
import { ChallengeRunner } from './features/challenges/ChallengeRunner';
import { ScoreEvaluationModal } from './features/challenges/ScoreEvaluationModal';
import { NormalizationLab } from './features/normalization/NormalizationLab';
import { SystemExplorerModal } from './features/systems/SystemExplorerModal';
import { WelcomeModal } from './features/home/WelcomeModal';
import { DashboardView } from './features/home/DashboardView';
import { KeysLabModal } from './features/learning/KeysLabModal';
import { AdvancedConceptsModal } from './features/learning/AdvancedConceptsModal';
import { AiTutorModal } from './features/learning/AiTutorModal';
import { ProjectsModal } from './features/projects/ProjectsModal';
import { SolutionModal } from './features/challenges/SolutionModal';
import { useLearningStore } from './stores/learningStore';

export const App: React.FC = () => {
  const {
    activeMode,
    isKeysLabOpen,
    toggleKeysLab,
    isAdvancedLabOpen,
    toggleAdvancedLab,
    isAiTutorOpen,
    toggleAiTutor,
    isSolutionModalOpen,
    toggleSolutionModal,
  } = useLearningStore();
  const [showWelcome, setShowWelcome] = useState(false);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#FAF9F5] text-zinc-900 font-sans select-none">
      {/* Top Minimal Navigation */}
      <Navbar />

      {/* Guided Mode Step Bar */}
      {activeMode === 'guided' && <GuidedWorkflowBar />}

      {/* Main Workspace Area (Canvas takes 85-90%+ of screen) */}
      <main className="flex-1 flex overflow-hidden relative">
        {activeMode === 'dashboard' ? (
          <DashboardView />
        ) : activeMode === 'normalization' ? (
          <div className="flex-1 overflow-auto bg-[#FAF9F5]">
            <NormalizationLab />
          </div>
        ) : (
          <div className="flex-1 h-full w-full relative">
            {/* The ERD Canvas dominates the entire workspace */}
            <ErdCanvas />

            {/* Contextual Floating Learning Prompts (Left Corner) */}
            {activeMode === 'guided' && <RequirementsReader />}
            {activeMode === 'challenge' && <ChallengeRunner />}

            {/* Contextual Floating Inspector (Right Corner, appears only when table/attr selected) */}
            <InspectorPanel />
          </div>
        )}
      </main>

      {/* Bottom Multi-Tab Dock (Collapsed by default, expands cleanly on demand) */}
      {activeMode !== 'normalization' && activeMode !== 'dashboard' && <BottomDock />}

      {/* Modals */}
      <SystemExplorerModal />
      <ScoreEvaluationModal />
      <ProjectsModal />
      <KeysLabModal isOpen={isKeysLabOpen} onClose={() => toggleKeysLab(false)} />
      <AdvancedConceptsModal isOpen={isAdvancedLabOpen} onClose={() => toggleAdvancedLab(false)} />
      <AiTutorModal isOpen={isAiTutorOpen} onClose={() => toggleAiTutor(false)} />
      <SolutionModal isOpen={isSolutionModalOpen} onClose={() => toggleSolutionModal(false)} />
      <WelcomeModal isOpen={showWelcome} onClose={() => setShowWelcome(false)} />
    </div>
  );
};

export default App;
