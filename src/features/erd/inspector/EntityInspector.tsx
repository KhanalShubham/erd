import React from 'react';
import { Plus, Trash2, Key } from 'lucide-react';
import type { Entity, EntityType } from '../../../types/erd';
import { useErdStore } from '../../../stores/erdStore';

interface EntityInspectorProps {
  entity: Entity;
}

export const EntityInspector: React.FC<EntityInspectorProps> = ({ entity }) => {
  const { updateEntity, deleteEntity, addAttribute, setSelectedAttribute } = useErdStore();

  return (
    <div className="space-y-4 text-xs">
      {/* Entity Name */}
      <div>
        <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Table Name</label>
        <input
          type="text"
          value={entity.name}
          onChange={(e) => updateEntity(entity.id, { name: e.target.value.toUpperCase().replace(/\s+/g, '_') })}
          className="w-full px-2.5 py-1.5 rounded border border-zinc-300 bg-white text-zinc-900 font-mono text-xs focus:outline-none focus:border-zinc-900"
        />
        <p className="text-[10px] text-zinc-500 mt-1">Represents table `{entity.name}` in relational schema.</p>
      </div>

      {/* Entity Classification */}
      <div>
        <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Entity Classification</label>
        <select
          value={entity.type}
          onChange={(e) => updateEntity(entity.id, { type: e.target.value as EntityType })}
          className="w-full px-2.5 py-1.5 rounded border border-zinc-300 bg-white text-zinc-900 text-xs focus:outline-none focus:border-zinc-900"
        >
          <option value="strong">Strong Entity (Regular independent table)</option>
          <option value="weak">Weak Entity (Depends on owner table)</option>
          <option value="associative">Associative Entity (Junction / Bridge table)</option>
          <option value="supertype">Supertype (Generalization parent)</option>
          <option value="subtype">Subtype (Specialization child)</option>
        </select>

        {entity.type === 'weak' && (
          <div className="mt-2 p-2 rounded bg-yellow-50 border border-yellow-200 text-zinc-800 text-[11px] leading-relaxed">
            <span className="font-bold block mb-0.5">Weak Entity Rule:</span>
            Cannot be identified on its own. Requires an identifying relationship and borrows owner table's primary key.
          </div>
        )}

        {entity.type === 'associative' && (
          <div className="mt-2 p-2 rounded bg-yellow-50 border border-yellow-200 text-zinc-800 text-[11px] leading-relaxed">
            <span className="font-bold block mb-0.5">Associative Table:</span>
            Decomposes an M:N relationship with composite foreign keys from participating tables.
          </div>
        )}
      </div>

      {/* Attributes List */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-[11px] font-semibold text-zinc-700">
            Columns ({entity.attributes.length})
          </label>
          <button
            onClick={() => {
              const num = entity.attributes.length + 1;
              addAttribute(entity.id, { name: `column_${num}`, dataType: 'VARCHAR' });
            }}
            className="flex items-center gap-1 text-[11px] text-zinc-700 hover:text-zinc-950 font-semibold"
          >
            <Plus className="w-3 h-3" />
            <span>Add Column</span>
          </button>
        </div>

        <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
          {entity.attributes.map((attr) => (
            <div
              key={attr.id}
              onClick={() => setSelectedAttribute(attr.id)}
              className="px-2.5 py-1.5 rounded border border-zinc-200 bg-white hover:bg-zinc-50 flex items-center justify-between cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                {attr.isPrimaryKey ? (
                  <Key className="w-3 h-3 text-amber-500 shrink-0" />
                ) : attr.isForeignKey ? (
                  <span className="text-[10px] text-zinc-400 font-mono shrink-0">↳</span>
                ) : null}
                <span className="text-xs font-medium text-zinc-800 truncate">{attr.name}</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-500 shrink-0">{attr.dataType}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Delete Table Action */}
      <div className="pt-2 border-t border-zinc-200 flex justify-end">
        <button
          onClick={() => deleteEntity(entity.id)}
          className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 px-2 py-1 rounded hover:bg-red-50 transition-colors"
        >
          <Trash2 className="w-3 h-3" />
          <span>Delete Table</span>
        </button>
      </div>
    </div>
  );
};
