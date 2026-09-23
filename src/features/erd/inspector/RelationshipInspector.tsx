import React, { useState } from 'react';
import {
  Trash2,
  Split,
  Link,
} from 'lucide-react';
import type { Relationship, Cardinality, Attribute } from '../../../types/erd';
import { useErdStore } from '../../../stores/erdStore';

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
      {/* Connected Tables Summary */}
      <div className="p-2 rounded bg-zinc-50 border border-zinc-200 flex items-center justify-between text-xs">
        <span className="font-mono font-bold text-zinc-900">{sourceEntity?.name || 'A'}</span>
        <span className="text-zinc-500 font-mono text-[11px]">— [{relationship.cardinality}] —</span>
        <span className="font-mono font-bold text-zinc-900">{targetEntity?.name || 'B'}</span>
      </div>

      {/* Relationship Name */}
      <div>
        <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Relationship Name / Verb</label>
        <input
          type="text"
          value={relationship.name}
          onChange={(e) => updateRelationship(relationship.id, { name: e.target.value })}
          placeholder="e.g. teaches, enrolls in, contains"
          className="w-full px-2.5 py-1.5 rounded border border-zinc-300 bg-white text-zinc-900 text-xs focus:outline-none focus:border-zinc-900 font-handwriting text-base"
        />
      </div>

      {/* Cardinality Ratio */}
      <div>
        <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Cardinality Ratio</label>
        <select
          value={relationship.cardinality}
          onChange={(e) => updateRelationship(relationship.id, { cardinality: e.target.value as Cardinality })}
          className="w-full px-2.5 py-1.5 rounded border border-zinc-300 bg-white text-zinc-900 text-xs focus:outline-none focus:border-zinc-900 font-mono"
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
