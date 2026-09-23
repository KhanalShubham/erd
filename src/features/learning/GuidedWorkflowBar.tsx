import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  X,
} from 'lucide-react';
import { useLearningStore } from '../../stores/learningStore';
import { guidedLessons } from '../../data/lessons/guidedLessons';

export const GuidedWorkflowBar: React.FC = () => {
  const {
    guidedStepIndex,
    nextGuidedStep,
    prevGuidedStep,
    revealedHintsCount,
    revealNextHint,
  } = useLearningStore();

  const currentStep = guidedLessons[guidedStepIndex] || guidedLessons[0];
  const hintsRevealed = revealedHintsCount[currentStep.stepNumber] || 0;
  const availableHints = currentStep.hints;

  const [isHintOpen, setIsHintOpen] = useState(false);

  const handleRevealHint = () => {
    if (hintsRevealed < availableHints.length) {
      revealNextHint(currentStep.stepNumber);
    }
    setIsHintOpen(true);
  };

  return (
    <div className="bg-white border-b border-zinc-200 px-4 py-2 flex items-center justify-between gap-4 text-xs select-none shrink-0 z-20 shadow-2xs">
      {/* Left: Previous Button & Step Indicator */}
      <div className="flex items-center gap-2">
        <button
          onClick={prevGuidedStep}
          disabled={guidedStepIndex === 0}
          className="flex items-center gap-1 px-2.5 py-1 rounded border border-zinc-300 bg-white hover:bg-zinc-50 disabled:opacity-30 disabled:hover:bg-white text-zinc-700 transition-colors font-medium text-[11px]"
          title="Previous Step"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Previous</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-zinc-950 text-xs px-2 py-0.5 rounded bg-[#FEF08A] border border-zinc-900">
            Step {currentStep.stepNumber} of 11
          </span>
          <span className="font-semibold text-zinc-900 hidden sm:inline">
            {currentStep.title}
          </span>
        </div>
      </div>

      {/* Center: Concise instruction */}
      <div className="hidden lg:block text-zinc-600 truncate max-w-lg text-[11px] font-sans">
        "{currentStep.instruction}"
      </div>

      {/* Right: Hint & Next Button */}
      <div className="flex items-center gap-2 relative">
        <button
          onClick={handleRevealHint}
          className="flex items-center gap-1 px-2.5 py-1 rounded border border-zinc-300 bg-white hover:bg-yellow-50 text-zinc-800 transition-colors font-medium text-[11px]"
          title="Get a hint for this step"
        >
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
          <span>Hint</span>
        </button>

        <button
          onClick={nextGuidedStep}
          disabled={guidedStepIndex >= guidedLessons.length - 1}
          className="flex items-center gap-1 px-3 py-1 rounded bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 text-white font-medium text-[11px] transition-colors"
          title="Next Step"
        >
          <span>Next</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        {/* Handwritten-style Sticky Note Hint Flyout */}
        {isHintOpen && (
          <div className="absolute right-0 top-full mt-2 w-72 p-3.5 bg-[#FEF9C3] border border-yellow-300 rounded shadow-md z-50 animate-in fade-in zoom-in-95 duration-100 text-zinc-900">
            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-yellow-300/70">
              <span className="font-handwriting text-base font-bold text-zinc-900 flex items-center gap-1">
                <span>💡 Notebook Note</span>
              </span>
              <button
                onClick={() => setIsHintOpen(false)}
                className="text-zinc-500 hover:text-zinc-900 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1.5 font-handwriting text-sm leading-relaxed text-zinc-850">
              {availableHints.slice(0, Math.max(1, hintsRevealed)).map((hint, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <span className="font-bold text-zinc-700">#{i + 1}</span>
                  <span>{hint}</span>
                </div>
              ))}
            </div>

            {hintsRevealed < availableHints.length && (
              <button
                onClick={() => revealNextHint(currentStep.stepNumber)}
                className="mt-2 text-[11px] text-zinc-800 underline font-sans font-medium hover:text-black block"
              >
                Reveal next clue ({hintsRevealed}/{availableHints.length})
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
