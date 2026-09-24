import React, { useState } from 'react';
import {
  Trash2,
  Split,
  Link,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  Compass,
} from 'lucide-react';
import type { Relationship, Cardinality, Attribute } from '../../../types/erd';
import { useErdStore } from '../../../stores/erdStore';
import { ErdCorrectnessEngine } from '../../../engine/database/ErdCorrectnessEngine';

interface RelationshipInspectorProps {
  relationship: Relationship;
}

export const RelationshipInspector: React.FC<RelationshipInspectorProps> = ({ relationship }) => {
  const {
    updateRelationship,
    deleteRelationship,
    resolveManyToMany,
    entities,
    setHighlightedFk,
  } = useErdStore();

  const [newAttrName, setNewAttrName] = useState('');

  const sourceEntity = entities.find((e) => e.id === relationship.sourceEntityId);
  const targetEntity = entities.find((e) => e.id === relationship.targetEntityId);

  const isManyToMany = relationship.cardinality === 'M:N';

  // Compute bidirectional traversal and 3-way triangulation
  const traversal = ErdCorrectnessEngine.getRelationshipTraversals(relationship, entities);

  const isCashierReceipt11Contradiction =
    relationship.cardinality === '1:1' &&
    ((sourceEntity?.name.toUpperCase().includes('CASHIER') && targetEntity?.name.toUpperCase().includes('RECEIPT')) ||
      (sourceEntity?.name.toUpperCase().includes('RECEIPT') && targetEntity?.name.toUpperCase().includes('CASHIER')));

  const handleAddRelationshipAttribute = () => {
    if (!newAttrName.trim()) return;
    const newAttr: Attribute = {
      id: `rel_attr_${Date.now()}`,
      entityId: relationship.id,
      name: newAttrName.trim(),
      type: 'simple',
      dataType: 'VARCHAR',
      isPrimaryKey: false,
      isForeignKey: false,
      isNullable: true,
      isUnique: false,
    };
    updateRelationship(relationship.id, {
      attributes: [...relationship.attributes, newAttr],
    });
    setNewAttrName('');
  };

  const handleRemoveRelationshipAttribute = (attrId: string) => {
    updateRelationship(relationship.id, {
      attributes: relationship.attributes.filter((a) => a.id !== attrId),
    });
  };

  const handleHighlightForeignKeys = () => {
    if (!sourceEntity || !targetEntity) return;
    const sourcePk = sourceEntity.attributes.find((a) => a.isPrimaryKey);
    if (sourcePk) {
      setHighlightedFk({
        sourceTable: sourceEntity.name,
        sourceColumn: sourcePk.name,
        targetTable: targetEntity.name,
        targetColumn: sourcePk.name,
      });
      setTimeout(() => setHighlightedFk(null), 3000);
    }
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Contradiction Alert Banner */}
      {isCashierReceipt11Contradiction && (
        <div className="p-3 bg-rose-50 border-2 border-rose-600 rounded-lg text-rose-950 space-y-1 shadow-[2px_2px_0px_#E11D48] animate-in fade-in">
          <div className="flex items-center gap-1.5 font-mono font-bold text-xs">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>CRITICAL CARDINALITY ERROR</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            Your relationship specifies <strong>1:1</strong> between Cashier and Sale Receipt.
            This asserts that one cashier can only ever process <em>one receipt in their career</em>!
          </p>
          <div className="pt-1 text-[11px] font-mono text-rose-900">
            <strong>Correct Cardinality:</strong> CASHIER [1] (0..N) ── rings_up ──► [N] (1..1) SALE_RECEIPT
          </div>
        </div>
      )}

      {/* Connected Tables Summary */}
      <div className="p-2.5 rounded bg-zinc-50 border border-zinc-300 flex items-center justify-between text-xs">
        <span className="font-mono font-bold text-zinc-900 bg-white px-2 py-0.5 rounded border border-zinc-200">
          {sourceEntity?.name || 'A'}
        </span>
        <span className="text-zinc-600 font-mono text-[11px] font-bold">
          [{relationship.sourceMax || '1'}] ── {relationship.name} ──► [{relationship.targetMax || 'N'}]
        </span>
        <span className="font-mono font-bold text-zinc-900 bg-white px-2 py-0.5 rounded border border-zinc-200">
          {targetEntity?.name || 'B'}
        </span>
      </div>

      {/* 1. Bidirectional Cardinality Traversal & Reverse-Read Test (Sections 2, 15, 16) */}
      <div className="p-2.5 rounded bg-yellow-50/70 border border-amber-300 space-y-2">
        <div className="flex items-center gap-1.5 text-amber-900 font-mono font-bold text-[11px] uppercase tracking-wider">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Bidirectional Reading Test</span>
        </div>

        {/* Forward Read */}
        <div className="p-2 rounded bg-white border border-amber-200 space-y-0.5">
          <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-zinc-500 uppercase">
            <ArrowRight className="w-3 h-3 text-amber-700" />
            <span>Forward Statement (Left-to-Right)</span>
          </div>
          <p className="text-zinc-900 font-medium text-[11.5px] leading-snug">
            "{traversal.forwardSentence}"
          </p>
        </div>

        {/* Reverse Read */}
        <div className="p-2 rounded bg-white border border-amber-200 space-y-0.5">
          <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-zinc-500 uppercase">
            <ArrowLeft className="w-3 h-3 text-amber-700" />
            <span>Reverse-Read Test (Right-to-Left)</span>
          </div>
          <p className="text-zinc-900 font-medium text-[11.5px] leading-snug">
            "{traversal.reverseSentence}"
          </p>
        </div>
      </div>

      {/* 2. 3-Way Triangulation Status (Section 17) */}
      <div className="p-2.5 rounded bg-white border border-zinc-300 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-mono font-bold text-[11px] uppercase tracking-wider text-zinc-800 flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-zinc-700" />
            <span>3-Way Triangulation Check</span>
          </span>
          <span
            className={`px-1.5 py-0.2 rounded font-mono text-[10px] font-bold border ${
              traversal.triangulationStatus === 'PASS'
                ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                : traversal.triangulationStatus === 'WARNING'
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-rose-100 text-rose-900 border-rose-300'
            }`}
          >
            {traversal.triangulationStatus}
          </span>
        </div>

        <div className="space-y-1 text-[11px] text-zinc-700">
          <div className="flex items-start gap-1.5">
            <span className="font-mono font-bold text-zinc-900 shrink-0">Check A (Business):</span>
            <span>Natural language traversal must be true in both directions.</span>
          </div>
          <div className="flex items-start gap-1.5">
            <span className="font-mono font-bold text-zinc-900 shrink-0">Check B (Diagram):</span>
            <span className="font-mono text-zinc-900 font-bold">{relationship.cardinality}</span>
          </div>
          <div className="flex items-start gap-1.5">
            <span className="font-mono font-bold text-zinc-900 shrink-0">Check C (Schema):</span>
            <span className="font-mono text-zinc-900">{traversal.fkLocation}</span>
          </div>
        </div>

        <p className="text-[10.5px] text-zinc-600 italic border-t border-zinc-100 pt-1.5 leading-snug">
          {traversal.triangulationDetails}
        </p>
      </div>

      {/* Relationship Name */}
      <div>
        <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
          Relationship Verb Phrase (Must describe real business action)
        </label>
        <input
          type="text"
          value={relationship.name}
          onChange={(e) => updateRelationship(relationship.id, { name: e.target.value })}
          placeholder="e.g. rings_up, contains, scanned_in"
          className="w-full px-2.5 py-1.5 rounded border border-zinc-300 bg-white text-zinc-900 text-xs focus:outline-none focus:border-zinc-900 font-handwriting text-base"
        />
      </div>

      {/* Cardinality Ratio */}
      <div>
        <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Cardinality Ratio</label>
        <select
          value={relationship.cardinality}
          onChange={(e) => {
            const card = e.target.value as Cardinality;
            let sMax: '1' | 'N' = '1';
            let tMax: '1' | 'N' = 'N';
            if (card === '1:1') { sMax = '1'; tMax = '1'; }
            else if (card === 'N:1') { sMax = 'N'; tMax = '1'; }
            else if (card === 'M:N') { sMax = 'N'; tMax = 'N'; }

            updateRelationship(relationship.id, {
              cardinality: card,
              sourceMax: sMax,
              targetMax: tMax,
            });
          }}
          className="w-full px-2.5 py-1.5 rounded border border-zinc-300 bg-white text-zinc-900 text-xs focus:outline-none focus:border-zinc-900 font-mono font-bold"
        >
          <option value="1:N">1:N (One to Many)</option>
          <option value="1:1">1:1 (One to One)</option>
          <option value="N:1">N:1 (Many to One)</option>
          <option value="M:N">M:N (Many to Many)</option>
        </select>
        <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed">
          {relationship.cardinality === '1:N' && `1 ${sourceEntity?.name || 'A'} relates to multiple ${targetEntity?.name || 'B'} records.`}
          {relationship.cardinality === '1:1' && `1 record strictly matches at most 1 record in the related table.`}
          {relationship.cardinality === 'M:N' && `Many-to-Many requires decomposition into an associative junction table.`}
        </p>
      </div>

      {/* Optionality & Min..Max */}
      <div className="p-2.5 rounded bg-zinc-50 border border-zinc-200 space-y-2">
        <span className="text-[11px] font-semibold text-zinc-700 block">Participation & Optionality</span>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-[10px] text-zinc-600 block mb-0.5">{sourceEntity?.name} (Min..Max)</span>
            <select
              value={`${relationship.sourceOptionality}..${relationship.sourceMax}`}
              onChange={(e) => {
                const [min, max] = e.target.value.split('..');
                updateRelationship(relationship.id, {
                  sourceOptionality: min as '0' | '1',
                  sourceMax: max as '1' | 'N',
                });
              }}
              className="w-full px-2 py-1 rounded border border-zinc-300 bg-white text-xs font-mono"
            >
              <option value="0..1">0..1 (Optional, Max 1)</option>
              <option value="1..1">1..1 (Mandatory, 1)</option>
              <option value="0..N">0..N (Optional, Many)</option>
              <option value="1..N">1..N (Mandatory, Many)</option>
            </select>
          </div>

          <div>
            <span className="text-[10px] text-zinc-600 block mb-0.5">{targetEntity?.name} (Min..Max)</span>
            <select
              value={`${relationship.targetOptionality}..${relationship.targetMax}`}
              onChange={(e) => {
                const [min, max] = e.target.value.split('..');
                updateRelationship(relationship.id, {
                  targetOptionality: min as '0' | '1',
                  targetMax: max as '1' | 'N',
                });
              }}
              className="w-full px-2 py-1 rounded border border-zinc-300 bg-white text-xs font-mono"
            >
              <option value="0..1">0..1 (Optional, Max 1)</option>
              <option value="1..1">1..1 (Mandatory, 1)</option>
              <option value="0..N">0..N (Optional, Many)</option>
              <option value="1..N">1..N (Mandatory, Many)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Resolve Many-to-Many Action */}
      {isManyToMany && (
        <div className="p-2.5 rounded bg-yellow-50 border border-yellow-300 space-y-2">
          <span className="font-bold text-zinc-900 block text-[11px]">Resolve M:N to Junction Table</span>
          <p className="text-[10px] text-zinc-700 leading-relaxed">
            Relational tables cannot store multi-valued arrays. Click below to automatically create a junction table with composite keys.
          </p>
          <button
            onClick={() => resolveManyToMany(relationship.id)}
            className="w-full py-1.5 px-3 rounded bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <Split className="w-3.5 h-3.5" />
            <span>Resolve to Associative Entity</span>
          </button>
        </div>
      )}

      {/* Foreign Key Visualizer Highlight Button */}
      {!isManyToMany && (
        <button
          onClick={handleHighlightForeignKeys}
          className="w-full py-1.5 px-3 rounded border border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-800 text-xs flex items-center justify-center gap-1.5 transition-colors"
        >
          <Link className="w-3.5 h-3.5 text-zinc-600" />
          <span>Highlight Foreign Key Migration</span>
        </button>
      )}

      {/* Relationship Attributes */}
      <div className="p-2.5 rounded bg-zinc-50 border border-zinc-200 space-y-2">
        <span className="text-[11px] font-semibold text-zinc-700 block">
          Relationship Attributes ({relationship.attributes.length})
        </span>

        <div className="space-y-1">
          {relationship.attributes.map((attr) => (
            <div key={attr.id} className="flex items-center justify-between text-xs bg-white border border-zinc-200 px-2 py-1 rounded">
              <span className="font-mono text-zinc-800">{attr.name}</span>
              <button
                onClick={() => handleRemoveRelationshipAttribute(attr.id)}
                className="text-zinc-400 hover:text-red-600 font-bold px-1"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-1 pt-1">
          <input
            type="text"
            placeholder="e.g. EnrollmentDate, Grade"
            value={newAttrName}
            onChange={(e) => setNewAttrName(e.target.value)}
            className="flex-1 px-2 py-1 rounded border border-zinc-300 bg-white text-xs font-mono"
          />
          <button
            onClick={handleAddRelationshipAttribute}
            className="px-2.5 py-1 rounded bg-zinc-900 text-white text-xs font-medium"
          >
            Add
          </button>
        </div>
      </div>

      {/* Delete Relationship */}
      <div className="pt-2 border-t border-zinc-200 flex justify-end">
        <button
          onClick={() => deleteRelationship(relationship.id)}
          className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 px-2 py-1 rounded hover:bg-red-50 transition-colors"
        >
          <Trash2 className="w-3 h-3" />
          <span>Delete Relationship</span>
        </button>
      </div>
    </div>
  );
};
