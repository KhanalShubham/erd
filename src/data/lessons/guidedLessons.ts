export interface GuidedStep {
  stepNumber: number;
  title: string;
  subtitle: string;
  instruction: string;
  conceptExplainer: {
    what: string;
    why: string;
    databaseEffect: string;
  };
  hints: string[];
  suggestedActionLabel?: string;
}

export const guidedLessons: GuidedStep[] = [
  {
    stepNumber: 1,
    title: 'Identify Entities',
    subtitle: 'Extract real-world things from business requirements',
    instruction:
      'Read the scenario requirements. Look for principal nouns that need their own records stored independently. In the LMS scenario, find the core participants.',
    conceptExplainer: {
      what: 'An Entity is a real-world person, place, object, or concept about which data is stored.',
      why: 'Databases model reality by isolating independent concepts into structured entities rather than mixing all data into one disorganized sheet.',
      databaseEffect: 'Each Entity will become its own Relational Table in the physical database.',
    },
    hints: [
      'Look for the main nouns in the requirements text (e.g. Student, Course, Instructor).',
      'Ask: "Does this thing have multiple attributes and multiple distinct instances?"',
      'Add entities: STUDENT, COURSE, INSTRUCTOR using the "+ Add Entity" button on the canvas toolbar.',
    ],
    suggestedActionLabel: 'Add Core Entities (Student, Course, Instructor)',
  },
  {
    stepNumber: 2,
    title: 'Add Attributes',
    subtitle: 'Give properties and characteristics to your entities',
    instruction:
      'Entities need attributes to describe them. For each entity, specify its characteristics (e.g., StudentID, Name, Email, DateOfBirth) and appropriate data types.',
    conceptExplainer: {
      what: 'An Attribute is a property, quality, or characteristic of an entity.',
      why: 'Entities cannot store information without attributes. Choosing precise data types prevents invalid data from entering the system.',
      databaseEffect: 'Each Attribute becomes a Column (Field) in the corresponding relational table with a designated SQL type.',
    },
    hints: [
      'For STUDENT: add StudentID (INT), Name (VARCHAR), Email (VARCHAR), DateOfBirth (DATE).',
      'For COURSE: add CourseID (INT), CourseName (VARCHAR), CreditHours (INT).',
      'For INSTRUCTOR: add InstructorID (INT), Name (VARCHAR), Email (VARCHAR).',
    ],
    suggestedActionLabel: 'Populate Attributes on Canvas',
  },
  {
    stepNumber: 3,
    title: 'Identify Primary Keys',
    subtitle: 'Designate unique identifiers for each entity',
    instruction:
      'Select each entity and designate an attribute that uniquely identifies each record. Mark it as the Primary Key (PK).',
    conceptExplainer: {
      what: 'A Primary Key (PK) is a minimal set of attributes that uniquely identifies each tuple (row) in an entity.',
      why: 'Without a primary key, there is no reliable way to distinguish two rows with identical names or to reference records across tables.',
      databaseEffect: 'Enforces Entity Integrity: The DBMS generates an internal B-Tree unique index and forbids any duplicate or NULL values.',
    },
    hints: [
      'Can two students have the same name? Yes! Therefore, Name cannot be a primary key.',
      'StudentID, CourseID, and InstructorID are ideal unique primary keys.',
      'Click an attribute in the Inspector and toggle "Primary Key".',
    ],
    suggestedActionLabel: 'Set Primary Keys',
  },
  {
    stepNumber: 4,
    title: 'Create Relationships',
    subtitle: 'Connect entities that interact with one another',
    instruction:
      'Connect entities that have business associations. An instructor teaches courses; students enroll in courses.',
    conceptExplainer: {
      what: 'A Relationship is an association among two or more entities.',
      why: 'Relational databases gain their power from relating separate entities without duplicating their internal attributes.',
      databaseEffect: 'Relationships dictate where Foreign Keys must be created to link the tables together.',
    },
    hints: [
      'Look for the active verbs in the requirements: "teaches", "enrolls in".',
      'Connect INSTRUCTOR to COURSE.',
      'Connect STUDENT to COURSE.',
    ],
    suggestedActionLabel: 'Connect Entities',
  },
  {
    stepNumber: 5,
    title: 'Define Cardinality',
    subtitle: 'Specify the maximum number of entity instances involved (1:1, 1:N, M:N)',
    instruction:
      'Decide whether associations are 1-to-1, 1-to-Many, or Many-to-Many. How many courses can one instructor teach? Can a course have multiple instructors?',
    conceptExplainer: {
      what: 'Cardinality ratio specifies the maximum number of relationship instances an entity can participate in.',
      why: 'Cardinality determines table architecture—specifically which table receives a foreign key or whether a junction table is needed.',
      databaseEffect: 'In 1:N, the PK of the "1" side goes to the "N" side as a foreign key. In M:N, an associative junction table is mandatory.',
    },
    hints: [
      'Instructor to Course is 1:N (One instructor teaches many courses; each course has one instructor).',
      'Student to Course is M:N (A student takes many courses; a course has many students).',
    ],
    suggestedActionLabel: 'Set Cardinality',
  },
  {
    stepNumber: 6,
    title: 'Define Optionality',
    subtitle: 'Determine participation requirements (0..N vs 1..N)',
    instruction:
      'Optionality defines the minimum participation. Can a new course exist without any enrolled students yet (0..N)? Can an enrollment exist without a student (1..1)?',
    conceptExplainer: {
      what: 'Optionality (minimum cardinality) specifies whether participation is mandatory (1) or optional (0).',
      why: 'Clearly separates "how many at most" from "must it exist at all".',
      databaseEffect: 'Mandatory participation translates to NOT NULL on the foreign key column. Optional allows NULL.',
    },
    hints: [
      'A new student might not have enrolled in any course yet: Student optionality is 0..N.',
      'An enrollment record MUST belong to an existing student: Enrollment participation is 1..1.',
    ],
    suggestedActionLabel: 'Tune Optionality',
  },
  {
    stepNumber: 7,
    title: 'Add Constraints & Domains',
    subtitle: 'Enforce business rules and boundary constraints',
    instruction:
      'Configure Domain boundaries (e.g. CreditHours between 1 and 6, valid email pattern, Grade enumeration).',
    conceptExplainer: {
      what: 'A Domain defines the set of permissible values for an attribute. Constraints enforce business rules.',
      why: 'Prevents corrupted or nonsensical data (e.g., negative credits or invalid grades) from ever entering the database.',
      databaseEffect: 'Generates SQL CHECK constraints, UNIQUE indexes, and NOT NULL specifications.',
    },
    hints: [
      'On Course.CreditHours, set Domain Min: 1, Max: 6.',
      'On Student.Email, mark Unique: YES and Domain Pattern: email.',
      'On Grade, set Allowed Values: A+, A, B+, B, C, F.',
    ],
    suggestedActionLabel: 'Define Attribute Domains',
  },
  {
    stepNumber: 8,
    title: 'Resolve Many-to-Many (M:N)',
    subtitle: 'Transform M:N relationship into an Associative Entity',
    instruction:
      'Relational databases cannot directly implement an M:N relationship without data duplication. Resolve the Student–Course relationship into an Associative Entity (ENROLLMENT).',
    conceptExplainer: {
      what: 'An Associative Entity (Junction Table) represents an M:N relationship and holds relationship-specific attributes.',
      why: 'Eliminates multivalued cells and repeating groups, bringing the model into 1st Normal Form.',
      databaseEffect: 'Creates ENROLLMENT table with composite PK (StudentID, CourseID) and foreign keys referencing both tables.',
    },
    hints: [
      'Click the Student–Course relationship and click "Resolve M:N".',
      'Notice how Enrollment inherits StudentID (FK) and CourseID (FK).',
      'Add relationship attributes: EnrollmentDate and Grade to ENROLLMENT.',
    ],
    suggestedActionLabel: 'Resolve M:N to Associative Entity',
  },
  {
    stepNumber: 9,
    title: 'Inspect Relational Tables',
    subtitle: 'See conceptual ERD become physical relational tables',
    instruction:
      'Switch to the [RELATIONAL TABLES] tab in the bottom dock. Notice how entities became tables, attributes became columns, and foreign keys link the tables.',
    conceptExplainer: {
      what: 'The Relational Model represents data as two-dimensional tables consisting of rows and named columns.',
      why: 'Bridges high-level conceptual modeling with real relational database storage engines.',
      databaseEffect: 'Shows exact relational table structures, primary keys, and foreign key pointers.',
    },
    hints: [
      'Click any Foreign Key column in the Relational View.',
      'Watch how the system highlights the referenced Primary Key with an animated line!',
    ],
    suggestedActionLabel: 'Inspect Relational Model',
  },
  {
    stepNumber: 10,
    title: 'Test Database Integrity in Sandbox',
    subtitle: 'Insert records and witness real-time constraint enforcement',
    instruction:
      'Switch to the [DATA SANDBOX] tab. Add sample rows. Intentionally try inserting a duplicate StudentID or a non-existent CourseID to see the database engine catch violations!',
    conceptExplainer: {
      what: 'Database Integrity Testing validates that entity, referential, and domain constraints are strictly enforced.',
      why: 'Experiencing constraint errors firsthand teaches why database rules are far superior to manual spreadsheet validation.',
      databaseEffect: 'Simulates real DBMS ACID validation and transaction rejection upon constraint violation.',
    },
    hints: [
      'Insert Student with StudentID 101. Then try inserting StudentID 101 again -> Watch PRIMARY KEY VIOLATION trigger!',
      'Try inserting an enrollment with CourseID 999 -> Watch FOREIGN KEY VIOLATION trigger!',
    ],
    suggestedActionLabel: 'Run Data Integrity Tests',
  },
  {
    stepNumber: 11,
    title: 'Generate Production SQL',
    subtitle: 'Export clean DDL and DML scripts ready for PostgreSQL or MySQL',
    instruction:
      'Switch to the [SQL GENERATOR] tab. Review the generated CREATE TABLE statements with full constraints and copy the production script.',
    conceptExplainer: {
      what: 'DDL (Data Definition Language) commands instruct the database server to build the physical schemas.',
      why: 'A well-designed ERD generates clean, error-free SQL automatically without manual query writing errors.',
      databaseEffect: 'Produces syntactically valid SQL with PRIMARY KEY, FOREIGN KEY REFERENCES, and CHECK constraints.',
    },
    hints: [
      'Toggle between Standard SQL, PostgreSQL, and MySQL dialect views.',
      'Use the "Copy SQL" button to copy the production script.',
    ],
    suggestedActionLabel: 'Copy Production SQL Script',
  },
];
