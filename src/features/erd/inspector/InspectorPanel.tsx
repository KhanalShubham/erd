import React, { useState } from 'react';
import { useErdStore } from '../../../stores/erdStore';
import { EntityInspector } from './EntityInspector';
import { AttributeInspector } from './AttributeInspector';
import { RelationshipInspector } from './RelationshipInspector';
import { AiExplanationPanel } from './AiExplanationPanel';
import { X, Sparkles, Sliders } from 'lucide-react';

export const InspectorPanel: React.FC = () => {
  const {
    entities,
    relationships,
    selectedEntityId,
    selectedAttributeId,
    selectedRelationshipId,
    setSelectedEntity,
    setSelectedAttribute,
    setSelectedRelationship,
  } = useErdStore();

  // Tab: AI Explanation (default) vs Edit Properties
  const [activeTab, setActiveTab] = useState<'explanation' | 'properties'>('explanation');

  const selectedEntity = entities.find((e) => e.id === selectedEntityId);
  const selectedAttribute = selectedEntity?.attributes.find((a) => a.id === selectedAttributeId);
  const selectedRelationship = relationships.find((r) => r.id === selectedRelationshipId);

  // If nothing is selected, do not take up canvas space!
  if (!selectedEntity && !selectedRelationship) {
    return null;
  }

  const handleClose = () => {
    setSelectedEntity(null);
    setSelectedAttribute(null);
    setSelectedRelationship(null);
  };

  const getTitle = () => {
    if (selectedAttribute && selectedEntity) {
      return `${selectedEntity.name}.${selectedAttribute.name}`;
    }
    if (selectedEntity) {
      return selectedEntity.name;
    }
    if (selectedRelationship) {
      return selectedRelationship.name || 'Relationship';
    }
    return 'Details';
  };

  const getSubtitle = () => {
    if (selectedAttribute) {
      if (selectedAttribute.isPrimaryKey) return 'Primary Key Column';
      if (selectedAttribute.isForeignKey) return 'Foreign Key Reference';
      return 'Column Details';
    }
    if (selectedEntity) {
      if (selectedEntity.type === 'associative' || selectedEntity.name.toUpperCase().includes('ENROLL'))
        return 'Associative Junction Table';
      return 'Database Entity Table';
    }
    if (selectedRelationship) return `${selectedRelationship.cardinality} Relational Link`;
    return '';
  };

  return (
    <aside className="absolute top-4 right-4 z-30 w-88 sm:w-96 max-h-[85vh] bg-white border-2 border-zinc-900 rounded-lg shadow-[4px_4px_0px_#18181B] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-100 text-zinc-900">
      {/* Yellow Highlighter Header Strip */}
      <div className="bg-[#F6E77A] px-3.5 py-2.5 border-b-2 border-zinc-900 flex items-center justify-between gap-2 shrink-0">
        <div className="min-w-0">
          <div className="font-extrabold text-xs tracking-wider uppercase font-mono truncate text-zinc-950">
            {getTitle()}
          </div>
          <div className="text-[11px] text-zinc-800 font-medium truncate">{getSubtitle()}</div>
        </div>
        <button
          onClick={handleClose}
          className="p-1 rounded text-zinc-700 hover:text-zinc-950 hover:bg-yellow-300 transition-colors"
          title="Close inspector"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Segmented Control: [ 💡 AI Explanation ] [ ⚙️ Properties ] */}
      <div className="flex items-center bg-zinc-100 border-b border-zinc-300 p-1 gap-1 shrink-0 font-mono text-[11px] font-bold">
        <button
          onClick={() => setActiveTab('explanation')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1 rounded transition-colors ${
            activeTab === 'explanation'
              ? 'bg-[#F6E77A] text-zinc-950 border border-zinc-900 shadow-[1px_1px_0px_#18181B]'
              : 'text-zinc-600 hover:text-zinc-950'
          }`}
        >
          <Sparkles className="w-3 h-3 text-zinc-950" />
          <span>AI Explanation</span>
        </button>
        <button
          onClick={() => setActiveTab('properties')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1 rounded transition-colors ${
            activeTab === 'properties'
              ? 'bg-white text-zinc-950 border border-zinc-900 shadow-[1px_1px_0px_#18181B]'
              : 'text-zinc-600 hover:text-zinc-950'
          }`}
        >
          <Sliders className="w-3 h-3 text-zinc-700" />
          <span>Edit Properties</span>
        </button>
      </div>

      {/* Content Body */}
      <div className="flex-1 overflow-y-auto p-4 text-xs bg-[#FCFBF7]">
        {activeTab === 'explanation' ? (
          <AiExplanationPanel
            entity={selectedEntity}
            attribute={selectedAttribute}
            relationship={selectedRelationship}
          />
        ) : (
          <div>
            {selectedAttribute && selectedEntity ? (
              <AttributeInspector entity={selectedEntity} attribute={selectedAttribute} />
            ) : selectedEntity ? (
              <EntityInspector entity={selectedEntity} />
            ) : selectedRelationship ? (
              <RelationshipInspector relationship={selectedRelationship} />
            ) : null}
          </div>
        )}
      </div>
    </aside>
  );
};
