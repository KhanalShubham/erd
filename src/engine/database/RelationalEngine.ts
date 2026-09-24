import type { Entity, Relationship } from '../../types/erd';
import type { RelationalTable, RelationalColumn } from '../../types/database';

export class RelationalEngine {
  /**
   * Transforms an ERD model (Entities + Relationships) into an equivalent Relational Schema
   */
  public static generateRelationalSchema(
    entities: Entity[],
    relationships: Relationship[]
  ): RelationalTable[] {
    const tablesMap = new Map<string, RelationalTable>();

    // 1. Convert each Entity to a base RelationalTable
    for (const entity of entities) {
      const columns: RelationalColumn[] = [];
      const primaryKeyColumns: string[] = [];
      const uniqueConstraints: string[][] = [];

      for (const attr of entity.attributes) {
        // If it's composite, flatten into its atomic children
        if (attr.type === 'composite' && attr.compositeChildren && attr.compositeChildren.length > 0) {
          for (const child of attr.compositeChildren) {
            columns.push({
              name: child.name,
              dataType: child.dataType,
              isPrimaryKey: false,
              isForeignKey: false,
              isNullable: true,
              isUnique: false,
            });
          }
          continue;
        }

        // If it's multivalued, it shouldn't be a single column in 1NF (handled below as separate table)
        if (attr.type === 'multivalued') {
          continue;
        }

        const col: RelationalColumn = {
          name: attr.name,
          dataType: attr.dataType,
          isPrimaryKey: attr.isPrimaryKey,
          isForeignKey: attr.isForeignKey,
          isNullable: attr.isNullable,
          isUnique: attr.isUnique || attr.isPrimaryKey,
          defaultValue: attr.defaultValue,
          domain: attr.domain,
          checkConstraint: attr.domain?.customCheckExpr,
        };

        if (attr.isPrimaryKey) {
          primaryKeyColumns.push(attr.name);
        }

        if (attr.isUnique && !attr.isPrimaryKey) {
          uniqueConstraints.push([attr.name]);
        }

        columns.push(col);
      }

      // Note: A table has ONE primary key, which may be a single column or a
      // composite primary key formed by multiple columns. We preserve all PK columns.

      // If weak entity and owner entity exists, mark identifying relation
      tablesMap.set(entity.id, {
        name: entity.name.trim().replace(/\s+/g, '_'),
        entityId: entity.id,
        columns,
        primaryKey: primaryKeyColumns,
        foreignKeys: [],
        uniqueConstraints,
        checkConstraints: [],
      });
    }

    // 2. Process Relationships to inject Foreign Keys
    for (const rel of relationships) {
      const sourceEntity = entities.find((e) => e.id === rel.sourceEntityId);
      const targetEntity = entities.find((e) => e.id === rel.targetEntityId);

      if (!sourceEntity || !targetEntity) continue;

      const sourceTable = tablesMap.get(sourceEntity.id);
      const targetTable = tablesMap.get(targetEntity.id);

      if (!sourceTable || !targetTable) continue;

      // Identify PK of source and target
      const sourcePkAttr = sourceEntity.attributes.find((a) => a.isPrimaryKey);
      const targetPkAttr = targetEntity.attributes.find((a) => a.isPrimaryKey);

      // Determine effective cardinality
      let effectiveCardinality: string = rel.cardinality;
      if (!effectiveCardinality) {
        const s = (rel as any).sourceCardinality || (rel.sourceMax === '1' ? '1' : 'N');
        const t = (rel as any).targetCardinality || (rel.targetMax === '1' ? '1' : 'N');
        if (s === '1' && t === '1') effectiveCardinality = '1:1';
        else if (s === '1' && (t === 'N' || t === 'M')) effectiveCardinality = '1:N';
        else if ((s === 'N' || s === 'M') && t === '1') effectiveCardinality = 'N:1';
        else effectiveCardinality = 'M:N';
      }

      // A) 1:N or N:1 Relationship: The FK goes to the 'MANY' side table
      if (effectiveCardinality === '1:N') {
        // Source is 1, Target is N -> Target gets Source's PK as FK
        if (sourcePkAttr) {
          const fkColName = sourcePkAttr.name;
          // Check if column already exists
          const existingCol = targetTable.columns.find(
            (c) => c.name.toLowerCase() === sourcePkAttr.name.toLowerCase() || c.name === fkColName
          );

          if (!existingCol) {
            targetTable.columns.push({
              name: fkColName,
              dataType: sourcePkAttr.dataType,
              isPrimaryKey: false,
              isForeignKey: true,
              isNullable: rel.targetOptionality === '0',
              isUnique: false,
              referencedTable: sourceTable.name,
              referencedColumn: sourcePkAttr.name,
            });
          } else {
            existingCol.isForeignKey = true;
            existingCol.referencedTable = sourceTable.name;
            existingCol.referencedColumn = sourcePkAttr.name;
            if (targetTable.primaryKey.some((pk) => pk !== existingCol.name)) {
              existingCol.isPrimaryKey = false;
              targetTable.primaryKey = targetTable.primaryKey.filter((pk) => pk !== existingCol.name);
            }
          }

          const existingFk = targetTable.foreignKeys.find(
            (fk) => fk.referencedTable === sourceTable.name && fk.referencedColumn === sourcePkAttr.name
          );
          if (!existingFk) {
            targetTable.foreignKeys.push({
              column: existingCol ? existingCol.name : fkColName,
              referencedTable: sourceTable.name,
              referencedColumn: sourcePkAttr.name,
            });
          }
        }
      } else if (effectiveCardinality === 'N:1') {
        // Source is N, Target is 1 -> Source gets Target's PK as FK
        if (targetPkAttr) {
          const fkColName = targetPkAttr.name;
          const existingCol = sourceTable.columns.find(
            (c) => c.name.toLowerCase() === targetPkAttr.name.toLowerCase() || c.name === fkColName
          );

          if (!existingCol) {
            sourceTable.columns.push({
              name: fkColName,
              dataType: targetPkAttr.dataType,
              isPrimaryKey: false,
              isForeignKey: true,
              isNullable: rel.sourceOptionality === '0',
              isUnique: false,
              referencedTable: targetTable.name,
              referencedColumn: targetPkAttr.name,
            });
          } else {
            existingCol.isForeignKey = true;
            existingCol.referencedTable = targetTable.name;
            existingCol.referencedColumn = targetPkAttr.name;
            if (sourceTable.primaryKey.some((pk) => pk !== existingCol.name)) {
              existingCol.isPrimaryKey = false;
              sourceTable.primaryKey = sourceTable.primaryKey.filter((pk) => pk !== existingCol.name);
            }
          }

          const existingFk = sourceTable.foreignKeys.find(
            (fk) => fk.referencedTable === targetTable.name && fk.referencedColumn === targetPkAttr.name
          );
          if (!existingFk) {
            sourceTable.foreignKeys.push({
              column: existingCol ? existingCol.name : fkColName,
              referencedTable: targetTable.name,
              referencedColumn: targetPkAttr.name,
            });
          }
        }
      } else if (effectiveCardinality === '1:1') {
        // In 1:1, FK placed on one side with UNIQUE constraint
        if (sourcePkAttr) {
          const existingCol = targetTable.columns.find(
            (c) => c.name.toLowerCase() === sourcePkAttr.name.toLowerCase()
          );

          const colName = existingCol ? existingCol.name : `${sourceTable.name.toLowerCase()}_${sourcePkAttr.name}`;
          if (!existingCol) {
            targetTable.columns.push({
              name: colName,
              dataType: sourcePkAttr.dataType,
              isPrimaryKey: false,
              isForeignKey: true,
              isNullable: rel.targetOptionality === '0',
              isUnique: true,
              referencedTable: sourceTable.name,
              referencedColumn: sourcePkAttr.name,
            });
          } else {
            existingCol.isForeignKey = true;
            existingCol.isUnique = true;
            existingCol.referencedTable = sourceTable.name;
            existingCol.referencedColumn = sourcePkAttr.name;
          }

          targetTable.foreignKeys.push({
            column: colName,
            referencedTable: sourceTable.name,
            referencedColumn: sourcePkAttr.name,
          });
          targetTable.uniqueConstraints.push([colName]);
        }
      } else if (effectiveCardinality === 'M:N') {
        // Decompose M:N into an Associative / Junction Table with Composite Primary Key (FK1 + FK2)
        if (sourcePkAttr && targetPkAttr) {
          const junctionName = `${sourceTable.name}_${targetTable.name}`.toLowerCase();
          const sourceFkName = `${sourceTable.name.toLowerCase()}_${sourcePkAttr.name}`;
          const targetFkName = `${targetTable.name.toLowerCase()}_${targetPkAttr.name}`;

          const junctionCols: RelationalColumn[] = [
            {
              name: sourceFkName,
              dataType: sourcePkAttr.dataType,
              isPrimaryKey: true,
              isForeignKey: true,
              isNullable: false,
              isUnique: false,
              referencedTable: sourceTable.name,
              referencedColumn: sourcePkAttr.name,
            },
            {
              name: targetFkName,
              dataType: targetPkAttr.dataType,
              isPrimaryKey: true,
              isForeignKey: true,
              isNullable: false,
              isUnique: false,
              referencedTable: targetTable.name,
              referencedColumn: targetPkAttr.name,
            },
          ];

          // Add any relationship attributes to junction table
          if (rel.attributes && rel.attributes.length > 0) {
            for (const rAttr of rel.attributes) {
              junctionCols.push({
                name: rAttr.name,
                dataType: rAttr.dataType,
                isPrimaryKey: false,
                isForeignKey: false,
                isNullable: rAttr.isNullable,
                isUnique: false,
              });
            }
          }

          tablesMap.set(`junction_${rel.id}`, {
            name: junctionName,
            entityId: `junction_${rel.id}`,
            columns: junctionCols,
            primaryKey: [sourceFkName, targetFkName],
            foreignKeys: [
              {
                column: sourceFkName,
                referencedTable: sourceTable.name,
                referencedColumn: sourcePkAttr.name,
              },
              {
                column: targetFkName,
                referencedTable: targetTable.name,
                referencedColumn: targetPkAttr.name,
              },
            ],
            uniqueConstraints: [],
            checkConstraints: [],
          });
        }
      }
    }

    // 3. Handle Multivalued Attributes -> Separate child relational tables
    for (const entity of entities) {
      const sourceTable = tablesMap.get(entity.id);
      const pkAttr = entity.attributes.find((a) => a.isPrimaryKey);

      for (const attr of entity.attributes) {
        if (attr.type === 'multivalued' && pkAttr && sourceTable) {
          const childTableName = `${sourceTable.name}_${attr.name.toUpperCase()}`;
          const childPkCol = `${childTableName.toLowerCase()}_id`;
          const childFkCol = pkAttr.name;
          const childValCol = attr.name;

          tablesMap.set(`multivalued_${entity.id}_${attr.id}`, {
            name: childTableName,
            entityId: entity.id,
            columns: [
              {
                name: childPkCol,
                dataType: 'INTEGER',
                isPrimaryKey: true,
                isForeignKey: false,
                isNullable: false,
                isUnique: true,
              },
              {
                name: childFkCol,
                dataType: pkAttr.dataType,
                isPrimaryKey: false,
                isForeignKey: true,
                isNullable: false,
                isUnique: false,
                referencedTable: sourceTable.name,
                referencedColumn: pkAttr.name,
              },
              {
                name: childValCol,
                dataType: attr.dataType,
                isPrimaryKey: false,
                isForeignKey: false,
                isNullable: false,
                isUnique: false,
              },
            ],
            primaryKey: [childPkCol],
            foreignKeys: [
              {
                column: childFkCol,
                referencedTable: sourceTable.name,
                referencedColumn: pkAttr.name,
              },
            ],
            uniqueConstraints: [],
            checkConstraints: [],
          });
        }
      }
    }

    return Array.from(tablesMap.values());
  }
}
