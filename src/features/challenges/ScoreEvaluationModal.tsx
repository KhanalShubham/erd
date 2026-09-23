import React from 'react';
import { Trophy } from 'lucide-react';
import { useChallengeStore } from '../../stores/challengeStore';

export const ScoreEvaluationModal: React.FC = () => {
  const { lastEvaluation, isEvaluationModalOpen, closeEvaluationModal } = useChallengeStore();

  if (!isEvaluationModalOpen || !lastEvaluation) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#FAF9F5] border-2 border-zinc-900 rounded-2xl w-full max-w-2xl shadow-[6px_6px_0px_#18181B] p-6 space-y-5 animate-in fade-in zoom-in duration-150 my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-zinc-900">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#FEF08A] text-zinc-900 border-2 border-zinc-900 shadow-[1px_1px_0px_#18181B]">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 font-mono">ERD Challenge Evaluation</h3>
              <p className="text-xs text-zinc-600 font-handwriting text-sm">Structured evaluation report against canonical relational standards</p>
            </div>
          </div>
          <button
            onClick={closeEvaluationModal}
            className="p-1.5 rounded-lg border border-zinc-900 bg-white hover:bg-zinc-100 text-zinc-800 text-xs font-bold shadow-[1px_1px_0px_#18181B]"
          >
            ✕
          </button>
        </div>

        {/* Big Overall Score Card */}
        <div className="p-4 rounded-xl bg-white border-2 border-zinc-900 flex items-center justify-between shadow-[3px_3px_0px_#18181B]">
          <div>
            <span className="text-[10px] font-bold text-zinc-600 block uppercase tracking-wider font-mono">
              Total Score & Proficiency
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-4xl font-extrabold text-zinc-900 font-mono">
                {lastEvaluation.percentage}%
              </span>
              <span className="text-xs text-zinc-600 font-mono">
                ({lastEvaluation.score} / {lastEvaluation.maxScore} points)
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="px-3 py-1 rounded text-xs font-bold font-mono bg-[#FEF08A] text-zinc-900 border border-zinc-900 shadow-[1px_1px_0px_#18181B]">
              {lastEvaluation.percentage >= 90
                ? 'Mastery Level'
                : lastEvaluation.percentage >= 70
                ? 'Proficient'
                : 'Developing'}
            </span>
          </div>
        </div>

        {/* Category Breakdown Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-mono">
          <div className="p-3 rounded-lg bg-white border border-zinc-300">
            <span className="text-zinc-600 block text-[10px] uppercase">Entities</span>
            <span className="text-base font-bold text-zinc-900">
              {lastEvaluation.entitiesScore.score} / {lastEvaluation.entitiesScore.max}
            </span>
          </div>
          <div className="p-3 rounded-lg bg-white border border-zinc-300">
            <span className="text-zinc-600 block text-[10px] uppercase">Attributes</span>
            <span className="text-base font-bold text-zinc-900">
              {lastEvaluation.attributesScore.score} / {lastEvaluation.attributesScore.max}
            </span>
          </div>
          <div className="p-3 rounded-lg bg-white border border-zinc-300">
            <span className="text-zinc-600 block text-[10px] uppercase">Primary Keys</span>
            <span className="text-base font-bold text-zinc-900">
              {lastEvaluation.keysScore.score} / {lastEvaluation.keysScore.max}
            </span>
          </div>
          <div className="p-3 rounded-lg bg-white border border-zinc-300">
            <span className="text-zinc-600 block text-[10px] uppercase">Relationships</span>
            <span className="text-base font-bold text-zinc-900">
              {lastEvaluation.relationshipsScore.score} / {lastEvaluation.relationshipsScore.max}
            </span>
          </div>
          <div className="p-3 rounded-lg bg-white border border-zinc-300">
            <span className="text-zinc-600 block text-[10px] uppercase">Cardinality</span>
            <span className="text-base font-bold text-zinc-900">
              {lastEvaluation.cardinalityScore.score} / {lastEvaluation.cardinalityScore.max}
            </span>
          </div>
          <div className="p-3 rounded-lg bg-white border border-zinc-300">
            <span className="text-zinc-600 block text-[10px] uppercase">Foreign Keys</span>
            <span className="text-base font-bold text-zinc-900">
              {lastEvaluation.foreignKeysScore.score} / {lastEvaluation.foreignKeysScore.max}
            </span>
          </div>
        </div>

        {/* Detailed Feedback List */}
        <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
          <span className="text-xs font-bold text-zinc-900 block font-mono uppercase text-[10px] tracking-wider">Detailed Diagnostic Notes</span>
          {lastEvaluation.entitiesScore.feedback.map((f, i) => (
            <div key={`ent_${i}`} className="p-2.5 rounded-lg bg-white border border-zinc-300 text-xs text-zinc-800 flex items-start gap-2">
              <span className="text-zinc-900 font-bold shrink-0">•</span>
              <span>{f}</span>
            </div>
          ))}
          {lastEvaluation.cardinalityScore.feedback.map((f, i) => (
            <div key={`card_${i}`} className="p-2.5 rounded-lg bg-white border border-zinc-300 text-xs text-zinc-800 flex items-start gap-2">
              <span className="text-zinc-900 font-bold shrink-0">•</span>
              <span>{f}</span>
            </div>
          ))}
          {lastEvaluation.foreignKeysScore.feedback.map((f, i) => (
            <div key={`fk_${i}`} className="p-2.5 rounded-lg bg-white border border-zinc-300 text-xs text-zinc-800 flex items-start gap-2">
              <span className="text-zinc-900 font-bold shrink-0">•</span>
              <span>{f}</span>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end pt-2 border-t-2 border-zinc-900">
          <button
            onClick={closeEvaluationModal}
            className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs shadow-[2px_2px_0px_#18181B] transition-all border border-zinc-900"
          >
            Review & Improve ERD
          </button>
        </div>
      </div>
    </div>
  );
};
