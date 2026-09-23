import React from 'react';
import { Database } from 'lucide-react';
import { useDatabaseStore } from '../../stores/databaseStore';
import { useErdStore } from '../../stores/erdStore';

export const RelationalTablesView: React.FC = () => {
  const { tables } = useDatabaseStore();
  const { setHighlightedFk, highlightedFk } = useErdStore();

  const handleFkClick = (sourceTable: string, sourceCol: string, targetTable: string, targetCol: string) => {
    setHighlightedFk({
      sourceTable,
      sourceColumn: sourceCol,
      targetTable,
      targetColumn: targetCol,
    });
    setTimeout(() => setHighlightedFk(null), 3000);
  };

  if (tables.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-zinc-400 p-8 text-center">
        <Database className="w-8 h-8 text-zinc-400 mb-2" />
        <h4 className="font-semibold text-xs text-zinc-700">No Relational Tables</h4>
        <p className="text-xs text-zinc-500 max-w-sm mt-1">
          Add entities on the ERD canvas to see relational table conversion.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
        <div>
          <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-900 font-mono">
            Relational Schema Tables
          </h3>
          <p className="text-[11px] text-zinc-600">
            Equivalent normalized relational tables converted from your conceptual ERD.
          </p>
        </div>
        <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-zinc-100 text-zinc-800 border border-zinc-300">
          {tables.length} Tables
        </span>
      </div>

      {/* Grid of Clean Textbook / Ruler-Drawn Tables */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {tables.map((table) => {
          const isTableFkTarget = highlightedFk && highlightedFk.targetTable.toLowerCase() === table.name.toLowerCase();
          const isTableFkSource = highlightedFk && highlightedFk.sourceTable.toLowerCase() === table.name.toLowerCase();

          return (
            <div
              key={table.name}
              className={`bg-white border border-zinc-900 shadow-xs overflow-hidden transition-all ${
                isTableFkSource || isTableFkTarget
                  ? 'ring-2 ring-amber-400 shadow-sm'
                  : 'hover:shadow-sm'
              }`}
              style={{ borderRadius: '2px' }}
            >
              {/* Table Name (Yellow Highlighter Strip) */}
              <div className="bg-[#FEF08A] px-3 py-1.5 border-b border-zinc-900 font-mono font-bold text-xs text-zinc-950 uppercase tracking-wide">
                {table.name}
              </div>

              {/* Columns List */}
              <div className="divide-y divide-zinc-200 text-xs">
                {table.columns.map((col) => {
                  const isPk = table.primaryKey.includes(col.name);
                  const isFk = col.isForeignKey;
                  const fkInfo = table.foreignKeys.find((fk) => fk.column === col.name);

                  return (
                    <div
                      key={col.name}
                      onClick={() => {
                        if (fkInfo) {
                          handleFkClick(table.name, col.name, fkInfo.referencedTable, fkInfo.referencedColumn);
                        }
                      }}
                      className={`px-3 py-1.5 flex items-center justify-between font-mono text-[11px] ${
                        isFk ? 'cursor-pointer hover:bg-yellow-50' : 'hover:bg-zinc-50'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="text-zinc-900 font-medium truncate">{col.name}</span>
                      </div>

                      {/* PK / FK Minimal Badges */}
                      <div className="flex items-center gap-1 shrink-0 font-sans text-[10px]">
                        {isPk && (
                          <span className="font-bold text-zinc-950 bg-yellow-200 px-1 rounded border border-zinc-400">
                            PK
                          </span>
                        )}
                        {isFk && (
                          <span
                            className="font-bold text-zinc-800 bg-zinc-100 hover:bg-zinc-200 px-1 rounded border border-zinc-300"
                            title={`References ${fkInfo?.referencedTable}.${fkInfo?.referencedColumn}`}
                          >
                            FK
                          </span>
                        )}
                        <span className="text-zinc-400 text-[10px] ml-1">{col.dataType}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
