import React, { useState } from 'react';
import { Trophy, CheckCircle2, FileText, ShieldAlert } from 'lucide-react';
import { useChallengeStore } from '../../stores/challengeStore';
import { MarkdownRenderer } from '../../components/common/MarkdownRenderer';

export const ScoreEvaluationModal: React.FC = () => {
  const { lastEvaluation, isEvaluationModalOpen, closeEvaluationModal } = useChallengeStore();
  const [activeTab, setActiveTab] = useState<'audit' | 'rubric'>('audit');

  if (!isEvaluationModalOpen || !lastEvaluation) return null;

  const report = lastEvaluation.validationReport;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-[#FAF9F5] border-2 border-zinc-900 rounded-2xl w-full max-w-3xl shadow-[6px_6px_0px_#18181B] p-5 space-y-4 my-auto max-h-[92vh] flex flex-col text-zinc-900 font-sans">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-zinc-900 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#FEF08A] text-zinc-900 border-2 border-zinc-900 shadow-[1px_1px_0px_#18181B]">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 font-mono">ERD Challenge Evaluation & Audit</h3>
              <p className="text-xs text-zinc-600 font-handwriting text-sm">
                Relational correctness, cardinality triangulation, and schema integrity
              </p>
            </div>
          </div>
          <button
            onClick={closeEvaluationModal}
            className="p-1.5 rounded-lg border border-zinc-900 bg-white hover:bg-zinc-100 text-zinc-800 text-xs font-bold shadow-[1px_1px_0px_#18181B]"
          >
            ✕
          </button>
        </div>

        {/* Big Overall Score Card with Error Counts */}
        <div className="p-3.5 rounded-xl bg-white border-2 border-zinc-900 flex flex-wrap items-center justify-between gap-3 shadow-[3px_3px_0px_#18181B] shrink-0">
          <div>
            <span className="text-[10px] font-bold text-zinc-600 block uppercase tracking-wider font-mono">
              Total Score & Proficiency
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-3xl font-extrabold text-zinc-900 font-mono">
                {lastEvaluation.percentage}%
              </span>
              <span className="text-xs text-zinc-600 font-mono">
                ({lastEvaluation.score} / {lastEvaluation.maxScore} points)
              </span>
            </div>
          </div>

          {/* Validation Status Badges */}
          {report && (
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-1 rounded text-xs font-mono font-bold border flex items-center gap-1 ${
                  report.overallStatus === 'PASS'
                    ? 'bg-emerald-100 text-emerald-950 border-emerald-600'
                    : 'bg-rose-100 text-rose-950 border-rose-600'
                }`}
              >
                {report.overallStatus === 'PASS' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                )}
                <span>Audit: {report.overallStatus}</span>
              </span>

              {report.criticalErrorCount > 0 && (
                <span className="px-2 py-1 rounded text-xs font-mono font-bold bg-rose-50 text-rose-700 border border-rose-300">
                  {report.criticalErrorCount} Critical Error{report.criticalErrorCount > 1 ? 's' : ''}
                </span>
              )}
            </div>
          )}
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 border-b border-zinc-200 pb-1 shrink-0 font-mono text-xs font-bold">
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1 rounded border transition-colors flex items-center gap-1.5 ${
              activeTab === 'audit'
                ? 'bg-[#F6E77A] text-zinc-950 border-zinc-900 shadow-[1px_1px_0px_#18181B]'
                : 'bg-white text-zinc-600 border-zinc-300 hover:bg-zinc-50'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Section 31 Educational ERD Audit</span>
          </button>
          <button
            onClick={() => setActiveTab('rubric')}
            className={`px-3 py-1 rounded border transition-colors ${
              activeTab === 'rubric'
                ? 'bg-[#F6E77A] text-zinc-950 border-zinc-900 shadow-[1px_1px_0px_#18181B]'
                : 'bg-white text-zinc-600 border-zinc-300 hover:bg-zinc-50'
            }`}
          >
            📊 Rubric Scores & Categories
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3">
          {activeTab === 'audit' && report ? (
            <div className="p-4 bg-white border border-zinc-300 rounded-xl space-y-3 shadow-2xs">
              <MarkdownRenderer content={report.formattedMarkdownReport} className="text-xs" />
            </div>
          ) : (
            <div className="space-y-3">
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

              {/* Detailed Diagnostic Notes */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-zinc-900 block font-mono uppercase text-[10px] tracking-wider">
                  Rubric Notes
                </span>
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
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center pt-2 border-t-2 border-zinc-900 shrink-0">
          <div className="text-[11px] text-zinc-600 font-mono">
            {report?.overallStatus === 'FAIL' ? '⚠️ Resolve critical issues to satisfy relational correctness.' : '✓ ERD model is consistent with business rules.'}
          </div>
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
