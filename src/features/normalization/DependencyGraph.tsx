import React from 'react';
import { ArrowRight, AlertTriangle } from 'lucide-react';
import { useNormalizationStore } from '../../stores/normalizationStore';

export const DependencyGraph: React.FC = () => {
  const { dependencies, currentLevel } = useNormalizationStore();

  const getDependencyBadge = (type: string) => {
    switch (type) {
      case 'partial':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-400">
            Partial Dependency (Violates 2NF)
          </span>
        );
      case 'transitive':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-900 border border-rose-400">
            Transitive Dependency (Violates 3NF)
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-400">
            Full Functional Dependency (Valid)
          </span>
        );
    }
  };

  return (
    <div className="p-4 rounded-xl bg-white border-2 border-zinc-900 space-y-4 shadow-[3px_3px_0px_#18181B]">
      <div className="flex items-center justify-between pb-2 border-b border-zinc-300">
        <div>
          <h4 className="font-bold text-sm text-zinc-900 flex items-center gap-2 font-mono">
            <span>Functional Dependency Visualizer</span>
          </h4>
          <p className="text-xs text-zinc-600 font-handwriting text-sm">
            A functional dependency (X → Y) states that the value of attribute X uniquely determines attribute Y.
          </p>
        </div>
        <span className="px-2.5 py-1 rounded text-xs font-mono bg-[#FEF08A] text-zinc-900 font-bold border border-zinc-900 shadow-[1px_1px_0px_#18181B]">
          Stage: {currentLevel}
        </span>
      </div>

      {/* Dependencies Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {dependencies.map((fd) => {
          const isViolatingAtCurrentLevel =
            (currentLevel === '1NF' && fd.type === 'partial') ||
            (currentLevel === '2NF' && fd.type === 'transitive');

          return (
            <div
              key={fd.id}
              className={`p-3.5 rounded-lg border transition-all ${
                isViolatingAtCurrentLevel
                  ? 'bg-amber-50/70 border-2 border-amber-600 shadow-sm'
                  : 'bg-zinc-50 border border-zinc-300'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                {getDependencyBadge(fd.type)}
                {isViolatingAtCurrentLevel && (
                  <span className="flex items-center gap-1 text-[11px] text-amber-800 font-bold font-mono">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Must Decompose</span>
                  </span>
                )}
              </div>

              {/* Visual Dependency Arrow */}
              <div className="p-2.5 rounded bg-white border border-zinc-900 flex items-center justify-center gap-3 my-2 font-mono text-xs shadow-[1px_1px_0px_#18181B]">
                <div className="px-2.5 py-1 rounded bg-zinc-100 text-zinc-900 font-bold border border-zinc-800">
                  {fd.determinants.join(', ')}
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-600" />
                <div className="px-2.5 py-1 rounded bg-[#FEF08A] text-zinc-900 font-bold border border-zinc-800">
                  {fd.dependents.join(', ')}
                </div>
              </div>

              <p className="text-[11px] text-zinc-600 mt-2 leading-relaxed">{fd.explanation}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
