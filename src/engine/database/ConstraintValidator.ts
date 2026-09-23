import type { RelationalTable, DatabaseRow, IntegrityViolation } from '../../types/database';

export class ConstraintValidator {
  /**
   * Validates a candidate row to be inserted or updated in a table
   */
  public static validateRow(
    table: RelationalTable,
    newRow: DatabaseRow,
    _allTables: RelationalTable[],
    allData: Record<string, DatabaseRow[]>,
    editingRowIndex: number = -1
  ): IntegrityViolation | null {
    const existingRows = allData[table.name] || [];

    // 1. Check Primary Key constraint
    if (table.primaryKey && table.primaryKey.length > 0) {
      // Check for NULL in PK columns
      for (const pkCol of table.primaryKey) {
        const val = newRow[pkCol];
        if (val === undefined || val === null || val === '') {
          return {
            id: `pk_null_${Date.now()}`,
            type: 'PRIMARY_KEY',
            table: table.name,
            column: pkCol,
            message: `Primary Key column '${pkCol}' cannot be NULL or empty.`,
            explanation: `Entity Integrity requires that every table has a primary key that uniquely identifies each entity, and no primary key attribute can be null.`,
            timestamp: Date.now(),
            attemptedValue: val,
          };
        }
      }

      // Check for Duplicate PK
      const duplicateRow = existingRows.find((row, idx) => {
        if (idx === editingRowIndex) return false;
        return table.primaryKey.every(
          (pkCol) => String(row[pkCol]).trim().toLowerCase() === String(newRow[pkCol]).trim().toLowerCase()
        );
      });

      if (duplicateRow) {
        const pkValues = table.primaryKey.map((col) => `${col} = ${newRow[col]}`).join(', ');
        return {
          id: `pk_dup_${Date.now()}`,
          type: 'PRIMARY_KEY',
          table: table.name,
          column: table.primaryKey.join(', '),
          message: `PRIMARY KEY VIOLATION: A record with (${pkValues}) already exists in table '${table.name}'.`,
          explanation: `Primary keys enforce entity uniqueness. In a database, inserting a duplicate primary key value violates Entity Integrity and is rejected by the DBMS.`,
          timestamp: Date.now(),
          attemptedValue: table.primaryKey.map((col) => newRow[col]),
        };
      }
    }

    // 2. Check NOT NULL and Data Types for all columns
    for (const col of table.columns) {
      const val = newRow[col.name];

      // NOT NULL check
      if (!col.isNullable && (val === undefined || val === null || val === '')) {
        return {
          id: `not_null_${Date.now()}`,
          type: 'NOT_NULL',
          table: table.name,
          column: col.name,
          message: `NOT NULL VIOLATION: Column '${col.name}' requires a value.`,
          explanation: `The attribute '${col.name}' is defined as mandatory (NOT NULL). Every tuple must provide a valid value for this attribute.`,
          timestamp: Date.now(),
          attemptedValue: val,
        };
      }

      // If value is provided, validate Data Type & Domain
      if (val !== undefined && val !== null && val !== '') {
        // Data Type check
        const typeError = this.validateDataType(col.dataType, val);
        if (typeError) {
          return {
            id: `type_${Date.now()}`,
            type: 'DATA_TYPE',
            table: table.name,
            column: col.name,
            message: `DATA TYPE ERROR: ${typeError}`,
            explanation: `The column '${col.name}' is declared as ${col.dataType}. The value '${val}' cannot be converted to this data type.`,
            timestamp: Date.now(),
            attemptedValue: val,
          };
        }

        // Domain checks
        if (col.domain) {
          const domainError = this.validateDomain(col.domain, col.dataType, val);
          if (domainError) {
            return {
              id: `domain_${Date.now()}`,
              type: 'DOMAIN',
              table: table.name,
              column: col.name,
              message: `DOMAIN VIOLATION: ${domainError}`,
              explanation: `A domain defines the set of permissible values for an attribute. The value '${val}' violates domain boundaries.`,
              timestamp: Date.now(),
              attemptedValue: val,
            };
          }
        }
      }
    }

    // 3. Check UNIQUE Constraints
    for (const uniqueGroup of table.uniqueConstraints) {
      const duplicateRow = existingRows.find((row, idx) => {
        if (idx === editingRowIndex) return false;
        return uniqueGroup.every((col) => {
          const v1 = row[col];
          const v2 = newRow[col];
          if (v1 === undefined || v1 === null || v1 === '') return false;
          return String(v1).trim().toLowerCase() === String(v2).trim().toLowerCase();
        });
      });

      if (duplicateRow) {
        const colNames = uniqueGroup.join(', ');
        return {
          id: `unique_${Date.now()}`,
          type: 'UNIQUE',
          table: table.name,
          column: colNames,
          message: `UNIQUE CONSTRAINT VIOLATION: Value for (${colNames}) already exists in '${table.name}'.`,
          explanation: `Unique constraints ensure that no two rows share identical non-null values in the specified column(s).`,
          timestamp: Date.now(),
          attemptedValue: uniqueGroup.map((c) => newRow[c]),
        };
      }
    }

    // 4. Check Referential Integrity (Foreign Keys)
    for (const fk of table.foreignKeys) {
      const fkVal = newRow[fk.column];

      // If FK is nullable and value is empty, it's permissible
      if (fkVal === undefined || fkVal === null || fkVal === '') {
        const colDef = table.columns.find((c) => c.name === fk.column);
        if (colDef && !colDef.isNullable) {
          return {
            id: `fk_null_${Date.now()}`,
            type: 'FOREIGN_KEY',
            table: table.name,
            column: fk.column,
            message: `FOREIGN KEY NOT NULL VIOLATION: Foreign key '${fk.column}' cannot be NULL.`,
            explanation: `Because this relationship is mandatory (1..N), the foreign key reference must be provided.`,
            timestamp: Date.now(),
            attemptedValue: fkVal,
          };
        }
        continue;
      }

      // Check if referenced record exists in target table
      const referencedTableData = allData[fk.referencedTable] || [];
      const match = referencedTableData.find(
        (refRow) => String(refRow[fk.referencedColumn]).trim().toLowerCase() === String(fkVal).trim().toLowerCase()
      );

      if (!match) {
        return {
          id: `fk_violation_${Date.now()}`,
          type: 'FOREIGN_KEY',
          table: table.name,
          column: fk.column,
          message: `FOREIGN KEY VIOLATION: '${fk.column}' value '${fkVal}' does not exist in referenced table '${fk.referencedTable}(${fk.referencedColumn})'.`,
          explanation: `Referential Integrity requires that any foreign key value in '${table.name}' must reference a valid, existing primary key in '${fk.referencedTable}'.`,
          timestamp: Date.now(),
          attemptedValue: fkVal,
        };
      }
    }

    return null; // All constraints passed!
  }

  private static validateDataType(dataType: string, val: any): string | null {
    switch (dataType) {
      case 'INTEGER':
      case 'BIGINT': {
        const num = Number(val);
        if (isNaN(num) || !Number.isInteger(num)) {
          return `Expected an integer number, got '${val}'.`;
        }
        return null;
      }
      case 'DECIMAL': {
        const num = Number(val);
        if (isNaN(num)) {
          return `Expected a valid decimal number, got '${val}'.`;
        }
        return null;
      }
      case 'BOOLEAN': {
        if (
          val !== true &&
          val !== false &&
          val !== 'true' &&
          val !== 'false' &&
          val !== '1' &&
          val !== '0'
        ) {
          return `Expected boolean (true/false), got '${val}'.`;
        }
        return null;
      }
      case 'DATE': {
        const d = new Date(val);
        if (isNaN(d.getTime())) {
          return `Expected valid date (YYYY-MM-DD), got '${val}'.`;
        }
        return null;
      }
      default:
        return null;
    }
  }

  private static validateDomain(domain: any, _dataType: string, val: any): string | null {
    if (domain.minValue !== undefined && Number(val) < domain.minValue) {
      return `Value ${val} is less than minimum allowed (${domain.minValue}).`;
    }
    if (domain.maxValue !== undefined && Number(val) > domain.maxValue) {
      return `Value ${val} is greater than maximum allowed (${domain.maxValue}).`;
    }
    if (domain.minLength !== undefined && String(val).length < domain.minLength) {
      return `Length (${String(val).length}) is less than minimum length (${domain.minLength}).`;
    }
    if (domain.maxLength !== undefined && String(val).length > domain.maxLength) {
      return `Length (${String(val).length}) exceeds maximum length (${domain.maxLength}).`;
    }
    if (domain.allowedValues && domain.allowedValues.length > 0) {
      const match = domain.allowedValues.some(
        (allowed: string) => allowed.toLowerCase() === String(val).toLowerCase()
      );
      if (!match) {
        return `Value '${val}' is not in allowed enumeration [${domain.allowedValues.join(', ')}].`;
      }
    }
    if (domain.pattern) {
      try {
        if (domain.pattern === 'email') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(String(val))) {
            return `Value '${val}' is not a valid email address format.`;
          }
        } else {
          const regex = new RegExp(domain.pattern);
          if (!regex.test(String(val))) {
            return `Value '${val}' does not match domain pattern ${domain.pattern}.`;
          }
        }
      } catch {
        // Ignore invalid regex
      }
    }
    return null;
  }
}
