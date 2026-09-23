import type { DataType, DomainRule } from './erd';

export interface RelationalColumn {
  name: string;
  dataType: DataType;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  isNullable: boolean;
  isUnique: boolean;
  defaultValue?: string;
  checkConstraint?: string;
  domain?: DomainRule;
  referencedTable?: string;
  referencedColumn?: string;
}

export interface ForeignKeyConstraint {
  column: string;
  referencedTable: string;
  referencedColumn: string;
}

export interface CheckConstraint {
  name: string;
  expression: string;
  description: string;
}

export interface RelationalTable {
  name: string;
  entityId: string;
  columns: RelationalColumn[];
  primaryKey: string[]; // Supports composite primary keys
  foreignKeys: ForeignKeyConstraint[];
  uniqueConstraints: string[][];
  checkConstraints: CheckConstraint[];
}

export type DatabaseRow = Record<string, any>;

export type ViolationType =
  | 'PRIMARY_KEY'
  | 'FOREIGN_KEY'
  | 'NOT_NULL'
  | 'UNIQUE'
  | 'DOMAIN'
  | 'DATA_TYPE'
  | 'CHECK';

export interface IntegrityViolation {
  id: string;
  type: ViolationType;
  table: string;
  column?: string;
  message: string;
  explanation: string;
  timestamp: number;
  attemptedValue?: any;
}

export interface RelationalDatabaseSchema {
  tables: RelationalTable[];
}
