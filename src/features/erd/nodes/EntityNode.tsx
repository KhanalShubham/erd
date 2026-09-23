import React, { useState } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Trash2 } from 'lucide-react';
import type { Entity } from '../../../types/erd';
import { useErdStore } from '../../../stores/erdStore';

export const EntityNode: React.FC<NodeProps> = ({ data, selected }) => {
  const entity = data as unknown as Entity;
  const {
    selectedEntityId,
    selectedAttributeId,
    setSelectedEntity,
    setSelectedAttribute,
    addAttribute,
    deleteEntity,
    highlightedFk,
    recentlyAddedAttrId,
    recentlyToggledPkId,
    recentlyCreatedEntityId,
  } = useErdStore();

  const [isAddingAttr, setIsAddingAttr] = useState(false);
  const [newAttrName, setNewAttrName] = useState('');

  const isSelected = selected || selectedEntityId === entity.id;
  const isRecentlyCreated = recentlyCreatedEntityId === entity.id;

  // Check if this entity is involved in highlighted FK
  const isFkHighlighted =
    highlightedFk &&
    (highlightedFk.targetTable.toLowerCase() === entity.name.toLowerCase() ||
      highlightedFk.sourceTable.toLowerCase() === entity.name.toLowerCase());

  const handleInlineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAttrName.trim()) return;
    addAttribute(entity.id, { name: newAttrName.trim(), dataType: 'VARCHAR' });
    setNewAttrName('');
    setIsAddingAttr(false);
  };

  const isWeak = entity.type === 'weak';
  const isAssociative = entity.type === 'associative';

  return (
    <div
      onClick={() => setSelectedEntity(entity.id)}
      className={`w-[310px] min-w-[280px] max-w-[340px] bg-white text-zinc-900 transition-all duration-200 cursor-pointer select-none rounded-[2px] ${
        isWeak
          ? 'border-4 border-double border-zinc-900'
          : 'border-[1.5px] border-zinc-900'
      } ${
        isSelected
          ? 'ring-2 ring-zinc-950 shadow-[4px_4px_0px_#18181B] opacity-100 scale-[1.01]'
          : isRecentlyCreated || isFkHighlighted
          ? 'ring-2 ring-amber-400 fk-highlight-pulse opacity-100 shadow-[3px_3px_0px_#18181B]'
          : selectedEntityId
          ? 'opacity-90 hover:opacity-100 shadow-[2px_2px_0px_#18181B] hover:shadow-[3px_3px_0px_#18181B]'
          : 'opacity-100 shadow-[2px_2px_0px_#18181B] hover:shadow-[3px_3px_0px_#18181B]'
      }`}
    >
      {/* Multi-directional connection handles on all 4 faces */}
      <Handle id="top-target" type="target" position={Position.Top} className="!w-2 !h-2 !bg-zinc-800 !border-none !opacity-40 hover:!opacity-100 transition-opacity" />
      <Handle id="top-source" type="source" position={Position.Top} className="!w-2 !h-2 !bg-zinc-800 !border-none !opacity-40 hover:!opacity-100 transition-opacity" />
      <Handle id="bottom-target" type="target" position={Position.Bottom} className="!w-2 !h-2 !bg-zinc-800 !border-none !opacity-40 hover:!opacity-100 transition-opacity" />
      <Handle id="bottom-source" type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-zinc-800 !border-none !opacity-40 hover:!opacity-100 transition-opacity" />
      <Handle id="left-target" type="target" position={Position.Left} className="!w-2 !h-2 !bg-zinc-800 !border-none !opacity-40 hover:!opacity-100 transition-opacity" />
      <Handle id="left-source" type="source" position={Position.Left} className="!w-2 !h-2 !bg-zinc-800 !border-none !opacity-40 hover:!opacity-100 transition-opacity" />
      <Handle id="right-target" type="target" position={Position.Right} className="!w-2 !h-2 !bg-zinc-800 !border-none !opacity-40 hover:!opacity-100 transition-opacity" />
      <Handle id="right-source" type="source" position={Position.Right} className="!w-2 !h-2 !bg-zinc-800 !border-none !opacity-40 hover:!opacity-100 transition-opacity" />

      {/* Table Header: #F6E77A Highlighter Yellow Ruler Strip */}
      <div className="bg-[#F6E77A] px-4 py-3 min-h-[50px] border-b-2 border-zinc-900 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-extrabold text-[17px] tracking-wide text-zinc-950 uppercase truncate font-mono">
            {entity.name}
          </span>
          {isAssociative && (
            <span className="text-[11px] font-bold text-zinc-800 bg-white/80 px-1.5 py-0.2 rounded border border-zinc-800 font-mono shrink-0">
              junction
            </span>
          )}
          {isWeak && (
            <span className="text-[11px] font-bold text-zinc-800 bg-white/80 px-1.5 py-0.2 rounded border border-zinc-800 font-mono shrink-0">
              weak
            </span>
          )}
        </div>

        {/* Delete action */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            deleteEntity(entity.id);
          }}
          className={`p-1 text-zinc-500 hover:text-red-700 hover:bg-black/10 rounded transition-colors ${
            isSelected ? 'opacity-100' : 'opacity-0 hover:opacity-100'
          }`}
          title="Delete table"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Attribute Rows: Ruler separated database rows */}
      <div className="bg-white">
        {entity.attributes.length === 0 ? (
          <div className="py-4 px-4 text-center text-zinc-400 italic text-[13px] font-sans border-b border-zinc-200">
            No columns yet
          </div>
        ) : (
          entity.attributes.map((attr) => {
            const isAttrSelected = selectedAttributeId === attr.id;
            const isRecentlyAdded = recentlyAddedAttrId === attr.id;
            const isRecentlyPkToggled = recentlyToggledPkId === attr.id;

            return (
              <div
                key={attr.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedEntity(entity.id);
                  setSelectedAttribute(attr.id);
                }}
                className={`min-h-[42px] px-4 py-2.5 flex items-center justify-between border-b border-zinc-200 transition-colors ${
                  isRecentlyAdded
                    ? 'animate-row-in'
                    : isRecentlyPkToggled
                    ? 'animate-yellow-pulse'
                    : isAttrSelected
                    ? 'bg-yellow-100 text-zinc-950 font-semibold'
                    : 'hover:bg-yellow-50/70 text-zinc-900'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {attr.isPrimaryKey ? (
                    <span className="text-zinc-950 font-bold flex items-center gap-1.5">
                      <span className="text-[15px] select-none" title="Primary Key (Unique Record Identifier)">🔑</span>
                      <span className="text-[14.5px] font-mono tracking-tight truncate">{attr.name}</span>
                    </span>
                  ) : attr.isForeignKey ? (
                    <span className="text-zinc-800 flex items-center gap-1.5">
                      <span className="text-zinc-500 text-[12px] font-mono font-bold select-none px-1 rounded bg-zinc-100 border border-zinc-300" title="Foreign Key (References Parent Table)">↳ FK</span>
                      <span className="text-[14.5px] font-mono tracking-tight truncate">{attr.name}</span>
                    </span>
                  ) : (
                    <span className="text-[14.5px] font-mono text-zinc-800 tracking-tight truncate">{attr.name}</span>
                  )}
                </div>

                {/* Subtle visual indicator on hover/select */}
                {isAttrSelected && (
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider bg-white px-1.5 py-0.5 rounded border border-zinc-300">
                    {attr.dataType}
                  </span>
                )}
              </div>
            );
          })
        )}

        {/* Bottom "+ attribute" row */}
        {isAddingAttr ? (
          <form
            onSubmit={handleInlineSubmit}
            onClick={(e) => e.stopPropagation()}
            className="px-3 py-2 flex items-center gap-2 bg-yellow-50/80 border-t border-zinc-300"
          >
            <input
              type="text"
              autoFocus
              value={newAttrName}
              onChange={(e) => setNewAttrName(e.target.value)}
              placeholder="Column name..."
              className="flex-1 px-2.5 py-1 text-[13.5px] font-mono border border-zinc-900 rounded bg-white text-zinc-950 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            />
            <button
              type="submit"
              disabled={!newAttrName.trim()}
              className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-white text-[12px] font-mono font-bold rounded shadow-[1px_1px_0px_#18181B]"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAddingAttr(false);
                setNewAttrName('');
              }}
              className="p-1 text-zinc-500 hover:text-zinc-900 text-xs font-bold"
            >
              ✕
            </button>
          </form>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedEntity(entity.id);
              setIsAddingAttr(true);
            }}
            className="w-full text-left px-4 py-2.5 text-[13px] text-zinc-500 hover:text-zinc-950 hover:bg-yellow-50/60 transition-colors flex items-center gap-1.5 font-mono"
            title="Add column to table"
          >
            <span className="text-zinc-400 font-bold">+</span>
            <span>attribute</span>
          </button>
        )}
      </div>
    </div>
  );
};
