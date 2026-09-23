export type EntityType = 'strong' | 'weak' | 'associative' | 'supertype' | 'subtype';

export type AttributeType = 'simple' | 'composite' | 'multivalued' | 'derived';

export type DataType =
  | 'INTEGER'
  | 'BIGINT'
  | 'VARCHAR'
  | 'TEXT'
  | 'BOOLEAN'
  | 'DATE'
  | 'TIME'
  | 'DATETIME'
  | 'DECIMAL'
  | 'ENUM';

export interface DomainRule {
  minValue?: number;
  maxValue?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  allowedValues?: string[];
  description?: string;
  customCheckExpr?: string;
}

export interface CompositeChild {
  id: string;
  name: string;
  dataType: DataType;
}

export interface Attribute {
  id: string;
  entityId: string;
  name: string;
  type: AttributeType;
  dataType: DataType;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  isCandidateKey?: boolean;
  isNullable: boolean;
  isUnique: boolean;
  defaultValue?: string;
  domain?: DomainRule;
  derivedFormula?: string;
  compositeChildren?: CompositeChild[];
  referencedEntityId?: string;
  referencedAttributeId?: string;
  notes?: string;
}

export interface Entity {
  id: string;
  name: string;
  type: EntityType;
  description?: string;
  position: { x: number; y: number };
  attributes: Attribute[];
  supertypeEntityId?: string;
  ownerEntityId?: string;
}

export type Cardinality = '1:1' | '1:N' | 'N:1' | 'M:N';
export type OptionalityNotation = '0..1' | '1..1' | '0..N' | '1..N';

export interface Relationship {
  id: string;
  name: string;
  sourceEntityId: string;
  targetEntityId: string;
  cardinality: Cardinality;
  sourceOptionality: '0' | '1'; // min
  targetOptionality: '0' | '1'; // min
  sourceMax: '1' | 'N';
  targetMax: '1' | 'N';
  attributes: Attribute[]; // Relationship attributes (e.g. EnrollmentDate, Grade)
  isIdentifying?: boolean; // For weak entity
  isRecursive?: boolean; // Self-referencing (Employee manages Employee)
  description?: string;
}

export interface ErdState {
  entities: Entity[];
  relationships: Relationship[];
  selectedEntityId: string | null;
  selectedAttributeId: string | null;
  selectedRelationshipId: string | null;
  highlightedFk: { sourceTable: string; sourceColumn: string; targetTable: string; targetColumn: string } | null;
}
