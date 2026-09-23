import React, { useState } from 'react';
import {
  Compass,
  Search,
  ArrowRight,
} from 'lucide-react';
import { useLearningStore } from '../../stores/learningStore';
import { useErdStore } from '../../stores/erdStore';
import { useDatabaseStore } from '../../stores/databaseStore';
import { systemsCatalog } from '../../data/systems';
import type { SystemScenario } from '../../types/system';

export const SystemExplorerModal: React.FC = () => {
  const { isSystemExplorerOpen, toggleSystemExplorer, setCurrentSystem } = useLearningStore();
  const { loadScenario } = useErdStore();
  const { loadSampleData } = useDatabaseStore();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isSystemExplorerOpen) return null;

  const categories = [
    'All',
    'Education',
    'Business',
    'Healthcare',
    'Transportation',
    'Hospitality',
    'Entertainment',
    'Social',
  ];

  const filteredSystems = systemsCatalog.filter((sys) => {
    const matchesCategory = selectedCategory === 'All' || sys.category === selectedCategory;
    const matchesSearch =
      sys.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sys.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sys.conceptsCovered.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleSelectSystem = (system: SystemScenario) => {
    setCurrentSystem(system);
    loadScenario(system);
    if (system.sampleData) {
      loadSampleData(system.sampleData);
    }
    toggleSystemExplorer(false);
  };

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case 'Beginner':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-400 font-mono">Beginner</span>;
      case 'Intermediate':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-900 border border-sky-400 font-mono">Intermediate</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-400 font-mono">Advanced</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#FAF9F5] border-2 border-zinc-900 rounded-2xl w-full max-w-5xl shadow-[6px_6px_0px_#18181B] flex flex-col max-h-[88vh] overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="p-5 border-b-2 border-zinc-900 flex items-center justify-between shrink-0 bg-white">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-[#FEF08A] text-zinc-900 border-2 border-zinc-900 flex items-center justify-center shadow-[1px_1px_0px_#18181B]">
                <Compass className="w-5 h-5 text-zinc-900" />
              </div>
              <h2 className="text-lg font-bold text-zinc-900 font-mono">Database Scenario Explorer</h2>
            </div>
            <p className="text-xs text-zinc-600 font-handwriting text-sm">
              Select a real-world system to practice ER diagram modeling, schema design, constraints, and SQL generation.
            </p>
          </div>
          <button
            onClick={() => toggleSystemExplorer(false)}
            className="p-1.5 rounded-lg border border-zinc-900 bg-white hover:bg-zinc-100 text-zinc-800 text-xs font-bold shadow-[1px_1px_0px_#18181B]"
          >
            ✕
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="p-3 border-b-2 border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 bg-white">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-[#FEF08A] text-zinc-900 font-bold border-2 border-zinc-900 shadow-[2px_2px_0px_#18181B]'
                    : 'bg-zinc-50 text-zinc-700 hover:text-zinc-900 border border-zinc-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search scenarios..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#FAF9F5] border border-zinc-400 text-zinc-900 text-xs font-mono focus:outline-none focus:border-zinc-900"
            />
          </div>
        </div>

        {/* Systems Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSystems.map((sys) => (
            <div
              key={sys.id}
              className="rounded-xl bg-white border-2 border-zinc-900 hover:shadow-[4px_4px_0px_#18181B] p-4 flex flex-col justify-between transition-all duration-150 group shadow-[2px_2px_0px_#18181B]"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-600 font-bold">
                    {sys.category}
                  </span>
                  {getDifficultyBadge(sys.difficulty)}
                </div>

                <div>
                  <h3 className="text-sm font-bold text-zinc-900 group-hover:underline font-mono">
                    {sys.name}
                  </h3>
                  <p className="text-xs text-zinc-600 mt-1 line-clamp-2 leading-relaxed">
                    {sys.shortDescription}
                  </p>
                </div>

                {/* Concepts Tags */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {sys.conceptsCovered.slice(0, 4).map((c) => (
                    <span
                      key={c}
                      className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-100 text-zinc-800 border border-zinc-300"
                    >
                      {c}
                    </span>
                  ))}
                  {sys.conceptsCovered.length > 4 && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-50 text-zinc-500 border border-zinc-200">
                      +{sys.conceptsCovered.length - 4}
                    </span>
                  )}
                </div>
              </div>

              {/* Card Footer with Start Button */}
              <div className="pt-4 mt-3 border-t border-zinc-200 flex items-center justify-between">
                <span className="text-[11px] text-zinc-600 font-mono">
                  {sys.entityCount} Tables
                </span>
                <button
                  onClick={() => handleSelectSystem(sys)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold shadow-[2px_2px_0px_#18181B] transition-all border border-zinc-900"
                >
                  <span>Open System</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
