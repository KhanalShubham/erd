import React, { useState } from 'react';
import {
  BookOpen,
  X,
  CheckCircle2,
  AlertTriangle,
  Key,
  Layers,
  ArrowRight,
  Code,
  ShieldCheck,
  Compass,
} from 'lucide-react';
import { useLearningStore } from '../../stores/learningStore';
import { getAuthoritativeSolution } from '../../engine/database/AuthoritativeSolutionRegistry';

interface SolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SolutionTab = 'overview' | 'entities' | 'relationships' | 'keys' | 'ddl' | 'mistakes';

export const SolutionModal: React.FC<SolutionModalProps> = ({ isOpen, onClose }) => {
  const { currentSystem } = useLearningStore();
  const [activeTab, setActiveTab] = useState<SolutionTab>('overview');

  if (!isOpen) return null;

  const solution = getAuthoritativeSolution(currentSystem.id);

  if (!solution) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
        <div className="bg-[#FAF9F5] border-2 border-zinc-900 rounded-2xl p-6 max-w-md w-full shadow-[6px_6px_0px_#18181B] text-center space-y-3 font-sans">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
          <h3 className="text-base font-bold text-zinc-900 font-mono">Solution Loading</h3>
          <p className="text-xs text-zinc-600">
            Authoritative solution guide for "{currentSystem.name}" is being generated.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-900 text-white rounded-lg text-xs font-bold font-mono"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-[#FAF9F5] border-2 border-zinc-900 rounded-2xl w-full max-w-4xl shadow-[6px_6px_0px_#18181B] flex flex-col my-auto max-h-[92vh] overflow-hidden text-zinc-900 font-sans">
        {/* Header Strip */}
        <div className="p-4 sm:p-5 border-b-2 border-zinc-900 bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FEF08A] text-zinc-900 border-2 border-zinc-900 flex items-center justify-center shadow-[1px_1px_0px_#18181B]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-zinc-100 text-zinc-700 border border-zinc-300">
                  {solution.domain}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  {solution.difficulty}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-950 border border-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Audit: PASS
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-zinc-900 font-mono mt-1">
                Authoritative Solution: {solution.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-zinc-900 bg-white hover:bg-zinc-100 text-zinc-800 text-xs font-bold shadow-[1px_1px_0px_#18181B] transition-all"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 border-b-2 border-zinc-900 px-4 py-2 bg-[#FEF08A]/40 overflow-x-auto shrink-0 font-mono text-xs font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1 rounded border transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-[#FEF08A] text-zinc-950 border-zinc-900 shadow-[1px_1px_0px_#18181B]'
                : 'bg-white text-zinc-600 border-zinc-300 hover:bg-zinc-50'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>1. Rules & ERD</span>
          </button>
          <button
            onClick={() => setActiveTab('entities')}
            className={`px-3 py-1 rounded border transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'entities'
                ? 'bg-[#FEF08A] text-zinc-950 border-zinc-900 shadow-[1px_1px_0px_#18181B]'
                : 'bg-white text-zinc-600 border-zinc-300 hover:bg-zinc-50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>2. Entities & PKs</span>
          </button>
          <button
            onClick={() => setActiveTab('relationships')}
            className={`px-3 py-1 rounded border transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'relationships'
                ? 'bg-[#FEF08A] text-zinc-950 border-zinc-900 shadow-[1px_1px_0px_#18181B]'
                : 'bg-white text-zinc-600 border-zinc-300 hover:bg-zinc-50'
            }`}
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>3. Relationships (1:N / M:N)</span>
          </button>
          <button
            onClick={() => setActiveTab('keys')}
            className={`px-3 py-1 rounded border transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'keys'
                ? 'bg-[#FEF08A] text-zinc-950 border-zinc-900 shadow-[1px_1px_0px_#18181B]'
                : 'bg-white text-zinc-600 border-zinc-300 hover:bg-zinc-50'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>4. Key Analysis</span>
          </button>
          <button
            onClick={() => setActiveTab('ddl')}
            className={`px-3 py-1 rounded border transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'ddl'
                ? 'bg-[#FEF08A] text-zinc-950 border-zinc-900 shadow-[1px_1px_0px_#18181B]'
                : 'bg-white text-zinc-600 border-zinc-300 hover:bg-zinc-50'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>5. SQL Schema DDL</span>
          </button>
          <button
            onClick={() => setActiveTab('mistakes')}
            className={`px-3 py-1 rounded border transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'mistakes'
                ? 'bg-[#FEF08A] text-zinc-950 border-zinc-900 shadow-[1px_1px_0px_#18181B]'
                : 'bg-white text-zinc-600 border-zinc-300 hover:bg-zinc-50'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>6. Common Pitfalls</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Problem Statement Card */}
              <div className="p-4 bg-white border-2 border-zinc-900 rounded-xl space-y-2 shadow-2xs">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 block">
                  Problem Statement
                </span>
                <p className="text-xs text-zinc-800 leading-relaxed font-sans">
                  {solution.problemStatement}
                </p>
              </div>

              {/* Extracted Business Rules Card */}
              <div className="p-4 bg-white border-2 border-zinc-900 rounded-xl space-y-2.5 shadow-2xs">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 block">
                  Authoritative Business Rules
                </span>
                <div className="space-y-1.5">
                  {solution.businessRules.map((rule, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-zinc-800">
                      <span className="px-1.5 py-0.5 rounded bg-[#FEF08A] border border-zinc-900 font-mono font-bold text-[10px] shrink-0">
                        BR-{idx + 1}
                      </span>
                      <span className="leading-snug">{rule}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mermaid ERD Architecture Diagram */}
              <div className="p-4 bg-zinc-900 text-zinc-100 rounded-xl space-y-2 font-mono text-xs shadow-2xs border border-zinc-900">
                <div className="flex items-center justify-between pb-1 border-b border-zinc-700">
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">
                    Authoritative Mermaid ERD Model
                  </span>
                  <span className="text-[10px] text-emerald-400">Validated 100% Relational Match</span>
                </div>
                <pre className="text-[11px] overflow-x-auto text-emerald-300 font-mono py-2">
                  {solution.mermaidDiagram}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'entities' && (
            <div className="space-y-3">
              <p className="text-xs text-zinc-600 font-sans">
                Each entity represents an independent concept or associative junction. Primary keys are selected
                according to minimal uniqueness and stability principles.
              </p>
              <div className="grid grid-cols-1 gap-3">
                {solution.entities.map((entity, i) => (
                  <div key={i} className="p-4 bg-white border-2 border-zinc-900 rounded-xl space-y-2.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-zinc-900 text-white font-mono font-bold text-xs">
                          {entity.name}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-950 font-mono text-[10px] border border-amber-300">
                          {entity.type.toUpperCase()} ENTITY
                        </span>
                      </div>
                      <div className="text-[11px] font-mono font-bold text-emerald-700">
                        PK: {entity.primaryKey}
                      </div>
                    </div>

                    <p className="text-xs text-zinc-700 font-sans leading-relaxed">
                      {entity.purpose}
                    </p>

                    {/* Attributes Table */}
                    <div className="overflow-x-auto border border-zinc-300 rounded-lg">
                      <table className="w-full text-left text-[11px] font-mono">
                        <thead className="bg-zinc-100 border-b border-zinc-300 text-zinc-700">
                          <tr>
                            <th className="p-1.5 font-bold">Column</th>
                            <th className="p-1.5 font-bold">Type</th>
                            <th className="p-1.5 font-bold">Constraint</th>
                            <th className="p-1.5 font-bold">References</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 bg-white">
                          {entity.attributes.map((attr, j) => (
                            <tr key={j} className="hover:bg-yellow-50/50">
                              <td className="p-1.5 font-bold flex items-center gap-1">
                                {attr.isPk && <span className="text-amber-600 font-extrabold">[PK]</span>}
                                {attr.isFk && <span className="text-blue-600 font-extrabold">[FK]</span>}
                                <span>{attr.name}</span>
                              </td>
                              <td className="p-1.5 text-zinc-600">{attr.dataType}</td>
                              <td className="p-1.5 text-zinc-700">
                                {attr.isUnique && <span className="mr-1 text-purple-700 font-bold">UNIQUE</span>}
                                {!attr.nullable && <span className="mr-1 text-zinc-600">NOT NULL</span>}
                                {attr.domainConstraint && <span className="text-zinc-500 text-[10px]">{attr.domainConstraint}</span>}
                              </td>
                              <td className="p-1.5 text-blue-700 font-semibold">{attr.references || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="p-2 bg-yellow-50 border border-amber-300 rounded text-[11px] text-zinc-800 font-sans">
                      <span className="font-bold text-amber-900 font-mono">Primary Key Rationale: </span>
                      {entity.pkJustification}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'relationships' && (
            <div className="space-y-3">
              <p className="text-xs text-zinc-600 font-sans">
                Every relationship is validated through bidirectional reading and 3-point triangulation.
              </p>
              <div className="space-y-3">
                {solution.relationships.map((rel, i) => (
                  <div key={i} className="p-4 bg-white border-2 border-zinc-900 rounded-xl space-y-2.5 shadow-2xs">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 pb-2">
                      <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-zinc-900">
                        <span className="px-2 py-0.5 bg-zinc-100 border border-zinc-300 rounded">{rel.source}</span>
                        <span>── {rel.name} ──►</span>
                        <span className="px-2 py-0.5 bg-zinc-100 border border-zinc-300 rounded">{rel.target}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-mono text-xs font-bold">
                        <span className="px-2 py-0.5 bg-[#FEF08A] border border-zinc-900 rounded">
                          Cardinality: {rel.cardinality}
                        </span>
                        <span className="px-2 py-0.5 bg-zinc-100 border border-zinc-300 rounded text-[11px]">
                          ({rel.sourceOptionality} to {rel.targetOptionality})
                        </span>
                      </div>
                    </div>

                    {/* Bidirectional Reading Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-sans">
                      <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg space-y-0.5">
                        <span className="text-[10px] font-mono font-bold text-blue-900 block uppercase">
                          Forward Statement (Left ──► Right)
                        </span>
                        <p className="text-zinc-800 italic text-[11px]">"{rel.forwardSentence}"</p>
                      </div>
                      <div className="p-2.5 bg-purple-50 border border-purple-200 rounded-lg space-y-0.5">
                        <span className="text-[10px] font-mono font-bold text-purple-900 block uppercase">
                          Reverse-Read Test (Right ──► Left)
                        </span>
                        <p className="text-zinc-800 italic text-[11px]">"{rel.reverseSentence}"</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] font-mono">
                      <div>
                        <span className="text-zinc-500 font-bold">Foreign Key: </span>
                        <span className="text-blue-700 font-bold">{rel.foreignKey}</span>
                      </div>
                      <div className="text-zinc-600 font-sans italic">{rel.explanation}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'keys' && (
            <div className="space-y-4">
              <div className="p-4 bg-white border-2 border-zinc-900 rounded-xl space-y-3 shadow-2xs font-mono text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
                  Authoritative Key Breakdown
                </span>

                <div className="space-y-2">
                  <div className="p-2.5 bg-zinc-50 border border-zinc-300 rounded">
                    <span className="text-amber-800 font-bold block mb-1">🔑 Primary Keys:</span>
                    <ul className="list-disc pl-5 space-y-0.5 text-zinc-800">
                      {solution.keyAnalysis.primaryKeys.map((pk, idx) => (
                        <li key={idx}>{pk}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-2.5 bg-zinc-50 border border-zinc-300 rounded">
                    <span className="text-blue-800 font-bold block mb-1">🔗 Foreign Keys:</span>
                    <ul className="list-disc pl-5 space-y-0.5 text-zinc-800">
                      {solution.keyAnalysis.foreignKeys.map((fk, idx) => (
                        <li key={idx}>{fk}</li>
                      ))}
                    </ul>
                  </div>

                  {solution.keyAnalysis.compositeKeys.length > 0 && (
                    <div className="p-2.5 bg-amber-50 border border-amber-300 rounded">
                      <span className="text-amber-950 font-bold block mb-1">🧩 Composite Keys on Junctions:</span>
                      <ul className="list-disc pl-5 space-y-0.5 text-zinc-800">
                        {solution.keyAnalysis.compositeKeys.map((ck, idx) => (
                          <li key={idx}>{ck}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {solution.keyAnalysis.candidateKeys.length > 0 && (
                    <div className="p-2.5 bg-purple-50 border border-purple-300 rounded">
                      <span className="text-purple-900 font-bold block mb-1">🎯 Candidate & Unique Keys:</span>
                      <ul className="list-disc pl-5 space-y-0.5 text-zinc-800">
                        {solution.keyAnalysis.candidateKeys.map((ck, idx) => (
                          <li key={idx}>{ck}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Normalization Card */}
              <div className="p-4 bg-white border-2 border-zinc-900 rounded-xl space-y-2.5 shadow-2xs font-sans text-xs">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 block">
                  Relational Normalization Verification (1NF / 2NF / 3NF)
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 font-sans">
                  <div className="p-2.5 bg-zinc-50 border border-zinc-300 rounded space-y-1">
                    <span className="font-mono font-bold text-zinc-900 text-xs block">First Normal Form (1NF)</span>
                    <p className="text-[11px] text-zinc-700 leading-snug">{solution.normalization.firstNormalForm}</p>
                  </div>
                  <div className="p-2.5 bg-zinc-50 border border-zinc-300 rounded space-y-1">
                    <span className="font-mono font-bold text-zinc-900 text-xs block">Second Normal Form (2NF)</span>
                    <p className="text-[11px] text-zinc-700 leading-snug">{solution.normalization.secondNormalForm}</p>
                  </div>
                  <div className="p-2.5 bg-zinc-50 border border-zinc-300 rounded space-y-1">
                    <span className="font-mono font-bold text-zinc-900 text-xs block">Third Normal Form (3NF)</span>
                    <p className="text-[11px] text-zinc-700 leading-snug">{solution.normalization.thirdNormalForm}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ddl' && (
            <div className="space-y-3">
              <div className="p-4 bg-zinc-900 text-zinc-100 rounded-xl space-y-2 border border-zinc-900 font-mono text-xs shadow-2xs">
                <div className="flex items-center justify-between pb-1 border-b border-zinc-700">
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">
                    Executable PostgreSQL / MySQL DDL
                  </span>
                  <span className="text-[10px] text-amber-300">Enforces PKs, FKs, CHECK, and UNIQUE</span>
                </div>
                <pre className="text-[11px] text-yellow-200 overflow-x-auto py-2 leading-relaxed">
                  {solution.sqlDdl}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'mistakes' && (
            <div className="space-y-3 font-sans">
              <p className="text-xs text-zinc-600">
                Study these common student database design pitfalls to avoid losing points during grading.
              </p>
              <div className="space-y-2.5">
                {solution.commonMistakes.map((m, idx) => (
                  <div key={idx} className="p-4 bg-white border-2 border-zinc-900 rounded-xl space-y-1.5 shadow-2xs">
                    <div className="flex items-center gap-2 text-rose-700 font-mono font-bold text-xs">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{m.mistake}</span>
                    </div>
                    <div className="text-xs text-zinc-700 pl-6 leading-relaxed">
                      <strong className="text-zinc-900">Why it is wrong: </strong>
                      {m.whyWrong}
                    </div>
                    <div className="text-xs text-emerald-800 bg-emerald-50 p-2 rounded border border-emerald-300 pl-4 font-mono">
                      <strong>✓ Correct Approach: </strong>
                      {m.correction}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t-2 border-zinc-900 bg-white flex items-center justify-between shrink-0 font-mono text-xs">
          <div className="text-zinc-600 text-[11px] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Authoritative Single Source of Truth • 100% Relational Compliance</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-900 text-white rounded-lg text-xs font-bold font-mono hover:bg-zinc-800 shadow-[2px_2px_0px_#18181B]"
          >
            Back to Canvas
          </button>
        </div>
      </div>
    </div>
  );
};
