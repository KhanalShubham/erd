import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Play,
  ArrowRight,
  HelpCircle,
  Link as LinkIcon,
  Key as KeyIcon,
  Layers,
  X,
} from 'lucide-react';
import type { Entity, Attribute, Relationship } from '../../../types/erd';
import { CONCEPT_CATALOG, type ConceptExplanation } from '../../../engine/ai/aiKnowledgeBase';
import { useDatabaseStore } from '../../../stores/databaseStore';
import { useErdStore } from '../../../stores/erdStore';
import { useLearningStore } from '../../../stores/learningStore';
import type { DatabaseRow, IntegrityViolation } from '../../../types/database';

interface AiExplanationPanelProps {
  entity?: Entity;
  attribute?: Attribute;
  relationship?: Relationship;
}

export const AiExplanationPanel: React.FC<AiExplanationPanelProps> = ({
  entity,
  attribute,
  relationship,
}) => {
  const { entities, relationships, resolveManyToMany, setHighlightedFk } = useErdStore();
  const { data, insertRow } = useDatabaseStore();
  const { toggleAiTutor } = useLearningStore();

  const [experimentResult, setExperimentResult] = useState<{
    status: 'error' | 'success';
    title: string;
    message: string;
    violation?: IntegrityViolation;
  } | null>(null);
  const [isRunningExperiment, setIsRunningExperiment] = useState(false);

  // 1. Determine which concept we are explaining
  let explanation: ConceptExplanation | null = null;

  if (attribute && entity) {
    if (attribute.isPrimaryKey) {
      explanation = CONCEPT_CATALOG.primaryKey(attribute.name, entity.name);
    } else if (attribute.isForeignKey) {
      // Find what table it references
      const rel = relationships.find(
        (r) =>
          (r.sourceEntityId === entity.id && r.targetEntityId !== entity.id) ||
          (r.targetEntityId === entity.id && r.sourceEntityId !== entity.id)
      );
      const otherEntityId =
        rel?.sourceEntityId === entity.id ? rel?.targetEntityId : rel?.sourceEntityId;
      const targetEntity = entities.find((e) => e.id === otherEntityId);
      const targetPk = targetEntity?.attributes.find((a) => a.isPrimaryKey);

      explanation = CONCEPT_CATALOG.foreignKey(
        attribute.name,
        entity.name,
        targetEntity?.name || 'PARENT_TABLE',
        targetPk?.name || 'ID'
      );
    } else {
      explanation = CONCEPT_CATALOG.generalAttribute(attribute.name, entity.name);
    }
  } else if (entity) {
    if (entity.type === 'associative' || entity.name.toUpperCase().includes('ENROLL')) {
      explanation = CONCEPT_CATALOG.associativeEntity(entity.name);
    } else {
      explanation = {
        concept: `Entity: ${entity.name}`,
        badge: '📋 Database Entity',
        definition: `An Entity represents a real-world object, person, transaction, or concept about which the system stores persistent information. In relational databases, entities become tables.`,
        whyThisElement: [
          `Represents a distinct noun in system requirements.`,
          `Each row in this table represents one specific instance of a ${entity.name.toLowerCase()}.`,
          `Has attributes (columns) describing its characteristics and a Primary Key to identify records.`,
        ],
        visualDiagram: `
┌──────────────────────────────┐
│ ${entity.name.padEnd(28, ' ')}│ ← Table Name
├──────────────────────────────┤
│ 🔑 ${entity.attributes.find((a) => a.isPrimaryKey)?.name || 'ID'.padEnd(25, ' ')}│ ← Primary Key
├──────────────────────────────┤
│ Columns: ${entity.attributes.length} attributes            │
└──────────────────────────────┘
`,
        realWorldAnalogy: {
          title: 'A Dedicated Filing Cabinet Drawer',
          description: `Think of an Entity like a labeled drawer in an office filing cabinet. One drawer for "Students", one for "Courses", one for "Invoices". Each folder inside is one record.`,
        },
        rules: [
          'Must have a clear, singular or plural business name.',
          'Must have at least one Primary Key column.',
          'Should avoid storing data that belongs to other entities.',
        ],
      };
    }
  } else if (relationship) {
    const source = entities.find((e) => e.id === relationship.sourceEntityId)?.name || 'Source';
    const target = entities.find((e) => e.id === relationship.targetEntityId)?.name || 'Target';
    explanation = CONCEPT_CATALOG.relationship(
      relationship.name,
      source,
      target,
      relationship.cardinality
    );
  }

  if (!explanation) {
    return (
      <div className="p-4 text-center text-zinc-500 text-xs italic">
        Select any column, table, or relationship line to view contextual AI explanations.
      </div>
    );
  }

  // Handle Interactive Experiment execution
  const handleRunExperiment = () => {
    if (!explanation?.interactiveExperiment || isRunningExperiment) return;
    setIsRunningExperiment(true);

    const testType = explanation.interactiveExperiment.testType;

    if (testType === 'duplicate_pk' && entity && attribute) {
      // Find an existing row from sample data or create dummy
      const existingRows = data[entity.name] || [];
      const duplicatePkVal =
        existingRows.length > 0 && existingRows[0][attribute.name] !== undefined
          ? existingRows[0][attribute.name]
          : 101;

      const testRow: DatabaseRow = {
        [attribute.name]: duplicatePkVal,
        ...(existingRows[0] || {}),
        name: 'TEST_DUPLICATE_ROW',
      };

      const violation = insertRow(entity.name, testRow);

      if (violation) {
        setExperimentResult({
          status: 'error',
          title: '❌ Primary Key Uniqueness Rejected!',
          message: `The database blocked this insert: ${violation.message}. A Primary Key must strictly guarantee unique identification!`,
          violation,
        });
      } else {
        setExperimentResult({
          status: 'success',
          title: 'Row Inserted',
          message: 'Row was inserted into simulator.',
        });
      }
    } else if (testType === 'orphan_fk' && entity && attribute) {
      // Find target table
      const rel = relationships.find(
        (r) =>
          (r.sourceEntityId === entity.id && r.targetEntityId !== entity.id) ||
          (r.targetEntityId === entity.id && r.sourceEntityId !== entity.id)
      );
      const otherEntityId =
        rel?.sourceEntityId === entity.id ? rel?.targetEntityId : rel?.sourceEntityId;
      const targetEntity = entities.find((e) => e.id === otherEntityId);

      const orphanRow: DatabaseRow = {
        [attribute.name]: 9999, // Non-existent parent ID
        ...(data[entity.name]?.[0] || {}),
      };

      const violation = insertRow(entity.name, orphanRow);

      if (violation) {
        setExperimentResult({
          status: 'error',
          title: '❌ Foreign Key Referential Integrity Blocked!',
          message: `The database blocked this insert: ${violation.message}. You cannot link an enrollment to a ${targetEntity?.name || 'parent'} that does not exist in the database!`,
          violation,
        });
      } else {
        setExperimentResult({
          status: 'success',
          title: 'Row Inserted',
          message: 'Row was inserted.',
        });
      }
    } else if (testType === 'resolve_mn' && relationship) {
      const newEntityId = resolveManyToMany(relationship.id);
      if (newEntityId) {
        setExperimentResult({
          status: 'success',
          title: '🎉 Many-to-Many Resolved!',
          message:
            'Created the associative junction table between the entities with migrated foreign keys and clean 1:N connections!',
        });
      }
    }

    setIsRunningExperiment(false);
  };

  const handleHighlightFkReference = () => {
    if (attribute?.isForeignKey && entity) {
      const rel = relationships.find(
        (r) =>
          (r.sourceEntityId === entity.id && r.targetEntityId !== entity.id) ||
          (r.targetEntityId === entity.id && r.sourceEntityId !== entity.id)
      );
      const otherEntityId =
        rel?.sourceEntityId === entity.id ? rel?.targetEntityId : rel?.sourceEntityId;
      const targetEntity = entities.find((e) => e.id === otherEntityId);
      const targetPk = targetEntity?.attributes.find((a) => a.isPrimaryKey);

      if (targetEntity && targetPk) {
        setHighlightedFk({
          sourceTable: entity.name,
          sourceColumn: attribute.name,
          targetTable: targetEntity.name,
          targetColumn: targetPk.name,
        });

        // Clear after 3.5 seconds
        setTimeout(() => setHighlightedFk(null), 3500);
      }
    }
  };

  return (
    <div className="space-y-4 text-xs font-sans text-zinc-900 leading-relaxed">
      {/* Concept Badge & Header */}
      <div className="flex items-center justify-between gap-2 bg-yellow-50/90 border border-zinc-900 rounded p-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded bg-[#F6E77A] border border-zinc-900 flex items-center justify-center shrink-0 shadow-[1px_1px_0px_#18181B]">
            {attribute?.isPrimaryKey ? (
              <KeyIcon className="w-3.5 h-3.5 text-zinc-950" />
            ) : attribute?.isForeignKey ? (
              <LinkIcon className="w-3.5 h-3.5 text-zinc-950" />
            ) : relationship ? (
              <ArrowRight className="w-3.5 h-3.5 text-zinc-950" />
            ) : (
              <Layers className="w-3.5 h-3.5 text-zinc-950" />
            )}
          </div>
          <span className="font-mono font-bold text-[12px] text-zinc-950 truncate">
            {explanation.badge}
          </span>
        </div>

        {attribute?.isForeignKey && (
          <button
            onClick={handleHighlightFkReference}
            className="px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 text-white font-mono text-[10px] font-bold shadow-[1px_1px_0px_#18181B] transition-transform active:scale-95"
            title="Animate link to referenced Primary Key"
          >
            ⚡ Trace PK
          </button>
        )}
      </div>

      {/* 1. Clear Definition */}
      <div className="bg-white border border-zinc-300 rounded p-3 shadow-2xs">
        <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-500 mb-1 flex items-center gap-1.5">
          <BookOpen className="w-3 h-3 text-zinc-700" />
          <span>Core Concept</span>
        </div>
        <p className="text-zinc-800 text-[12.5px] leading-normal">{explanation.definition}</p>
      </div>

      {/* 2. WHY this element exists in this scenario */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-900 flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-amber-600" />
          <span>Why is this here?</span>
        </div>
        <ul className="space-y-1 bg-zinc-50 border border-zinc-200 rounded p-3">
          {explanation.whyThisElement.map((reason, idx) => (
            <li key={idx} className="flex items-start gap-2 text-zinc-700 text-[11.5px]">
              <span className="text-zinc-400 font-mono select-none">•</span>
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 3. Visual Connection Diagram */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-900">
          Visual Connection
        </div>
        <div className="p-2.5 bg-zinc-900 text-zinc-100 rounded border border-zinc-800 font-mono text-[10.5px] whitespace-pre overflow-x-auto shadow-inner leading-snug">
          {explanation.visualDiagram.trim()}
        </div>
      </div>

      {/* 4. Real-World Analogy */}
      <div className="bg-yellow-50/70 border border-yellow-300 rounded p-3 space-y-1">
        <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
          <span>💡 Real-World Analogy:</span>
          <span className="normal-case font-bold">{explanation.realWorldAnalogy.title}</span>
        </div>
        <p className="text-zinc-800 text-[11.5px] italic">
          "{explanation.realWorldAnalogy.description}"
        </p>
      </div>

      {/* 5. Essential Rules */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-900">
          Inviolable Rules
        </div>
        <div className="bg-white border border-zinc-200 rounded p-2.5 space-y-1">
          {explanation.rules.map((rule, idx) => (
            <div key={idx} className="flex items-start gap-1.5 text-[11.5px] text-zinc-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>{rule}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Interactive Experiment ("Try It" Mini-Lab) */}
      {explanation.interactiveExperiment && (
        <div className="bg-white border-2 border-zinc-900 rounded p-3 shadow-[2px_2px_0px_#18181B] space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono font-bold text-[11px] uppercase tracking-wider text-zinc-950">
              {explanation.interactiveExperiment.title}
            </span>
            <span className="text-[10px] font-mono bg-[#F6E77A] px-1.5 py-0.5 rounded border border-zinc-900 font-bold">
              LIVE LAB
            </span>
          </div>
          <p className="text-zinc-600 text-[11px]">
            {explanation.interactiveExperiment.description}
          </p>

          <button
            onClick={handleRunExperiment}
            disabled={isRunningExperiment}
            className="w-full py-1.5 px-3 bg-[#F6E77A] hover:bg-yellow-300 text-zinc-950 border border-zinc-900 font-mono font-bold text-xs rounded shadow-[1px_1px_0px_#18181B] flex items-center justify-center gap-1.5 transition-transform active:scale-98"
          >
            <Play className="w-3 h-3 fill-zinc-950" />
            <span>{explanation.interactiveExperiment.buttonLabel}</span>
          </button>

          {/* Experiment Result Live Feedback Banner */}
          {experimentResult && (
            <div
              className={`p-2.5 rounded border text-xs animate-in fade-in slide-in-from-top-1 duration-150 relative ${
                experimentResult.status === 'error'
                  ? 'bg-rose-50 border-rose-300 text-rose-950'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-950'
              }`}
            >
              <button
                onClick={() => setExperimentResult(null)}
                className="absolute top-1.5 right-1.5 text-zinc-400 hover:text-zinc-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <div className="font-bold font-mono text-[11.5px] mb-1">
                {experimentResult.title}
              </div>
              <div className="text-[11px] leading-snug">{experimentResult.message}</div>
            </div>
          )}
        </div>
      )}

      {/* 7. Common Misconception Callout */}
      {explanation.commonMisconception && (
        <div className="bg-amber-50/80 border border-amber-300 rounded p-2.5 space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-900 font-mono">
            <AlertTriangle className="w-3 h-3 text-amber-700 shrink-0" />
            <span>Common Misconception:</span>
          </div>
          <div className="text-[11px] text-zinc-700 line-through">
            "{explanation.commonMisconception.myth}"
          </div>
          <div className="text-[11px] text-zinc-900 font-medium">
            ✓ {explanation.commonMisconception.correction}
          </div>
        </div>
      )}

      {/* 8. Ask AI Tutor Link */}
      <button
        onClick={() => toggleAiTutor(true)}
        className="w-full py-1.5 px-3 rounded border border-zinc-300 hover:border-zinc-900 hover:bg-zinc-50 text-zinc-800 font-mono text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
      >
        <HelpCircle className="w-3.5 h-3.5 text-zinc-700" />
        <span>Ask AI Tutor more about this...</span>
      </button>
    </div>
  );
};
