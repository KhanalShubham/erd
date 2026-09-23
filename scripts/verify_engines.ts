import { RelationalEngine } from '../src/engine/database/RelationalEngine.ts';
import { ConstraintValidator } from '../src/engine/database/ConstraintValidator.ts';
import { SqlGenerator } from '../src/engine/sql/SqlGenerator.ts';
import { systemsCatalog } from '../src/data/systems/index.ts';
import type { Entity, Relationship } from '../src/types/erd.ts';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${message}`);
}

console.log('\n--- 1. Testing RelationalEngine ---');

// Test 1: 1:N relationship foreign key placement
const deptEntity: Entity = {
  id: 'ent_dept',
  name: 'Department',
  type: 'strong',
  attributes: [
    { id: 'attr_d1', entityId: 'ent_dept', type: 'simple', name: 'dept_id', dataType: 'INTEGER', isPrimaryKey: true, isNullable: false, isUnique: true, isForeignKey: false },
    { id: 'attr_d2', entityId: 'ent_dept', type: 'simple', name: 'dept_name', dataType: 'VARCHAR', isPrimaryKey: false, isNullable: false, isUnique: false, isForeignKey: false },
  ],
  position: { x: 0, y: 0 },
};

const empEntity: Entity = {
  id: 'ent_emp',
  name: 'Employee',
  type: 'strong',
  attributes: [
    { id: 'attr_e1', entityId: 'ent_emp', type: 'simple', name: 'emp_id', dataType: 'INTEGER', isPrimaryKey: true, isNullable: false, isUnique: true, isForeignKey: false },
    { id: 'attr_e2', entityId: 'ent_emp', type: 'simple', name: 'emp_name', dataType: 'VARCHAR', isPrimaryKey: false, isNullable: false, isUnique: false, isForeignKey: false },
  ],
  position: { x: 200, y: 0 },
};

const relDeptEmp: Relationship = {
  id: 'rel_dept_emp',
  name: 'Employs',
  sourceEntityId: 'ent_dept',
  targetEntityId: 'ent_emp',
  cardinality: '1:N',
  sourceOptionality: '1',
  targetOptionality: '0',
  sourceMax: '1',
  targetMax: 'N',
  attributes: [],
};

const tables1N = RelationalEngine.generateRelationalSchema([deptEntity, empEntity], [relDeptEmp]);
assert(tables1N.length === 2, '1:N generates exactly 2 tables');
const empTable = tables1N.find((t) => t.name === 'Employee');
assert(!!empTable, 'Employee table exists');
const fkCol = empTable?.columns.find((c) => c.isForeignKey);
assert(!!fkCol && fkCol.name === 'dept_id', 'Employee table contains migrated foreign key dept_id');
assert(empTable?.foreignKeys.length === 1, 'Employee table has 1 foreign key constraint');
assert(empTable?.foreignKeys[0].referencedTable === 'Department', 'FK references Department');

// Test 2: M:N relationship junction table creation
const studentEntity: Entity = {
  id: 'ent_student',
  name: 'Student',
  type: 'strong',
  attributes: [
    { id: 'attr_s1', entityId: 'ent_student', type: 'simple', name: 'student_id', dataType: 'INTEGER', isPrimaryKey: true, isNullable: false, isUnique: true, isForeignKey: false },
  ],
  position: { x: 0, y: 0 },
};

const courseEntity: Entity = {
  id: 'ent_course',
  name: 'Course',
  type: 'strong',
  attributes: [
    { id: 'attr_c1', entityId: 'ent_course', type: 'simple', name: 'course_id', dataType: 'INTEGER', isPrimaryKey: true, isNullable: false, isUnique: true, isForeignKey: false },
  ],
  position: { x: 200, y: 0 },
};

const relStudentCourse: Relationship = {
  id: 'rel_enroll',
  name: 'Enrolls',
  sourceEntityId: 'ent_student',
  targetEntityId: 'ent_course',
  cardinality: 'M:N',
  sourceOptionality: '1',
  targetOptionality: '0',
  sourceMax: 'N',
  targetMax: 'N',
  attributes: [],
};

const tablesMN = RelationalEngine.generateRelationalSchema([studentEntity, courseEntity], [relStudentCourse]);
assert(tablesMN.length === 3, 'M:N generates 3 tables (2 entity tables + 1 junction table)');
const junction = tablesMN.find((t) => t.name.includes('_') || t.name === 'student_course');
assert(!!junction, 'Junction table created for M:N');
const junctionPk = junction?.columns.filter((c) => c.isPrimaryKey);
assert(junctionPk?.length === 1, 'Junction table has exactly 1 Primary Key');
const junctionFks = junction?.columns.filter((c) => c.isForeignKey);
assert(junctionFks?.length === 2, 'Junction table has 2 Foreign Keys referencing participating tables');

console.log('\n--- 2. Testing ConstraintValidator ---');

// Primary Key Unique Check
const pkError = ConstraintValidator.validateRow(
  empTable!,
  { emp_id: '1', emp_name: 'Alice', dept_id: '10' },
  tables1N,
  {
    Employee: [{ emp_id: '1', emp_name: 'Bob', dept_id: '10' }],
    Department: [{ dept_id: '10', dept_name: 'Engineering' }],
  }
);
assert(pkError !== null && pkError.type === 'PRIMARY_KEY', 'Catches duplicate Primary Key violation');

// Foreign Key Referential Integrity Check
const fkError = ConstraintValidator.validateRow(
  empTable!,
  { emp_id: '2', emp_name: 'Charlie', dept_id: '999' },
  tables1N,
  {
    Employee: [],
    Department: [{ dept_id: '10', dept_name: 'Engineering' }],
  }
);
assert(fkError !== null && fkError.type === 'FOREIGN_KEY', 'Catches Foreign Key referential integrity violation');

// Not Null Check
const notNullError = ConstraintValidator.validateRow(
  empTable!,
  { emp_id: '3', emp_name: '', dept_id: '10' },
  tables1N,
  {
    Employee: [],
    Department: [{ dept_id: '10', dept_name: 'Engineering' }],
  }
);
assert(notNullError !== null && notNullError.type === 'NOT_NULL', 'Catches NOT NULL constraint violation');

console.log('\n--- 3. Testing SqlGenerator ---');
const pgSql = SqlGenerator.generateDDL(tables1N, 'PostgreSQL');
assert(pgSql.includes('CREATE TABLE "Department"'), 'PostgreSQL DDL creates Department');
assert(pgSql.includes('CREATE TABLE "Employee"'), 'PostgreSQL DDL creates Employee');
assert(pgSql.includes('FOREIGN KEY ("dept_id") REFERENCES "Department"'), 'PostgreSQL DDL has valid FOREIGN KEY reference');

const mysqlSql = SqlGenerator.generateDDL(tables1N, 'MySQL');
assert(mysqlSql.includes('CREATE TABLE `Department`'), 'MySQL DDL uses backtick escaping');

const sqliteSql = SqlGenerator.generateDDL(tables1N, 'SQLite');
assert(sqliteSql.includes('CREATE TABLE "Department"'), 'SQLite DDL generated properly');

console.log('\n--- 4. Testing 15 Real-World Scenarios Catalog & Key Invariants ---');
assert(systemsCatalog.length === 15, `Catalog contains 15 scenarios (found ${systemsCatalog.length})`);
for (const sys of systemsCatalog) {
  assert(sys.canonicalEntities.length > 0, `Scenario "${sys.name}" has canonical entities`);
  assert(sys.requirements.length >= 3, `Scenario "${sys.name}" has at least 3 requirements`);
  assert(!!sys.sampleData, `Scenario "${sys.name}" has sample data`);

  // Verify Single Primary Key Invariant across all canonical entities
  for (const ent of sys.canonicalEntities) {
    const pks = ent.attributes.filter((a) => a.isPrimaryKey);
    assert(pks.length === 1, `[${sys.id}] Entity "${ent.name}" must have strictly 1 Primary Key (found ${pks.length}: ${pks.map(p => p.name).join(', ')})`);

    const both = ent.attributes.filter((a) => a.isPrimaryKey && a.isForeignKey);
    assert(both.length === 0, `[${sys.id}] Entity "${ent.name}" cannot have attributes marked as both PK and FK (found: ${both.map(b => b.name).join(', ')})`);
  }

  // Verify Single Primary Key Invariant across all generated relational tables
  const generatedTables = RelationalEngine.generateRelationalSchema(sys.canonicalEntities, sys.canonicalRelationships);
  for (const table of generatedTables) {
    assert(table.primaryKey.length === 1, `[${sys.id}] Relational Table "${table.name}" must have strictly 1 Primary Key (found ${table.primaryKey.length}: ${table.primaryKey.join(', ')})`);
  }
}

console.log('\n🎉 ALL TESTS AND KEY INVARIANTS PASSED SUCCESSFULLY!\n');
