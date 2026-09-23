import React, { useMemo, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  type Connection,
  type Edge,
  type Node,
  type OnNodesChange,
} from '@xyflow/react';
import { EntityNode } from './nodes/EntityNode';
import { RelationshipEdge } from './edges/RelationshipEdge';
import { CanvasToolbar } from './toolbar/CanvasToolbar';
import { RelationalTablesView } from '../database/RelationalTablesView';
import { useErdStore } from '../../stores/erdStore';
import { useDatabaseStore } from '../../stores/databaseStore';

const nodeTypes = {
  entity: EntityNode,
};

const edgeTypes = {
  relationship: RelationshipEdge,
};

export const ErdCanvas: React.FC = () => {
  const {
    entities,
    relationships,
    updateEntity,
    addRelationship,
    setSelectedEntity,
    setSelectedRelationship,
    setSelectedAttribute,
    activeViewMode,
  } = useErdStore();

  const { syncFromErd } = useDatabaseStore();

  // Sync relational schema whenever entities or relationships change
  useEffect(() => {
    syncFromErd(entities, relationships);
  }, [entities, relationships, syncFromErd]);

  // Convert entities to React Flow nodes
  const nodes: Node[] = useMemo(() => {
    return entities.map((entity) => ({
      id: entity.id,
      type: 'entity',
      position: entity.position || { x: 100, y: 100 },
      data: entity as unknown as Record<string, unknown>,
    }));
  }, [entities]);

  // Convert relationships to React Flow edges with intelligent handle routing
  const edges: Edge[] = useMemo(() => {
    return relationships.map((rel) => {
      const sourceEntity = entities.find((e) => e.id === rel.sourceEntityId);
      const targetEntity = entities.find((e) => e.id === rel.targetEntityId);

      let sourceHandle = 'right-source';
      let targetHandle = 'left-target';

      if (sourceEntity?.position && targetEntity?.position) {
        const nodeWidth = 310;
        const sourceHeight = 50 + (sourceEntity.attributes?.length || 4) * 42 + 40;
        const targetHeight = 50 + (targetEntity.attributes?.length || 4) * 42 + 40;

        const sourceCenter = {
          x: sourceEntity.position.x + nodeWidth / 2,
          y: sourceEntity.position.y + sourceHeight / 2,
        };
        const targetCenter = {
          x: targetEntity.position.x + nodeWidth / 2,
          y: targetEntity.position.y + targetHeight / 2,
        };

        const dx = targetCenter.x - sourceCenter.x;
        const dy = targetCenter.y - sourceCenter.y;

        // Determine the best exit and entry faces based on relative position
        if (Math.abs(dx) > Math.abs(dy) * 0.8) {
          if (dx > 0) {
            sourceHandle = 'right-source';
            targetHandle = 'left-target';
          } else {
            sourceHandle = 'left-source';
            targetHandle = 'right-target';
          }
        } else {
          if (dy > 0) {
            sourceHandle = 'bottom-source';
            targetHandle = 'top-target';
          } else {
            sourceHandle = 'top-source';
            targetHandle = 'bottom-target';
          }
        }
      }

      return {
        id: rel.id,
        source: rel.sourceEntityId,
        target: rel.targetEntityId,
        sourceHandle,
        targetHandle,
        type: 'relationship',
        data: rel as unknown as Record<string, unknown>,
      };
    });
  }, [relationships, entities]);

  // Handle Node Drag & Position updates
  const onNodesChange: OnNodesChange = useCallback(
    (changes) => {
      changes.forEach((change) => {
        if (change.type === 'position' && change.position) {
          updateEntity(change.id, { position: change.position });
        }
      });
    },
    [updateEntity]
  );

  // Handle drag-and-drop connections between entity handles
  const onConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target || connection.source === connection.target) return;

      addRelationship({
        name: 'connects to',
        sourceEntityId: connection.source,
        targetEntityId: connection.target,
        cardinality: '1:N',
        sourceOptionality: '1',
        targetOptionality: '0',
        sourceMax: '1',
        targetMax: 'N',
        attributes: [],
      });
    },
    [addRelationship]
  );

  // Auto layout entities with comfortable spacing for 310px tables
  const handleAutoLayout = useCallback(() => {
    const spacingX = 480;
    const spacingY = 420;
    const cols = Math.max(2, Math.ceil(Math.sqrt(entities.length)));

    entities.forEach((entity, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      updateEntity(entity.id, {
        position: {
          x: 60 + col * spacingX,
          y: 80 + row * spacingY,
        },
      });
    });
  }, [entities, updateEntity]);

  const onPaneClick = useCallback(() => {
    setSelectedEntity(null);
    setSelectedAttribute(null);
    setSelectedRelationship(null);
  }, [setSelectedEntity, setSelectedAttribute, setSelectedRelationship]);

  return (
    <div className="relative w-full h-full bg-[#FCFBF7] overflow-hidden">
      {/* Minimalist Top Canvas Toolbar */}
      <CanvasToolbar onAutoLayout={handleAutoLayout} />

      {activeViewMode === 'relational' ? (
        /* Real-Time Conversion: Relational Tables Mode (Point 26 & 27) */
        <div className="w-full h-full p-8 pt-16 overflow-y-auto bg-[#FCFBF7] animate-in fade-in duration-150">
          <div className="max-w-6xl mx-auto space-y-4">
            <div className="p-4 bg-white border-2 border-zinc-900 rounded-xl shadow-[3px_3px_0px_#18181B] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold font-mono uppercase bg-[#F6E77A] text-zinc-950 px-2 py-0.5 rounded border border-zinc-900 shadow-[1px_1px_0px_#18181B]">
                  Real-Time Database Conversion
                </span>
                <h2 className="text-base font-bold text-zinc-950 font-mono mt-1">
                  Relational Table Representation
                </h2>
                <p className="text-xs text-zinc-600 font-handwriting text-sm">
                  "Notice how each conceptual entity transforms into a structured database table with Primary and Foreign Keys."
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-600 font-mono">
                  {entities.length} Entities → {entities.length} Tables
                </span>
              </div>
            </div>

            <div className="p-6 bg-white border-2 border-zinc-900 rounded-xl shadow-[4px_4px_0px_#18181B]">
              <RelationalTablesView />
            </div>
          </div>
        </div>
      ) : (
        /* Primary Interactive ERD Canvas */
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onPaneClick={onPaneClick}
          fitView
          fitViewOptions={{ padding: 0.22, maxZoom: 1.15, minZoom: 0.7 }}
          minZoom={0.5}
          maxZoom={1.6}
          defaultViewport={{ x: 0, y: 0, zoom: 1.0 }}
          snapToGrid
          snapGrid={[20, 20]}
          proOptions={{ hideAttribution: true }}
        >
          {/* Subtle Paper Lines Background (No Dots/Space) */}
          <Background variant={BackgroundVariant.Lines} gap={36} color="#EFECE6" />

          <Controls
            className="!bg-white !border-2 !border-zinc-900 !text-zinc-900 !shadow-[2px_2px_0px_#18181B] !rounded-md overflow-hidden"
          />

          <MiniMap
            nodeColor="#F6E77A"
            maskColor="rgba(252, 251, 247, 0.85)"
            className="!bg-white !border-2 !border-zinc-900 !rounded-md !shadow-[2px_2px_0px_#18181B] overflow-hidden"
          />
        </ReactFlow>
      )}
    </div>
  );
};
