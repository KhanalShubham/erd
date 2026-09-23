import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Sparkles,
} from 'lucide-react';
import { useErdStore } from '../../stores/erdStore';

export const IntegrityReportView: React.FC = () => {
  const { entities, relationships, resolveManyToMany } = useErdStore();

  interface DiagnosticItem {
    id: string;
    level: 'error' | 'warning' | 'pass';
    category: string;
    title: string;
    details: string;
    actionLabel?: string;
    onAction?: () => void;
  }

  const diagnostics: DiagnosticItem[] = [];

  // 1. Check Primary Keys on all entities
  entities.forEach((entity) => {
    const pk = entity.attributes.filter((a) => a.isPrimaryKey);
    if (pk.length === 0) {
      diagnostics.push({
        id: `no_pk_${entity.id}`,
        level: 'error',
        category: 'Entity Integrity',
        title: `Entity '${entity.name}' has no Primary Key`,
        details: 'Every table must have a unique, non-null primary key to distinguish records.',
      });
    } else if (pk.length > 1) {
      diagnostics.push({
        id: `multi_pk_${entity.id}`,
        level: 'error',
        category: 'Entity Integrity',
        title: `Entity '${entity.name}' has ${pk.length} Primary Keys (${pk.map((k) => k.name).join(', ')})`,
        details: 'A relational table must have exactly ONE Primary Key. Relational references to other tables should be Foreign Keys.',
      });
    } else {
      diagnostics.push({
        id: `has_pk_${entity.id}`,
        level: 'pass',
        category: 'Entity Integrity',
        title: `'${entity.name}' has valid Primary Key (${pk[0].name})`,
        details: 'Entity integrity is properly satisfied for this table.',
      });
    }

    const both = entity.attributes.filter((a) => a.isPrimaryKey && a.isForeignKey);
    if (both.length > 0) {
      diagnostics.push({
        id: `both_pk_fk_${entity.id}`,
        level: 'warning',
        category: 'Relational Design',
        title: `Entity '${entity.name}' has columns marked as both PK and FK: ${both.map((a) => a.name).join(', ')}`,
        details: 'Relational design best practice uses a single dedicated Primary Key, with referencing columns defined strictly as Foreign Keys.',
      });
    }
  });

  // 2. Check for unresolved M:N relationships
  relationships.forEach((rel) => {
    if (rel.cardinality === 'M:N') {
      const source = entities.find((e) => e.id === rel.sourceEntityId)?.name || 'Source';
      const target = entities.find((e) => e.id === rel.targetEntityId)?.name || 'Target';
      diagnostics.push({
        id: `unresolved_mn_${rel.id}`,
        level: 'warning',
        category: 'Relational Decomposition',
        title: `Unresolved M:N relationship: ${source} ↔ ${target}`,
        details:
          'Direct Many-to-Many relationships cannot be stored in a relational schema. Resolve into an Associative Entity.',
        actionLabel: 'Resolve to Junction Entity',
        onAction: () => resolveManyToMany(rel.id),
      });
    }
  });

  // 3. Check for orphaned entities
  entities.forEach((entity) => {
    const isConnected = relationships.some(
      (r) => r.sourceEntityId === entity.id || r.targetEntityId === entity.id
    );
    if (!isConnected && entities.length > 1) {
      diagnostics.push({
        id: `orphan_${entity.id}`,
        level: 'warning',
        category: 'Connectivity',
        title: `'${entity.name}' is not connected to any other entity`,
        details: 'Check whether this entity requires a foreign key relationship.',
      });
    }
  });

  // 4. Check for empty entities
  entities.forEach((entity) => {
    if (entity.attributes.length === 0) {
      diagnostics.push({
        id: `empty_${entity.id}`,
        level: 'error',
        category: 'Completeness',
        title: `'${entity.name}' has no columns defined`,
        details: 'A table with no columns cannot store records.',
      });
    }
  });

  const errorsCount = diagnostics.filter((d) => d.level === 'error').length;
  const warningsCount = diagnostics.filter((d) => d.level === 'warning').length;
  const passCount = diagnostics.filter((d) => d.level === 'pass').length;

  return (
    <div className="space-y-3 text-xs">
      {/* Summary Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-zinc-200">
        <div>
          <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-900 font-mono">
            Database Design Diagnostic Health
          </h3>
          <p className="text-[11px] text-zinc-600">
            Real-time validation checking Entity Integrity and Relational constraints.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200 font-mono">
            {errorsCount} Errors
          </span>
          <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-mono">
            {warningsCount} Warnings
          </span>
          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono">
            {passCount} Passed
          </span>
        </div>
      </div>

      {/* Diagnostics List */}
      <div className="space-y-2">
        {diagnostics.map((diag) => (
          <div
            key={diag.id}
            className={`p-2.5 rounded border flex items-start justify-between gap-3 ${
              diag.level === 'error'
                ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                : diag.level === 'warning'
                ? 'bg-yellow-50/70 border-yellow-200 text-amber-900'
                : 'bg-white border-zinc-200 text-zinc-800'
            }`}
          >
            <div className="flex items-start gap-2">
              {diag.level === 'error' && <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
              {diag.level === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />}
              {diag.level === 'pass' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}

              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-semibold text-xs text-zinc-950">{diag.title}</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-zinc-100 text-zinc-600 border border-zinc-200">
                    {diag.category}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-600 leading-relaxed font-sans">{diag.details}</p>
              </div>
            </div>

            {diag.onAction && diag.actionLabel && (
              <button
                onClick={diag.onAction}
                className="shrink-0 px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold flex items-center gap-1 shadow-2xs transition-colors"
              >
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>{diag.actionLabel}</span>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
