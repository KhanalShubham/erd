import type { RelationalTable, DatabaseRow } from '../../types/database';

export type SqlDialect = 'PostgreSQL' | 'MySQL' | 'SQLite' | 'SQL Server' | 'Standard SQL';

export class SqlGenerator {
  public static generateDDL(tables: RelationalTable[], dialect: SqlDialect = 'Standard SQL'): string {
    if (tables.length === 0) {
      return '-- No tables defined yet. Add entities to your ERD to generate SQL schema.';
    }

    const lines: string[] = [];
    lines.push(`-- ==========================================================`);
    lines.push(`-- Generated SQL DDL (${dialect})`);
    lines.push(`-- Interactive ERD Learning & Database Design Lab`);
    lines.push(`-- ==========================================================\n`);

    for (const table of tables) {
      lines.push(`-- Table: ${table.name}`);
      lines.push(`CREATE TABLE ${this.quoteIdentifier(table.name, dialect)} (`);

      const tableElements: string[] = [];

      // Column definitions
      for (const col of table.columns) {
        let colDef = `  ${this.quoteIdentifier(col.name, dialect)} ${this.mapDataType(col.dataType, dialect)}`;

        if (!col.isNullable) {
          colDef += ' NOT NULL';
        }

        if (col.defaultValue !== undefined && col.defaultValue !== '') {
          colDef += ` DEFAULT '${col.defaultValue}'`;
        }

        if (col.isUnique && !table.primaryKey.includes(col.name) && table.columns.filter((c) => c.isUnique).length === 1) {
          colDef += ' UNIQUE';
        }

        // Domain check constraint inline or separate
        if (col.domain) {
          if (col.domain.minValue !== undefined && col.domain.maxValue !== undefined) {
            colDef += ` CHECK (${this.quoteIdentifier(col.name, dialect)} BETWEEN ${col.domain.minValue} AND ${col.domain.maxValue})`;
          } else if (col.domain.minValue !== undefined) {
            colDef += ` CHECK (${this.quoteIdentifier(col.name, dialect)} >= ${col.domain.minValue})`;
          } else if (col.domain.maxValue !== undefined) {
            colDef += ` CHECK (${this.quoteIdentifier(col.name, dialect)} <= ${col.domain.maxValue})`;
          } else if (col.domain.allowedValues && col.domain.allowedValues.length > 0) {
            const values = col.domain.allowedValues.map((v) => `'${v}'`).join(', ');
            colDef += ` CHECK (${this.quoteIdentifier(col.name, dialect)} IN (${values}))`;
          }
        }

        tableElements.push(colDef);
      }

      // Primary Key Constraint
      if (table.primaryKey.length > 0) {
        const pkCols = table.primaryKey.map((c) => this.quoteIdentifier(c, dialect)).join(', ');
        tableElements.push(`  PRIMARY KEY (${pkCols})`);
      }

      // Foreign Key Constraints
      for (const fk of table.foreignKeys) {
        const fkCol = this.quoteIdentifier(fk.column, dialect);
        const refTable = this.quoteIdentifier(fk.referencedTable, dialect);
        const refCol = this.quoteIdentifier(fk.referencedColumn, dialect);
        tableElements.push(`  FOREIGN KEY (${fkCol}) REFERENCES ${refTable} (${refCol}) ON DELETE CASCADE ON UPDATE CASCADE`);
      }

      // Multi-column Unique Constraints
      for (const uniqueGroup of table.uniqueConstraints) {
        if (uniqueGroup.length > 0) {
          const uCols = uniqueGroup.map((c) => this.quoteIdentifier(c, dialect)).join(', ');
          tableElements.push(`  UNIQUE (${uCols})`);
        }
      }

      lines.push(tableElements.join(',\n'));
      lines.push(`);\n`);
    }

    return lines.join('\n');
  }

  public static generateDML(tables: RelationalTable[], data: Record<string, DatabaseRow[]>, dialect: SqlDialect = 'Standard SQL'): string {
    const lines: string[] = [];
    lines.push(`-- ==========================================================`);
    lines.push(`-- Sample Data INSERT Statements`);
    lines.push(`-- ==========================================================\n`);

    let totalRows = 0;
    for (const table of tables) {
      const rows = data[table.name] || [];
      if (rows.length === 0) continue;

      lines.push(`-- Inserts for ${table.name}`);
      for (const row of rows) {
        totalRows++;
        const cols = Object.keys(row).filter((k) => row[k] !== undefined && row[k] !== null);
        if (cols.length === 0) continue;

        const colNames = cols.map((c) => this.quoteIdentifier(c, dialect)).join(', ');
        const values = cols
          .map((c) => {
            const val = row[c];
            if (typeof val === 'number' || typeof val === 'boolean') {
              return String(val);
            }
            return `'${String(val).replace(/'/g, "''")}'`;
          })
          .join(', ');

        lines.push(`INSERT INTO ${this.quoteIdentifier(table.name, dialect)} (${colNames}) VALUES (${values});`);
      }
      lines.push('');
    }

    if (totalRows === 0) {
      return '-- No rows inserted yet. Use the Data Sandbox to insert test records.';
    }

    return lines.join('\n');
  }

  private static mapDataType(type: string, dialect: SqlDialect): string {
    if (dialect === 'SQLite') {
      switch (type) {
        case 'INTEGER':
        case 'BIGINT':
          return 'INTEGER';
        case 'DECIMAL':
          return 'REAL';
        case 'BOOLEAN':
          return 'INTEGER';
        default:
          return 'TEXT';
      }
    }

    if (dialect === 'SQL Server') {
      switch (type) {
        case 'INTEGER':
          return 'INT';
        case 'BIGINT':
          return 'BIGINT';
        case 'VARCHAR':
          return 'NVARCHAR(150)';
        case 'TEXT':
          return 'NVARCHAR(MAX)';
        case 'BOOLEAN':
          return 'BIT';
        case 'DATE':
          return 'DATE';
        case 'TIME':
          return 'TIME';
        case 'DATETIME':
          return 'DATETIME2';
        case 'DECIMAL':
          return 'DECIMAL(10, 2)';
        default:
          return 'NVARCHAR(100)';
      }
    }

    switch (type) {
      case 'INTEGER':
        return 'INT';
      case 'BIGINT':
        return 'BIGINT';
      case 'VARCHAR':
        return 'VARCHAR(150)';
      case 'TEXT':
        return 'TEXT';
      case 'BOOLEAN':
        return dialect === 'MySQL' ? 'TINYINT(1)' : 'BOOLEAN';
      case 'DATE':
        return 'DATE';
      case 'TIME':
        return 'TIME';
      case 'DATETIME':
        return dialect === 'PostgreSQL' ? 'TIMESTAMP' : 'DATETIME';
      case 'DECIMAL':
        return 'DECIMAL(10, 2)';
      case 'ENUM':
        return 'VARCHAR(50)';
      default:
        return 'VARCHAR(100)';
    }
  }

  private static quoteIdentifier(name: string, dialect: SqlDialect): string {
    if (dialect === 'PostgreSQL' || dialect === 'SQLite' || dialect === 'Standard SQL') {
      return `"${name}"`;
    }
    if (dialect === 'MySQL') {
      return `\`${name}\``;
    }
    if (dialect === 'SQL Server') {
      return `[${name}]`;
    }
    return name;
  }
}
