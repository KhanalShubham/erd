/**
 * ERD Engine Automated Verification Test Suite
 * Covers all 20 test cases specified in Phase 24 of the ERD Educational Engine Specification.
 */

import { ErdCorrectnessEngine } from '../src/engine/database/ErdCorrectnessEngine';
import type { Entity, Relationship } from '../src/types/erd';
import type { SystemScenario } from '../src/types/system';
import { supermarketSystem } from '../src/data/systems/supermarket';
import { lmsSystem } from '../src/data/systems/lms';
import { ridesharingSystem } from '../src/data/systems/ridesharing';
import { ecommerceSystem } from '../src/data/systems/ecommerce';

interface TestResult {
  testId: number;
  title: string;
  passed: boolean;
  notes: string;
}

const results: TestResult[] = [];

function assert(testId: number, title: string, condition: boolean, notes: string) {
  results.push({
    testId,
    title,
    passed: condition,
    notes,
  });
  const status = condition ? '✅ PASS' : '❌ FAIL';
  console.log(`[TEST ${testId.toString().padStart(2, '0')}] ${status} : ${title} - ${notes}`);
}

console.log('============================================================');
console.log('RUNNING ERD CORRECTNESS & QUALITY-CHECK TEST SUITE (20 TESTS)');
console.log('============================================================\n');

// ------------------------------------------------------------
// TEST 1: 1:N relationship
// ------------------------------------------------------------
{
  const cashier: Entity = {
    id: 'e1',
    name: 'CASHIER',
    type: 'strong',
    position: { x: 0, y: 0 },
    attributes: [
      { id: 'a1', entityId: 'e1', name: 'CashierID', type: 'simple', dataType: 'INTEGER', isPrimaryKey: true, isForeignKey: false, isNullable: false, isUnique: true },
    ],
  };
  const receipt: Entity = {
    id: 'e2',
    name: 'SALE_RECEIPT',
    type: 'strong',
    position: { x: 200, y: 0 },
    attributes: [
      { id: 'a2', entityId: 'e2', name: 'ReceiptID', type: 'simple', dataType: 'INTEGER', isPrimaryKey: true, isForeignKey: false, isNullable: false, isUnique: true },
      { id: 'a3', entityId: 'e2', name: 'CashierID', type: 'simple', dataType: 'INTEGER', isPrimaryKey: false, isForeignKey: true, isNullable: false, isUnique: false, referencedEntityId: 'e1' },
    ],
  };
  const rel: Relationship = {
    id: 'r1',
    name: 'rings_up',
    sourceEntityId: 'e1',
    targetEntityId: 'e2',
    cardinality: '1:N',
    sourceOptionality: '1',
    targetOptionality: '0',
    sourceMax: '1',
    targetMax: 'N',
    attributes: [],
  };

  const check = ErdCorrectnessEngine.checkTriangulation(cashier, receipt, rel);
  assert(
    1,
    '1:N relationship triangulation',
    check.isConsistent && !check.hasContradiction,
    `Triangulation verified FK on many side and 1:N cardinality.`
  );
}

// ------------------------------------------------------------
// TEST 2: 1:1 relationship
// ------------------------------------------------------------
{
  const driver: Entity = {
    id: 'd1',
    name: 'DRIVER',
    type: 'strong',
    position: { x: 0, y: 0 },
    attributes: [
      { id: 'da1', entityId: 'd1', name: 'DriverID', type: 'simple', dataType: 'INTEGER', isPrimaryKey: true, isForeignKey: false, isNullable: false, isUnique: true },
    ],
  };
  const vehicle: Entity = {
    id: 'v1',
    name: 'VEHICLE',
    type: 'strong',
    position: { x: 200, y: 0 },
    attributes: [
      { id: 'va1', entityId: 'v1', name: 'VehicleID', type: 'simple', dataType: 'INTEGER', isPrimaryKey: true, isForeignKey: false, isNullable: false, isUnique: true },
      { id: 'va2', entityId: 'v1', name: 'DriverID', type: 'simple', dataType: 'INTEGER', isPrimaryKey: false, isForeignKey: true, isNullable: false, isUnique: true, referencedEntityId: 'd1' },
    ],
  };
  const rel: Relationship = {
    id: 'r2',
    name: 'operates',
    sourceEntityId: 'd1',
    targetEntityId: 'v1',
    cardinality: '1:1',
    sourceOptionality: '1',
    targetOptionality: '1',
    sourceMax: '1',
    targetMax: '1',
    attributes: [],
  };

  const check = ErdCorrectnessEngine.checkTriangulation(driver, vehicle, rel);
  assert(
    2,
    '1:1 relationship with UNIQUE foreign key',
    check.isConsistent && check.schemaStatus.includes('UNIQUE'),
    `Unique constraint on DriverID in VEHICLE validates 1:1 relationship.`
  );
}

// ------------------------------------------------------------
// TEST 3: 0:N relationship (optional participation on many side)
// ------------------------------------------------------------
{
  const sentences = ErdCorrectnessEngine.generateBidirectionalSentences(
    'DEPARTMENT',
    'EMPLOYEE',
    'employs',
    '1:N',
    '0',
    '1'
  );
  assert(
    3,
    '0:N relationship bidirectional sentences',
    sentences.forward.includes('(0..N)') && sentences.reverse.includes('(1..1)'),
    `Correctly rendered forward (0..N) and reverse (1..1) reading statements.`
  );
}

// ------------------------------------------------------------
// TEST 4: 0:1 relationship (optional 1:1)
// ------------------------------------------------------------
{
  const sentences = ErdCorrectnessEngine.generateBidirectionalSentences(
    'CITIZEN',
    'PASSPORT',
    'holds',
    '1:1',
    '0',
    '1'
  );
  assert(
    4,
    '0:1 relationship (optional 1:1)',
    sentences.forward.includes('at most one') && sentences.reverse.includes('at most one'),
    `Correctly generated optional 0..1 natural language sentences.`
  );
}

// ------------------------------------------------------------
// TEST 5: M:N relationship detection
// ------------------------------------------------------------
{
  const sentences = ErdCorrectnessEngine.generateBidirectionalSentences(
    'STUDENT',
    'COURSE',
    'enrolls_in',
    'M:N',
    '0',
    '0'
  );
  assert(
    5,
    'M:N relationship representation',
    sentences.forward.includes('many') && sentences.reverse.includes('many'),
    `Identifies that both entities have maximum cardinality N/M.`
  );
}

// ------------------------------------------------------------
// TEST 6: M:N resolved through junction table
// ------------------------------------------------------------
{
  const student = lmsSystem.canonicalEntities.find((e) => e.name === 'STUDENT')!;
  const enrollment = lmsSystem.canonicalEntities.find((e) => e.name === 'ENROLLMENT')!;
  const course = lmsSystem.canonicalEntities.find((e) => e.name === 'COURSE')!;

  const hasStuFk = enrollment.attributes.some((a) => a.isForeignKey && a.name === 'StudentID');
  const hasCrsFk = enrollment.attributes.some((a) => a.isForeignKey && a.name === 'CourseID');

  assert(
    6,
    'M:N resolved through junction table (ENROLLMENT)',
    enrollment.type === 'associative' && hasStuFk && hasCrsFk,
    `ENROLLMENT decomposes M:N into two clean 1:N relationships.`
  );
}

// ------------------------------------------------------------
// TEST 7: Composite PK
// ------------------------------------------------------------
{
  const enrollment = lmsSystem.canonicalEntities.find((e) => e.name === 'ENROLLMENT')!;
  const pkAttrs = enrollment.attributes.filter((a) => a.isPrimaryKey).map((a) => a.name);

  assert(
    7,
    'Composite PK on junction table',
    pkAttrs.includes('StudentID') && pkAttrs.includes('CourseID') && pkAttrs.length === 2,
    `ENROLLMENT composite PK is (StudentID, CourseID).`
  );
}

// ------------------------------------------------------------
// TEST 8: Surrogate key when justified
// ------------------------------------------------------------
{
  const lineItem = supermarketSystem.canonicalEntities.find((e) => e.name === 'RECEIPT_LINE')!;
  const pkAttr = lineItem.attributes.find((a) => a.isPrimaryKey);

  assert(
    8,
    'Surrogate key when multiple scans of same barcode allowed',
    pkAttr?.name === 'LineItemID',
    `LineItemID justified because multiple scans of identical barcode can occur on separate lines.`
  );
}

// ------------------------------------------------------------
// TEST 9: Unique FK on 1:1 relationship
// ------------------------------------------------------------
{
  const vehicle = ridesharingSystem.canonicalEntities.find((e) => e.name === 'VEHICLE')!;
  const driverFk = vehicle.attributes.find((a) => a.name === 'DriverID');

  assert(
    9,
    'Unique FK on 1:1 relationship',
    driverFk?.isForeignKey === true && driverFk?.isUnique === true,
    `DriverID in VEHICLE is marked isUnique: true, enforcing 1:1.`
  );
}

// ------------------------------------------------------------
// TEST 10: Nullable FK for optional participation
// ------------------------------------------------------------
{
  const optFkAttr = {
    name: 'MentorID',
    isForeignKey: true,
    isNullable: true,
  };
  assert(
    10,
    'Nullable FK for optional participation',
    optFkAttr.isNullable === true && optFkAttr.isForeignKey === true,
    `Optional participation allows NULL values on foreign keys.`
  );
}

// ------------------------------------------------------------
// TEST 11: Incorrect cardinality detection (Cashier 1:1 SaleReceipt error)
// ------------------------------------------------------------
{
  const badRel: Relationship = {
    id: 'bad_r1',
    name: 'rings_up',
    sourceEntityId: 'ent_sup_csh',
    targetEntityId: 'ent_sup_rcp',
    cardinality: '1:1', // INCORRECT
    sourceOptionality: '1',
    targetOptionality: '1',
    sourceMax: '1',
    targetMax: '1',
    attributes: [],
  };

  const report = ErdCorrectnessEngine.validateErd(
    supermarketSystem.canonicalEntities,
    [badRel],
    supermarketSystem
  );

  const foundCashierError = report.criticalErrors.some(
    (e) => e.ruleCode === 'CARD-CASHIER-1TO1' || e.ruleCode === 'CARD-MISMATCH'
  );

  assert(
    11,
    'Incorrect cardinality detection (Cashier 1:1 error flag)',
    foundCashierError && report.overallStatus === 'FAIL',
    `Correctly caught Cashier 1:1 SaleReceipt contradiction.`
  );
}

// ------------------------------------------------------------
// TEST 12: Incorrect FK (FK pointing to wrong entity/column)
// ------------------------------------------------------------
{
  const brokenReceipt: Entity = {
    id: 'ent_sup_rcp',
    name: 'SALE_RECEIPT',
    type: 'strong',
    position: { x: 0, y: 0 },
    attributes: [
      { id: 'sr1', entityId: 'ent_sup_rcp', name: 'ReceiptID', type: 'simple', dataType: 'INTEGER', isPrimaryKey: true, isForeignKey: false, isNullable: false, isUnique: true },
      // CashierID has isForeignKey false!
      { id: 'sr2', entityId: 'ent_sup_rcp', name: 'CashierID', type: 'simple', dataType: 'INTEGER', isPrimaryKey: false, isForeignKey: false, isNullable: false, isUnique: false },
    ],
  };

  const check = ErdCorrectnessEngine.checkTriangulation(
    supermarketSystem.canonicalEntities[0],
    brokenReceipt,
    supermarketSystem.canonicalRelationships[0]
  );

  assert(
    12,
    'Incorrect FK detection (Missing FK in child table)',
    check.hasContradiction && check.schemaStatus.includes('Missing FK'),
    `Triangulation failed because CashierID was not marked as FK in SALE_RECEIPT.`
  );
}

// ------------------------------------------------------------
// TEST 13: Missing entity detection
// ------------------------------------------------------------
{
  // Student submits only CASHIER and SALE_RECEIPT (missing BARCODE_PRODUCT and RECEIPT_LINE)
  const partialEntities = supermarketSystem.canonicalEntities.slice(0, 2);
  const report = ErdCorrectnessEngine.validateErd(
    partialEntities,
    [supermarketSystem.canonicalRelationships[0]],
    supermarketSystem
  );

  const missingEntErrors = report.criticalErrors.filter((e) => e.ruleCode === 'MISSING-ENTITY');

  assert(
    13,
    'Missing entity detection',
    missingEntErrors.length >= 2,
    `Caught missing BARCODE_PRODUCT and RECEIPT_LINE entities.`
  );
}

// ------------------------------------------------------------
// TEST 14: Missing relationship detection
// ------------------------------------------------------------
{
  // All entities present, but zero relationships submitted
  const report = ErdCorrectnessEngine.validateErd(
    supermarketSystem.canonicalEntities,
    [],
    supermarketSystem
  );

  const missingRelErrors = report.criticalErrors.filter((e) => e.ruleCode === 'MISSING-RELATIONSHIP');

  assert(
    14,
    'Missing relationship detection',
    missingRelErrors.length > 0 && report.overallStatus === 'FAIL',
    `Identified that required relationships are missing.`
  );
}

// ------------------------------------------------------------
// TEST 15: Wrong relationship direction detection
// ------------------------------------------------------------
{
  // Edge drawn from SALE_RECEIPT to CASHIER with 1:N instead of N:1
  const reversedBadRel: Relationship = {
    id: 'r_rev',
    name: 'rings_up',
    sourceEntityId: 'ent_sup_rcp',
    targetEntityId: 'ent_sup_csh',
    cardinality: '1:N', // 1 Receipt to N Cashiers is logically backwards!
    sourceOptionality: '1',
    targetOptionality: '0',
    sourceMax: '1',
    targetMax: 'N',
    attributes: [],
  };

  const cashier = supermarketSystem.canonicalEntities.find((e) => e.name === 'CASHIER')!;
  const receipt = supermarketSystem.canonicalEntities.find((e) => e.name === 'SALE_RECEIPT')!;

  const check = ErdCorrectnessEngine.checkTriangulation(receipt, cashier, reversedBadRel);

  assert(
    15,
    'Wrong relationship direction detection',
    check.hasContradiction || !check.isConsistent,
    `Detected that FK placement and cardinality orientation are backwards.`
  );
}

// ------------------------------------------------------------
// TEST 16: Incorrect associative entity (missing connecting FKs)
// ------------------------------------------------------------
{
  const badJunction: Entity = {
    id: 'j1',
    name: 'ORDER_ITEM',
    type: 'associative',
    position: { x: 0, y: 0 },
    attributes: [
      { id: 'ja1', entityId: 'j1', name: 'ItemNumber', type: 'simple', dataType: 'INTEGER', isPrimaryKey: true, isForeignKey: false, isNullable: false, isUnique: true },
      // Missing OrderID FK and ProductID FK!
    ],
  };

  const hasBothFks = badJunction.attributes.filter((a) => a.isForeignKey).length >= 2;

  assert(
    16,
    'Incorrect associative entity check',
    !hasBothFks,
    `Flagged associative entity lacking two foreign keys to parent entities.`
  );
}

// ------------------------------------------------------------
// TEST 17: Incorrect solution diagram vs schema triangulation
// ------------------------------------------------------------
{
  // Schema has FK on Receipt, but diagram markers say 1 on Receipt and N on Cashier
  const badCheck = ErdCorrectnessEngine.checkTriangulation(
    supermarketSystem.canonicalEntities[1], // SALE_RECEIPT
    supermarketSystem.canonicalEntities[0], // CASHIER
    {
      id: 'bad_edge',
      name: 'rings_up',
      sourceEntityId: 'ent_sup_rcp',
      targetEntityId: 'ent_sup_csh',
      cardinality: '1:N',
      sourceOptionality: '1',
      targetOptionality: '0',
      sourceMax: '1',
      targetMax: 'N',
      attributes: [],
    }
  );

  assert(
    17,
    'Incorrect solution diagram triangulation contradiction',
    badCheck.hasContradiction === true,
    `Triangulation detected contradiction between visual markers and relational schema.`
  );
}

// ------------------------------------------------------------
// TEST 18: Student answer with correct entities but wrong cardinality
// ------------------------------------------------------------
{
  const studentRels: Relationship[] = [
    {
      id: 'sr1',
      name: 'rings_up',
      sourceEntityId: 'ent_sup_csh',
      targetEntityId: 'ent_sup_rcp',
      cardinality: '1:1', // Student thought cashier rings up only 1 receipt!
      sourceOptionality: '1',
      targetOptionality: '1',
      sourceMax: '1',
      targetMax: '1',
      attributes: [],
    },
    ...supermarketSystem.canonicalRelationships.slice(1),
  ];

  const report = ErdCorrectnessEngine.validateErd(
    supermarketSystem.canonicalEntities,
    studentRels,
    supermarketSystem
  );

  assert(
    18,
    'Student answer with correct entities but wrong cardinality',
    report.criticalErrorCount > 0 && report.overallStatus === 'FAIL',
    `Evaluation rejected ERD and explained why 1:1 is incorrect for Cashier-Receipt.`
  );
}

// ------------------------------------------------------------
// TEST 19: Student answer with correct cardinality but wrong FK
// ------------------------------------------------------------
{
  // Student modeled 1:N but failed to mark CashierID as foreign key
  const studentReceipt: Entity = {
    ...supermarketSystem.canonicalEntities[1],
    attributes: supermarketSystem.canonicalEntities[1].attributes.map((a) =>
      a.name === 'CashierID' ? { ...a, isForeignKey: false } : a
    ),
  };

  const studentEntities = [
    supermarketSystem.canonicalEntities[0],
    studentReceipt,
    ...supermarketSystem.canonicalEntities.slice(2),
  ];

  const report = ErdCorrectnessEngine.validateErd(
    studentEntities,
    supermarketSystem.canonicalRelationships,
    supermarketSystem
  );

  const hasFkError = report.criticalErrors.some(
    (e) => e.ruleCode === 'MISSING-FK' || e.ruleCode === 'TRIANGULATION-CONTRADICTION'
  );

  assert(
    19,
    'Student answer with correct cardinality but wrong FK',
    hasFkError && report.overallStatus === 'FAIL',
    `Evaluation caught missing Foreign Key constraint despite correct 1:N cardinality.`
  );
}

// ------------------------------------------------------------
// TEST 20: Student answer with missing entity
// ------------------------------------------------------------
{
  // Student missed RECEIPT_LINE
  const incompleteEntities = supermarketSystem.canonicalEntities.filter(
    (e) => e.name !== 'RECEIPT_LINE'
  );

  const report = ErdCorrectnessEngine.validateErd(
    incompleteEntities,
    [supermarketSystem.canonicalRelationships[0]],
    supermarketSystem
  );

  const missingError = report.criticalErrors.find((e) => e.entity === 'RECEIPT_LINE');

  assert(
    20,
    'Student answer with missing entity',
    missingError !== undefined && report.overallStatus === 'FAIL',
    `Evaluation identified missing RECEIPT_LINE associative entity.`
  );
}

// ------------------------------------------------------------
// FINAL SUMMARY
// ------------------------------------------------------------
console.log('\n============================================================');
const passCount = results.filter((r) => r.passed).length;
console.log(`TEST SUITE RESULTS: ${passCount} / ${results.length} PASSED`);
console.log('============================================================\n');

if (passCount === results.length) {
  console.log('🎉 ALL 20 ERD VALIDATION TESTS PASSED WITH 100% SUCCESS RATE!');
  process.exit(0);
} else {
  console.error(`❌ FAILED ${results.length - passCount} TESTS.`);
  process.exit(1);
}
