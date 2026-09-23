import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Database,
} from 'lucide-react';
import { useDatabaseStore } from '../../stores/databaseStore';
import type { DatabaseRow, IntegrityViolation } from '../../types/database';
import { lmsSystem } from '../../data/systems/lms';

export const DataSandboxView: React.FC = () => {
  const {
    tables,
    data,
    activeTableName,
    setActiveTableName,
    insertRow,
    deleteRow,
    loadSampleData,
    resetData,
  } = useDatabaseStore();

  const [inputRow, setInputRow] = useState<DatabaseRow>({});
  const [activeViolation, setActiveViolation] = useState<IntegrityViolation | null>(null);

  const activeTable = tables.find((t) => t.name === activeTableName) || tables[0];
  const currentRows = activeTable ? data[activeTable.name] || [] : [];

  const handleInputChange = (colName: string, value: string) => {
    setInputRow((prev) => ({ ...prev, [colName]: value }));
  };

  const handleInsert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTable) return;

    const violation = insertRow(activeTable.name, inputRow);
    if (violation) {
      setActiveViolation(violation);
    } else {
      setActiveViolation(null);
      setInputRow({});
    }
  };

  if (tables.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-zinc-400 p-8 text-center">
        <Database className="w-8 h-8 text-zinc-400 mb-2" />
        <h4 className="font-semibold text-xs text-zinc-700">No Database Tables</h4>
        <p className="text-xs text-zinc-500 max-w-sm mt-1">
          Create entities and attributes on the canvas to generate interactive tables for data entry.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Controls: Table Switcher & Sample Data */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-zinc-200">
        <div className="flex items-center gap-1 overflow-x-auto">
          {tables.map((t) => (
            <button
              key={t.name}
              onClick={() => {
                setActiveTableName(t.name);
                setActiveViolation(null);
              }}
              className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-colors ${
                (activeTable && activeTable.name === t.name)
                  ? 'bg-zinc-900 text-white shadow-2xs'
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
              }`}
            >
              {t.name} ({(data[t.name] || []).length})
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => loadSampleData(lmsSystem.sampleData || {})}
            className="flex items-center gap-1 px-2.5 py-1 rounded border border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-800 text-xs font-medium transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Load Sample Data</span>
          </button>

          <button
            onClick={resetData}
            className="flex items-center gap-1 px-2.5 py-1 rounded border border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-600 text-xs transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Constraint Violation Banner if any */}
      {activeViolation && (
        <div className="p-3 rounded bg-rose-50 border border-rose-300 text-rose-900 text-xs space-y-1 animate-in fade-in duration-100">
          <div className="flex items-center gap-1.5 font-bold">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>{activeViolation.type} VIOLATION</span>
          </div>
          <p className="font-mono text-[11px] text-rose-950">{activeViolation.message}</p>
          <p className="text-[11px] text-rose-800 leading-relaxed font-sans">{activeViolation.explanation}</p>
        </div>
      )}

      {/* Clean Spreadsheet-style Table */}
      {activeTable && (
        <div className="border border-zinc-900 bg-white overflow-x-auto shadow-xs" style={{ borderRadius: '2px' }}>
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="bg-[#FEF08A] border-b border-zinc-900 text-zinc-950 font-bold">
                {activeTable.columns.map((col) => (
                  <th key={col.name} className="px-3 py-2 border-r border-zinc-300 last:border-r-0">
                    <div className="flex items-center gap-1">
                      <span>{col.name}</span>
                      {activeTable.primaryKey.includes(col.name) && (
                        <span className="text-[10px] bg-yellow-200 px-1 rounded border border-zinc-500">PK</span>
                      )}
                      {col.isForeignKey && (
                        <span className="text-[10px] bg-zinc-100 px-1 rounded border border-zinc-400">FK</span>
                      )}
                    </div>
                  </th>
                ))}
                <th className="px-3 py-2 w-12 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {currentRows.length === 0 ? (
                <tr>
                  <td colSpan={activeTable.columns.length + 1} className="py-6 text-center text-zinc-400 italic text-[11px]">
                    No records in table '{activeTable.name}'. Insert a test row below.
                  </td>
                </tr>
              ) : (
                currentRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-zinc-50 transition-colors">
                    {activeTable.columns.map((col) => (
                      <td key={col.name} className="px-3 py-1.5 border-r border-zinc-200 last:border-r-0 text-zinc-800">
                        {row[col.name] !== undefined && row[col.name] !== null ? String(row[col.name]) : <span className="text-zinc-400 italic">NULL</span>}
                      </td>
                    ))}
                    <td className="px-3 py-1.5 text-center">
                      <button
                        onClick={() => deleteRow(activeTable.name, idx)}
                        className="text-zinc-400 hover:text-red-600 transition-colors"
                        title="Delete row"
                      >
                        <Trash2 className="w-3.5 h-3.5 mx-auto" />
                      </button>
                    </td>
                  </tr>
                ))
              )}

              {/* Inline Insert Row */}
              <tr className="bg-zinc-50 border-t-2 border-zinc-300">
                {activeTable.columns.map((col) => (
                  <td key={col.name} className="p-1.5 border-r border-zinc-200 last:border-r-0">
                    <input
                      type="text"
                      placeholder={`Enter ${col.name}...`}
                      value={inputRow[col.name] ?? ''}
                      onChange={(e) => handleInputChange(col.name, e.target.value)}
                      className="w-full px-2 py-1 rounded border border-zinc-300 bg-white text-xs font-mono focus:outline-none focus:border-zinc-900"
                    />
                  </td>
                ))}
                <td className="p-1.5 text-center">
                  <button
                    onClick={handleInsert}
                    className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs flex items-center gap-1 mx-auto"
                    title="Insert Record"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Insert</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
