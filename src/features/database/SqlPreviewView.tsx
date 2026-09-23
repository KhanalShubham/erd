import React, { useState } from 'react';
import { Copy, Check, Download } from 'lucide-react';
import { useDatabaseStore } from '../../stores/databaseStore';
import { SqlGenerator, type SqlDialect } from '../../engine/sql/SqlGenerator';

export const SqlPreviewView: React.FC = () => {
  const { tables, data, sqlDialect, setSqlDialect } = useDatabaseStore();
  const [copied, setCopied] = useState(false);
  const [showDml, setShowDml] = useState(false);

  const ddl = SqlGenerator.generateDDL(tables, sqlDialect);
  const dml = showDml ? SqlGenerator.generateDML(tables, data, sqlDialect) : '';
  const fullSql = `${ddl}${showDml && dml ? `\n\n${dml}` : ''}`.trim();

  const handleCopy = () => {
    navigator.clipboard.writeText(fullSql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([fullSql], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `schema_${sqlDialect.toLowerCase().replace(/\s+/g, '_')}.sql`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-3">
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-zinc-200">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-zinc-700">Dialect:</label>
          <select
            value={sqlDialect}
            onChange={(e) => setSqlDialect(e.target.value as SqlDialect)}
            className="px-2 py-1 rounded border border-zinc-300 bg-white text-zinc-900 text-xs font-mono focus:outline-none focus:border-zinc-900"
          >
            <option value="PostgreSQL">PostgreSQL</option>
            <option value="MySQL">MySQL</option>
            <option value="SQLite">SQLite</option>
            <option value="SQL Server">SQL Server (T-SQL)</option>
            <option value="Standard SQL">Standard SQL</option>
          </select>

          <label className="flex items-center gap-1.5 text-xs text-zinc-700 cursor-pointer ml-2">
            <input
              type="checkbox"
              checked={showDml}
              onChange={(e) => setShowDml(e.target.checked)}
              className="rounded border-zinc-300 text-zinc-900"
            />
            <span>Include Sample INSERTs</span>
          </label>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleDownload}
            className="flex items-center gap-1 px-2.5 py-1 rounded border border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-800 text-xs font-medium transition-colors"
            title="Download SQL file"
          >
            <Download className="w-3.5 h-3.5 text-zinc-600" />
            <span>Download</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-3 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium transition-colors shadow-2xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy SQL'}</span>
          </button>
        </div>
      </div>

      {/* Clean Paper Code Block */}
      <div className="border border-zinc-300 bg-white p-3.5 rounded shadow-2xs overflow-hidden">
        <pre className="overflow-x-auto font-mono text-xs text-zinc-850 leading-relaxed max-h-60 select-all">
          <code>{fullSql}</code>
        </pre>
      </div>
    </div>
  );
};
