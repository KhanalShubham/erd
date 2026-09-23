import React from 'react';
import {
  GitMerge,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Table,
} from 'lucide-react';
import { useNormalizationStore } from '../../stores/normalizationStore';
import { DependencyGraph } from './DependencyGraph';
import type { NormalFormLevel } from '../../types/normalization';

export const NormalizationLab: React.FC = () => {
  const { currentLevel, setCurrentLevel, nextLevel, prevLevel, stages } = useNormalizationStore();

  const currentStage = stages.find((s) => s.level === currentLevel) || stages[0];
  const levels: NormalFormLevel[] = ['UNF', '1NF', '2NF', '3NF'];

  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto space-y-6 max-w-6xl mx-auto bg-[#FAF9F5] text-zinc-900">
      {/* Top Stage Pipeline Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b-2 border-zinc-900 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded border border-zinc-900 bg-[#FEF08A] flex items-center justify-center shadow-[1px_1px_0px_#18181B]">
              <GitMerge className="w-4 h-4 text-zinc-900" />
            </div>
            <h2 className="text-lg font-bold text-zinc-900 font-mono tracking-tight">Interactive Normalization Laboratory</h2>
          </div>
          <p className="text-xs text-zinc-600 font-handwriting text-sm">
            Observe step-by-step how unnormalized tables decompose into 1NF, 2NF, and 3NF to eliminate anomalies.
          </p>
        </div>

        {/* Level Step Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-white border-2 border-zinc-900 rounded-lg shadow-[2px_2px_0px_#18181B]">
          {levels.map((lvl) => {
            const isActive = currentLevel === lvl;
            return (
              <button
                key={lvl}
                onClick={() => setCurrentLevel(lvl)}
                className={`px-3 py-1 rounded text-xs font-bold font-mono transition-all ${
                  isActive
                    ? 'bg-[#FEF08A] text-zinc-900 border border-zinc-900 shadow-[1px_1px_0px_#18181B]'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
              >
                {lvl}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stage Card: Definition & Problem Statement */}
      <div className="p-5 rounded-xl bg-white border-2 border-zinc-900 shadow-[3px_3px_0px_#18181B] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold bg-[#FEF08A] text-zinc-900 px-2 py-0.5 rounded border border-zinc-900 tracking-wider uppercase font-mono shadow-[1px_1px_0px_#18181B]">
              Stage: {currentStage.level}
            </span>
            <h3 className="text-base font-bold text-zinc-900 mt-1.5 font-mono">{currentStage.title}</h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={prevLevel}
              disabled={currentLevel === 'UNF'}
              className="p-1.5 rounded border border-zinc-900 bg-white hover:bg-zinc-100 text-zinc-800 disabled:opacity-30 transition-colors shadow-[1px_1px_0px_#18181B]"
              title="Previous Normal Form"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextLevel}
              disabled={currentLevel === '3NF'}
              className="flex items-center gap-1 px-3 py-1.5 rounded border border-zinc-900 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs shadow-[2px_2px_0px_#18181B] disabled:opacity-30 transition-all"
            >
              <span>Next Stage</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Definition */}
        <div className="p-3.5 rounded-lg bg-amber-50/70 border border-amber-300 text-xs leading-relaxed text-zinc-800">
          <span className="font-bold text-zinc-900 block mb-1 font-mono uppercase text-[10px] tracking-wider">Formal Definition:</span>
          {currentStage.definition}
        </div>

        {/* Problem Statement & Violations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3.5 rounded-lg bg-rose-50/50 border border-rose-300 text-xs space-y-2 text-zinc-800">
            <span className="font-bold text-rose-900 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-700" />
              <span>Current Status & Problems</span>
            </span>
            <p className="text-zinc-700 text-[11px] leading-relaxed">{currentStage.problemStatement}</p>
          </div>

          <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-300 text-xs space-y-1.5 text-zinc-800">
            <span className="font-bold text-zinc-900 block text-xs font-mono uppercase text-[10px] tracking-wider">Identified Violations:</span>
            {currentStage.violations.length === 0 ? (
              <div className="flex items-center gap-1.5 text-emerald-700 font-semibold text-[11px] pt-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Zero violations! Full 3NF compliance achieved.</span>
              </div>
            ) : (
              currentStage.violations.map((v, i) => (
                <div key={i} className="flex items-start gap-1.5 text-rose-800 text-[11px]">
                  <span className="text-rose-600 font-bold shrink-0">•</span>
                  <span>{v}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Relational Tables for this Stage */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-zinc-900 flex items-center gap-2 font-mono">
          <Table className="w-4 h-4 text-zinc-900" />
          <span>Schema & Sample Rows at {currentStage.level}</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentStage.tables.map((tbl) => (
            <div
              key={tbl.name}
              className="rounded-xl bg-white border-2 border-zinc-900 overflow-hidden shadow-[2px_2px_0px_#18181B]"
            >
              <div className="px-3.5 py-2 bg-[#FEF08A] border-b-2 border-zinc-900 flex items-center justify-between font-mono text-xs text-zinc-900">
                <span className="font-bold">{tbl.name}</span>
                {tbl.primaryKey.length > 0 && (
                  <span className="text-[10px] bg-white px-1.5 py-0.5 rounded border border-zinc-900 font-bold text-zinc-900">
                    PK: ({tbl.primaryKey.join(', ')})
                  </span>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px] font-mono border-collapse">
                  <thead>
                    <tr className="bg-zinc-100 border-b border-zinc-900 text-zinc-700">
                      {tbl.columns.map((col) => (
                        <th key={col} className="p-2 font-bold text-zinc-900">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 text-zinc-800">
                    {tbl.sampleRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-yellow-50/50">
                        {tbl.columns.map((col) => (
                          <td key={col} className="p-2">
                            {row[col] ?? '—'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Functional Dependencies Graph */}
      <DependencyGraph />
    </div>
  );
};
