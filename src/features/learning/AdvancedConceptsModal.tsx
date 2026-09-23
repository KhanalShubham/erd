import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useErdStore } from '../../stores/erdStore';
import { useLearningStore } from '../../stores/learningStore';
import type { Entity, Relationship } from '../../types/erd';

interface AdvancedConceptsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ConceptDemo {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  summary: string;
  databaseRule: string;
  entities: Entity[];
  relationships: Relationship[];
}

export const AdvancedConceptsModal: React.FC<AdvancedConceptsModalProps> = ({ isOpen, onClose }) => {
  const { loadScenario } = useErdStore();
  const { setActiveMode } = useLearningStore();

  const [activeConceptId, setActiveConceptId] = useState<string>('weak_entity');

  if (!isOpen) return null;

  const conceptDemos: ConceptDemo[] = [
    {
      id: 'weak_entity',
      title: 'Weak Entity & Identifying Relationship',
      subtitle: 'ORDER ──(identifying)── ORDER_ITEM with Partial Key',
      badge: 'Weak Entity',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      summary:
        'A Weak Entity cannot be uniquely identified by its own attributes alone. It depends upon an identifying owner entity. Its primary key is formed by combining the owner primary key with its own partial discriminator key.',
      databaseRule:
        'Relational Result: ORDER_ITEM table takes OrderID (FK, PK) + ItemNumber (PK) as a composite primary key. When an Order is deleted, cascading deletes purge all its line items.',
      entities: [
        {
          id: 'adv_ord',
          name: 'PURCHASE_ORDER',
          type: 'strong',
          description: 'Owner identifying strong entity',
          position: { x: 100, y: 120 },
          attributes: [
            { id: 'ao_1', entityId: 'adv_ord', name: 'OrderID', type: 'simple', dataType: 'INTEGER', isPrimaryKey: true, isForeignKey: false, isNullable: false, isUnique: true },
            { id: 'ao_2', entityId: 'adv_ord', name: 'OrderDate', type: 'simple', dataType: 'DATE', isPrimaryKey: false, isForeignKey: false, isNullable: false, isUnique: false },
            { id: 'ao_3', entityId: 'adv_ord', name: 'TotalAmount', type: 'simple', dataType: 'DECIMAL', isPrimaryKey: false, isForeignKey: false, isNullable: false, isUnique: false },
          ],
        },
        {
          id: 'adv_item',
          name: 'ORDER_ITEM',
          type: 'weak',
          description: 'Weak entity dependent on PURCHASE_ORDER',
          position: { x: 500, y: 120 },
          attributes: [
            { id: 'ai_1', entityId: 'adv_item', name: 'OrderID', type: 'simple', dataType: 'INTEGER', isPrimaryKey: true, isForeignKey: true, isNullable: false, isUnique: false, referencedEntityId: 'adv_ord' },
            { id: 'ai_2', entityId: 'adv_item', name: 'ItemNumber', type: 'simple', dataType: 'INTEGER', isPrimaryKey: true, isForeignKey: false, isNullable: false, isUnique: false },
            { id: 'ai_3', entityId: 'adv_item', name: 'ProductName', type: 'simple', dataType: 'VARCHAR', isPrimaryKey: false, isForeignKey: false, isNullable: false, isUnique: false },
            { id: 'ai_4', entityId: 'adv_item', name: 'Quantity', type: 'simple', dataType: 'INTEGER', isPrimaryKey: false, isForeignKey: false, isNullable: false, isUnique: false },
          ],
        },
      ],
      relationships: [
        {
          id: 'adv_rel_ord_item',
          name: 'contains (identifying)',
          sourceEntityId: 'adv_ord',
          targetEntityId: 'adv_item',
          cardinality: '1:N',
          sourceOptionality: '1',
          targetOptionality: '1',
          sourceMax: '1',
          targetMax: 'N',
          isIdentifying: true,
          attributes: [],
        },
      ],
    },
    {
      id: 'recursive',
      title: 'Recursive Relationship (Self-Referencing)',
      subtitle: 'EMPLOYEE ──(manages)── EMPLOYEE with ManagerID FK',
      badge: 'Recursive 1:N',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      summary:
        'A relationship where the same entity participates in multiple roles. For example, a senior manager is an Employee who supervises other Employees.',
      databaseRule:
        'Relational Result: The EMPLOYEE table receives a self-referencing foreign key column `ManagerID` that points back to `EMPLOYEE.EmployeeID`. Top executives have NULL ManagerID.',
      entities: [
        {
          id: 'adv_emp',
          name: 'EMPLOYEE',
          type: 'strong',
          description: 'Staff member who can both supervise and be supervised',
          position: { x: 300, y: 120 },
          attributes: [
            { id: 'ae_1', entityId: 'adv_emp', name: 'EmployeeID', type: 'simple', dataType: 'INTEGER', isPrimaryKey: true, isForeignKey: false, isNullable: false, isUnique: true },
            { id: 'ae_2', entityId: 'adv_emp', name: 'FullName', type: 'simple', dataType: 'VARCHAR', isPrimaryKey: false, isForeignKey: false, isNullable: false, isUnique: false },
            { id: 'ae_3', entityId: 'adv_emp', name: 'JobTitle', type: 'simple', dataType: 'VARCHAR', isPrimaryKey: false, isForeignKey: false, isNullable: false, isUnique: false },
            { id: 'ae_4', entityId: 'adv_emp', name: 'ManagerID', type: 'simple', dataType: 'INTEGER', isPrimaryKey: false, isForeignKey: true, isNullable: true, isUnique: false, referencedEntityId: 'adv_emp' },
          ],
        },
      ],
      relationships: [
        {
          id: 'adv_rel_emp_manages',
          name: 'manages',
          sourceEntityId: 'adv_emp',
          targetEntityId: 'adv_emp',
          cardinality: '1:N',
          sourceOptionality: '0',
          targetOptionality: '0',
          sourceMax: '1',
          targetMax: 'N',
          isRecursive: true,
          attributes: [],
        },
      ],
    },
    {
      id: 'generalization',
      title: 'Generalization & Specialization (Supertype / Subtype)',
      subtitle: 'PERSON (Supertype) ── STUDENT & STAFF (Subtypes)',
      badge: 'Super/Subtype',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      summary:
        'Generalization captures shared common attributes in a parent supertype entity (Person), while specialization isolates role-specific attributes into child subtypes (Student, Staff).',
      databaseRule:
        'Relational Result: Subtypes borrow the primary key of the supertype (PersonID) as both their PK and FK, eliminating redundant duplication of shared properties like Name and Contact.',
      entities: [
        {
          id: 'adv_person',
          name: 'PERSON',
          type: 'supertype',
          description: 'Parent generalization entity holding common attributes',
          position: { x: 300, y: 60 },
          attributes: [
            { id: 'ap_1', entityId: 'adv_person', name: 'PersonID', type: 'simple', dataType: 'INTEGER', isPrimaryKey: true, isForeignKey: false, isNullable: false, isUnique: true },
            { id: 'ap_2', entityId: 'adv_person', name: 'FullName', type: 'simple', dataType: 'VARCHAR', isPrimaryKey: false, isForeignKey: false, isNullable: false, isUnique: false },
            { id: 'ap_3', entityId: 'adv_person', name: 'Email', type: 'simple', dataType: 'VARCHAR', isPrimaryKey: false, isForeignKey: false, isNullable: false, isUnique: true },
            { id: 'ap_4', entityId: 'adv_person', name: 'PersonType', type: 'simple', dataType: 'VARCHAR', isPrimaryKey: false, isForeignKey: false, isNullable: false, isUnique: false, domain: { allowedValues: ['Student', 'Staff'] } },
          ],
        },
        {
          id: 'adv_sub_student',
          name: 'STUDENT',
          type: 'subtype',
          description: 'Specialized student subtype',
          position: { x: 100, y: 360 },
          attributes: [
            { id: 'as_1', entityId: 'adv_sub_student', name: 'PersonID', type: 'simple', dataType: 'INTEGER', isPrimaryKey: true, isForeignKey: true, isNullable: false, isUnique: true, referencedEntityId: 'adv_person' },
            { id: 'as_2', entityId: 'adv_sub_student', name: 'MajorGPA', type: 'simple', dataType: 'DECIMAL', isPrimaryKey: false, isForeignKey: false, isNullable: false, isUnique: false },
          ],
        },
        {
          id: 'adv_sub_staff',
          name: 'STAFF',
          type: 'subtype',
          description: 'Specialized faculty staff subtype',
          position: { x: 500, y: 360 },
          attributes: [
            { id: 'at_1', entityId: 'adv_sub_staff', name: 'PersonID', type: 'simple', dataType: 'INTEGER', isPrimaryKey: true, isForeignKey: true, isNullable: false, isUnique: true, referencedEntityId: 'adv_person' },
            { id: 'at_2', entityId: 'adv_sub_staff', name: 'AnnualSalary', type: 'simple', dataType: 'DECIMAL', isPrimaryKey: false, isForeignKey: false, isNullable: false, isUnique: false },
          ],
        },
      ],
      relationships: [
        {
          id: 'adv_rel_is_student',
          name: 'is_a',
          sourceEntityId: 'adv_person',
          targetEntityId: 'adv_sub_student',
          cardinality: '1:1',
          sourceOptionality: '0',
          targetOptionality: '1',
          sourceMax: '1',
          targetMax: '1',
          attributes: [],
        },
        {
          id: 'adv_rel_is_staff',
          name: 'is_a',
          sourceEntityId: 'adv_person',
          targetEntityId: 'adv_sub_staff',
          cardinality: '1:1',
          sourceOptionality: '0',
          targetOptionality: '1',
          sourceMax: '1',
          targetMax: '1',
          attributes: [],
        },
      ],
    },
    {
      id: 'one_to_one',
      title: 'One-to-One Foreign Key with UNIQUE Constraint',
      subtitle: 'PERSON 1 ──── 1 PASSPORT',
      badge: '1:1 Unique FK',
      badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
      summary:
        'In a One-to-One relationship, each record corresponds to at most one record in the other table. To enforce this in relational databases without creating an extra table, place a Foreign Key on one side and apply a strict UNIQUE constraint.',
      databaseRule:
        'Relational Result: In table PASSPORT, `PersonID INT FOREIGN KEY REFERENCES Person(PersonID) UNIQUE`. The UNIQUE constraint makes it physically impossible for two passports to reference the same person.',
      entities: [
        {
          id: 'adv_pers',
          name: 'PERSON',
          type: 'strong',
          description: 'Citizen holding civil identification',
          position: { x: 120, y: 120 },
          attributes: [
            { id: 'ap1', entityId: 'adv_pers', name: 'PersonID', type: 'simple', dataType: 'INTEGER', isPrimaryKey: true, isForeignKey: false, isNullable: false, isUnique: true },
            { id: 'ap2', entityId: 'adv_pers', name: 'FullName', type: 'simple', dataType: 'VARCHAR', isPrimaryKey: false, isForeignKey: false, isNullable: false, isUnique: false },
            { id: 'ap3', entityId: 'adv_pers', name: 'DateOfBirth', type: 'simple', dataType: 'DATE', isPrimaryKey: false, isForeignKey: false, isNullable: false, isUnique: false },
          ],
        },
        {
          id: 'adv_pass',
          name: 'PASSPORT',
          type: 'strong',
          description: 'Official international travel document with UNIQUE FK',
          position: { x: 520, y: 120 },
          attributes: [
            { id: 'apb1', entityId: 'adv_pass', name: 'PassportID', type: 'simple', dataType: 'INTEGER', isPrimaryKey: true, isForeignKey: false, isNullable: false, isUnique: true },
            { id: 'apb2', entityId: 'adv_pass', name: 'PersonID', type: 'simple', dataType: 'INTEGER', isPrimaryKey: false, isForeignKey: true, isNullable: false, isUnique: true, referencedEntityId: 'adv_pers' },
            { id: 'apb3', entityId: 'adv_pass', name: 'ExpiryDate', type: 'simple', dataType: 'DATE', isPrimaryKey: false, isForeignKey: false, isNullable: false, isUnique: false },
          ],
        },
      ],
      relationships: [
        {
          id: 'adv_rel_pers_pass',
          name: 'holds_passport',
          sourceEntityId: 'adv_pers',
          targetEntityId: 'adv_pass',
          cardinality: '1:1',
          sourceOptionality: '0',
          targetOptionality: '1',
          sourceMax: '1',
          targetMax: '1',
          attributes: [],
        },
      ],
    },
  ];

  const currentConcept = conceptDemos.find((c) => c.id === activeConceptId) || conceptDemos[0];

  const handleLoadOntoCanvas = () => {
    loadScenario({
      id: `adv_${currentConcept.id}`,
      name: currentConcept.title,
      category: 'Education',
      difficulty: 'Advanced',
      shortDescription: currentConcept.subtitle,
      scenarioStory: currentConcept.summary,
      learningObjectives: [currentConcept.databaseRule],
      conceptsCovered: [currentConcept.badge],
      entityCount: currentConcept.entities.length,
      requirements: [],
      canonicalEntities: currentConcept.entities,
      canonicalRelationships: currentConcept.relationships,
    });
    setActiveMode('builder');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#FAF9F5] border-2 border-zinc-900 rounded-2xl w-full max-w-4xl shadow-[6px_6px_0px_#18181B] flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="p-5 border-b-2 border-zinc-900 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FEF08A] text-zinc-900 border-2 border-zinc-900 flex items-center justify-center shadow-[1px_1px_0px_#18181B]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 font-mono">Advanced ERD Modeling Patterns</h2>
              <p className="text-xs text-zinc-600 font-handwriting text-sm">
                Interactive masterclass on Weak Entities, Recursive hierarchies, Super/Subtypes, and 1:1 Unique Constraints.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-zinc-900 bg-white hover:bg-zinc-100 text-zinc-800 text-xs font-bold shadow-[1px_1px_0px_#18181B]"
          >
            ✕
          </button>
        </div>

        {/* Concept Selector Tabs */}
        <div className="p-3 border-b-2 border-zinc-900 bg-white flex items-center gap-2 overflow-x-auto shrink-0">
          {conceptDemos.map((demo) => {
            const isActive = demo.id === activeConceptId;
            return (
              <button
                key={demo.id}
                onClick={() => setActiveConceptId(demo.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#FEF08A] text-zinc-900 border-2 border-zinc-900 shadow-[2px_2px_0px_#18181B] font-bold'
                    : 'bg-zinc-50 text-zinc-700 hover:text-zinc-900 border border-zinc-300'
                }`}
              >
                {demo.title.split('(')[0].trim()}
              </button>
            );
          })}
        </div>

        {/* Concept Details & Visual Demo */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold border border-zinc-900 bg-[#FEF08A] text-zinc-900 font-mono shadow-[1px_1px_0px_#18181B]">
                {currentConcept.badge}
              </span>
              <h3 className="text-base font-bold text-zinc-900 mt-1.5 font-mono">{currentConcept.title}</h3>
              <p className="text-xs text-zinc-600 font-handwriting text-sm">{currentConcept.subtitle}</p>
            </div>

            <button
              onClick={handleLoadOntoCanvas}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs shadow-[2px_2px_0px_#18181B] transition-all shrink-0 border border-zinc-900"
            >
              <span>Load Into Canvas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Explanation Text */}
          <div className="p-4 rounded-xl bg-white border-2 border-zinc-900 text-xs text-zinc-800 leading-relaxed space-y-2 shadow-[2px_2px_0px_#18181B]">
            <span className="font-bold text-zinc-900 block font-mono uppercase text-[10px] tracking-wider">Conceptual Mechanics:</span>
            <p>{currentConcept.summary}</p>
          </div>

          {/* Relational Rule */}
          <div className="p-4 rounded-xl bg-amber-50/70 border-2 border-zinc-900 text-xs text-zinc-800 leading-relaxed space-y-1 shadow-[2px_2px_0px_#18181B]">
            <span className="font-bold text-zinc-900 block flex items-center gap-1.5 font-mono uppercase text-[10px] tracking-wider">
              <ShieldCheck className="w-4 h-4 text-zinc-900" />
              <span>Relational Schema & Database Rule:</span>
            </span>
            <p>{currentConcept.databaseRule}</p>
          </div>

          {/* Miniature Entity Preview Cards */}
          <div>
            <span className="text-xs font-bold text-zinc-800 block mb-2 font-mono uppercase tracking-wider">
              Pattern Entity Model ({currentConcept.entities.length} Tables)
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {currentConcept.entities.map((e) => (
                <div key={e.id} className="rounded-lg bg-white border-2 border-zinc-900 font-mono text-xs overflow-hidden shadow-[2px_2px_0px_#18181B]">
                  <div className="flex items-center justify-between bg-[#FEF08A] px-3 py-1.5 border-b border-zinc-900">
                    <span className="font-bold text-zinc-900">{e.name}</span>
                    <span className="text-[10px] font-bold text-zinc-700 uppercase bg-white px-1 rounded border border-zinc-900">{e.type}</span>
                  </div>
                  <div className="p-3 space-y-1 text-[11px]">
                    {e.attributes.map((a) => (
                      <div key={a.id} className="flex items-center justify-between text-zinc-800">
                        <span className={a.isPrimaryKey ? 'font-bold underline decoration-zinc-900' : a.isForeignKey ? 'text-zinc-600' : ''}>
                          {a.isPrimaryKey && '🔑 '}
                          {a.name}
                        </span>
                        <span className="text-[10px] text-zinc-500">{a.dataType}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t-2 border-zinc-900 bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-zinc-600 font-handwriting text-sm">
            <CheckCircle2 className="w-4 h-4 text-zinc-900" />
            <span>Click "Load Into Canvas" to visually simulate and inspect these models in real time.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white hover:bg-zinc-100 text-zinc-800 border border-zinc-900 font-semibold text-xs transition-colors shadow-[1px_1px_0px_#18181B]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
