import React from 'react';
import {
  GraduationCap,
  Compass,
  Layers,
  Award,
  Key,
  Network,
  GitMerge,
  ArrowRight,
  Database,
  Table,
  ShieldCheck,
  Code2,
} from 'lucide-react';
import { useLearningStore } from '../../stores/learningStore';
import { useErdStore } from '../../stores/erdStore';
import { allSystems } from '../../data/systems';
import type { SystemScenario } from '../../types/system';

export const DashboardView: React.FC = () => {
  const {
    setActiveMode,
    setCurrentSystem,
    toggleSystemExplorer,
    toggleKeysLab,
    toggleAdvancedLab,
    completedSteps,
    currentSystem,
  } = useLearningStore();

  const { loadScenario, resetToBlank } = useErdStore();

  const handleStartGuided = () => {
    loadScenario(currentSystem);
    setActiveMode('guided');
  };

  const handleStartBuilder = () => {
    resetToBlank();
    setActiveMode('builder');
  };

  const handleStartChallenge = () => {
    resetToBlank();
    setActiveMode('challenge');
  };

  const handleLoadSystemQuick = (systemId: string) => {
    const sys = allSystems.find((s: SystemScenario) => s.id === systemId);
    if (sys) {
      setCurrentSystem(sys);
      loadScenario(sys);
      setActiveMode('guided');
    }
  };

  const featuredSystems = allSystems.slice(0, 6);

  return (
    <div className="flex-1 overflow-y-auto bg-[#FAF9F5] text-zinc-900 p-6 sm:p-10 space-y-10 selection:bg-yellow-200">
      {/* Hero Section */}
      <section className="max-w-4xl mx-auto text-center space-y-4 pt-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#FEF08A] border border-zinc-900 text-zinc-950 text-xs font-mono font-bold tracking-wide">
          <span>Database Design Notebook</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-zinc-950 font-sans leading-tight">
          Understand Databases <br className="hidden sm:inline" />
          <span className="bg-[#FEF08A] px-2 py-0.5 rounded border border-zinc-900">
            by Building Them
          </span>
        </h1>

        <p className="text-zinc-600 text-sm sm:text-base max-w-xl mx-auto leading-relaxed font-sans">
          Explore real-world systems, draw clean ER diagrams with pen and paper simplicity, test constraints, and see your design translate into real SQL tables.
        </p>

        {/* Feature Highlights Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs text-zinc-700 font-medium">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white border border-zinc-300 shadow-2xs">
            <Database className="w-3 h-3 text-zinc-600" /> 15 Canonical Systems
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white border border-zinc-300 shadow-2xs">
            <Table className="w-3 h-3 text-zinc-600" /> Live Relational Conversion
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white border border-zinc-300 shadow-2xs">
            <ShieldCheck className="w-3 h-3 text-zinc-600" /> Constraint Validation
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white border border-zinc-300 shadow-2xs">
            <Code2 className="w-3 h-3 text-zinc-600" /> Multi-Dialect SQL
          </span>
        </div>
      </section>

      {/* Progress & Quick Stats Card */}
      <section className="max-w-4xl mx-auto">
        <div className="p-4 rounded bg-white border border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
          <div className="space-y-0.5 text-center sm:text-left">
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-500">
              Active Study Scenario
            </div>
            <div className="text-base font-bold text-zinc-900 font-mono">
              {currentSystem.name}
            </div>
          </div>

          <div className="flex items-center gap-4 text-center">
            <div className="px-3 py-1.5 rounded bg-zinc-50 border border-zinc-200">
              <div className="text-lg font-black font-mono text-zinc-900">{completedSteps.length} / 11</div>
              <div className="text-[10px] text-zinc-500 font-medium">Guided Steps</div>
            </div>

            <div className="px-3 py-1.5 rounded bg-zinc-50 border border-zinc-200">
              <div className="text-lg font-black font-mono text-zinc-900">15</div>
              <div className="text-[10px] text-zinc-500 font-medium">Scenarios</div>
            </div>

            <button
              onClick={handleStartGuided}
              className="px-4 py-2 rounded bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold shadow-2xs transition-colors"
            >
              Resume Learning
            </button>
          </div>
        </div>
      </section>

      {/* 4 Main Working Modes (Paper Cards with Ruler Borders) */}
      <section className="max-w-4xl mx-auto space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500 font-mono">
          Learning Modes
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* 1. Guided Learn */}
          <button
            onClick={handleStartGuided}
            className="p-5 rounded bg-white border border-zinc-900 text-left hover:shadow-md transition-all flex flex-col justify-between group shadow-xs"
          >
            <div>
              <div className="w-9 h-9 rounded bg-[#FEF08A] border border-zinc-900 flex items-center justify-center mb-3 text-zinc-900">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-zinc-950 group-hover:underline">
                1. Guided Learning Path
              </h3>
              <p className="text-xs text-zinc-600 mt-1.5 leading-relaxed font-sans">
                Progressive 11-step walkthrough: Nouns → Entities → Attributes → Keys → Cardinality → Foreign Keys → SQL.
              </p>
            </div>
            <div className="pt-3 mt-3 border-t border-zinc-200 flex items-center justify-between text-xs font-semibold text-zinc-900">
              <span>Start Step 1</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* 2. Explore Systems */}
          <button
            onClick={() => toggleSystemExplorer(true)}
            className="p-5 rounded bg-white border border-zinc-900 text-left hover:shadow-md transition-all flex flex-col justify-between group shadow-xs"
          >
            <div>
              <div className="w-9 h-9 rounded bg-zinc-100 border border-zinc-900 flex items-center justify-center mb-3 text-zinc-900">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-zinc-950 group-hover:underline">
                2. Explore Real-World Systems
              </h3>
              <p className="text-xs text-zinc-600 mt-1.5 leading-relaxed font-sans">
                Browse 15 comprehensive domain designs: LMS, Hospital, E-Commerce, Airline, Banking, Hotel, and more.
              </p>
            </div>
            <div className="pt-3 mt-3 border-t border-zinc-200 flex items-center justify-between text-xs font-semibold text-zinc-900">
              <span>Browse Catalog</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* 3. Free Builder */}
          <button
            onClick={handleStartBuilder}
            className="p-5 rounded bg-white border border-zinc-900 text-left hover:shadow-md transition-all flex flex-col justify-between group shadow-xs"
          >
            <div>
              <div className="w-9 h-9 rounded bg-zinc-100 border border-zinc-900 flex items-center justify-center mb-3 text-zinc-900">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-zinc-950 group-hover:underline">
                3. Free ERD Canvas
              </h3>
              <p className="text-xs text-zinc-600 mt-1.5 leading-relaxed font-sans">
                Blank digital notebook. Draw custom tables, connect relationships, assign primary keys, and export DDL.
              </p>
            </div>
            <div className="pt-3 mt-3 border-t border-zinc-200 flex items-center justify-between text-xs font-semibold text-zinc-900">
              <span>Open Blank Studio</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* 4. Challenges */}
          <button
            onClick={handleStartChallenge}
            className="p-5 rounded bg-white border border-zinc-900 text-left hover:shadow-md transition-all flex flex-col justify-between group shadow-xs"
          >
            <div>
              <div className="w-9 h-9 rounded bg-zinc-100 border border-zinc-900 flex items-center justify-center mb-3 text-zinc-900">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-zinc-950 group-hover:underline">
                4. Problem-Solving Challenges
              </h3>
              <p className="text-xs text-zinc-600 mt-1.5 leading-relaxed font-sans">
                Objective database design tests with instant automated rubric scoring, feedback, and constraint evaluations.
              </p>
            </div>
            <div className="pt-3 mt-3 border-t border-zinc-200 flex items-center justify-between text-xs font-semibold text-zinc-900">
              <span>Take Assessment</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>
      </section>

      {/* 3 Specialized Interactive Labs */}
      <section className="max-w-4xl mx-auto space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500 font-mono">
          Specialized Educational Labs
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Keys Lab */}
          <div className="p-4 rounded bg-white border border-zinc-300 hover:border-zinc-900 transition-colors flex flex-col justify-between space-y-3 shadow-2xs">
            <div className="space-y-1.5">
              <div className="w-8 h-8 rounded bg-[#FEF08A] border border-zinc-900 flex items-center justify-center text-zinc-950">
                <Key className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-zinc-950 font-mono">Keys Taxonomy Lab</h3>
              <p className="text-[11px] text-zinc-600 leading-relaxed">
                Learn Super Keys, Candidate Keys, Primary Keys, and Alternate Keys with an interactive candidate tester.
              </p>
            </div>
            <button
              onClick={() => toggleKeysLab(true)}
              className="w-full py-1.5 rounded border border-zinc-300 hover:border-zinc-900 text-xs font-semibold transition-colors"
            >
              Open Keys Lab
            </button>
          </div>

          {/* Advanced Concepts Lab */}
          <div className="p-4 rounded bg-white border border-zinc-300 hover:border-zinc-900 transition-colors flex flex-col justify-between space-y-3 shadow-2xs">
            <div className="space-y-1.5">
              <div className="w-8 h-8 rounded bg-zinc-100 border border-zinc-900 flex items-center justify-center text-zinc-950">
                <Network className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-zinc-950 font-mono">Advanced Concepts Lab</h3>
              <p className="text-[11px] text-zinc-600 leading-relaxed">
                Explore Weak Entities, recursive/self-referencing FKs, Subtype Generalization, and 1:1 Unique constraints.
              </p>
            </div>
            <button
              onClick={() => toggleAdvancedLab(true)}
              className="w-full py-1.5 rounded border border-zinc-300 hover:border-zinc-900 text-xs font-semibold transition-colors"
            >
              Open Advanced Lab
            </button>
          </div>

          {/* Normalization Lab */}
          <div className="p-4 rounded bg-white border border-zinc-300 hover:border-zinc-900 transition-colors flex flex-col justify-between space-y-3 shadow-2xs">
            <div className="space-y-1.5">
              <div className="w-8 h-8 rounded bg-[#FEF08A] border border-zinc-900 flex items-center justify-center text-zinc-950">
                <GitMerge className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-zinc-950 font-mono">Normalization Lab</h3>
              <p className="text-[11px] text-zinc-600 leading-relaxed">
                Step through UNF → 1NF → 2NF → 3NF to eliminate insert, update, and delete anomalies.
              </p>
            </div>
            <button
              onClick={() => setActiveMode('normalization')}
              className="w-full py-1.5 rounded border border-zinc-300 hover:border-zinc-900 text-xs font-semibold transition-colors"
            >
              Open Normalization Lab
            </button>
          </div>
        </div>
      </section>

      {/* Featured Scenarios */}
      <section className="max-w-4xl mx-auto space-y-3 pb-8">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500 font-mono">
            Featured Scenarios
          </h2>
          <button
            onClick={() => toggleSystemExplorer(true)}
            className="text-xs font-semibold text-zinc-700 hover:text-black flex items-center gap-1"
          >
            <span>View All 15</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {featuredSystems.map((system: SystemScenario) => (
            <div
              key={system.id}
              className="p-3.5 rounded bg-white border border-zinc-300 hover:border-zinc-900 flex flex-col justify-between space-y-2 transition-colors shadow-2xs"
            >
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 mb-1">
                  <span>{system.canonicalEntities.length} Tables</span>
                  <span className="bg-zinc-100 px-1 rounded border border-zinc-200">{system.difficulty}</span>
                </div>
                <h4 className="text-xs font-bold text-zinc-950">{system.name}</h4>
                <p className="text-[11px] text-zinc-600 mt-1 line-clamp-2 leading-relaxed">
                  {system.shortDescription}
                </p>
              </div>

              <button
                onClick={() => handleLoadSystemQuick(system.id)}
                className="w-full text-center py-1 rounded bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-xs font-medium text-zinc-800 transition-colors"
              >
                Load & Study
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
