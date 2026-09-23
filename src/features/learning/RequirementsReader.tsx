import React, { useState } from 'react';
import {
  FileText,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';
import { useLearningStore } from '../../stores/learningStore';
import { guidedLessons } from '../../data/lessons/guidedLessons';

export const RequirementsReader: React.FC = () => {
  const { currentSystem, guidedStepIndex } = useLearningStore();
  const currentStep = guidedLessons[guidedStepIndex] || guidedLessons[0];

  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // If user minimized the prompt to keep canvas 100% clean
  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="absolute bottom-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1.5 bg-white border border-zinc-300 rounded-md shadow-xs text-xs text-zinc-700 hover:text-zinc-950 font-medium transition-colors"
        title="Show learning prompt"
      >
        <FileText className="w-3.5 h-3.5 text-zinc-500" />
        <span>Prompt: {currentStep.title}</span>
      </button>
    );
  }

  // Find relevant requirement for the current step if available
  const sampleReq = currentSystem.requirements[0]?.text || currentSystem.scenarioStory;

  return (
    <div className="absolute bottom-4 left-4 z-20 w-80 bg-white/95 border border-zinc-300 rounded-md shadow-xs flex flex-col overflow-hidden text-xs text-zinc-900 select-none animate-in fade-in duration-100">
      {/* Header */}
      <div className="px-3 py-2 bg-[#FEF08A] border-b border-zinc-300 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="font-mono font-bold text-[11px] uppercase tracking-wide text-zinc-950">
            Step {currentStep.stepNumber}: {currentStep.title}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-0.5 text-zinc-600 hover:text-zinc-900"
            title={isExpanded ? 'Collapse requirements' : 'View all requirements'}
          >
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setIsMinimized(true)}
            className="p-0.5 text-zinc-600 hover:text-zinc-900"
            title="Minimize prompt"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Learning Prompt */}
      <div className="p-3 space-y-2">
        <p className="text-zinc-700 font-sans text-xs leading-relaxed">
          {currentStep.instruction}
        </p>

        {/* Small italicized quote from requirements */}
        <div className="p-2 rounded bg-yellow-50/70 border border-yellow-200/80 text-[11px] font-handwriting text-zinc-800 text-sm leading-snug">
          "{sampleReq}"
        </div>

        {/* Expandable full requirements list */}
        {isExpanded && (
          <div className="pt-2 border-t border-zinc-200 space-y-2 max-h-48 overflow-y-auto pr-1">
            <span className="font-bold text-[10px] uppercase text-zinc-500 tracking-wider block">
              All Requirements ({currentSystem.requirements.length})
            </span>
            {currentSystem.requirements.map((req, idx) => (
              <div key={req.id} className="p-2 rounded bg-zinc-50 border border-zinc-200 text-[11px] space-y-1">
                <span className="font-mono font-bold text-zinc-600">REQ {idx + 1}:</span>
                <p className="text-zinc-800 font-sans">{req.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
