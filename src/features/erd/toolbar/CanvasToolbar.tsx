import React, { useState } from 'react';
import {
  Plus,
  ArrowRightLeft,
  Undo2,
  Redo2,
  Sparkles,
  RotateCcw,
  X,
} from 'lucide-react';
import { useErdStore } from '../../../stores/erdStore';
import { lmsSystem } from '../../../data/systems/lms';

interface CanvasToolbarProps {
  onAutoLayout: () => void;
}

export const CanvasToolbar: React.FC<CanvasToolbarProps> = ({ onAutoLayout }) => {
  const {
    addEntity,
    undo,
    redo,
    past,
    future,
    entities,
    addRelationship,
    loadScenario,
    activeViewMode,
    setActiveViewMode,
  } = useErdStore();

  const [isAddEntityOpen, setIsAddEntityOpen] = useState(false);
  const [newEntityName, setNewEntityName] = useState('');

  const [isConnectOpen, setIsConnectOpen] = useState(false);
  const [sourceEntityId, setSourceEntityId] = useState('');
  const [targetEntityId, setTargetEntityId] = useState('');
  const [relCardinality, setRelCardinality] = useState<'1:1' | '1:N' | 'M:N'>('1:N');

  const [isDemonstrating, setIsDemonstrating] = useState(false);
  const [demoStepMessage, setDemoStepMessage] = useState<string | null>(null);

  const handleCreateEntity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntityName.trim()) return;
    addEntity(newEntityName.trim().toUpperCase(), 'strong', { x: 120 + Math.random() * 80, y: 120 + Math.random() * 60 });
    setNewEntityName('');
    setIsAddEntityOpen(false);
  };

  const handleCreateRelationship = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceEntityId || !targetEntityId || sourceEntityId === targetEntityId) return;

    addRelationship({
      name: 'connects to',
      sourceEntityId,
      targetEntityId,
      cardinality: relCardinality,
      sourceOptionality: '1',
      targetOptionality: '0',
      sourceMax: relCardinality === 'M:N' ? 'N' : '1',
      targetMax: 'N',
      attributes: [],
    });

    setIsConnectOpen(false);
  };

  // Optional "Watch It Happen" Mode (Point 28)
  const handleWatchItHappen = async () => {
    if (isDemonstrating) return;
    setIsDemonstrating(true);
    setActiveViewMode('erd');

    // 1. Entity identified
    setDemoStepMessage('1. Identify Entity: Drawing STUDENT table on paper...');
    useErdStore.setState({
      entities: [
        {
          id: 'demo_stu',
          name: 'STUDENT',
          type: 'strong',
          description: 'Student',
          position: { x: 80, y: 100 },
          attributes: [],
        },
      ],
      relationships: [],
    });

    await new Promise((r) => setTimeout(r, 1200));

    // 2. Attributes added
    setDemoStepMessage('2. Add Attributes: Adding StudentID, Name, Email rows...');
    useErdStore.setState({
      entities: [
        {
          id: 'demo_stu',
          name: 'STUDENT',
          type: 'strong',
          description: 'Student',
          position: { x: 80, y: 100 },
          attributes: [
            { id: 'da_1', entityId: 'demo_stu', name: 'StudentID', type: 'simple', dataType: 'INTEGER', isPrimaryKey: false, isForeignKey: false, isNullable: false, isUnique: true },
            { id: 'da_2', entityId: 'demo_stu', name: 'Name', type: 'simple', dataType: 'VARCHAR', isPrimaryKey: false, isForeignKey: false, isNullable: false, isUnique: false },
            { id: 'da_3', entityId: 'demo_stu', name: 'Email', type: 'simple', dataType: 'VARCHAR', isPrimaryKey: false, isForeignKey: false, isNullable: false, isUnique: true },
          ],
        },
      ],
      relationships: [],
    });

    await new Promise((r) => setTimeout(r, 1200));

    // 3. Primary Key designated
    setDemoStepMessage('3. Primary Key: StudentID designated as Primary Key (🔑)...');
    useErdStore.setState((state) => ({
      entities: state.entities.map((e) => ({
        ...e,
        attributes: e.attributes.map((a) => (a.name === 'StudentID' ? { ...a, isPrimaryKey: true } : a)),
      })),
      recentlyToggledPkId: 'da_1',
    }));

    await new Promise((r) => setTimeout(r, 1200));

    // 4. Second entity added & Relationship drawn
    setDemoStepMessage('4. Relationship: Connecting STUDENT M:N COURSE...');
    useErdStore.setState((state) => ({
      entities: [
        ...state.entities,
        {
          id: 'demo_crs',
          name: 'COURSE',
          type: 'strong',
          description: 'Course',
          position: { x: 840, y: 100 },
          attributes: [
            { id: 'da_c1', entityId: 'demo_crs', name: 'CourseID', type: 'simple', dataType: 'INTEGER', isPrimaryKey: true, isForeignKey: false, isNullable: false, isUnique: true },
            { id: 'da_c2', entityId: 'demo_crs', name: 'CourseName', type: 'simple', dataType: 'VARCHAR', isPrimaryKey: false, isForeignKey: false, isNullable: false, isUnique: false },
          ],
        },
      ],
      relationships: [
        {
          id: 'demo_rel',
          name: 'enrolls in',
          sourceEntityId: 'demo_stu',
          targetEntityId: 'demo_crs',
          cardinality: 'M:N',
          sourceOptionality: '1',
          targetOptionality: '0',
          sourceMax: 'N',
          targetMax: 'N',
          attributes: [],
        },
      ],
    }));

    await new Promise((r) => setTimeout(r, 1400));

    // 5. M:N resolution: associative table appears at midpoint with FKs
    setDemoStepMessage('5. M:N Resolved: ENROLLMENT junction table appears with StudentID (FK) and CourseID (FK)!');
    useErdStore.getState().resolveManyToMany('demo_rel', 'ENROLLMENT');

    await new Promise((r) => setTimeout(r, 1800));

    setDemoStepMessage('6. Complete: Conceptual ERD transformed into full relational schema!');
    await new Promise((r) => setTimeout(r, 2000));

    setDemoStepMessage(null);
    setIsDemonstrating(false);
  };

  return (
    <>
      {/* Educational Transformation Banner during "Show Me" mode */}
      {demoStepMessage && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-30 bg-[#F6E77A] border-2 border-zinc-900 px-4 py-2 rounded-lg shadow-[3px_3px_0px_#18181B] flex items-center gap-2 font-mono text-xs font-bold text-zinc-950 animate-in fade-in slide-in-from-top-2 duration-150">
          <Sparkles className="w-4 h-4 text-zinc-900" />
          <span>{demoStepMessage}</span>
          <button
            onClick={() => {
              setDemoStepMessage(null);
              setIsDemonstrating(false);
            }}
            className="ml-2 text-zinc-600 hover:text-zinc-950 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      <div className="absolute top-3 left-4 z-20 flex items-center gap-1.5 bg-white/95 border-2 border-zinc-900 px-2.5 py-1.5 rounded-lg shadow-[2px_2px_0px_#18181B] backdrop-blur-xs text-xs">
        {/* Toggle: [ ERD ] [ TABLES ] (Points 26, 27) */}
        <div className="flex items-center p-0.5 bg-zinc-100 border border-zinc-400 rounded font-mono text-[11px] font-bold">
          <button
            onClick={() => setActiveViewMode('erd')}
            className={`px-2.5 py-1 rounded transition-colors ${
              activeViewMode === 'erd'
                ? 'bg-[#F6E77A] text-zinc-950 border border-zinc-900 shadow-[1px_1px_0px_#18181B]'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            ERD
          </button>
          <button
            onClick={() => setActiveViewMode('relational')}
            className={`px-2.5 py-1 rounded transition-colors ${
              activeViewMode === 'relational'
                ? 'bg-[#F6E77A] text-zinc-950 border border-zinc-900 shadow-[1px_1px_0px_#18181B]'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            TABLES
          </button>
        </div>

        <div className="w-[1px] h-4 bg-zinc-300 mx-0.5" />

        {/* + Entity: Fast Inline Drawer (Point 16) */}
        {isAddEntityOpen ? (
          <form
            onSubmit={handleCreateEntity}
            className="flex items-center gap-1.5 bg-yellow-50/90 border border-zinc-900 rounded p-0.5 animate-in fade-in duration-100"
          >
            <input
              type="text"
              placeholder="Table Name (e.g. STUDENT)..."
              value={newEntityName}
              onChange={(e) => setNewEntityName(e.target.value)}
              className="px-2 py-0.5 text-xs font-mono font-bold uppercase border border-zinc-400 rounded bg-white text-zinc-900 focus:outline-none focus:border-zinc-900 w-36"
              autoFocus
            />
            <button
              type="submit"
              disabled={!newEntityName.trim()}
              className="px-2 py-0.5 bg-zinc-900 text-white border border-zinc-900 rounded font-bold font-mono text-[11px] shadow-[1px_1px_0px_#18181B] disabled:opacity-40"
            >
              Draw
            </button>
            <button
              type="button"
              onClick={() => setIsAddEntityOpen(false)}
              className="px-1 text-zinc-500 hover:text-zinc-900 text-xs font-bold"
            >
              ✕
            </button>
          </form>
        ) : (
          <button
            onClick={() => setIsAddEntityOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-white font-semibold transition-colors shadow-[1px_1px_0px_#18181B]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Table</span>
          </button>
        )}

        {/* Connect Relationship */}
        <button
          onClick={() => {
            if (entities.length >= 2) {
              setSourceEntityId(entities[0].id);
              setTargetEntityId(entities[1].id);
              setIsConnectOpen(true);
            }
          }}
          disabled={entities.length < 2}
          className="flex items-center gap-1 px-2 py-1 rounded text-zinc-800 hover:bg-zinc-100 disabled:opacity-30 transition-colors font-medium"
          title="Connect two tables"
        >
          <ArrowRightLeft className="w-3.5 h-3.5 text-zinc-600" />
          <span>Connect</span>
        </button>

        <div className="w-[1px] h-4 bg-zinc-300 mx-0.5" />

        {/* Optional "Watch It Happen" Mode (Point 28) */}
        <button
          onClick={handleWatchItHappen}
          disabled={isDemonstrating}
          className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#F6E77A] hover:bg-yellow-300 text-zinc-950 border border-zinc-900 font-bold font-mono text-[11px] shadow-[1px_1px_0px_#18181B] transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
          title="Watch step-by-step database transformation"
        >
          <Sparkles className="w-3 h-3 text-zinc-900" />
          <span>Show Me</span>
        </button>

        <div className="w-[1px] h-4 bg-zinc-300 mx-0.5" />

        {/* Undo / Redo */}
        <button
          onClick={undo}
          disabled={past.length === 0}
          className="p-1 rounded text-zinc-700 hover:bg-zinc-100 disabled:opacity-25 transition-colors"
          title="Undo"
        >
          <Undo2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={redo}
          disabled={future.length === 0}
          className="p-1 rounded text-zinc-700 hover:bg-zinc-100 disabled:opacity-25 transition-colors"
          title="Redo"
        >
          <Redo2 className="w-3.5 h-3.5" />
        </button>

        {/* Auto Layout */}
        <button
          onClick={onAutoLayout}
          className="p-1 rounded text-zinc-700 hover:bg-zinc-100 transition-colors"
          title="Frame & Align Tables"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
        </button>

        {/* Reset to Canonical LMS */}
        <button
          onClick={() => loadScenario(lmsSystem)}
          className="flex items-center gap-1 px-2 py-1 rounded text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 transition-colors text-[11px] font-mono"
          title="Reset to default LMS scenario"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Simple Minimal Modal: Connect Relationship */}
      {isConnectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-zinc-900 rounded-md p-5 w-full max-w-xs shadow-lg animate-in fade-in duration-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                Connect Relationship
              </h3>
              <button
                onClick={() => setIsConnectOpen(false)}
                className="text-zinc-400 hover:text-zinc-700 p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRelationship} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] text-zinc-600 mb-1">From Entity</label>
                <select
                  value={sourceEntityId}
                  onChange={(e) => setSourceEntityId(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-zinc-300 text-zinc-900 focus:outline-none focus:border-zinc-900 font-mono"
                >
                  {entities.map((e) => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-zinc-600 mb-1">To Entity</label>
                <select
                  value={targetEntityId}
                  onChange={(e) => setTargetEntityId(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-zinc-300 text-zinc-900 focus:outline-none focus:border-zinc-900 font-mono"
                >
                  {entities.map((e) => (
                    <option key={e.id} value={e.id} disabled={e.id === sourceEntityId}>{e.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-zinc-600 mb-1">Cardinality Ratio</label>
                <select
                  value={relCardinality}
                  onChange={(e) => setRelCardinality(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 rounded border border-zinc-300 text-zinc-900 focus:outline-none focus:border-zinc-900 font-mono"
                >
                  <option value="1:N">1:N (One-to-Many)</option>
                  <option value="1:1">1:1 (One-to-One)</option>
                  <option value="M:N">M:N (Many-to-Many)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsConnectOpen(false)}
                  className="px-3 py-1 text-xs text-zinc-500 hover:text-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1 text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-white rounded"
                >
                  Connect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
