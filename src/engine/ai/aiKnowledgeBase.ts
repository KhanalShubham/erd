// ============================================================================
// AI Knowledge Base & Context Engine for Interactive ERD Learning Notebook
// Provides structured database concepts, real-world analogies, common
// misconceptions, Socratic dialogue trees, and contextual explanations.
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
      'Usually has a Composite Primary Key combining both foreign keys (or a surrogate key like enrollment_id).',
      'Both foreign keys must satisfy referential integrity.',
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
// 2. Common Misconceptions Database (Expanded Section Point 11.2)
// ----------------------------------------------------------------------------

export const COMMON_MISCONCEPTIONS: MisconceptionItem[] = [
  {
    id: 'misc_multi_pk',
    category: 'Keys',
    myth: 'A table can have multiple Primary Keys.',
    whyItsFalse:
      'By mathematical definition of relational algebra, a relation has exactly ONE primary key to identify a tuple.',
    correctPrinciple:
      'A table has exactly ONE Primary Key. Columns that reference parent entities are Foreign Keys. In an associative entity, a dedicated Primary Key (e.g. EnrollmentID) uniquely identifies the record, while StudentID and CourseID serve as Foreign Keys.',
    example:
      'In ENROLLMENT, EnrollmentID is the single Primary Key, while StudentID (FK) and CourseID (FK) link to Student and Course.',
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
// 3. Socratic Dialogue Engine (Interactive Guidance for Scenarios)
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
];

// ----------------------------------------------------------------------------
// 4. Intelligent Natural Language Response Generator for AI Tutor Chat
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

  // Difference between PK and FK
  if (q.includes('difference') && (q.includes('pk') || q.includes('primary')) && (q.includes('fk') || q.includes('foreign'))) {
    return {
      text: `### Primary Key vs. Foreign Key

**Primary Key (PK):**
• **Identifies:** Uniquely identifies a single row in its *own* table.
• **Example:** \`StudentID = 101\` identifies Ram Sharma in the \`STUDENT\` table.
• **Constraint:** Strictly unique, never NULL. Exactly one per table.

**Foreign Key (FK):**
• **References:** Links a row to a Primary Key in *another* table.
• **Example:** \`StudentID = 101\` inside the \`ENROLLMENT\` table tells the database that this grade belongs to Ram.
• **Constraint:** Must match an existing PK in the referenced table (Referential Integrity).

**Can a column be both?**
While composite keys historically allowed columns to be both, industry best practice is for every table to have ONE dedicated Primary Key (e.g., \`EnrollmentID\`), while referencing columns act purely as Foreign Keys (\`StudentID FK\`, \`CourseID FK\`).`,
      diagram: `
STUDENT (PK Table)            ENROLLMENT (FK Table)
┌──────────────┐             ┌──────────────┐
│ StudentID PK │◄────────────│ StudentID FK │
│ Name         │   FK Link   │ CourseID FK  │
└──────────────┘             └──────────────┘
`,
      analogy:
        'Think of a Primary Key as your National ID card (proves who you are). A Foreign Key is a visitor pass at a company that writes down your National ID number so they know who entered.',
      chips: ['Why does FK go on many side?', 'Can a column be both PK and FK?', 'What is referential integrity?'],
    };
  }

  // Why resolve M:N / Associative entity
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
      chips: ['Where does the FK go in 1:N?', 'What is a composite primary key?', 'Show me LMS scenario'],
    };
  }

  // Where does FK go in 1:N?
  if (q.includes('where') && (q.includes('fk') || q.includes('foreign')) && (q.includes('1:n') || q.includes('one-to-many') || q.includes('many side'))) {
    return {
      text: `### Where Does the Foreign Key Go in a 1:N Relationship?

**The Golden Rule:** The Foreign Key **ALWAYS** goes into the table on the **"MANY"** side.

**Why?**
Consider **Department (1) ─── (N) Employee**:
• One department has 50 employees.
• If you tried to put the FK in \`DEPARTMENT\`, you would need to store 50 employee IDs inside one department row (impossible without violating 1NF).
• But each employee has only **ONE** department. So placing \`DepartmentID\` as an FK in the \`EMPLOYEE\` table requires exactly one simple cell per employee!`,
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

  // Cardinality explanation
  if (q.includes('cardinality') || q.includes('1:1') || q.includes('1:n')) {
    return {
      text: `### Understanding Cardinality & Optionality

**Cardinality** describes the *maximum* number of records on one side that can relate to the other side:
• **1:1 (One-to-One):** One person has at most one passport; one passport belongs to one person.
• **1:N (One-to-Many):** One department employs many staff; each staff member works in one department.
• **M:N (Many-to-Many):** One author writes many books; one book can be co-authored by many authors.

**Optionality (Minimum Cardinality):**
• **Mandatory (1):** Must participate (e.g. Every employee must belong to a department).
• **Optional (0):** Can exist without a partner (e.g. A course with 0 enrolled students yet).`,
      diagram: `
Format: (min, max) ─────── (min, max)
STUDENT (0, N) ─────────── (1, 1) DEPARTMENT
(A student must belong to 1 department; a department has 0 to many students)
`,
      chips: ['Why does FK go on many side?', 'Why resolve M:N?', 'What is a primary key?'],
    };
  }

  // What is a Primary Key?
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
      chips: ['What is the difference between PK and FK?', 'Can a column be both PK and FK?'],
    };
  }

  // Default context-aware fallback response
  return {
    text: `### Database Design Insight

You are currently working in **${context.activeScenarioName || 'Database Design Lab'}**.

In relational database modeling:
• **Entities** turn into **Tables**
• **Attributes** turn into **Columns**
• **Primary Keys** ensure every row is uniquely identifiable
• **Foreign Keys** connect child records to parent records
• **Many-to-Many relationships** resolve into **Associative Bridge Tables**

Click any table column or relationship line on the canvas to see an instant contextual explanation, or select a question below!`,
    chips: [
      'What is the difference between PK and FK?',
      'Why do we need an associative entity?',
      'Where does the FK go in a 1:N relationship?',
      'Explain cardinality in simple words',
    ],
  };
}
