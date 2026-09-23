import React, { useState } from 'react';
import { Key, ShieldCheck } from 'lucide-react';

interface KeysLabModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeysLabModal: React.FC<KeysLabModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'types' | 'interactive'>('types');
  const [selectedCols, setSelectedCols] = useState<string[]>(['StudentID']);

  if (!isOpen) return null;

  // Interactive Student Table columns
  const tableColumns = [
    { name: 'StudentID', isUnique: true, isMinimal: true, description: 'University issued student identifier' },
    { name: 'NationalID', isUnique: true, isMinimal: true, description: 'Government issued citizen identity number' },
    { name: 'Email', isUnique: true, isMinimal: true, description: 'Institutional email address' },
    { name: 'FirstName', isUnique: false, isMinimal: false, description: 'Given name' },
    { name: 'LastName', isUnique: false, isMinimal: false, description: 'Family surname' },
  ];

  const toggleColumn = (colName: string) => {
    if (selectedCols.includes(colName)) {
      setSelectedCols(selectedCols.filter((c) => c !== colName));
    } else {
      setSelectedCols([...selectedCols, colName]);
    }
  };

  // Evaluate selected set
  const hasUniqueCol = selectedCols.some((c) =>
    tableColumns.find((tc) => tc.name === c)?.isUnique
  );
  const isSuperKey = hasUniqueCol;
  const isCandidateKey =
    selectedCols.length === 1 &&
    tableColumns.find((tc) => tc.name === selectedCols[0])?.isUnique;
  const isPrimaryKey = selectedCols.length === 1 && selectedCols[0] === 'StudentID';
  const isAlternateKey =
    selectedCols.length === 1 &&
    (selectedCols[0] === 'NationalID' || selectedCols[0] === 'Email');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#FAF9F5] border-2 border-zinc-900 rounded-2xl w-full max-w-4xl shadow-[6px_6px_0px_#18181B] flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="p-5 border-b-2 border-zinc-900 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FEF08A] text-zinc-900 border-2 border-zinc-900 flex items-center justify-center shadow-[1px_1px_0px_#18181B]">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 font-mono">Database Keys Laboratory</h2>
              <p className="text-xs text-zinc-600 font-handwriting text-sm">
                Master Super Keys, Candidate Keys, Primary Keys, Alternate Keys, and Composite Keys.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex p-1 bg-zinc-100 border border-zinc-400 rounded-lg text-xs font-semibold font-mono">
              <button
                onClick={() => setActiveTab('types')}
                className={`px-3 py-1 rounded transition-colors ${
                  activeTab === 'types' ? 'bg-[#FEF08A] text-zinc-900 border border-zinc-900 shadow-[1px_1px_0px_#18181B] font-bold' : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                Key Taxonomy
              </button>
              <button
                onClick={() => setActiveTab('interactive')}
                className={`px-3 py-1 rounded transition-colors ${
                  activeTab === 'interactive' ? 'bg-[#FEF08A] text-zinc-900 border border-zinc-900 shadow-[1px_1px_0px_#18181B] font-bold' : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                Interactive Key Tester
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg border border-zinc-900 bg-white hover:bg-zinc-100 text-zinc-800 text-xs font-bold ml-2 shadow-[1px_1px_0px_#18181B]"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'types' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Super Key */}
              <div className="p-4 rounded-xl bg-white border-2 border-zinc-900 space-y-2 shadow-[2px_2px_0px_#18181B]">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-zinc-900 font-mono">1. Super Key</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-100 text-zinc-800 border border-zinc-900">
                    Superset
                  </span>
                </div>
                <p className="text-xs text-zinc-700 leading-relaxed">
                  A set of one or more attributes that uniquely identifies each tuple in a relation. It may contain redundant columns that are not strictly necessary for uniqueness.
                </p>
                <div className="p-2.5 rounded bg-zinc-50 font-mono text-[11px] text-zinc-800 border border-zinc-300">
                  Example: <span className="font-bold bg-[#FEF08A] px-1 rounded">&#123;StudentID, FullName&#125;</span> or <span className="font-bold bg-[#FEF08A] px-1 rounded">&#123;Email, LastName&#125;</span>
                </div>
              </div>

              {/* Candidate Key */}
              <div className="p-4 rounded-xl bg-white border-2 border-zinc-900 space-y-2 shadow-[2px_2px_0px_#18181B]">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-zinc-900 font-mono">2. Candidate Key</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#FEF08A] text-zinc-900 border border-zinc-900 font-bold">
                    Minimal Super Key
                  </span>
                </div>
                <p className="text-xs text-zinc-700 leading-relaxed">
                  A minimal super key with no redundant attributes. If any attribute is removed from a candidate key, it ceases to be unique.
                </p>
                <div className="p-2.5 rounded bg-zinc-50 font-mono text-[11px] text-zinc-800 border border-zinc-300">
                  Example: In Student, candidates are <span className="font-bold bg-[#FEF08A] px-1 rounded">&#123;StudentID&#125;</span>, <span className="font-bold bg-[#FEF08A] px-1 rounded">&#123;NationalID&#125;</span>, <span className="font-bold bg-[#FEF08A] px-1 rounded">&#123;Email&#125;</span>
                </div>
              </div>

              {/* Primary Key */}
              <div className="p-4 rounded-xl bg-amber-50/70 border-2 border-zinc-900 space-y-2 shadow-[2px_2px_0px_#18181B]">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-zinc-900 font-mono">3. Primary Key (PK)</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#FEF08A] text-zinc-900 border border-zinc-900 font-bold shadow-[1px_1px_0px_#18181B]">
                    Chosen Identifier
                  </span>
                </div>
                <p className="text-xs text-zinc-700 leading-relaxed">
                  The primary candidate key selected by the database architect to uniquely identify records across the application. Values must be NOT NULL and NEVER duplicate.
                </p>
                <div className="p-2.5 rounded bg-white font-mono text-[11px] text-zinc-900 border border-zinc-400">
                  Chosen PK: <span className="font-bold bg-[#FEF08A] px-1 rounded">StudentID INT PRIMARY KEY</span>
                </div>
              </div>

              {/* Alternate Key */}
              <div className="p-4 rounded-xl bg-white border-2 border-zinc-900 space-y-2 shadow-[2px_2px_0px_#18181B]">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-zinc-900 font-mono">4. Alternate (Secondary) Key</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-100 text-zinc-800 border border-zinc-900">
                    Unchosen Candidates
                  </span>
                </div>
                <p className="text-xs text-zinc-700 leading-relaxed">
                  Candidate keys that were NOT chosen as the primary key. They are typically implemented in relational databases as columns with a UNIQUE constraint.
                </p>
                <div className="p-2.5 rounded bg-zinc-50 font-mono text-[11px] text-zinc-800 border border-zinc-300">
                  Alternate Keys: <span className="font-bold">NationalID UNIQUE</span>, <span className="font-bold">Email UNIQUE</span>
                </div>
              </div>

              {/* Foreign Key */}
              <div className="p-4 rounded-xl bg-white border-2 border-zinc-900 space-y-2 shadow-[2px_2px_0px_#18181B]">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-zinc-900 font-mono">5. Foreign Key (FK)</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-100 text-sky-900 border border-zinc-900 font-bold">
                    Referential Link
                  </span>
                </div>
                <p className="text-xs text-zinc-700 leading-relaxed">
                  A column (or group of columns) in one table that references the Primary Key of another table. It enforces Referential Integrity and connects relational data without duplicating records.
                </p>
                <div className="p-2.5 rounded bg-zinc-50 font-mono text-[11px] text-zinc-800 border border-zinc-300">
                  Example: In Course, <span className="font-bold text-sky-800">InstructorID FK</span> references <span className="font-bold">INSTRUCTOR(InstructorID PK)</span>
                </div>
              </div>

              {/* Single PK Best Practice vs Composite Key */}
              <div className="p-4 rounded-xl bg-white border-2 border-zinc-900 md:col-span-2 space-y-2 shadow-[2px_2px_0px_#18181B]">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-zinc-900 font-mono">6. Single Primary Key Rule & Associative Tables</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#FEF08A] text-zinc-900 border border-zinc-900 font-bold">
                    Relational Best Practice
                  </span>
                </div>
                <p className="text-xs text-zinc-700 leading-relaxed">
                  Every table must have strictly <strong>one Primary Key</strong>. In associative/junction tables (like ENROLLMENT or ORDER_ITEM), modern database engineering assigns a single surrogate primary key (e.g. <span className="font-mono font-bold">EnrollmentID PK</span>), while the connected columns (<span className="font-mono font-bold">StudentID FK, CourseID FK</span>) act purely as Foreign Keys.
                </p>
                <div className="p-2.5 rounded bg-zinc-50 font-mono text-[11px] text-zinc-900 border border-zinc-300">
                  Best Practice Schema: <span className="font-bold bg-[#FEF08A] px-1 rounded">EnrollmentID (PK)</span> + <span className="font-bold text-sky-800">StudentID (FK)</span> + <span className="font-bold text-sky-800">CourseID (FK)</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Interactive Tester */}
              <div className="p-5 rounded-xl bg-white border-2 border-zinc-900 space-y-4 shadow-[3px_3px_0px_#18181B]">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 font-mono">Interactive Column Selector</h3>
                    <p className="text-xs text-zinc-600 font-handwriting text-sm">
                      Click columns from the sample <code>STUDENT</code> table to evaluate what key classification the selected subset forms.
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedCols(['StudentID'])}
                    className="text-xs text-zinc-600 hover:text-zinc-900 underline font-mono font-semibold"
                  >
                    Reset to Default
                  </button>
                </div>

                {/* Column Badges */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {tableColumns.map((col) => {
                    const isSelected = selectedCols.includes(col.name);
                    return (
                      <button
                        key={col.name}
                        onClick={() => toggleColumn(col.name)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-2 border transition-all ${
                          isSelected
                            ? 'bg-[#FEF08A] text-zinc-900 border-2 border-zinc-900 shadow-[2px_2px_0px_#18181B] font-bold'
                            : 'bg-zinc-50 text-zinc-700 border border-zinc-300 hover:border-zinc-900'
                        }`}
                      >
                        <span>{col.name}</span>
                        {col.isUnique && (
                          <span className="px-1 py-0.2 rounded text-[9px] bg-white text-zinc-800 border border-zinc-400 font-bold">
                            Unique
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Real-Time Classification Evaluation Banner */}
                <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-300 space-y-3 mt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-600 uppercase tracking-wider font-mono">
                      Selected Attribute Set: &#123;{selectedCols.join(', ') || 'EMPTY'}&#125;
                    </span>
                    <span className="text-xs font-bold font-mono text-zinc-900">
                      {selectedCols.length} Column{selectedCols.length === 1 ? '' : 's'}
                    </span>
                  </div>

                  {/* Diagnosis Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                    <div className={`p-2.5 rounded-lg border ${isSuperKey ? 'bg-[#FEF08A]/50 border-2 border-zinc-900 text-zinc-900 font-bold' : 'bg-white border-zinc-300 text-zinc-400'}`}>
                      <span className="block text-[10px] uppercase font-sans">Is Super Key?</span>
                      <span className="font-bold text-sm">{isSuperKey ? 'YES' : 'NO'}</span>
                    </div>

                    <div className={`p-2.5 rounded-lg border ${isCandidateKey ? 'bg-[#FEF08A]/50 border-2 border-zinc-900 text-zinc-900 font-bold' : 'bg-white border-zinc-300 text-zinc-400'}`}>
                      <span className="block text-[10px] uppercase font-sans">Is Candidate Key?</span>
                      <span className="font-bold text-sm">{isCandidateKey ? 'YES' : 'NO'}</span>
                    </div>

                    <div className={`p-2.5 rounded-lg border ${isPrimaryKey ? 'bg-[#FEF08A]/50 border-2 border-zinc-900 text-zinc-900 font-bold' : 'bg-white border-zinc-300 text-zinc-400'}`}>
                      <span className="block text-[10px] uppercase font-sans">Is Primary Key?</span>
                      <span className="font-bold text-sm">{isPrimaryKey ? 'YES' : 'NO'}</span>
                    </div>

                    <div className={`p-2.5 rounded-lg border ${isAlternateKey ? 'bg-[#FEF08A]/50 border-2 border-zinc-900 text-zinc-900 font-bold' : 'bg-white border-zinc-300 text-zinc-400'}`}>
                      <span className="block text-[10px] uppercase font-sans">Is Alternate Key?</span>
                      <span className="font-bold text-sm">{isAlternateKey ? 'YES' : 'NO'}</span>
                    </div>
                  </div>

                  {/* Detailed Pedagogical Explanation */}
                  <div className="pt-2 text-xs text-zinc-800 leading-relaxed font-sans">
                    {selectedCols.length === 0 ? (
                      <span className="italic text-zinc-500">Select one or more columns above to inspect properties.</span>
                    ) : isCandidateKey ? (
                      <span className="text-zinc-900">
                        <strong>Excellent!</strong> &#123;{selectedCols.join(', ')}&#125; is a minimal super key with zero redundancy. It can uniquely identify each student on its own.
                      </span>
                    ) : isSuperKey ? (
                      <span className="text-zinc-900">
                        &#123;{selectedCols.join(', ')}&#125; is a valid <strong>Super Key</strong> because it guarantees uniqueness, but it is <em>not minimal</em> (redundant attributes exist).
                      </span>
                    ) : (
                      <span className="text-rose-700">
                        &#123;{selectedCols.join(', ')}&#125; <strong>cannot</strong> guarantee uniqueness because multiple students could share the exact same names.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t-2 border-zinc-900 bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-zinc-600 font-handwriting text-sm">
            <ShieldCheck className="w-4 h-4 text-zinc-900" />
            <span>Entity Integrity: Every relational table requires a designated Primary Key.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs transition-all shadow-[2px_2px_0px_#18181B]"
          >
            Close Lab
          </button>
        </div>
      </div>
    </div>
  );
};
