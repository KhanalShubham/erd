import React from 'react';
import { BaseEdge, EdgeLabelRenderer, type EdgeProps, getSmoothStepPath } from '@xyflow/react';
import { Split, Trash2 } from 'lucide-react';
import { useErdStore } from '../../../stores/erdStore';
import type { Relationship } from '../../../types/erd';

export const RelationshipEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
  selected,
}) => {
  // Use smooth step routing for clean, crisp orthogonal database schema lines
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 14,
  });

  const rel = data as unknown as Relationship;
  const { setSelectedRelationship, resolveManyToMany, deleteRelationship, selectedRelationshipId } = useErdStore();

  const isSelected = selected || selectedRelationshipId === id;
  const isManyToMany = rel && rel.cardinality === 'M:N';

  // Place cardinality chips cleanly along the line OUTSIDE the node perimeter
  // so they never overlap table headers, rows, or borders
  const getCardPosition = (x: number, y: number, pos: string) => {
    switch (pos) {
      case 'left':
        return { x: x - 26, y: y - 14 };
      case 'right':
        return { x: x + 26, y: y - 14 };
      case 'top':
        return { x: x + 16, y: y - 22 };
      case 'bottom':
        return { x: x + 16, y: y + 22 };
      default:
        return { x, y };
    }
  };

  const sourceCardPos = getCardPosition(sourceX, sourceY, sourcePosition);
  const targetCardPos = getCardPosition(targetX, targetY, targetPosition);

  const sourceCard = rel?.sourceMax || (rel?.cardinality === 'N:1' || rel?.cardinality === 'M:N' ? 'N' : '1');
  const targetCard = rel?.targetMax || (rel?.cardinality === '1:N' || rel?.cardinality === 'M:N' ? 'N' : '1');

  const getCardinalityDescription = () => {
    if (rel?.cardinality === '1:1') return 'one ─── one';
    if (rel?.cardinality === '1:N') return 'one ─── many';
    if (rel?.cardinality === 'N:1') return 'many ─── one';
    if (rel?.cardinality === 'M:N') return 'many ──── many (M:N)';
    return 'relates to';
  };

  return (
    <>
      {/* Clean 2px Solid Dark Charcoal/Black Ink Line */}
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: isSelected ? '#18181B' : '#27272A',
          strokeWidth: isSelected ? 2.5 : 2,
          strokeDasharray: rel?.isIdentifying ? '5 4' : undefined,
          transition: 'stroke 0.15s, stroke-width 0.15s',
        }}
      />

      <EdgeLabelRenderer>
        {/* Source Cardinality safely outside the source node perimeter */}
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${sourceCardPos.x}px,${sourceCardPos.y}px)`,
            pointerEvents: 'none',
          }}
          className="min-w-[22px] h-[22px] px-1 rounded border border-zinc-900 bg-white font-mono font-bold text-[11px] flex items-center justify-center shadow-[1px_1px_0px_#18181B] text-zinc-950 select-none z-10"
        >
          {sourceCard}
        </div>

        {/* Target Cardinality safely outside the target node perimeter */}
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${targetCardPos.x}px,${targetCardPos.y}px)`,
            pointerEvents: 'none',
          }}
          className="min-w-[22px] h-[22px] px-1 rounded border border-zinc-900 bg-white font-mono font-bold text-[11px] flex items-center justify-center shadow-[1px_1px_0px_#18181B] text-zinc-950 select-none z-10"
        >
          {targetCard}
        </div>

        {/* Center Relationship Chip & Handwritten Annotation */}
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="flex flex-col items-center gap-0.5 select-none z-20 group"
        >
          <div className="flex items-center gap-1.5">
            <div
              onClick={(e) => {
                e.stopPropagation();
                setSelectedRelationship(id);
              }}
              className={`px-3 py-0.5 rounded border-2 transition-all cursor-pointer shadow-[2px_2px_0px_#18181B] flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-[#F6E77A] border-zinc-900 text-zinc-950 font-bold scale-105 ring-1 ring-zinc-900'
                  : 'bg-white border-zinc-900 text-zinc-900 hover:bg-[#F6E77A]'
              }`}
            >
              <span className="font-handwriting text-[15px] font-bold tracking-wide">
                {rel?.name || 'connects'}
              </span>
            </div>

            {/* Quick delete button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteRelationship(id);
              }}
              className={`p-1 rounded bg-white hover:bg-rose-50 text-zinc-400 hover:text-rose-600 border border-zinc-400 shadow-[1px_1px_0px_#18181B] transition-opacity ${
                isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`}
              title="Delete relationship"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>

          {/* Handwritten Annotation underneath */}
          <div className="font-handwriting text-[12px] text-zinc-600 bg-white/95 px-1.5 py-0.2 rounded border border-zinc-300 shadow-2xs pointer-events-none">
            {getCardinalityDescription()}
          </div>

          {/* Prominent M:N Resolution Button */}
          {isManyToMany && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                resolveManyToMany(id);
              }}
              className="mt-1 px-3 py-1 rounded bg-[#F6E77A] hover:bg-yellow-300 border-2 border-zinc-900 text-zinc-950 font-bold font-mono text-[11px] flex items-center gap-1.5 shadow-[2px_2px_0px_#18181B] transition-transform hover:scale-105 active:scale-95"
              title="Resolve Many-to-Many by creating an Associative Table between them"
            >
              <Split className="w-3 h-3" />
              <span>Resolve M:N → Junction Table</span>
            </button>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};
