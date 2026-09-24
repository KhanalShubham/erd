import React, { useState } from 'react';
import {
  Award,
  CheckSquare,
  Trophy,
  ChevronDown,
  ChevronUp,
  X,
  BookOpen,
} from 'lucide-react';
import { useLearningStore } from '../../stores/learningStore';
import { useErdStore } from '../../stores/erdStore';
import { useChallengeStore } from '../../stores/challengeStore';

export const ChallengeRunner: React.FC = () => {
  const { currentSystem, toggleSolutionModal } = useLearningStore();
  const { entities, relationships } = useErdStore();
  const { evaluateErd } = useChallengeStore();

  const [isMinimized, setIsMinimized] = useState(false);
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);

  const handleEvaluate = () => {
    evaluateErd(entities, relationships, currentSystem);
  };

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="absolute bottom-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1.5 bg-white border border-zinc-900 rounded shadow-xs text-xs font-medium text-zinc-900 hover:bg-yellow-50"
      >
        <Award className="w-3.5 h-3.5 text-amber-500" />
        <span>Challenge Brief: {currentSystem.name}</span>
      </button>
    );
  }

  return (
    <div className="absolute bottom-4 left-4 z-20 w-80 bg-white border border-zinc-900 rounded shadow-xs flex flex-col overflow-hidden text-xs text-zinc-900 select-none animate-in fade-in duration-100">
      {/* Header (Yellow Highlighter Strip) */}
      <div className="px-3 py-2 bg-[#FEF08A] border-b border-zinc-900 flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-mono font-bold text-xs">
          <Award className="w-3.5 h-3.5 text-zinc-900" />
          <span>Challenge: {currentSystem.name}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsChecklistOpen(!isChecklistOpen)}
            className="p-0.5 text-zinc-600 hover:text-zinc-950"
            title={isChecklistOpen ? 'Hide requirements' : 'Show requirements'}
          >
            {isChecklistOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setIsMinimized(true)}
            className="p-0.5 text-zinc-600 hover:text-zinc-950"
            title="Minimize"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Brief */}
      <div className="p-3 space-y-2">
        <p className="text-zinc-700 text-[11px] leading-relaxed">
          Design the tables and relationships on the canvas to satisfy the requirements. When ready, test your design against the evaluation rubric.
        </p>

        {isChecklistOpen && (
          <div className="pt-2 border-t border-zinc-200 space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {currentSystem.requirements.map((req) => (
              <div key={req.id} className="p-1.5 rounded bg-zinc-50 border border-zinc-200 text-[11px] flex items-start gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" />
                <span className="text-zinc-800 leading-snug">{req.text}</span>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-1.5 pt-1">
          <button
            onClick={handleEvaluate}
            className="w-full py-2 px-3 rounded bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-300" />
            <span>Submit for Evaluation</span>
          </button>

          <button
            onClick={() => toggleSolutionModal(true)}
            className="w-full py-1.5 px-3 rounded bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-950 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-700" />
            <span>📖 Study Authoritative Solution</span>
          </button>
        </div>
      </div>
    </div>
  );
};
