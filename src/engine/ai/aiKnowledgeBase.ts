// ============================================================================
// AI Knowledge Base & Context Engine for Interactive ERD Learning Notebook
// Provides structured database concepts, real-world analogies, common
// misconceptions, Socratic dialogue trees, canonical lab solutions (Q6-Q10),
// primary key decision strategy, and contextual relational explanations.
//
// CRITICAL DATABASE MODELING CONSTRAINT:
// Never add a separate ID column to a junction/associative table unless the
// business rules require an independently identifiable relationship row.
// First test whether the participating foreign keys form a composite primary key.
// A composite primary key is a complete, first-class, valid primary key.
// ============================================================================

export interface ConceptExplanation {
  concept: string;
  badge: string;
  definition: string;
  whyThisElement: string[];
  visualDiagram: string;
  realWorldAnalogy: {
    title: string;
    description: string;
  };
  rules: string[];
  commonMisconception?: {
    myth: string;
    correction: string;
  };
  interactiveExperiment?: {
    title: string;
    buttonLabel: string;
    description: string;
    testType: 'duplicate_pk' | 'orphan_fk' | 'null_violation' | 'resolve_mn';
  };
}

export interface MisconceptionItem {
  id: string;
  myth: string;
  whyItsFalse: string;
  correctPrinciple: string;
  example: string;
  category: 'Keys' | 'Relationships' | 'Constraints' | 'Entities';
}

export interface SocraticStep {
  id: number;
  question: string;
  context: string;
  options: {
    label: string;
    feedback: string;
    isOptimal: boolean;
    explanation: string;
  }[];
}

export interface LabSolution {
  id: 'Q6' | 'Q7' | 'Q8' | 'Q9' | 'Q10';
  title: string;
  domain: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  scenario: string;
  businessRules: string[];
  entities: string[];
  junctionTables: string[];
  pkJustification: string;
  mermaid: string;
  sqlDdl: string;
  testQueries: string;
  checklist: string[];
}

// ----------------------------------------------------------------------------
// 1. Structured Concept Catalog
// ----------------------------------------------------------------------------

export const CONCEPT_CATALOG = {
  primaryKey: (attrName: string, tableName: string): ConceptExplanation => ({
    concept: 'Primary Key (PK)',
    badge: '🔑 Primary Key',
    definition:
      'A Primary Key (PK) is a column (or set of columns) that UNIQUELY IDENTIFIES each row in a table. No two rows can have the same primary key value, and it can never be empty (NULL).',
    whyThisElement: [
      `Each ${tableName.toLowerCase()} needs a unique identifier so the database can distinguish between them.`,
      `No two ${tableName.toLowerCase()} records can ever share the same ${attrName}.`,
      `${attrName} is simple, stable, and never changes once assigned.`,
      `It enables relationships: other tables reference this ${attrName} as a Foreign Key to link data.`,
    ],
    visualDiagram: `
${tableName.toUpperCase()} TABLE
┌─────────────────────────────┐
│ 101 │ First Row             │ ← Uniquely identified by 101
├─────────────────────────────┤
│ 102 │ Second Row            │ ← Uniquely identified by 102
├─────────────────────────────┤
│ 103 │ Third Row             │ ← Uniquely identified by 103
└─────────────────────────────┘
     ▲
  ${attrName} (PK)
`,
    realWorldAnalogy: {
      title: 'College Student ID Card or Passport',
      description:
        'Think of a Primary Key like a student ID card or passport number. Two students might share the exact same name (e.g. "Ram Sharma"), but their student IDs are distinct. The database uses the ID—not the name—to look up grades, fees, and attendance.',
    },
    rules: [
      'Must be UNIQUE — duplicate values are strictly rejected.',
      'Cannot be NULL — every row must have an identifiable key.',
      'Only ONE primary key per table — other referencing columns should be Foreign Keys.',
      'Should be stable — avoid columns that change often (like phone numbers or emails).',
    ],
    commonMisconception: {
      myth: 'A table can have multiple Primary Keys.',
      correction:
        'A table can only have ONE Primary Key. Relational references to other tables must be Foreign Keys, with a single Primary Key uniquely identifying each record.',
    },
    interactiveExperiment: {
      title: 'Test Primary Key Uniqueness Violation',
      buttonLabel: '🧪 Try Inserting Duplicate PK',
      description:
        `Attempt to insert a new row with an existing ${attrName} value to observe the database simulator enforcing uniqueness.`,
      testType: 'duplicate_pk',
    },
  }),

  compositePrimaryKey: (tableName: string, columns: string[]): ConceptExplanation => ({
    concept: `Composite Primary Key: (${columns.join(', ')})`,
    badge: '🔑 Composite PK',
    definition:
      `A Composite Primary Key is a Primary Key formed by two or more columns combined together to uniquely identify each row in ${tableName}. No individual column alone is unique, but their combination is guaranteed unique and NOT NULL.`,
    whyThisElement: [
      `Used standardly in associative junction tables resolving Many-to-Many relationships.`,
      `Leverages the existing foreign keys (${columns.join(', ')}) without creating an unnecessary surrogate ID.`,
      `Enforces business uniqueness naturally (e.g., a student can enroll in a given course only once).`,
      `Zero extra storage overhead: avoids creating an unneeded auto-increment ID column.`,
    ],
    visualDiagram: `
${tableName.toUpperCase()} (Junction Table)
┌──────────────────────────────────────────────┐
│ [ ${columns[0]} ] + [ ${columns[1] || 'Col2'} ] (Composite PK) │
├──────────────────────────────────────────────┤
│ 101       + 201         → Unique Pairing 1   │
│ 101       + 202         → Unique Pairing 2   │
│ 102       + 201         → Unique Pairing 3   │
└──────────────────────────────────────────────┘
`,
    realWorldAnalogy: {
      title: 'GPS Latitude and Longitude Coordinates',
      description:
        'Think of geographic coordinates. Latitude alone does not identify a spot on Earth (it describes an entire line), nor does Longitude alone. But together, (Latitude, Longitude) pinpoints a single exact location.',
    },
    rules: [
      'The combination of all composite columns must be strictly UNIQUE across all rows.',
      'None of the participating columns in the composite primary key may ever be NULL.',
      'Do not add a surrogate ID by default; composite foreign keys form a complete and valid primary key.',
    ],
    interactiveExperiment: {
      title: 'Test Composite PK Duplicate Insertion',
      buttonLabel: '🧪 Try Inserting Duplicate Pair',
      description:
        `Attempt to insert an identical combination of (${columns.join(', ')}) into ${tableName} to observe the relational engine rejecting duplicate pairings.`,
      testType: 'duplicate_pk',
    },
  }),

  foreignKey: (
    attrName: string,
    tableName: string,
    targetTable: string,
    targetColumn: string
  ): ConceptExplanation => ({
    concept: 'Foreign Key (FK)',
    badge: '🔗 Foreign Key',
    definition:
      `A Foreign Key (FK) is a column in one table (${tableName}) that REFERENCES the Primary Key (${targetColumn}) of another table (${targetTable}). It creates a verified relational link between rows in the two tables.`,
    whyThisElement: [
      `${tableName} needs to know WHICH ${targetTable.toLowerCase()} it is associated with.`,
      `${attrName} in ${tableName} points directly to ${targetTable}.${targetColumn}.`,
      `It guarantees Referential Integrity: every ${tableName} record must connect to an actual, valid ${targetTable}.`,
      `It prevents "orphan" records (e.g., an enrollment for a student that does not exist).`,
    ],
    visualDiagram: `
${targetTable}               ${tableName}
┌──────────────┐          ┌──────────────┐
│${targetColumn.padEnd(10, ' ')} PK│◄─────────│${attrName.padEnd(10, ' ')} FK│
└──────────────┘  FK Link └──────────────┘
       ▲                         │
       └────── References ───────┘
`,
    realWorldAnalogy: {
      title: 'Library Bookmark or Parcel Tracking Code',
      description:
        `Think of a Foreign Key like a library checkout slip or tracking code. The slip does not contain the whole book or student profile—it just writes down "StudentID: 101". Anyone holding the slip can look up student 101 to find their address and contact details.`,
    },
    rules: [
      'Referential Integrity: The FK value must exist in the referenced table\'s PK.',
      'Can be NULL only if the relationship is optional (e.g., an employee without a department).',
      'The data types of the Foreign Key and referenced Primary Key must match exactly.',
      'Multiple rows in this table can reference the same PK row (1:N relationship).',
    ],
    commonMisconception: {
      myth: 'A Foreign Key must have the exact same column name as the Primary Key.',
      correction:
        'A Foreign Key does not have to match names, but using the same name (e.g. StudentID) is standard best practice for clarity.',
    },
    interactiveExperiment: {
      title: 'Test Referential Integrity Enforcement',
      buttonLabel: '🧪 Try Inserting Orphan Record',
      description:
        `Attempt to insert a row into ${tableName} referencing a non-existent ${targetTable} (ID: 9999) to see the referential integrity check fail.`,
      testType: 'orphan_fk',
    },
  }),

  relationship: (
    relName: string,
    sourceTable: string,
    targetTable: string,
    cardinality: string
  ): ConceptExplanation => {
    const isMN = cardinality === 'M:N' || cardinality === 'many-to-many';
    const is1N = cardinality === '1:N' || cardinality === 'one-to-many';

    return {
      concept: `Relationship: ${relName || `${sourceTable} — ${targetTable}`}`,
      badge: `⚡ ${cardinality} Connection`,
      definition:
        `A relationship defines how records in "${sourceTable}" relate to records in "${targetTable}". Cardinality specifies the maximum number of associated records on each side.`,
      whyThisElement: isMN
        ? [
            `One ${sourceTable} can relate to multiple ${targetTable} records.`,
            `One ${targetTable} can relate to multiple ${sourceTable} records.`,
            `Direct M:N cannot be implemented in relational tables without creating duplicate data or multi-valued columns.`,
            `Requires an Associative Entity (Junction Table) to break it down into two clean 1:N relationships.`,
          ]
        : is1N
        ? [
            `One record in ${sourceTable} can relate to MANY records in ${targetTable}.`,
            `Each record in ${targetTable} relates back to at most ONE record in ${sourceTable}.`,
            `Relational rule: The Foreign Key ALWAYS goes on the "MANY" side (${targetTable}).`,
          ]
        : [
            `One record in ${sourceTable} relates to exactly ONE record in ${targetTable}.`,
            `Usually used when splitting large tables or handling specialized sub-types.`,
          ],
      visualDiagram: isMN
        ? `
${sourceTable}       M ───────────── N       ${targetTable}
            ▲                               ▲
            └───── [Needs Junction Table] ──┘
`
        : `
${sourceTable} (1) ───────────── (N) ${targetTable}
[Parent PK]  ─────────────►  [Child FK]
`,
      realWorldAnalogy: isMN
        ? {
            title: 'Students and Courses (or Actors and Movies)',
            description:
              'A student attends several courses, and a course has dozens of students. You cannot put a list of courses inside the student row (violates 1NF). An enrollment ticket connects one student to one course at a specific time.',
          }
        : {
            title: 'Department and Employees (or Mother and Children)',
            description:
              'One department employs many staff members, but each staff member belongs to one department. The employee carries the "DepartmentID" badge.',
          },
      rules: isMN
        ? [
            'M:N relationships cannot be converted directly to relational tables.',
            'Resolve M:N by creating a bridge table holding FKs from both parent tables.',
            'The bridge table often uses a Composite Primary Key made of both FKs.',
          ]
        : [
            'In a 1:N relationship, place the Foreign Key on the "MANY" side table.',
            'The "ONE" side is the parent table holding the referenced Primary Key.',
          ],
      interactiveExperiment: isMN
        ? {
            title: 'Resolve Many-to-Many Relationship',
            buttonLabel: '⚡ Resolve M:N into Junction Table',
            description:
              'Convert this M:N relationship into an associative junction table with migrated foreign keys and animated connections.',
            testType: 'resolve_mn',
          }
        : undefined,
    };
  },

  associativeEntity: (entityName: string): ConceptExplanation => ({
    concept: `Associative Entity: ${entityName}`,
    badge: '📦 Associative Entity',
    definition:
      `An Associative Entity (also called a Junction Table, Bridge Table, or Link Table) is created to resolve a Many-to-Many (M:N) relationship into two manageable One-to-Many (1:N) relationships.`,
    whyThisElement: [
      'Relational databases cannot store repeating lists of foreign keys in a single column (First Normal Form violation).',
      `The "${entityName}" table acts as a bridge: each row represents a specific link between two parent entities.`,
      `It allows storing relationship-specific attributes (like EnrollmentDate, Grade, Quantity, or Timestamp) that do not belong exclusively to either parent.`,
      'Its Primary Key is typically a Composite Primary Key made of both parent Foreign Keys.',
    ],
    visualDiagram: `
BEFORE:
STUDENT              M ───────────── N              COURSE

AFTER RESOLUTION:
STUDENT (1) ───◄ (N) [ ENROLLMENT ] (N) ►─── (1) COURSE
                     ├─ StudentID (FK, PK)
                     ├─ CourseID (FK, PK)
                     ├─ EnrollmentDate
                     └─ Grade
`,
    realWorldAnalogy: {
      title: 'The Matchmaker or Transaction Receipt',
      description:
        'Think of a boarding pass connecting a passenger to a flight, or a receipt connecting a customer to a purchased product. The receipt stores the transaction date and price—data that only exists because the two entities met.',
    },
    rules: [
      'Contains at least two Foreign Keys referencing the related parent entities.',
      'Uses a Composite Primary Key combining both foreign keys (e.g. StudentID PK, FK + CourseID PK, FK).',
      'Both foreign keys must satisfy referential integrity.',
      'Do not add a surrogate ID unless business rules explicitly require an independently identifiable relationship row.',
    ],
    commonMisconception: {
      myth: 'Junction tables can only store two foreign keys and nothing else.',
      correction:
        'Junction tables frequently store intersection data such as dates, grades, status flags, and quantities!',
    },
  }),

  generalAttribute: (attrName: string, tableName: string): ConceptExplanation => ({
    concept: `Attribute: ${attrName}`,
    badge: '📝 Table Column',
    definition:
      `An attribute represents a single property, characteristic, or piece of data stored about every ${tableName.toLowerCase()} record.`,
    whyThisElement: [
      `Stores descriptive information required by business rules.`,
      `Has a defined data type (e.g. VARCHAR, INTEGER, DATE) to enforce domain constraints.`,
      `Can specify whether values are mandatory (NOT NULL) or must be unique across all rows.`,
    ],
    visualDiagram: `
${tableName}
┌──────────────────────────────┐
│ 🔑 ${tableName}ID             │
├──────────────────────────────┤
│ ▶  ${attrName.padEnd(24, ' ')}│ ← This Attribute
└──────────────────────────────┘
`,
    realWorldAnalogy: {
      title: 'Fields on a Blank Paper Application Form',
      description:
        `Think of attributes like the blank labeled boxes on an application form: "First Name", "Date of Birth", "Email Address". Every applicant fills in their own values.`,
    },
    rules: [
      'Atomic: In 1NF, each attribute value must be atomic (cannot contain comma-separated lists).',
      'Consistent Data Type: Every row must store the same data type in this column.',
      'Domain Integrity: Optional check constraints can restrict values to valid ranges.',
    ],
  }),
};

// ----------------------------------------------------------------------------
// 2. Common Misconceptions Database
// ----------------------------------------------------------------------------

export const COMMON_MISCONCEPTIONS: MisconceptionItem[] = [
  {
    id: 'misc_multi_pk',
    category: 'Keys',
    myth: 'A table can have multiple Primary Keys.',
    whyItsFalse:
      'By mathematical definition of relational algebra, a relation has exactly ONE primary key to identify a tuple.',
    correctPrinciple:
      'A table has strictly ONE Primary Key. However, that primary key can be a COMPOSITE Primary Key spanning multiple columns! In a junction/associative table (like ENROLLMENT or ORDER_ITEM), the participating foreign keys (StudentID PK, FK and CourseID PK, FK) together form the composite primary key. You do NOT need a redundant surrogate ID (like EnrollmentID) unless specific business rules require independent identification.',
    example:
      'In ENROLLMENT, (StudentID, CourseID) is the composite Primary Key. Both columns are Foreign Keys AND together they form the table\'s Primary Key.',
  },
  {
    id: 'misc_junction_surrogate',
    category: 'Keys',
    myth: 'Every table, including junction tables, should have an auto-increment ID column (e.g. EnrollmentID).',
    whyItsFalse:
      'Adding an artificial surrogate key to a junction table introduces redundant columns, increases index overhead, and fails to prevent duplicate relationship pairings unless an auxiliary UNIQUE constraint is added.',
    correctPrinciple:
      'In associative tables resolving Many-to-Many relationships, the foreign keys from participating tables form a composite primary key by default. A composite primary key is a complete and valid primary key.',
    example:
      'ENROLLMENT uses PRIMARY KEY (StudentID, CourseID). ORDER_ITEM uses PRIMARY KEY (OrderID, ProductID).',
  },
  {
    id: 'misc_surrogate_superiority',
    category: 'Keys',
    myth: 'Surrogate keys are always superior to natural composite keys.',
    whyItsFalse:
      'Surrogate keys carry zero semantic meaning and require additional storage and B-tree indexes. Composite natural keys enforce business uniqueness intrinsically.',
    correctPrinciple:
      'Use composite keys when the combination naturally forms the entity identity (especially junction tables). Use surrogate keys when no stable natural key exists, or when the natural composite key is too wide for child foreign keys.',
    example:
      'Customer uses CustomerID (surrogate), but Account_Holder uses (CustomerID, AccountID) composite PK.',
  },
  {
    id: 'misc_fk_null',
    category: 'Keys',
    myth: 'Foreign Keys must always be NOT NULL.',
    whyItsFalse:
      'A foreign key can be NULL if the participation in the relationship is optional.',
    correctPrinciple:
      'If an employee does not currently have an assigned department or manager, DepartmentID in EMPLOYEE can be NULL.',
    example:
      'EMPLOYEE.DepartmentID is NULL for newly hired interns awaiting department placement.',
  },
  {
    id: 'misc_mn_direct',
    category: 'Relationships',
    myth: 'Many-to-Many relationships can be directly represented in relational tables.',
    whyItsFalse:
      'Relational databases cannot store arrays or lists in a single cell without violating First Normal Form (1NF).',
    correctPrinciple:
      'M:N relationships MUST be resolved into an associative bridge table containing foreign keys from both sides.',
    example:
      'STUDENT and COURSE cannot be directly linked with a single foreign key; you must create ENROLLMENT.',
  },
  {
    id: 'misc_card_opt',
    category: 'Relationships',
    myth: 'Cardinality and Optionality are the same thing.',
    whyItsFalse:
      'Cardinality defines the MAXIMUM number of associations; Optionality defines the MINIMUM number.',
    correctPrinciple:
      'Cardinality asks: "Can there be many?" (1 or N). Optionality asks: "Is it required?" (0 or 1, optional vs mandatory).',
    example:
      'A customer may have 0 or many orders. Minimum = 0 (optional), Maximum = N (many).',
  },
  {
    id: 'misc_fk_names',
    category: 'Keys',
    myth: 'A Foreign Key MUST have the exact same name as the Primary Key it references.',
    whyItsFalse:
      'SQL links tables using constraints on column references, not column names.',
    correctPrinciple:
      'The column name can differ (e.g. supervisor_id referencing employee_id in a recursive relationship), though using identical names improves code readability.',
    example:
      'EMPLOYEE.manager_id REFERENCES EMPLOYEE(employee_id).',
  },
  {
    id: 'misc_junction_columns',
    category: 'Entities',
    myth: 'A junction table can only contain two foreign key columns.',
    whyItsFalse:
      'Junction tables frequently store relationship-specific attributes.',
    correctPrinciple:
      'Junction tables are full relational entities! They can store transaction dates, quantities, grades, scores, or timestamps.',
    example:
      'ORDER_ITEM stores quantity, unit_price, and discount alongside order_id and product_id.',
  },
  {
    id: 'misc_surrogate_only',
    category: 'Keys',
    myth: 'Using an auto-increment ID (surrogate key) means you do not need UNIQUE constraints.',
    whyItsFalse:
      'Surrogate keys only identify the row technically; they do not prevent duplicate real-world data.',
    correctPrinciple:
      'Even if you use an auto-increment ID, business keys like Email, ISBN, or SSN must still have UNIQUE constraints.',
    example:
      'A user table with user_id can still end up with 5 accounts for the same email unless Email is marked UNIQUE.',
  },
  {
    id: 'misc_1n_fk_side',
    category: 'Relationships',
    myth: 'In a 1:N relationship, it does not matter which table gets the Foreign Key.',
    whyItsFalse:
      'Putting the FK on the "ONE" side would require storing multiple values per row, violating 1NF.',
    correctPrinciple:
      'The Foreign Key ALWAYS belongs on the "MANY" side table, pointing back to the ONE side parent.',
    example:
      'In Department (1) to Employee (N), DepartmentID goes inside EMPLOYEE.',
  },
];

// ----------------------------------------------------------------------------
// 3. System Prompt & Decision Flowchart Exports
// ----------------------------------------------------------------------------

export const PRIMARY_KEY_DECISION_FLOW_PROMPT = `
You are a database design assistant. For each table, determine the primary key as follows:

1. Identify the table type (entity vs associative/junction):
   - If it's an associative (junction) table resolving a many-to-many relationship between two (or more) entities, the foreign key columns from the related tables form the composite primary key. Do NOT add a separate ID column unless absolutely required by a higher-level need (such as referencing this table from other tables). The composite of FKs itself uniquely identifies the relationship.
   - Otherwise (an entity table), proceed to find a unique key.

2. Look for natural candidate keys:
   - List attributes that uniquely identify each row (e.g. registration numbers, codes, or meaningful fields).
   - If a single attribute qualifies, use it as the primary key.
   - If no single attribute works, check if multiple attributes together uniquely identify the entity. If yes, use those as a composite primary key.

3. Surrogate key decision:
   - Use a surrogate (artificial) key only if there is no natural key (or composite) that fulfills uniqueness and stability requirements. Justify its use:
       * "No stable natural key exists"
       * "The composite natural key is very wide or frequently changes"
   - Always enforce any natural uniqueness as a UNIQUE constraint in addition to any surrogate PK to preserve data integrity.
   - Hard Constraint: Never add a separate ID (surrogate) to a junction table by default. First assume (FK1, FK2, ...) is the PK.

4. Self-Check Questions:
   - What does one row represent?
   - Which attributes make a row unique (candidate keys)?
   - Is this an associative table (M:N)?
   - If M:N, can the foreign keys alone form a unique combination?
   - If an entity table, is there a single natural key or a natural composite key?
   - If not, what surrogate ID might be needed, and why?
   - If using a surrogate, have I added a UNIQUE constraint on the natural candidate keys?
`;

export const PRIMARY_KEY_FLOWCHART_MERMAID = `
flowchart TD
    Start([Start: Define Table]) --> CheckMN{Is this a many-to-many junction?}
    CheckMN -- Yes --> CompositeKey[Use composite PK of all participating FKs]
    CompositeKey --> Confirm1[Done: Add additional domain / check constraints]
    CheckMN -- No --> CheckSingle{Is there a single natural candidate key?}
    CheckSingle -- Yes --> NaturalPK[Use that natural attribute as PK]
    NaturalPK --> Confirm1
    CheckSingle -- No --> CheckComposite{Is there a natural composite key?}
    CheckComposite -- Yes --> CompositeEntityPK[Use composite of natural attributes as PK]
    CompositeEntityPK --> Confirm1
    CheckComposite -- No --> SurrogatePK[Introduce surrogate PK e.g. Auto-Increment ID / UUID]
    SurrogatePK --> AddConstraints[Add UNIQUE constraint on candidate natural keys]
    AddConstraints --> Confirm1
    Confirm1 --> End([End: Normalized Schema])
`;

// ----------------------------------------------------------------------------
// 4. Canonical Instructor Lab Solutions (Q6 - Q10)
// ----------------------------------------------------------------------------

export const INSTRUCTOR_LAB_SOLUTIONS: LabSolution[] = [
  {
    id: 'Q6',
    title: 'University Course Enrollment',
    domain: 'Education / Academic LMS',
    difficulty: 'Beginner',
    scenario:
      'Students enroll in courses; instructors teach courses. Each student can take many courses and each course can have many students (a student can enroll in a given course only once). Each course is taught by one instructor. Enrollment records a date, semester, and grade.',
    businessRules: [
      'A student can enroll in many courses, and a course can have many students.',
      'A student cannot enroll in the same course more than once per semester (enforced by PK).',
      'Each course must have exactly one instructor (InstructorID NOT NULL).',
      'Emails are unique identifiers for students and instructors.',
    ],
    entities: ['Student', 'Instructor', 'Course'],
    junctionTables: ['Enrollment'],
    pkJustification:
      'ENROLLMENT has a composite PK of (StudentID, CourseID). Under the business rule that a student enrolls in a given course at most once, (StudentID, CourseID) is naturally unique. Adding a surrogate EnrollmentID is redundant.',
    mermaid: `
erDiagram
    STUDENT ||--o{ ENROLLMENT : "enrolls in"
    COURSE  ||--o{ ENROLLMENT : "contains"
    INSTRUCTOR ||--o{ COURSE : "teaches"
    STUDENT { int StudentID PK, string FullName, string Email UK, string Phone, string Program }
    INSTRUCTOR { int InstructorID PK, string FullName, string Email UK, string Specialization }
    COURSE { int CourseID PK, string CourseName, int CreditHours, string Description, int InstructorID FK }
    ENROLLMENT { int StudentID PK,FK, int CourseID PK,FK, date EnrollmentDate, string Semester, string Grade }
`,
    sqlDdl: `CREATE TABLE Student (
    StudentID    INT PRIMARY KEY,
    FullName     VARCHAR(100) NOT NULL,
    Email        VARCHAR(100) NOT NULL UNIQUE,
    Phone        VARCHAR(20),
    Program      VARCHAR(50)
);

CREATE TABLE Instructor (
    InstructorID INT PRIMARY KEY,
    FullName     VARCHAR(100) NOT NULL,
    Email        VARCHAR(100) NOT NULL UNIQUE,
    Specialization VARCHAR(50)
);

CREATE TABLE Course (
    CourseID     INT PRIMARY KEY,
    CourseName   VARCHAR(100) NOT NULL,
    CreditHours  INT NOT NULL CHECK (CreditHours > 0),
    Description  TEXT,
    InstructorID INT NOT NULL,
    FOREIGN KEY (InstructorID) REFERENCES Instructor(InstructorID)
);

CREATE TABLE Enrollment (
    StudentID      INT NOT NULL,
    CourseID       INT NOT NULL,
    EnrollmentDate DATE NOT NULL,
    Semester       VARCHAR(10) NOT NULL,
    Grade          CHAR(2),
    PRIMARY KEY (StudentID, CourseID),
    FOREIGN KEY (StudentID) REFERENCES Student(StudentID) ON DELETE CASCADE,
    FOREIGN KEY (CourseID)  REFERENCES Course(CourseID) ON DELETE RESTRICT
);`,
    testQueries: `-- 1. Insert valid enrollment
INSERT INTO Enrollment (StudentID, CourseID, EnrollmentDate, Semester, Grade)
VALUES (1, 101, '2026-01-15', 'Spring2026', 'A');

-- 2. Attempt duplicate enrollment (MUST FAIL with PK violation):
INSERT INTO Enrollment (StudentID, CourseID, EnrollmentDate, Semester, Grade)
VALUES (1, 101, '2026-01-16', 'Spring2026', 'B');

-- 3. Verify uniqueness:
SELECT StudentID, CourseID, COUNT(*) AS cnt FROM Enrollment GROUP BY StudentID, CourseID;`,
    checklist: [
      'Composite PK (StudentID, CourseID) is enforced on Enrollment.',
      'Duplicate insertion into Enrollment fails with Primary Key violation.',
      'Referential integrity rejects non-existent StudentID or CourseID.',
      'Course requires a valid InstructorID foreign key.',
    ],
  },
  {
    id: 'Q7',
    title: 'E-Commerce Order & Composite Keys',
    domain: 'Retail & E-Commerce',
    difficulty: 'Intermediate',
    scenario:
      'An online shopping schema with Customers, Products, Orders, and OrderItems. Each order can contain many products (each product at most once per order). OrderItem records quantity and unit price at time of purchase.',
    businessRules: [
      'Each order belongs to exactly one customer; a customer can place multiple orders.',
      'A product can appear at most once in a given order; quantity indicates unit count.',
      'Therefore, (OrderID, ProductID) uniquely identifies each line item.',
      'Shipping address is stored on the order to allow order-specific delivery locations.',
    ],
    entities: ['Customer', 'Product', 'PurchaseOrder'],
    junctionTables: ['OrderItem'],
    pkJustification:
      'ORDER_ITEM uses a composite PK of (OrderID, ProductID). Because each product appears at most once per order, this composite naturally guarantees uniqueness. No artificial OrderItemID surrogate is added.',
    mermaid: `
erDiagram
    CUSTOMER ||--o{ PURCHASE_ORDER : "places"
    PURCHASE_ORDER ||--o{ ORDER_ITEM : "contains"
    PRODUCT ||--o{ ORDER_ITEM : "included in"
    CUSTOMER { int CustomerID PK, string FullName, string Email UK, string Phone, string Address }
    PRODUCT { int ProductID PK, string ProductName, decimal Price, int StockQuantity }
    PURCHASE_ORDER { int OrderID PK, int CustomerID FK, date OrderDate, string OrderStatus, string ShippingAddress }
    ORDER_ITEM { int OrderID PK,FK, int ProductID PK,FK, int Quantity, decimal UnitPrice }
`,
    sqlDdl: `CREATE TABLE Customer (
    CustomerID INT PRIMARY KEY,
    FullName   VARCHAR(100) NOT NULL,
    Email      VARCHAR(100) NOT NULL UNIQUE,
    Phone      VARCHAR(20),
    Address    VARCHAR(200)
);

CREATE TABLE Product (
    ProductID     INT PRIMARY KEY,
    ProductName   VARCHAR(100) NOT NULL,
    Price         DECIMAL(10,2) NOT NULL CHECK (Price >= 0),
    StockQuantity INT NOT NULL CHECK (StockQuantity >= 0)
);

CREATE TABLE PurchaseOrder (
    OrderID         INT PRIMARY KEY,
    CustomerID      INT NOT NULL,
    OrderDate       DATE NOT NULL,
    OrderStatus     VARCHAR(20) NOT NULL,
    ShippingAddress VARCHAR(200) NOT NULL,
    FOREIGN KEY (CustomerID) REFERENCES Customer(CustomerID)
);

CREATE TABLE OrderItem (
    OrderID   INT NOT NULL,
    ProductID INT NOT NULL,
    Quantity  INT NOT NULL CHECK (Quantity > 0),
    UnitPrice DECIMAL(10,2) NOT NULL CHECK (UnitPrice >= 0),
    PRIMARY KEY (OrderID, ProductID),
    FOREIGN KEY (OrderID) REFERENCES PurchaseOrder(OrderID) ON DELETE CASCADE,
    FOREIGN KEY (ProductID) REFERENCES Product(ProductID)
);`,
    testQueries: `-- 1. Insert order and line item
INSERT INTO PurchaseOrder (OrderID, CustomerID, OrderDate, OrderStatus, ShippingAddress)
VALUES (5001, 1001, '2026-08-01', 'Pending', '123 Main St');

INSERT INTO OrderItem (OrderID, ProductID, Quantity, UnitPrice)
VALUES (5001, 200, 3, 49.99);

-- 2. Attempt duplicate line item (MUST FAIL):
INSERT INTO OrderItem (OrderID, ProductID, Quantity, UnitPrice)
VALUES (5001, 200, 2, 49.99);`,
    checklist: [
      'Composite PK (OrderID, ProductID) prevents duplicate items within an order.',
      'Price snapshot is stored in OrderItem to freeze purchase-time prices.',
      'Foreign keys preserve referential integrity to PurchaseOrder and Product.',
    ],
  },
  {
    id: 'Q8',
    title: 'Banking Management System',
    domain: 'Financial Services & Banking',
    difficulty: 'Advanced',
    scenario:
      'A commercial bank database covering customers, branches, employees, accounts, account-holders (many-to-many relationship supporting joint accounts), transactions (with transfers between accounts), loans, loan payments, and beneficiaries.',
    businessRules: [
      'An account can be owned by multiple customers (joint accounts); a customer can hold multiple accounts.',
      'ACCOUNT_HOLDER resolves Customer M:N Account with ownership type and opening date.',
      'Ledger transactions record source and optional destination accounts for auditing.',
      'Balance non-negativity is enforced with a CHECK constraint (Balance >= 0).',
    ],
    entities: ['Customer', 'Branch', 'Employee', 'Account', 'Transaction', 'Loan', 'Loan_Payment', 'Beneficiary'],
    junctionTables: ['Account_Holder'],
    pkJustification:
      'Account_Holder uses a composite PK of (CustomerID, AccountID) to model account ownership without an unneeded surrogate ID. Standalone transaction events use TransactionID because multiple transactions can occur between the same accounts over time.',
    mermaid: `
erDiagram
    CUSTOMER ||--o{ ACCOUNT_HOLDER : "owns account"
    ACCOUNT  ||--o{ ACCOUNT_HOLDER : "has customer"
    BRANCH   ||--o{ ACCOUNT : "manages"
    BRANCH   ||--o{ EMPLOYEE : "employs"
    ACCOUNT  ||--o{ TRANSACTION : "generates"
    LOAN     ||--o{ LOAN_PAYMENT : "has payment"
    ACCOUNT  ||--o{ BENEFICIARY : "has"
    ACCOUNT_HOLDER { int CustomerID PK,FK, int AccountID PK,FK, date OpenDate, string OwnershipType }
    TRANSACTION { int TransactionID PK, date TransactionDate, decimal Amount, int SourceAccountID FK, int DestAccountID FK }
`,
    sqlDdl: `CREATE TABLE Account_Holder (
    CustomerID    INT NOT NULL,
    AccountID     INT NOT NULL,
    OpenDate      DATE NOT NULL,
    OwnershipType VARCHAR(20) NOT NULL,
    PRIMARY KEY (CustomerID, AccountID),
    FOREIGN KEY (CustomerID) REFERENCES Customer(CustomerID),
    FOREIGN KEY (AccountID)  REFERENCES Account(AccountID)
);

CREATE TABLE Transaction (
    TransactionID   INT PRIMARY KEY,
    TransactionDate DATE NOT NULL,
    TransactionTime TIME NOT NULL,
    TransactionType VARCHAR(20) NOT NULL,
    Amount          DECIMAL(15,2) NOT NULL CHECK (Amount > 0),
    BalanceAfter    DECIMAL(15,2) NOT NULL,
    SourceAccountID INT NOT NULL,
    DestAccountID   INT,
    Description     VARCHAR(200),
    FOREIGN KEY (SourceAccountID) REFERENCES Account(AccountID),
    FOREIGN KEY (DestAccountID)   REFERENCES Account(AccountID)
);`,
    testQueries: `-- 1. Establish ownership
INSERT INTO Account_Holder (CustomerID, AccountID, OpenDate, OwnershipType)
VALUES (101, 301, '2026-01-01', 'Primary');

-- 2. Attempt duplicate joint ownership (MUST FAIL):
INSERT INTO Account_Holder (CustomerID, AccountID, OpenDate, OwnershipType)
VALUES (101, 301, '2026-02-01', 'Secondary');`,
    checklist: [
      'Account_Holder enforces composite PK (CustomerID, AccountID).',
      'Transaction uses surrogate TransactionID to record chronological audit logs.',
      'Check constraints enforce balance >= 0 and amount > 0.',
    ],
  },
  {
    id: 'Q9',
    title: 'E-Commerce Marketplace',
    domain: 'Multi-Vendor Marketplace',
    difficulty: 'Advanced',
    scenario:
      'A multi-vendor marketplace connecting Customers, Sellers, Products, Categories, Listings, Orders, Order Items, Payments, Shipments, Warehouses, Inventory, Reviews, and Returns.',
    businessRules: [
      'A seller cannot create two active listings for the same product: (SellerID, ProductID) is unique.',
      'An order item references a specific seller listing: (OrderID, SellerID, ProductID) forms the composite PK.',
      'Warehouse inventory tracks listing stock across locations: (SellerID, ProductID, WarehouseID).',
      'Shipments can fulfill order items in split batches: (ShipmentID, OrderID, SellerID, ProductID).',
    ],
    entities: ['Customer', 'Seller', 'Product', 'Category', 'Warehouse', 'Order', 'Payment', 'Shipment', 'Review', 'Return'],
    junctionTables: ['Product_Category', 'Product_Listing', 'Inventory', 'Order_Item', 'Shipment_Item'],
    pkJustification:
      'Product_Listing (SellerID, ProductID), Inventory (SellerID, ProductID, WarehouseID), Order_Item (OrderID, SellerID, ProductID), and Shipment_Item (ShipmentID, OrderID, SellerID, ProductID) all use composite primary keys composed of participating foreign keys. Surrogate IDs are used for transactional entities like Payment and Shipment.',
    mermaid: `
erDiagram
    PRODUCT_LISTING { int SellerID PK,FK, int ProductID PK,FK, decimal SellingPrice, int AvailableQty }
    INVENTORY { int SellerID PK,FK, int ProductID PK,FK, int WarehouseID PK,FK, int QuantityStored }
    ORDER_ITEM { int OrderID PK,FK, int SellerID PK,FK, int ProductID PK,FK, int Quantity, decimal UnitPrice }
    SHIPMENT_ITEM { int ShipmentID PK,FK, int OrderID PK,FK, int SellerID PK,FK, int ProductID PK,FK, int Quantity }
`,
    sqlDdl: `CREATE TABLE Product_Listing (
    SellerID      INT NOT NULL,
    ProductID     INT NOT NULL,
    SellingPrice  DECIMAL(10,2) NOT NULL CHECK (SellingPrice >= 0),
    SellerSKU     VARCHAR(50),
    AvailableQty  INT NOT NULL CHECK (AvailableQty >= 0),
    ListingStatus VARCHAR(20) NOT NULL,
    ListingDate   DATE NOT NULL,
    PRIMARY KEY (SellerID, ProductID),
    FOREIGN KEY (SellerID) REFERENCES Seller(SellerID),
    FOREIGN KEY (ProductID) REFERENCES Product(ProductID)
);

CREATE TABLE Order_Item (
    OrderID   INT NOT NULL,
    SellerID  INT NOT NULL,
    ProductID INT NOT NULL,
    Quantity  INT NOT NULL CHECK (Quantity > 0),
    UnitPrice DECIMAL(10,2) NOT NULL CHECK (UnitPrice >= 0),
    PRIMARY KEY (OrderID, SellerID, ProductID),
    FOREIGN KEY (OrderID) REFERENCES "Order"(OrderID) ON DELETE CASCADE,
    FOREIGN KEY (SellerID, ProductID) REFERENCES Product_Listing(SellerID, ProductID)
);`,
    testQueries: `-- 1. Duplicate listing rejection:
INSERT INTO Product_Listing VALUES (201, 101, 19.99, 'SKU123', 50, 'Active', '2026-01-01');
INSERT INTO Product_Listing VALUES (201, 101, 18.99, 'SKU999', 20, 'Active', '2026-02-01'); -- MUST FAIL`,
    checklist: [
      'Multi-vendor listings use composite PK (SellerID, ProductID).',
      'Inventory tracks listing-warehouse pairs with 3-part composite PK.',
      'Order line items reference exact seller listings with 3-part composite PK.',
      'Shipment items support split multi-box fulfillments with 4-part composite PK.',
    ],
  },
  {
    id: 'Q10',
    title: 'Hospital & Healthcare Management',
    domain: 'Healthcare & Clinical Informatics',
    difficulty: 'Advanced',
    scenario:
      'An integrated healthcare system spanning Patients, Departments, Doctors, Appointments, Inpatient Admissions, Rooms/Wards, Diagnoses, Treatments, Prescriptions (and prescribed items), Lab Tests/Results, Insurance Policies, Invoices, and Payments.',
    businessRules: [
      'A patient admission can involve multiple rooms over time: (AdmissionID, RoomID) composite PK.',
      'Patient medical conditions are tracked via (PatientID, DiagnosisID) composite PK.',
      'Prescriptions list medicines with dosages via (PrescriptionID, MedicineID) composite PK.',
      'Appointments use surrogate AppointmentID because a patient can visit the same doctor multiple times.',
    ],
    entities: ['Patient', 'Department', 'Doctor', 'Appointment', 'Admission', 'Ward', 'Room', 'Diagnosis', 'Treatment', 'Medicine', 'Prescription', 'Lab_Test', 'Test_Result', 'Policy', 'Invoice', 'Invoice_Item', 'Payment'],
    junctionTables: ['Room_Assignment', 'Patient_Diagnosis', 'Treatment_Record', 'Prescription_Item', 'Patient_Policy'],
    pkJustification:
      'True Many-to-Many associations (Room_Assignment, Patient_Diagnosis, Treatment_Record, Prescription_Item, Patient_Policy) strictly use composite primary keys. Single-column surrogate keys are reserved for independent entities and multi-visit events (AppointmentID, InvoiceID).',
    mermaid: `
erDiagram
    ROOM_ASSIGNMENT { int AdmissionID PK,FK, int RoomID PK,FK, date AssignDate, date ReleaseDate }
    PATIENT_DIAGNOSIS { int PatientID PK,FK, int DiagnosisID PK,FK, date DiagnosisDate, int DiagnosedBy FK }
    PRESCRIPTION_ITEM { int PrescriptionID PK,FK, int MedicineID PK,FK, string Dosage, string Frequency }
`,
    sqlDdl: `CREATE TABLE Room_Assignment (
    AdmissionID INT NOT NULL,
    RoomID      INT NOT NULL,
    AssignDate  DATE NOT NULL,
    ReleaseDate DATE,
    BedNumber   VARCHAR(10),
    PRIMARY KEY (AdmissionID, RoomID),
    FOREIGN KEY (AdmissionID) REFERENCES Admission(AdmissionID),
    FOREIGN KEY (RoomID) REFERENCES Room(RoomID)
);

CREATE TABLE Prescription_Item (
    PrescriptionID INT NOT NULL,
    MedicineID     INT NOT NULL,
    Dosage         VARCHAR(50) NOT NULL,
    Frequency      VARCHAR(50) NOT NULL,
    Duration       INT NOT NULL CHECK (Duration > 0),
    Instructions   TEXT,
    PRIMARY KEY (PrescriptionID, MedicineID),
    FOREIGN KEY (PrescriptionID) REFERENCES Prescription(PrescriptionID) ON DELETE CASCADE,
    FOREIGN KEY (MedicineID)     REFERENCES Medicine(MedicineID)
);`,
    testQueries: `-- 1. Rejection of duplicate diagnosis:
INSERT INTO Patient_Diagnosis VALUES (501, 301, '2026-06-01', 'Hypertension', 102);
INSERT INTO Patient_Diagnosis VALUES (501, 301, '2026-06-02', 'Re-evaluation', 103); -- MUST FAIL`,
    checklist: [
      'Room_Assignment uses composite PK (AdmissionID, RoomID).',
      'Prescription_Item uses composite PK (PrescriptionID, MedicineID).',
      'Patient_Diagnosis uses composite PK (PatientID, DiagnosisID).',
      'Appointment uses surrogate AppointmentID because patient visits repeat over time.',
    ],
  },
];

// ----------------------------------------------------------------------------
// 5. Composite vs Surrogate Keys Comparison Matrix
// ----------------------------------------------------------------------------

export const COMPOSITE_VS_SURROGATE_COMPARISON = [
  {
    aspect: 'Definition',
    composite: 'Key composed of two or more existing business columns.',
    surrogate: 'System-generated, artificial single-column identifier (e.g. Identity, UUID).',
  },
  {
    aspect: 'Storage / Space',
    composite: 'Zero extra column overhead; leverages existing foreign keys.',
    surrogate: 'Requires an additional column and an additional B-tree index.',
  },
  {
    aspect: 'Implementation',
    composite: 'Directly defined in DDL via PRIMARY KEY (col1, col2).',
    surrogate: 'Requires auto-increment sequences, identity generators, or UUID v4 logic.',
  },
  {
    aspect: 'Uniqueness Guarantee',
    composite: 'Naturally guarantees that relationship pairs cannot be duplicated.',
    surrogate: 'Guarantees row identity, but requires an auxiliary UNIQUE constraint to prevent business duplicates.',
  },
  {
    aspect: 'Readability & Meaning',
    composite: 'Carries direct relational meaning (e.g., (OrderID, ProductID)).',
    surrogate: 'Opaque numeric value without semantic business meaning.',
  },
  {
    aspect: 'Foreign Keys / Joins',
    composite: 'Child tables must carry multiple columns to reference this key.',
    surrogate: 'Simple single-column joins across child tables.',
  },
  {
    aspect: 'Schema Flexibility',
    composite: 'Schema must be adjusted if business rules allow duplicate pairings.',
    surrogate: 'Unaffected if business attributes change.',
  },
  {
    aspect: 'Normalization',
    composite: 'Strictly conforms to relational theory without redundant surrogate columns.',
    surrogate: 'Introduces a synthetic candidate key alongside natural candidate keys.',
  },
  {
    aspect: 'When to Use',
    composite: '• Many-to-many junction tables\n• Weak entities identifying with parent\n• Naturally unique attribute pairs',
    surrogate: '• Independent entities without stable natural keys\n• Frequently changing or very wide natural keys\n• Entities referenced as parents by many other tables',
  },
  {
    aspect: 'Canonical Example',
    composite: 'Enrollment(StudentID, CourseID)',
    surrogate: 'Customer(CustomerID) with UNIQUE(Email)',
  },
];

// ----------------------------------------------------------------------------
// 6. Socratic Dialogue Engine (Interactive Guidance for Scenarios)
// ----------------------------------------------------------------------------

export const SOCRATIC_LMS_STEPS: SocraticStep[] = [
  {
    id: 1,
    question: 'Can one student enroll in multiple courses at the university?',
    context: 'Reviewing Requirement 3: "A student can enroll in many courses."',
    options: [
      {
        label: 'Yes, students usually take multiple courses.',
        isOptimal: true,
        feedback: 'Correct! That means the cardinality from Student toward Course has an upper bound of "Many" (N).',
        explanation: 'A single student record relates to multiple course records.',
      },
      {
        label: 'No, each student can only ever take one course.',
        isOptimal: false,
        feedback: 'That would be too restrictive for a modern university curriculum.',
        explanation: 'Most educational systems allow students to register for several courses per semester.',
      },
    ],
  },
  {
    id: 2,
    question: 'Can one course contain multiple students?',
    context: 'Reviewing Requirement 4: "A course can contain many students."',
    options: [
      {
        label: 'Yes, a classroom or course holds many students.',
        isOptimal: true,
        feedback: 'Excellent! Both sides have an upper bound of "Many". Therefore, this is a Many-to-Many (M:N) relationship.',
        explanation: 'Because both directions are "Many", Student and Course form an M:N connection.',
      },
      {
        label: 'No, each course is taught to only one student at a time.',
        isOptimal: false,
        feedback: 'Private 1-on-1 tutoring exists, but standard university courses have dozens or hundreds of students.',
        explanation: 'Standard course rosters have many enrolled students.',
      },
    ],
  },
  {
    id: 3,
    question: 'Where should we store "EnrollmentDate" and "Grade"?',
    context: 'Requirement 5: "Each enrollment stores enrollment date and grade."',
    options: [
      {
        label: 'Inside an Associative Entity (ENROLLMENT) between Student and Course.',
        isOptimal: true,
        feedback: 'Spot on! The grade belongs to the specific pairing of a student taking a particular course.',
        explanation: 'Putting Grade in STUDENT means they can only have 1 grade total. Putting Grade in COURSE means all students get the same grade! ENROLLMENT resolves this.',
      },
      {
        label: 'Inside the STUDENT table directly.',
        isOptimal: false,
        feedback: 'If Grade is in STUDENT, how would you store different grades for 5 different courses?',
        explanation: 'You would have to create repeating columns (Grade1, Grade2) which violates First Normal Form.',
      },
      {
        label: 'Inside the COURSE table directly.',
        isOptimal: false,
        feedback: 'If Grade is in COURSE, every student in that course would share the identical grade!',
        explanation: 'A course does not have a single grade; individual students earn grades.',
      },
    ],
  },
  {
    id: 4,
    question: 'What should be the Primary Key of the ENROLLMENT table?',
    context: 'Key Strategy Rule: "Never add a surrogate ID to a junction table by default."',
    options: [
      {
        label: 'A composite primary key of (StudentID, CourseID).',
        isOptimal: true,
        feedback: 'Masterful! In relational theory, the combination of participating foreign keys naturally forms the primary key of the junction table.',
        explanation: 'Because a student cannot enroll in the same course twice, (StudentID, CourseID) is completely unique. Creating a redundant EnrollmentID is unnecessary.',
      },
      {
        label: 'An artificial auto-increment EnrollmentID column.',
        isOptimal: false,
        feedback: 'Adding EnrollmentID by default introduces an extra column without preventing duplicate student-course enrollments.',
        explanation: 'Unless another table references an enrollment row directly, composite primary keys (StudentID, CourseID) are the standard relational practice.',
      },
    ],
  },
];

// ----------------------------------------------------------------------------
// 7. Intelligent Natural Language Response Generator for AI Tutor Chat
// ----------------------------------------------------------------------------

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  suggestedChips?: string[];
  diagram?: string;
  analogy?: string;
}

export function generateAiTutorResponse(
  query: string,
  context: {
    activeScenarioName?: string;
    entityCount?: number;
    selectedTable?: string;
  }
): { text: string; diagram?: string; analogy?: string; chips?: string[] } {
  const q = query.toLowerCase().trim();

  // 1. Primary Key Decision Flow & Flowchart
  if (
    q.includes('flowchart') ||
    q.includes('decision flow') ||
    q.includes('decision rule') ||
    (q.includes('how') && q.includes('choose') && (q.includes('pk') || q.includes('primary key')))
  ) {
    return {
      text: `### Primary Key Decision Flowchart & Strategy

Relational primary keys should be derived from **business rules**, not auto-generated indiscriminately.

**The 4-Step Decision Flow:**
1. **Check Table Type:** If this is an **associative (junction) table** resolving an $M:N$ relationship, use the composite of all participating foreign keys as the **Composite Primary Key**. Do **NOT** add an artificial ID column.
2. **Identify Natural Candidate Keys:** Look for unique attributes in the real-world domain (e.g. registration numbers, tax numbers, codes). If one exists, make it the PK.
3. **Check Natural Composite Keys:** If multiple business columns together guarantee uniqueness, make them a composite PK.
4. **Surrogate Key Fallback:** Introduce a surrogate key (auto-increment integer or UUID) **only** if no stable natural key exists or the composite key is excessively wide. Always preserve real-world uniqueness with an auxiliary \`UNIQUE\` constraint!`,
      diagram: `
START: Define Table
  │
  ├──► Is this an M:N junction table?
  │      ├── YES ──► Use COMPOSITE PK of participating Foreign Keys (No surrogate ID!)
  │      └── NO
  │            │
  │            ├──► Is there a single natural candidate key?
  │            │      ├── YES ──► Use Natural Attribute as Primary Key
  │            │      └── NO
  │            │            │
  │            │            ├──► Is there a natural composite key?
  │            │            │      ├── YES ──► Use Composite Business Attributes as PK
  │            │            │      └── NO  ──► Introduce SURROGATE PK (e.g. ID) + Add UNIQUE constraint on candidates!
  ▼
DONE: Fully Normalized 3NF Schema
`,
      chips: ['Show me Q6 Enrollment solution', 'Surrogate vs composite keys', 'Explain Q7 OrderItem key choice'],
    };
  }

  // 2. Surrogate vs. Composite Keys Comparison
  if (
    q.includes('surrogate vs composite') ||
    q.includes('composite vs surrogate') ||
    (q.includes('surrogate') && q.includes('composite')) ||
    q.includes('when to use surrogate')
  ) {
    return {
      text: `### Composite Primary Keys vs. Surrogate Keys

| Aspect | Composite Primary Key | Surrogate (Synthetic) Key |
| :--- | :--- | :--- |
| **Definition** | Formed by 2+ existing business columns. | System-generated artificial ID (auto-increment, UUID). |
| **Storage** | **0 extra columns**; uses existing FKs. | Adds an extra column and an extra index tree. |
| **Uniqueness** | Natural guarantee; cannot duplicate pairings. | Guarantees row identity, but needs \`UNIQUE\` to prevent duplicate data! |
| **Readability** | Meaningful: \`(OrderID, ProductID)\` speaks for itself. | Opaque number without semantic context. |
| **Junction Rule** | **Default choice for junction tables**. | Avoid on junctions unless referenced by child tables. |

**The Golden Guideline:**
- Use **Composite Primary Keys** on junction tables (\`ENROLLMENT\`, \`ORDER_ITEM\`, \`PRODUCT_LISTING\`).
- Use **Surrogate Keys** on independent entities where no concise natural key exists (\`CUSTOMER\`, \`PURCHASE_ORDER\`, \`TRANSACTION\`).`,
      chips: ['Why not add EnrollmentID?', 'Show me Q8 Banking solution', 'Primary key decision flowchart'],
    };
  }

  // 3. Lab Question Q6: University Course Enrollment
  if (q.includes('q6') || q.includes('enrollment') || (q.includes('course') && q.includes('student'))) {
    return {
      text: `### Lab Question Q6: University Course Enrollment

**Scenario Summary:**
Students enroll in courses; instructors teach courses. A student can enroll in a given course only once.

**Relational Schema:**
- \`STUDENT\` (\`StudentID\` PK, \`FullName\`, \`Email\` UNIQUE, \`Phone\`, \`Program\`)
- \`INSTRUCTOR\` (\`InstructorID\` PK, \`FullName\`, \`Email\` UNIQUE, \`Specialization\`)
- \`COURSE\` (\`CourseID\` PK, \`CourseName\`, \`CreditHours\`, \`Description\`, \`InstructorID\` FK)
- \`ENROLLMENT\` (\`StudentID\` PK, FK, \`CourseID\` PK, FK, \`EnrollmentDate\`, \`Semester\`, \`Grade\`)

**Primary Key Strategy Justification:**
\`ENROLLMENT\` uses a **composite primary key** \`(StudentID, CourseID)\`. Because the business rule states a student cannot take the same course more than once, \`(StudentID, CourseID)\` is naturally unique. Adding a separate \`EnrollmentID\` is redundant.

\`\`\`sql
CREATE TABLE Enrollment (
    StudentID      INT NOT NULL,
    CourseID       INT NOT NULL,
    EnrollmentDate DATE NOT NULL,
    Semester       VARCHAR(10) NOT NULL,
    Grade          CHAR(2),
    PRIMARY KEY (StudentID, CourseID),
    FOREIGN KEY (StudentID) REFERENCES Student(StudentID),
    FOREIGN KEY (CourseID)  REFERENCES Course(CourseID)
);
\`\`\``,
      diagram: `
STUDENT (1) ────◄ (N) [ ENROLLMENT ] (N) ►──── (1) COURSE
                      ├─ StudentID (PK, FK)
                      ├─ CourseID  (PK, FK)
                      ├─ EnrollmentDate
                      └─ Grade
`,
      chips: ['Show test queries for Q6', 'Show me Q7 OrderItem solution', 'Primary key decision flowchart'],
    };
  }

  // 4. Lab Question Q7: E-Commerce Order & Order Items
  if (q.includes('q7') || q.includes('order item') || q.includes('orderitem') || (q.includes('order') && q.includes('product'))) {
    return {
      text: `### Lab Question Q7: E-Commerce Order & Composite Keys

**Scenario Summary:**
Customers place orders containing products. Each product appears at most once per order; \`Quantity\` records how many units were bought.

**Key Architecture Decision:**
Is \`OrderItemID\` needed, or does \`(OrderID, ProductID)\` suffice?
- **Answer:** \`(OrderID, ProductID)\` **suffices completely as the Primary Key**.
- Because the business rules guarantee that a product appears only once per order, \`(OrderID, ProductID)\` is strictly unique.
- Adding \`OrderItemID\` introduces a redundant column and requires an auxiliary \`UNIQUE(OrderID, ProductID)\` constraint anyway!

\`\`\`sql
CREATE TABLE OrderItem (
    OrderID   INT NOT NULL,
    ProductID INT NOT NULL,
    Quantity  INT NOT NULL CHECK (Quantity > 0),
    UnitPrice DECIMAL(10,2) NOT NULL CHECK (UnitPrice >= 0),
    PRIMARY KEY (OrderID, ProductID),
    FOREIGN KEY (OrderID) REFERENCES PurchaseOrder(OrderID) ON DELETE CASCADE,
    FOREIGN KEY (ProductID) REFERENCES Product(ProductID)
);
\`\`\``,
      diagram: `
PURCHASE_ORDER (1) ───◄ (N) [ ORDER_ITEM ] (N) ►─── (1) PRODUCT
                            ├─ OrderID   (PK, FK)
                            ├─ ProductID (PK, FK)
                            ├─ Quantity
                            └─ UnitPrice
`,
      chips: ['Show test queries for Q7', 'Show me Q8 Banking solution', 'Why not use OrderItemID?'],
    };
  }

  // 5. Lab Question Q8: Banking Management System
  if (q.includes('q8') || q.includes('banking') || q.includes('account holder') || q.includes('account_holder')) {
    return {
      text: `### Lab Question Q8: Banking Management System

**Key Junction Table: ACCOUNT_HOLDER**
- Banking accounts often have joint ownership (multiple depositors on one checking/savings account).
- A customer can also own multiple distinct accounts.
- **Key Strategy:** \`ACCOUNT_HOLDER\` uses a **composite primary key** \`(CustomerID, AccountID)\` with attributes \`OpenDate\` and \`OwnershipType\` (e.g. Primary, Secondary).

**Surrogate Key Entities:**
- \`Transaction\`: Uses surrogate \`TransactionID\` because multiple money transfers can occur between the same accounts on the same day.
- \`Loan_Payment\`: Uses \`PaymentID\` to allow partial installment indexing.

\`\`\`sql
CREATE TABLE Account_Holder (
    CustomerID    INT NOT NULL,
    AccountID     INT NOT NULL,
    OpenDate      DATE NOT NULL,
    OwnershipType VARCHAR(20) NOT NULL,
    PRIMARY KEY (CustomerID, AccountID),
    FOREIGN KEY (CustomerID) REFERENCES Customer(CustomerID),
    FOREIGN KEY (AccountID)  REFERENCES Account(AccountID)
);
\`\`\``,
      chips: ['Show me Q9 Marketplace solution', 'Show me Q10 Healthcare solution', 'Surrogate vs composite keys'],
    };
  }

  // 6. Lab Question Q9: E-Commerce Marketplace
  if (q.includes('q9') || q.includes('marketplace') || q.includes('product listing') || q.includes('product_listing')) {
    return {
      text: `### Lab Question Q9: Multi-Vendor Marketplace

**Complex Junction Table Strategy:**
1. \`PRODUCT_LISTING\`: Composite PK \`(SellerID, ProductID)\` — A seller cannot list the same product twice.
2. \`INVENTORY\`: 3-part Composite PK \`(SellerID, ProductID, WarehouseID)\` — Tracks stock per seller listing per warehouse location.
3. \`ORDER_ITEM\`: 3-part Composite PK \`(OrderID, SellerID, ProductID)\` — Identifies the exact vendor listing bought.
4. \`SHIPMENT_ITEM\`: 4-part Composite PK \`(ShipmentID, OrderID, SellerID, ProductID)\` — Resolves split shipments across multiple packages!

\`\`\`sql
CREATE TABLE Product_Listing (
    SellerID      INT NOT NULL,
    ProductID     INT NOT NULL,
    SellingPrice  DECIMAL(10,2) NOT NULL,
    AvailableQty  INT NOT NULL,
    ListingStatus VARCHAR(20) NOT NULL,
    PRIMARY KEY (SellerID, ProductID),
    FOREIGN KEY (SellerID) REFERENCES Seller(SellerID),
    FOREIGN KEY (ProductID) REFERENCES Product(ProductID)
);
\`\`\``,
      chips: ['Show me Q10 Healthcare solution', 'Primary key decision flowchart', 'Why 3-part composite keys?'],
    };
  }

  // 7. Lab Question Q10: Hospital & Healthcare Management
  if (q.includes('q10') || q.includes('hospital') || q.includes('healthcare') || q.includes('room assignment')) {
    return {
      text: `### Lab Question Q10: Hospital & Healthcare Management System

**Composite Keys in Healthcare:**
- \`ROOM_ASSIGNMENT\`: Composite PK \`(AdmissionID, RoomID)\` tracks patient bed transfers.
- \`PATIENT_DIAGNOSIS\`: Composite PK \`(PatientID, DiagnosisID)\` links active clinical conditions to patients.
- \`PRESCRIPTION_ITEM\`: Composite PK \`(PrescriptionID, MedicineID)\` items per prescription.
- \`PATIENT_POLICY\`: Composite PK \`(PatientID, PolicyID)\` links insurance coverage.

**Surrogate Key Exception:**
- \`APPOINTMENT\`: Uses surrogate \`AppointmentID\` because a patient visits the same physician multiple times on different days. \`(PatientID, DoctorID)\` is NOT unique!

\`\`\`sql
CREATE TABLE Room_Assignment (
    AdmissionID INT NOT NULL,
    RoomID      INT NOT NULL,
    AssignDate  DATE NOT NULL,
    ReleaseDate DATE,
    BedNumber   VARCHAR(10),
    PRIMARY KEY (AdmissionID, RoomID),
    FOREIGN KEY (AdmissionID) REFERENCES Admission(AdmissionID),
    FOREIGN KEY (RoomID) REFERENCES Room(RoomID)
);
\`\`\``,
      chips: ['Show me Q6 Enrollment solution', 'Primary key decision flowchart', 'Surrogate vs composite keys'],
    };
  }

  // 8. Difference between PK and FK
  if (q.includes('difference') && (q.includes('pk') || q.includes('primary')) && (q.includes('fk') || q.includes('foreign'))) {
    return {
      text: `### Primary Key vs. Foreign Key

**Primary Key (PK):**
- **Identifies:** Uniquely identifies a single row in its *own* table.
- **Example:** \`StudentID = 101\` identifies Ram Sharma in the \`STUDENT\` table.
- **Constraint:** Strictly unique, never NULL. Exactly one per table (can be a single column or a composite key).

**Foreign Key (FK):**
- **References:** Links a row to a Primary Key in *another* table.
- **Example:** \`StudentID = 101\` inside the \`ENROLLMENT\` table tells the database that this grade belongs to Ram.
- **Constraint:** Must match an existing PK in the referenced table (Referential Integrity).

**Can a column be both a Primary Key and a Foreign Key?**
**Yes, absolutely!** In junction/associative tables, foreign keys from participating tables naturally combine to form a **Composite Primary Key**.

For example, in \`ENROLLMENT\`:
- \`StudentID\` is an FK (references \`STUDENT\`) AND part of the composite PK.
- \`CourseID\` is an FK (references \`COURSE\`) AND part of the composite PK.

Together \`(StudentID, CourseID)\` uniquely identify each enrollment. A composite primary key is a complete and valid primary key—adding a separate \`EnrollmentID\` is redundant unless a specific business rule demands an independent surrogate key.`,
      diagram: `
STUDENT (Parent Table)        ENROLLMENT (Junction Table)
┌──────────────┐             ┌────────────────────────┐
│ StudentID PK │◄────────────│ StudentID   PK, FK     │
│ Name         │   FK Link   │ CourseID    PK, FK     │
└──────────────┘             │ EnrollmentDate, Grade  │
                             └────────────────────────┘
`,
      analogy:
        'Think of a Primary Key as your National ID card (proves who you are). A Foreign Key is a visitor pass at a company that writes down your National ID number so they know who entered.',
      chips: ['Can a column be both PK and FK?', 'Why do we need an associative entity?', 'Where does FK go on many side?'],
    };
  }

  // 9. Can a column be both PK and FK / Composite Primary Key
  if ((q.includes('both') && (q.includes('pk') || q.includes('fk'))) || q.includes('composite')) {
    return {
      text: `### Composite Primary Keys & Foreign Keys

**Can a column be both a Primary Key and a Foreign Key?**
**Yes, absolutely!** A Foreign Key and a Primary Key serve different purposes:
- An **FK** references a record in another parent table.
- A **PK** uniquely identifies a record in the current table.

When resolving Many-to-Many relationships, the foreign keys from both parent entities combine to form a **Composite Primary Key**.

### Example: ENROLLMENT Table
\`\`\`text
ENROLLMENT
-------------------------
StudentID   PK, FK  (References STUDENT)
CourseID    PK, FK  (References COURSE)
EnrollmentDate
Grade
\`\`\`

**Key Takeaways:**
- \`StudentID\` is an FK because it links to \`STUDENT\`, AND it is part of the PK because it helps uniquely identify which student is enrolled.
- \`CourseID\` is an FK because it links to \`COURSE\`, AND it is part of the PK because it helps uniquely identify which course is taken.
- Together, \`(StudentID, CourseID)\` guarantees that a student can enroll in a particular course only once.
- **Do NOT add a redundant \`EnrollmentID\`** unless the business rules require an independently identifiable relationship row. A composite primary key is a complete, first-class, valid primary key!`,
      diagram: `
STUDENT (Parent)              ENROLLMENT (Junction)
┌──────────────┐             ┌─────────────────────────┐
│ StudentID PK │◄────────────│ StudentID   PK, FK      │
│ Name         │   FK Link   │ CourseID    PK, FK      │
└──────────────┘             │ EnrollmentDate, Grade   │
                             └─────────────────────────┘
`,
      analogy:
        'Think of coordinates on a map (Latitude and Longitude). Neither coordinate alone identifies your location, but combined, (Latitude, Longitude) forms a composite primary key uniquely pinpointing a single spot on Earth.',
      chips: ['Primary key decision flowchart', 'Why do we need an associative entity?', 'Show me Q7 OrderItem solution'],
    };
  }

  // 10. Why resolve M:N / Associative entity
  if (q.includes('associative') || q.includes('m:n') || q.includes('many-to-many') || q.includes('junction') || q.includes('bridge')) {
    return {
      text: `### Why Must We Resolve Many-to-Many (M:N) Relationships?

In relational theory, every cell in a table must be **atomic** (First Normal Form, 1NF). It cannot contain a comma-separated list of items.

**The Dilemma:**
If student Alice takes Course 10, Course 20, and Course 30:
1. We cannot put \`10, 20, 30\` in a single \`CourseID\` cell of Alice's row.
2. We cannot add infinite columns (\`Course1\`, \`Course2\`, \`Course3\`).
3. If Alice earns an "A" in Course 10 and a "B" in Course 20, where does the grade live?

**The Solution: The Associative Entity**
We create a middle bridge table (e.g. \`ENROLLMENT\`). Every individual enrollment is one clean row connecting one student to one course with their specific grade and date!`,
      diagram: `
STUDENT 1 ──── N [ ENROLLMENT ] N ──── 1 COURSE
                 ├─ StudentID (FK, PK)
                 ├─ CourseID  (FK, PK)
                 ├─ EnrollmentDate
                 └─ Grade
`,
      analogy:
        'Think of a boarding pass connecting a Passenger to a Flight. The boarding pass is the associative entity holding seat number and gate—information that only exists when a specific passenger books a specific flight.',
      chips: ['Where does the FK go in 1:N?', 'What is a composite primary key?', 'Primary key decision flowchart'],
    };
  }

  // 11. Where does FK go in 1:N?
  if (q.includes('where') && (q.includes('fk') || q.includes('foreign')) && (q.includes('1:n') || q.includes('one-to-many') || q.includes('many side'))) {
    return {
      text: `### Where Does the Foreign Key Go in a 1:N Relationship?

**The Golden Rule:** The Foreign Key **ALWAYS** goes into the table on the **"MANY"** side.

**Why?**
Consider **Department (1) ─── (N) Employee**:
- One department has 50 employees.
- If you tried to put the FK in \`DEPARTMENT\`, you would need to store 50 employee IDs inside one department row (impossible without violating 1NF).
- But each employee has only **ONE** department. So placing \`DepartmentID\` as an FK in the \`EMPLOYEE\` table requires exactly one simple cell per employee!`,
      diagram: `
DEPARTMENT (One Side - Parent)
┌──────────────┐
│ DeptID (PK)  │◄────────────┐
└──────────────┘             │
                             │ FK Link
EMPLOYEE (Many Side - Child) │
┌──────────────┐             │
│ EmployeeID PK│             │
│ DeptID (FK)  ├─────────────┘
└──────────────┘
`,
      analogy:
        'Think of a mother and her children. The mother does not have her children\'s names tattooed on her ID card. Instead, each child carries a birth certificate naming their mother.',
      chips: ['What is referential integrity?', 'What is 1NF?', 'Explain cardinality in simple words'],
    };
  }

  // 12. Cardinality explanation
  if (q.includes('cardinality') || q.includes('1:1') || q.includes('1:n')) {
    return {
      text: `### Understanding Cardinality & Optionality

**Cardinality** describes the *maximum* number of records on one side that can relate to the other side:
- **1:1 (One-to-One):** One person has at most one passport; one passport belongs to one person.
- **1:N (One-to-Many):** One department employs many staff; each staff member works in one department.
- **M:N (Many-to-Many):** One author writes many books; one book can be co-authored by many authors.

**Optionality (Minimum Cardinality):**
- **Mandatory (1):** Must participate (e.g. Every employee must belong to a department).
- **Optional (0):** Can exist without a partner (e.g. A course with 0 enrolled students yet).`,
      diagram: `
Format: (min, max) ─────── (min, max)
STUDENT (0, N) ─────────── (1, 1) DEPARTMENT
(A student must belong to 1 department; a department has 0 to many students)
`,
      chips: ['Why does FK go on many side?', 'Why resolve M:N?', 'What is a primary key?'],
    };
  }

  // 13. What is a Primary Key?
  if (q.includes('primary key') || q.includes('pk')) {
    return {
      text: `### What is a Primary Key?

A **Primary Key** is the unique identifier for rows in a database table.

**The 4 Inviolable Rules of a Primary Key:**
1. **Uniqueness:** No two rows may ever contain the same PK value.
2. **Not Null:** A PK can never be empty or undefined.
3. **Stability:** PK values should not change over time.
4. **Single per table:** A table has exactly one PK (though it may span multiple columns as a composite key).`,
      analogy:
        'Think of your fingerprint or Social Security Number. It identifies you without ambiguity even if another person shares your name, birthdate, and town.',
      chips: ['What is the difference between PK and FK?', 'Can a column be both PK and FK?', 'Primary key decision flowchart'],
    };
  }

  // 14. Screenshot Pattern: Cashier, Sale Receipt, Receipt Line, Barcode Product (Section 6 & 12)
  if (
    q.includes('cashier') ||
    q.includes('sale receipt') ||
    q.includes('salereceipt') ||
    q.includes('receipt line') ||
    q.includes('receiptline') ||
    q.includes('barcode') ||
    (q.includes('pos') && q.includes('supermarket'))
  ) {
    return {
      text: `### Retail POS Pattern: Cashier, Receipt, Line, and Barcode

**1. CASHIER ── rings_up ──► SALE_RECEIPT (Cardinality: 1:N)**
- **Forward Traversal:** "One cashier can process many sales receipts over their shift."
- **Reverse-Read Test:** "Each sales receipt is processed by exactly one cashier."
- **Schema Implementation:** \`SALE_RECEIPT\` contains \`CashierID\` as a Foreign Key.
- **Critical Error Warning:** Rendering this as \`1:1\` is a **CRITICAL ERROR**. That would assert each cashier is fired or restricted after printing a single receipt!

**2. SALE_RECEIPT ── contains ──► RECEIPT_LINE (Cardinality: 1:N)**
- **Forward Traversal:** "A sales receipt contains one or more receipt lines."
- **Reverse-Read Test:** "Each receipt line belongs to exactly one sales receipt."
- **Schema Implementation:** \`RECEIPT_LINE\` contains \`ReceiptID\` as a Foreign Key. The \`[N]\` marker belongs on \`RECEIPT_LINE\`.

**3. BARCODE_PRODUCT ── scanned_in ──► RECEIPT_LINE (Cardinality: 1:N)**
- **Forward Traversal:** "One barcoded product can appear across many receipt lines in different customer carts."
- **Reverse-Read Test:** "Each receipt line refers to one product."
- **Schema Implementation:** \`RECEIPT_LINE\` contains \`Barcode\` as a Foreign Key referencing \`BARCODE_PRODUCT\`.

**Primary Key Strategy for RECEIPT_LINE:**
- **Candidate Composite Key:** If a product appears at most once per receipt, \`PRIMARY KEY (ReceiptID, Barcode)\` is the natural composite key.
- **Surrogate Key:** If the requirements explicitly specify a separate identifier (e.g. \`LineItemID\`), use it as PK and enforce \`UNIQUE(ReceiptID, Barcode)\`.`,
      diagram: `
CASHIER [1] (0..N) ──────── rings_up ────────► [N] (1..1) SALE_RECEIPT
                                                               │
                                                           [1] (1..1)
                                                            contains
                                                               ▼
BARCODE_PRODUCT [1] (0..N) ── scanned_in ──► [N] (1..N) RECEIPT_LINE
`,
      chips: ['What is the 3-way triangulation check?', 'Show me Q7 OrderItem solution', 'Primary key decision flowchart'],
    };
  }

  // 15. The 3-Way Triangulation Check & ERD Correctness Principles
  if (
    q.includes('triangulation') ||
    q.includes('erd correctness') ||
    q.includes('reverse read') ||
    q.includes('direction test') ||
    q.includes('35 principles') ||
    q.includes('database correctness')
  ) {
    return {
      text: `### The 3-Way Relational Triangulation Check

The primary responsibility of an educational ERD tool is **DATABASE CORRECTNESS**. Never determine cardinality from visual appearance.

**Every relationship must pass 3 independent checks:**
1. **Check A (Business Statement):** The natural language business rule (e.g. "One cashier processes many receipts").
2. **Check B (Diagram Cardinality):** The visual endpoint markers (e.g. \`CASHIER [1] ──── [N] SALE_RECEIPT\`).
3. **Check C (Schema Implementation):** The foreign key and uniqueness structure (e.g. \`SALE_RECEIPT.CashierID FK\`).

**The Golden Rules of Engagement:**
- **Bidirectional Traversal:** Read left-to-right AND right-to-left. Both statements must be true.
- **Endpoint Anchors:** The \`[1]\` and \`[N]\` markers must physically belong to their respective entity boxes.
- **No Ambiguous Middle Text:** Never rely on a vague "one — many" label in the middle of a line.
- **Schema Priority:** A non-unique FK usually represents the "many" side, but business rules always have ultimate priority!`,
      diagram: `
               [ CHECK A ]
             Business Rules
             /            \\
            /              \\
    [ CHECK B ] ──────── [ CHECK C ]
Diagram Cardinality    Schema Structure (FK, PK, UNIQUE)

Rule: All three must agree. A mismatch indicates a modeling error!
`,
      chips: ['Show Cashier and Receipt POS pattern', 'Primary key decision flowchart', 'Surrogate vs composite keys'],
    };
  }

  // Default context-aware fallback response
  return {
    text: `### Database Design Insight & Lab Solutions

You are currently working in **${context.activeScenarioName || 'Database Design Lab'}**.

In relational database modeling:
- **Entities** turn into **Tables**
- **Attributes** turn into **Columns**
- **Primary Keys** ensure every row is uniquely identifiable
- **Foreign Keys** connect child records to parent records
- **Junction Tables** resolve Many-to-Many relationships using **Composite Primary Keys**

Select any question below to explore the decision flowchart, compare keys, or inspect verified solutions for Q6 through Q10!`,
    chips: [
      'Primary key decision flowchart',
      'Surrogate vs composite keys',
      'Show me Q6 Enrollment solution',
      'Show me Q7 OrderItem solution',
      'Show me Q8 Banking solution',
      'Show me Q9 Marketplace solution',
      'Show me Q10 Healthcare solution',
    ],
  };
}
