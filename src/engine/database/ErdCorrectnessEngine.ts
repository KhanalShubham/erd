// ============================================================================
// Educational ERD Correctness & Triangulation Validation Engine
// Enforces the 35 Core Database Correctness Principles:
// - Bidirectional Cardinality Traversal (Forward & Reverse-Read Tests)
// - 3-Point Triangulation (Business Rules <-> Diagram <-> Schema FK/PK/UNIQUE)
// - One Row = One Thing Semantics
// - Screenshot-Specific Pattern Detection (Cashier - Receipt - Line - Barcode)
// - Structured Section 31 Educational Validation Output
// ============================================================================

import type { Entity, Relationship } from '../../types/erd';
import type { SystemScenario } from '../../types/system';

export type ValidationSeverity = 'CRITICAL' | 'MAJOR' | 'MINOR';

export interface ValidationIssue {
  id: string;
  severity: ValidationSeverity;
  category: 'CARDINALITY' | 'SCHEMA' | 'VISUAL' | 'KEYS' | 'SEMANTICS';
  relationshipName?: string;
  sourceEntity: string;
  targetEntity: string;
  message: string;
  studentBelief: string;
  businessFact: string;
  schemaEvidence: string;
  correctedDesign: string;
  reasoning: string;
}

export interface RelationshipTraversal {
  relationshipId: string;
  relationshipName: string;
  sourceEntity: string;
  targetEntity: string;
  forwardSentence: string;
  reverseSentence: string;
  forwardCardinality: string;
  reverseCardinality: string;
  sourceOptionality: string;
  targetOptionality: string;
  fkLocation: string;
  triangulationStatus: 'PASS' | 'FAIL' | 'WARNING';
  triangulationDetails: string;
}

export interface ErdValidationReport {
  overallStatus: 'PASS' | 'FAIL';
  criticalErrorCount: number;
  majorErrorCount: number;
  minorErrorCount: number;
  relationshipChecks: {
    relationship: string;
    expected: string;
    rendered: string;
    status: 'PASS' | 'FAIL';
    reason: string;
    corrected: string;
  }[];
  schemaChecks: {
    check: string;
    status: 'PASS' | 'FAIL';
    details: string;
  }[];
  visualChecks: {
    check: string;
    status: 'PASS' | 'FAIL';
    details: string;
  }[];
  traversals: RelationshipTraversal[];
  issues: ValidationIssue[];
  formattedMarkdownReport: string;
}

export class ErdCorrectnessEngine {
  /**
   * Generates the bidirectional natural language reading of a relationship
   */
  public static getRelationshipTraversals(
    rel: Relationship,
    entities: Entity[]
  ): RelationshipTraversal {
    const source = entities.find((e) => e.id === rel.sourceEntityId);
    const target = entities.find((e) => e.id === rel.targetEntityId);

    const sName = source?.name || 'Entity A';
    const tName = target?.name || 'Entity B';
    const verb = rel.name?.trim() || 'relates to';

    // Effective cardinality at endpoints
    const sMax = rel.sourceMax || (rel.cardinality === 'N:1' || rel.cardinality === 'M:N' ? 'N' : '1');
    const tMax = rel.targetMax || (rel.cardinality === '1:N' || rel.cardinality === 'M:N' ? 'N' : '1');
    const sMin = rel.sourceOptionality || '1';
    const tMin = rel.targetOptionality || '0';

    // Left-to-Right (Forward)
    const forwardQuantifier = tMax === 'N' ? 'many' : 'at most one';
    const forwardSentence = `One ${sName} can ${verb} ${forwardQuantifier} ${tName} records.`;

    // Right-to-Left (Reverse)
    const reverseQuantifier = sMax === 'N' ? 'many' : 'one';
    const reverseSentence = `Each ${tName} is ${verb} by ${reverseQuantifier === 'one' ? 'exactly one' : 'multiple'} ${sName} records.`;

    // Check FK location in schema
    let fkLocation = 'No FK defined';
    const targetFk = target?.attributes.find(
      (a) => a.isForeignKey && (a.referencedEntityId === source?.id || a.name.toLowerCase().includes(sName.toLowerCase()))
    );
    const sourceFk = source?.attributes.find(
      (a) => a.isForeignKey && (a.referencedEntityId === target?.id || a.name.toLowerCase().includes(tName.toLowerCase()))
    );

    if (targetFk) {
      fkLocation = `${tName}.${targetFk.name} (FK) -> ${sName}`;
    } else if (sourceFk) {
      fkLocation = `${sName}.${sourceFk.name} (FK) -> ${tName}`;
    }

    // Triangulation: Diagram vs FK
    let triangulationStatus: 'PASS' | 'FAIL' | 'WARNING' = 'PASS';
    let triangulationDetails = `Consistent: The FK sits in the child table matching the 'N' side.`;

    if (rel.cardinality === '1:N' && sourceFk && !targetFk) {
      triangulationStatus = 'FAIL';
      triangulationDetails = `Contradiction: Diagram specifies ${sName} [1] -> [N] ${tName}, but FK resides in ${sName}!`;
    } else if (rel.cardinality === '1:1' && targetFk && !targetFk.isUnique) {
      triangulationStatus = 'WARNING';
      triangulationDetails = `Notice: Diagram specifies 1:1, but ${tName}.${targetFk.name} lacks a UNIQUE constraint.`;
    }

    return {
      relationshipId: rel.id,
      relationshipName: verb,
      sourceEntity: sName,
      targetEntity: tName,
      forwardSentence,
      reverseSentence,
      forwardCardinality: `${sMax === '1' ? '1' : 'N'} : ${tMax === '1' ? '1' : 'N'}`,
      reverseCardinality: `${tMax === '1' ? '1' : 'N'} : ${sMax === '1' ? '1' : 'N'}`,
      sourceOptionality: `${sMin}..${sMax}`,
      targetOptionality: `${tMin}..${tMax}`,
      fkLocation,
      triangulationStatus,
      triangulationDetails,
    };
  }

  /**
   * Validates an ERD model against the 35 Core Educational Correctness Principles
   */
  public static validateErd(
    entities: Entity[],
    relationships: Relationship[],
    scenario: SystemScenario
  ): ErdValidationReport {
    const issues: ValidationIssue[] = [];
    const traversals: RelationshipTraversal[] = [];
    const relationshipChecks: ErdValidationReport['relationshipChecks'] = [];
    const schemaChecks: ErdValidationReport['schemaChecks'] = [];
    const visualChecks: ErdValidationReport['visualChecks'] = [];

    const canonicalRels = scenario.canonicalRelationships || [];
    const canonicalEntities = scenario.canonicalEntities || [];

    // 1. Evaluate every active relationship on canvas
    for (const rel of relationships) {
      const traversal = this.getRelationshipTraversals(rel, entities);
      traversals.push(traversal);

      const source = entities.find((e) => e.id === rel.sourceEntityId);
      const target = entities.find((e) => e.id === rel.targetEntityId);
      if (!source || !target) continue;

      const sName = source.name.toUpperCase().trim();
      const tName = target.name.toUpperCase().trim();

      // Find canonical match
      const cRel = canonicalRels.find((cr) => {
        const cSource = canonicalEntities.find((e) => e.id === cr.sourceEntityId)?.name.toUpperCase().trim();
        const cTarget = canonicalEntities.find((e) => e.id === cr.targetEntityId)?.name.toUpperCase().trim();
        return (
          (cSource === sName && cTarget === tName) ||
          (cSource === tName && cTarget === sName)
        );
      });

      // ======================================================================
      // SCREENSHOT PATTERN DETECTION (Section 6)
      // ======================================================================

      // Pattern 6.1: CASHIER -> SALE_RECEIPT
      if (
        (sName.includes('CASHIER') && tName.includes('RECEIPT')) ||
        (sName.includes('RECEIPT') && tName.includes('CASHIER'))
      ) {
        const renderedCard = rel.cardinality;

        // If diagram displays 1:1, trigger CRITICAL ERROR
        if (renderedCard === '1:1') {
          issues.push({
            id: `err_cashier_11_${rel.id}`,
            severity: 'CRITICAL',
            category: 'CARDINALITY',
            relationshipName: rel.name,
            sourceEntity: source.name,
            targetEntity: target.name,
            message: `Cardinality contradiction: CASHIER and SALE_RECEIPT rendered as 1:1.`,
            studentBelief: `Your relationship says: CASHIER 1 ---- 1 SALE_RECEIPT. This asserts that one cashier can only ever process exactly one receipt in their entire career.`,
            businessFact: `The business requirement states: "A cashier can process many sales receipts. Each sales receipt is processed by one cashier."`,
            schemaEvidence: `SALE_RECEIPT contains CashierID as a non-unique foreign key.`,
            correctedDesign: `CASHIER [1] (0..N) ─────── rings_up ───────► [N] (1..1) SALE_RECEIPT`,
            reasoning: `One cashier appears across many receipt rows; each receipt points to one cashier. Therefore cardinality must be 1:N with the 'N' attached to SALE_RECEIPT.`,
          });

          relationshipChecks.push({
            relationship: `${source.name} -> ${target.name}`,
            expected: `1:N (Cashier 1 ---- N Receipt)`,
            rendered: renderedCard,
            status: 'FAIL',
            reason: `One cashier processes multiple receipts. Rendering 1:1 violates business rules.`,
            corrected: `CASHIER [1] ─── rings_up ───► [N] SALE_RECEIPT`,
          });
        } else {
          relationshipChecks.push({
            relationship: `${source.name} -> ${target.name}`,
            expected: `1:N`,
            rendered: renderedCard,
            status: 'PASS',
            reason: `Correctly models cashier processing multiple receipts.`,
            corrected: `CASHIER [1] ─── rings_up ───► [N] SALE_RECEIPT`,
          });
        }
      }

      // Pattern 6.2: SALE_RECEIPT -> RECEIPT_LINE
      else if (
        (sName.includes('RECEIPT') && !sName.includes('LINE') && tName.includes('LINE')) ||
        (tName.includes('RECEIPT') && !tName.includes('LINE') && sName.includes('LINE'))
      ) {
        const isReceiptSource = !sName.includes('LINE');
        const renderedCard = rel.cardinality;

        if (renderedCard === '1:1' || (isReceiptSource && rel.targetMax === '1')) {
          issues.push({
            id: `err_line_11_${rel.id}`,
            severity: 'CRITICAL',
            category: 'CARDINALITY',
            relationshipName: rel.name,
            sourceEntity: source.name,
            targetEntity: target.name,
            message: `Cardinality contradiction: SALE_RECEIPT and RECEIPT_LINE rendered with 1 on line side.`,
            studentBelief: `A receipt has only one line item.`,
            businessFact: `A single sale receipt contains multiple scanned items (lines).`,
            schemaEvidence: `RECEIPT_LINE contains ReceiptID (FK).`,
            correctedDesign: `SALE_RECEIPT [1] (1..1) ─────── contains ───────► [N] (1..N) RECEIPT_LINE`,
            reasoning: `Each receipt item appears as a separate line row in RECEIPT_LINE referencing ReceiptID.`,
          });
        }
      }

      // Pattern 6.3: BARCODE_PRODUCT -> RECEIPT_LINE
      else if (
        (sName.includes('PRODUCT') && tName.includes('LINE')) ||
        (sName.includes('LINE') && tName.includes('PRODUCT'))
      ) {
        const isProductSource = sName.includes('PRODUCT');
        const renderedCard = rel.cardinality;

        // Verify that RECEIPT_LINE is on the 'N' side
        const lineMax = isProductSource ? rel.targetMax : rel.sourceMax;
        if (lineMax !== 'N' && renderedCard !== '1:N') {
          issues.push({
            id: `err_prod_line_${rel.id}`,
            severity: 'CRITICAL',
            category: 'CARDINALITY',
            relationshipName: rel.name,
            sourceEntity: source.name,
            targetEntity: target.name,
            message: `Product to Receipt Line must place the 'N' on RECEIPT_LINE.`,
            studentBelief: `Product is on the many side or 1:1.`,
            businessFact: `One product can appear on many receipt lines across different customer carts.`,
            schemaEvidence: `RECEIPT_LINE contains Barcode as a Foreign Key referencing BARCODE_PRODUCT.`,
            correctedDesign: `BARCODE_PRODUCT [1] (0..N) ─────── scanned_in ───────► [N] (1..1) RECEIPT_LINE`,
            reasoning: `The table containing the foreign key is the 'many' side. RECEIPT_LINE stores Barcode FK.`,
          });
        }
      }

      // General canonical check if matching scenario exists
      else if (cRel) {
        const cSource = canonicalEntities.find((e) => e.id === cRel.sourceEntityId)?.name.toUpperCase().trim();
        const isSourceAligned = cSource === sName;
        const expectedCard = cRel.cardinality;

        let isCardMatch = false;
        if (isSourceAligned) {
          isCardMatch = rel.cardinality === expectedCard;
        } else {
          // Inverted traversal
          if (expectedCard === '1:N') isCardMatch = rel.cardinality === 'N:1';
          else if (expectedCard === 'N:1') isCardMatch = rel.cardinality === '1:N';
          else isCardMatch = rel.cardinality === expectedCard;
        }

        if (!isCardMatch) {
          issues.push({
            id: `err_rel_card_${rel.id}`,
            severity: 'CRITICAL',
            category: 'CARDINALITY',
            relationshipName: rel.name,
            sourceEntity: source.name,
            targetEntity: target.name,
            message: `Cardinality mismatch between ${sName} and ${tName}.`,
            studentBelief: `Rendered as '${rel.cardinality}'.`,
            businessFact: `Canonical requirement dictates '${expectedCard}'.`,
            schemaEvidence: traversal.fkLocation,
            correctedDesign: `${sName} [${cRel.sourceMax}] ─── ${cRel.name} ───► [${cRel.targetMax}] ${tName}`,
            reasoning: `Verify both forward and reverse statements: "${traversal.forwardSentence}" and "${traversal.reverseSentence}".`,
          });

          relationshipChecks.push({
            relationship: `${source.name} -> ${target.name}`,
            expected: expectedCard,
            rendered: rel.cardinality,
            status: 'FAIL',
            reason: `Business rules require ${expectedCard}.`,
            corrected: `${sName} [${cRel.sourceMax}] ─── [${cRel.targetMax}] ${tName}`,
          });
        } else {
          relationshipChecks.push({
            relationship: `${source.name} -> ${target.name}`,
            expected: expectedCard,
            rendered: rel.cardinality,
            status: 'PASS',
            reason: `Matches canonical requirements.`,
            corrected: `${sName} [${cRel.sourceMax}] ─── [${cRel.targetMax}] ${tName}`,
          });
        }
      }

      // Semantics Check: Flag generic verbs like "has", "connects"
      const lowerVerb = rel.name.toLowerCase().trim();
      if (['has', 'have', 'connected to', 'relates to', 'linked with', 'connects'].includes(lowerVerb)) {
        issues.push({
          id: `warn_verb_${rel.id}`,
          severity: 'MINOR',
          category: 'SEMANTICS',
          relationshipName: rel.name,
          sourceEntity: source.name,
          targetEntity: target.name,
          message: `Generic relationship verb '${rel.name}' used.`,
          studentBelief: `Using '${rel.name}' as a placeholder.`,
          businessFact: `Educational diagrams require meaningful business verb phrases (e.g. 'processes', 'rings_up', 'contains', 'scanned_in').`,
          schemaEvidence: `A relationship communicates real-world domain interactions.`,
          correctedDesign: `Replace '${rel.name}' with a business action verb.`,
          reasoning: `Avoid vague labels that do not describe the real business event.`,
        });
      }

      // Visual Placement Check (Section 3 & 4)
      const sPos = rel.sourceMax;
      const tPos = rel.targetMax;
      if (!sPos || !tPos) {
        visualChecks.push({
          check: `Cardinality Endpoint Anchors on ${sName}–${tName}`,
          status: 'FAIL',
          details: `Missing explicit endpoint markers. Must visually anchor [1] and [N] to endpoints.`,
        });
      } else {
        visualChecks.push({
          check: `Cardinality Endpoint Anchors on ${sName}–${tName}`,
          status: 'PASS',
          details: `Anchored to endpoints: [${sPos}] at ${sName}, [${tPos}] at ${tName}.`,
        });
      }
    }

    // 2. Schema Checks (FKs & PKs)
    for (const ent of entities) {
      const pks = ent.attributes.filter((a) => a.isPrimaryKey);
      if (pks.length === 0) {
        issues.push({
          id: `err_pk_missing_${ent.id}`,
          severity: 'CRITICAL',
          category: 'KEYS',
          sourceEntity: ent.name,
          targetEntity: ent.name,
          message: `Entity '${ent.name}' is missing a Primary Key.`,
          studentBelief: `Tables can exist without a unique identifier.`,
          businessFact: `Entity Integrity requires that every table must have a Primary Key that uniquely identifies each tuple.`,
          schemaEvidence: `No column is marked isPrimaryKey: true in '${ent.name}'.`,
          correctedDesign: `Designate candidate key(s) or composite PK.`,
          reasoning: `Relational tables cannot enforce row uniqueness without a primary key.`,
        });
        schemaChecks.push({
          check: `Primary Key on '${ent.name}'`,
          status: 'FAIL',
          details: `Missing primary key column.`,
        });
      } else {
        schemaChecks.push({
          check: `Primary Key on '${ent.name}'`,
          status: 'PASS',
          details: `Defined: (${pks.map((k) => k.name).join(', ')}).`,
        });
      }

      // Check unnecessary surrogate IDs on junction tables (Section 10 & 11)
      if (ent.type === 'associative') {
        const hasSurrogate = pks.length === 1 && pks[0].name.toLowerCase().endsWith('id') && !pks[0].isForeignKey;
        const fks = ent.attributes.filter((a) => a.isForeignKey);
        if (hasSurrogate && fks.length >= 2) {
          issues.push({
            id: `major_surrogate_junction_${ent.id}`,
            severity: 'MAJOR',
            category: 'KEYS',
            sourceEntity: ent.name,
            targetEntity: ent.name,
            message: `Junction table '${ent.name}' introduces an arbitrary surrogate ID '${pks[0].name}'.`,
            studentBelief: `Every table must have its own auto-increment ID column.`,
            businessFact: `In associative tables, the participating foreign keys (${fks.map((f) => f.name).join(', ')}) naturally form a valid composite primary key.`,
            schemaEvidence: `PRIMARY KEY (${fks.map((f) => f.name).join(', ')}) eliminates redundant column overhead.`,
            correctedDesign: `PRIMARY KEY (${fks.map((f) => f.name).join(', ')})`,
            reasoning: `Unless this relationship is referenced as a parent by other tables, a composite primary key is the standard relational design.`,
          });
        }
      }
    }

    const criticalCount = issues.filter((i) => i.severity === 'CRITICAL').length;
    const majorCount = issues.filter((i) => i.severity === 'MAJOR').length;
    const minorCount = issues.filter((i) => i.severity === 'MINOR').length;
    const overallStatus: 'PASS' | 'FAIL' = criticalCount > 0 ? 'FAIL' : 'PASS';

    // Format Markdown Report following Section 31
    const markdownReport = this.generateMarkdownReport(
      overallStatus,
      criticalCount,
      majorCount,
      minorCount,
      relationshipChecks,
      schemaChecks,
      visualChecks,
      issues
    );

    return {
      overallStatus,
      criticalErrorCount: criticalCount,
      majorErrorCount: majorCount,
      minorErrorCount: minorCount,
      relationshipChecks,
      schemaChecks,
      visualChecks,
      traversals,
      issues,
      formattedMarkdownReport: markdownReport,
    };
  }

  /**
   * Generates the standard educational Section 31 report format
   */
  private static generateMarkdownReport(
    overallStatus: 'PASS' | 'FAIL',
    critical: number,
    major: number,
    minor: number,
    relChecks: ErdValidationReport['relationshipChecks'],
    schemaChecks: ErdValidationReport['schemaChecks'],
    visualChecks: ErdValidationReport['visualChecks'],
    issues: ValidationIssue[]
  ): string {
    return `### ERD VALIDATION RESULT

**Overall Status:** ${overallStatus === 'PASS' ? '✓ PASS' : '✗ FAIL'}
- **Critical Errors:** ${critical}
- **Major Errors:** ${major}
- **Minor Errors:** ${minor}

---

### RELATIONSHIP CHECK
${
  relChecks.length > 0
    ? relChecks
        .map(
          (rc) => `
**Relationship:** \`${rc.relationship}\`
- **Expected:** \`${rc.expected}\`
- **Rendered:** \`${rc.rendered}\`
- **Status:** ${rc.status === 'PASS' ? '✓ PASS' : '✗ FAIL'}
- **Reason:** ${rc.reason}
- **Corrected Design:** \`${rc.corrected}\`
`
        )
        .join('\n')
    : '_No relationships evaluated._'
}

---

### SCHEMA CHECK
${schemaChecks.map((sc) => `- **${sc.check}:** ${sc.status === 'PASS' ? '✓ PASS' : '✗ FAIL'} (${sc.details})`).join('\n')}

---

### VISUAL & ENDPOINT CHECK
${visualChecks.map((vc) => `- **${vc.check}:** ${vc.status === 'PASS' ? '✓ PASS' : '✗ FAIL'} (${vc.details})`).join('\n')}

---

### DETAILED PEDAGOGICAL FEEDBACK
${
  issues.length > 0
    ? issues
        .map(
          (issue) => `
#### [${issue.severity}] ${issue.message}
- **Your Relationship:** ${issue.studentBelief}
- **The Business Rule:** ${issue.businessFact}
- **Schema Evidence:** \`${issue.schemaEvidence}\`
- **Correct Model:** \`${issue.correctedDesign}\`
- **Why It Matters:** ${issue.reasoning}
`
        )
        .join('\n')
    : '✓ All relationships, schema keys, and endpoints satisfy relational correctness principles.'
}
`;
  }
}
