import React from 'react';
import {
  Compass,
  GraduationCap,
  Layers,
  Award,
  ArrowRight,
} from 'lucide-react';
import { useLearningStore } from '../../stores/learningStore';
import { lmsSystem } from '../../data/systems/lms';
import { useErdStore } from '../../stores/erdStore';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose }) => {
  const { setActiveMode, toggleSystemExplorer, setCurrentSystem } = useLearningStore();
  const { loadScenario, resetToBlank } = useErdStore();

  if (!isOpen) return null;

  const handleStartLearning = () => {
    setCurrentSystem(lmsSystem);
    loadScenario(lmsSystem);
    setActiveMode('guided');
    onClose();
  };

  const handleBuildErd = () => {
    resetToBlank();
    setActiveMode('builder');
    onClose();
  };

  const handleTryChallenge = () => {
    setCurrentSystem(lmsSystem);
    resetToBlank();
    setActiveMode('challenge');
    onClose();
  };

  const handleExploreSystems = () => {
    onClose();
    toggleSystemExplorer(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-[#FAF9F5] border-2 border-zinc-900 rounded-3xl w-full max-w-3xl shadow-[8px_8px_0px_#18181B] p-8 sm:p-10 space-y-8 animate-in fade-in zoom-in duration-150">
        {/* Main Headline & Supporting Text */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FEF08A] border-2 border-zinc-900 text-zinc-900 text-xs font-mono font-bold shadow-[1px_1px_0px_#18181B]">
            <span>Interactive ERD & Database Design Laboratory</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight leading-tight font-mono">
            Understand Databases by Building Them
          </h1>

          <p className="text-zinc-600 font-handwriting text-lg max-w-xl mx-auto leading-relaxed">
            "A student learns database design by drawing simple tables with a pen and ruler on paper."
          </p>
        </div>

        {/* Primary Action Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Start Learning */}
          <button
            onClick={handleStartLearning}
            className="p-5 rounded-xl bg-white border-2 border-zinc-900 hover:shadow-[4px_4px_0px_#18181B] hover:-translate-y-0.5 text-left group transition-all duration-150 flex flex-col justify-between shadow-[2px_2px_0px_#18181B]"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-[#FEF08A] text-zinc-900 border border-zinc-900 flex items-center justify-center mb-3 shadow-[1px_1px_0px_#18181B]">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900 group-hover:underline font-mono">
                Start Guided Learning
              </h3>
              <p className="text-xs text-zinc-600 mt-1 leading-relaxed font-sans">
                Step-by-step interactive workflow: Entities → Attributes → Keys → Relationships → Normalization → SQL.
              </p>
            </div>
            <div className="pt-3 mt-3 border-t border-zinc-200 flex items-center gap-1.5 text-xs font-bold font-mono text-zinc-900">
              <span>Begin Step 1</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Explore Systems */}
          <button
            onClick={handleExploreSystems}
            className="p-5 rounded-xl bg-white border-2 border-zinc-900 hover:shadow-[4px_4px_0px_#18181B] hover:-translate-y-0.5 text-left group transition-all duration-150 flex flex-col justify-between shadow-[2px_2px_0px_#18181B]"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-[#FEF08A] text-zinc-900 border border-zinc-900 flex items-center justify-center mb-3 shadow-[1px_1px_0px_#18181B]">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900 group-hover:underline font-mono">
                Explore Real Systems
              </h3>
              <p className="text-xs text-zinc-600 mt-1 leading-relaxed font-sans">
                Choose from 18+ scenarios: LMS, Hospital, E-Commerce, Banking, Airline, and more.
              </p>
            </div>
            <div className="pt-3 mt-3 border-t border-zinc-200 flex items-center gap-1.5 text-xs font-bold font-mono text-zinc-900">
              <span>Browse Catalog</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Build an ERD */}
          <button
            onClick={handleBuildErd}
            className="p-5 rounded-xl bg-white border-2 border-zinc-900 hover:shadow-[4px_4px_0px_#18181B] hover:-translate-y-0.5 text-left group transition-all duration-150 flex flex-col justify-between shadow-[2px_2px_0px_#18181B]"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-[#FEF08A] text-zinc-900 border border-zinc-900 flex items-center justify-center mb-3 shadow-[1px_1px_0px_#18181B]">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900 group-hover:underline font-mono">
                Free ERD Canvas
              </h3>
              <p className="text-xs text-zinc-600 mt-1 leading-relaxed font-sans">
                Blank canvas with ruler-drawn tables. Add entities, connect relations, and generate real SQL.
              </p>
            </div>
            <div className="pt-3 mt-3 border-t border-zinc-200 flex items-center gap-1.5 text-xs font-bold font-mono text-zinc-900">
              <span>Open Blank Canvas</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Try a Challenge */}
          <button
            onClick={handleTryChallenge}
            className="p-5 rounded-xl bg-white border-2 border-zinc-900 hover:shadow-[4px_4px_0px_#18181B] hover:-translate-y-0.5 text-left group transition-all duration-150 flex flex-col justify-between shadow-[2px_2px_0px_#18181B]"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-[#FEF08A] text-zinc-900 border border-zinc-900 flex items-center justify-center mb-3 shadow-[1px_1px_0px_#18181B]">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900 group-hover:underline font-mono">
                Take a Challenge
              </h3>
              <p className="text-xs text-zinc-600 mt-1 leading-relaxed font-sans">
                Test your skills with automated rubric evaluation, diagnostic grading, and constraint feedback.
              </p>
            </div>
            <div className="pt-3 mt-3 border-t border-zinc-200 flex items-center gap-1.5 text-xs font-bold font-mono text-zinc-900">
              <span>Start Challenge</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>

        {/* Dismiss Button */}
        <div className="text-center pt-2">
          <button
            onClick={onClose}
            className="text-xs text-zinc-600 hover:text-zinc-900 underline font-mono font-medium"
          >
            Enter Studio Directly
          </button>
        </div>
      </div>
    </div>
  );
};
