export interface AuthoritativeEntityAttribute {
  name: string;
  dataType: string;
  isPk: boolean;
  isFk: boolean;
  references?: string;
  isUnique?: boolean;
  nullable?: boolean;
  domainConstraint?: string;
}

export interface AuthoritativeEntity {
  name: string;
  type: 'strong' | 'weak' | 'associative';
  purpose: string;
  attributes: AuthoritativeEntityAttribute[];
  primaryKey: string;
  pkJustification: string;
}

export interface AuthoritativeRelationship {
  source: string;
  target: string;
  name: string;
  cardinality: string;
  sourceOptionality: string;
  targetOptionality: string;
  foreignKey: string;
  forwardSentence: string;
  reverseSentence: string;
  explanation: string;
}

export interface CommonMistake {
  mistake: string;
  whyWrong: string;
  correction: string;
}

export interface AuthoritativeSolution {
  scenarioId: string;
  title: string;
  domain: string;
  difficulty: string;
  problemStatement: string;
  businessRules: string[];
  entities: AuthoritativeEntity[];
  relationships: AuthoritativeRelationship[];
  keyAnalysis: {
    primaryKeys: string[];
    foreignKeys: string[];
    compositeKeys: string[];
    candidateKeys: string[];
    uniqueConstraints: string[];
  };
  normalization: {
    firstNormalForm: string;
    secondNormalForm: string;
    thirdNormalForm: string;
  };
  mermaidDiagram: string;
  sqlDdl: string;
  commonMistakes: CommonMistake[];
  validationStatus: 'PASS';
}

export const AUTHORITATIVE_SOLUTIONS: Record<string, AuthoritativeSolution> = {
  // 1. LMS System
  lms: {
    scenarioId: 'lms',
    title: 'University Learning Management System (LMS)',
    domain: 'Education / Academic Administration',
    difficulty: 'Intermediate',
    problemStatement:
      'A university manages student enrollments, faculty course assignments, and academic performance grading across academic semesters.',
    businessRules: [
      'Each student is identified by StudentID, with a unique email address.',
      'Each instructor is identified by InstructorID and can teach multiple courses (1:N).',
      'Each course is taught by exactly one instructor (InstructorID NOT NULL).',
      'A student can enroll in multiple courses, and each course can enroll multiple students (M:N).',
      'The M:N relationship is resolved through the ENROLLMENT associative entity.',
      'A student may enroll in a course only once per academic period; (StudentID, CourseID) uniquely identifies the enrollment.',
      'Enrollment records an enrollment date and a final letter grade (A+, A, B+, B, C, F).',
    ],
    entities: [
      {
        name: 'STUDENT',
        type: 'strong',
        purpose: 'Stores registered university student profile and demographic information.',
        attributes: [
          { name: 'StudentID', dataType: 'INTEGER', isPk: true, isFk: false, isUnique: true, nullable: false },
          { name: 'Name', dataType: 'VARCHAR(100)', isPk: false, isFk: false, nullable: false },
          { name: 'Email', dataType: 'VARCHAR(100)', isPk: false, isFk: false, isUnique: true, nullable: false },
          { name: 'DateOfBirth', dataType: 'DATE', isPk: false, isFk: false, nullable: false },
        ],
        primaryKey: 'StudentID',
        pkJustification: 'StudentID is a concise, immutable, unique identifier assigned by the university registrar.',
      },
      {
        name: 'INSTRUCTOR',
        type: 'strong',
        purpose: 'Stores faculty professor credentials and departmental contact details.',
        attributes: [
          { name: 'InstructorID', dataType: 'INTEGER', isPk: true, isFk: false, isUnique: true, nullable: false },
          { name: 'Name', dataType: 'VARCHAR(100)', isPk: false, isFk: false, nullable: false },
          { name: 'Email', dataType: 'VARCHAR(100)', isPk: false, isFk: false, isUnique: true, nullable: false },
        ],
        primaryKey: 'InstructorID',
        pkJustification: 'InstructorID is the authoritative employee identification key.',
      },
      {
        name: 'COURSE',
        type: 'strong',
        purpose: 'Defines academic catalog offerings, credit weight, and assigned instructor.',
        attributes: [
          { name: 'CourseID', dataType: 'INTEGER', isPk: true, isFk: false, isUnique: true, nullable: false },
          { name: 'CourseName', dataType: 'VARCHAR(100)', isPk: false, isFk: false, nullable: false },
          { name: 'CreditHours', dataType: 'INTEGER', isPk: false, isFk: false, nullable: false, domainConstraint: 'CHECK (CreditHours BETWEEN 1 AND 6)' },
          { name: 'InstructorID', dataType: 'INTEGER', isPk: false, isFk: true, references: 'INSTRUCTOR.InstructorID', nullable: false },
        ],
        primaryKey: 'CourseID',
        pkJustification: 'CourseID is the designated curricular identification number.',
      },
      {
        name: 'ENROLLMENT',
        type: 'associative',
        purpose: 'Resolves the M:N relationship between Student and Course, recording grades and enrollment timestamps.',
        attributes: [
          { name: 'StudentID', dataType: 'INTEGER', isPk: true, isFk: true, references: 'STUDENT.StudentID', nullable: false },
          { name: 'CourseID', dataType: 'INTEGER', isPk: true, isFk: true, references: 'COURSE.CourseID', nullable: false },
          { name: 'EnrollmentDate', dataType: 'DATE', isPk: false, isFk: false, nullable: false },
          { name: 'Grade', dataType: 'VARCHAR(2)', isPk: false, isFk: false, nullable: true, domainConstraint: "CHECK (Grade IN ('A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'))" },
        ],
        primaryKey: '(StudentID, CourseID)',
        pkJustification:
          'Under the business rule that a student enrolls in a given course at most once, (StudentID, CourseID) is naturally unique. Introducing an artificial EnrollmentID is redundant.',
      },
    ],
    relationships: [
      {
        source: 'INSTRUCTOR',
        target: 'COURSE',
        name: 'teaches',
        cardinality: '1:N',
        sourceOptionality: '1..1',
        targetOptionality: '0..N',
        foreignKey: 'COURSE.InstructorID → INSTRUCTOR.InstructorID',
        forwardSentence: 'One instructor can teach many courses (0..N).',
        reverseSentence: 'Each course is taught by exactly one instructor (1..1).',
        explanation: '1:N relationship. The foreign key InstructorID is stored on the many side (COURSE).',
      },
      {
        source: 'STUDENT',
        target: 'ENROLLMENT',
        name: 'registers_in',
        cardinality: '1:N',
        sourceOptionality: '1..1',
        targetOptionality: '0..N',
        foreignKey: 'ENROLLMENT.StudentID → STUDENT.StudentID',
        forwardSentence: 'One student can register for multiple course enrollments (0..N).',
        reverseSentence: 'Each enrollment belongs to exactly one student (1..1).',
        explanation: 'Left half of the M:N resolution. Foreign key StudentID is part of ENROLLMENT composite PK.',
      },
      {
        source: 'COURSE',
        target: 'ENROLLMENT',
        name: 'contains_students',
        cardinality: '1:N',
        sourceOptionality: '1..1',
        targetOptionality: '0..N',
        foreignKey: 'ENROLLMENT.CourseID → COURSE.CourseID',
        forwardSentence: 'One course can have many student enrollments (0..N).',
        reverseSentence: 'Each enrollment record belongs to exactly one course (1..1).',
        explanation: 'Right half of the M:N resolution. Foreign key CourseID is part of ENROLLMENT composite PK.',
      },
    ],
    keyAnalysis: {
      primaryKeys: ['STUDENT.StudentID', 'INSTRUCTOR.InstructorID', 'COURSE.CourseID', 'ENROLLMENT.(StudentID, CourseID)'],
      foreignKeys: [
        'COURSE.InstructorID → INSTRUCTOR.InstructorID',
        'ENROLLMENT.StudentID → STUDENT.StudentID',
        'ENROLLMENT.CourseID → COURSE.CourseID',
      ],
      compositeKeys: ['ENROLLMENT.(StudentID, CourseID)'],
      candidateKeys: ['STUDENT.Email', 'INSTRUCTOR.Email'],
      uniqueConstraints: ['STUDENT(Email)', 'INSTRUCTOR(Email)'],
    },
    normalization: {
      firstNormalForm: 'All attributes contain atomic values (single scalar types); no multivalued grade or phone arrays.',
      secondNormalForm: 'All non-key attributes in ENROLLMENT (EnrollmentDate, Grade) depend on the entire composite key (StudentID, CourseID).',
      thirdNormalForm: 'No transitive dependencies exist; Course attributes depend solely on CourseID, not on Instructor details.',
    },
    mermaidDiagram: `erDiagram
    STUDENT ||--o{ ENROLLMENT : "registers_in"
    COURSE ||--o{ ENROLLMENT : "contains_students"
    INSTRUCTOR ||--o{ COURSE : "teaches"
    STUDENT {
        int StudentID PK
        string Name
        string Email UK
        date DateOfBirth
    }
    INSTRUCTOR {
        int InstructorID PK
        string Name
        string Email UK
    }
    COURSE {
        int CourseID PK
        string CourseName
        int CreditHours
        int InstructorID FK
    }
    ENROLLMENT {
        int StudentID PK,FK
        int CourseID PK,FK
        date EnrollmentDate
        string Grade
    }`,
    sqlDdl: `CREATE TABLE Student (
    StudentID   INT PRIMARY KEY,
    Name        VARCHAR(100) NOT NULL,
    Email       VARCHAR(100) NOT NULL UNIQUE,
    DateOfBirth DATE NOT NULL
);

CREATE TABLE Instructor (
    InstructorID INT PRIMARY KEY,
    Name         VARCHAR(100) NOT NULL,
    Email        VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE Course (
    CourseID     INT PRIMARY KEY,
    CourseName   VARCHAR(100) NOT NULL,
    CreditHours  INT NOT NULL CHECK (CreditHours BETWEEN 1 AND 6),
    InstructorID INT NOT NULL,
    FOREIGN KEY (InstructorID) REFERENCES Instructor(InstructorID) ON DELETE RESTRICT
);

CREATE TABLE Enrollment (
    StudentID      INT NOT NULL,
    CourseID       INT NOT NULL,
    EnrollmentDate DATE NOT NULL,
    Grade          VARCHAR(2) CHECK (Grade IN ('A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F')),
    PRIMARY KEY (StudentID, CourseID),
    FOREIGN KEY (StudentID) REFERENCES Student(StudentID) ON DELETE CASCADE,
    FOREIGN KEY (CourseID)  REFERENCES Course(CourseID) ON DELETE CASCADE
);`,
    commonMistakes: [
      {
        mistake: 'Adding a surrogate EnrollmentID to ENROLLMENT without justification.',
        whyWrong: 'Under business rule "student enrolls at most once", (StudentID, CourseID) is uniquely identifying. An unnecessary ID allows duplicate enrollments.',
        correction: 'Use composite primary key (StudentID, CourseID).',
      },
      {
        mistake: 'Placing InstructorID in Student or StudentID in Course directly.',
        whyWrong: 'Violates cardinality: courses have many students (M:N) and instructors do not belong to students.',
        correction: 'Use ENROLLMENT junction table for Student/Course and put InstructorID in Course (1:N).',
      },
    ],
    validationStatus: 'PASS',
  },

  // 2. Student Management System
  student_management: {
    scenarioId: 'student_management',
    title: 'Student Academic Records & Advising',
    domain: 'Education / Registrar Administration',
    difficulty: 'Beginner',
    problemStatement:
      'Manage university academic departments, faculty advisors, student enrollments with assigned advisors, and term GPA grade reports.',
    businessRules: [
      'Each department has DeptID and unique DeptName.',
      'Faculty advisors belong to one department (1:N from Department to Advisor).',
      'Each student registers under a department and is assigned exactly one faculty advisor.',
      'One advisor can mentor multiple students (1:N from Advisor to Student).',
      'Each term, students receive a GradeReport with a GPA constrained between 0.00 and 4.00.',
    ],
    entities: [
      {
        name: 'DEPARTMENT',
        type: 'strong',
        purpose: 'Academic division overseeing degree programs.',
        attributes: [
          { name: 'DeptID', dataType: 'INTEGER', isPk: true, isFk: false, isUnique: true, nullable: false },
          { name: 'DeptName', dataType: 'VARCHAR', isPk: false, isFk: false, isUnique: true, nullable: false },
          { name: 'BuildingCode', dataType: 'VARCHAR', isPk: false, isFk: false, nullable: false },
        ],
        primaryKey: 'DeptID',
        pkJustification: 'DeptID is the minimal, unique natural identifier.',
      },
      {
        name: 'FACULTY_ADVISOR',
        type: 'strong',
        purpose: 'Faculty professor assigned to guide students.',
        attributes: [
          { name: 'AdvisorID', dataType: 'INTEGER', isPk: true, isFk: false, isUnique: true, nullable: false },
          { name: 'AdvisorName', dataType: 'VARCHAR', isPk: false, isFk: false, nullable: false },
          { name: 'OfficeRoom', dataType: 'VARCHAR', isPk: false, isFk: false, nullable: false },
          { name: 'DeptID', dataType: 'INTEGER', isPk: false, isFk: true, references: 'DEPARTMENT.DeptID', nullable: false },
        ],
        primaryKey: 'AdvisorID',
        pkJustification: 'AdvisorID uniquely distinguishes professors across departments.',
      },
      {
        name: 'STUDENT',
        type: 'strong',
        purpose: 'Enrolled degree-seeking scholar.',
        attributes: [
          { name: 'StudentID', dataType: 'INTEGER', isPk: true, isFk: false, isUnique: true, nullable: false },
          { name: 'FirstName', dataType: 'VARCHAR', isPk: false, isFk: false, nullable: false },
          { name: 'LastName', dataType: 'VARCHAR', isPk: false, isFk: false, nullable: false },
          { name: 'Email', dataType: 'VARCHAR', isPk: false, isFk: false, isUnique: true, nullable: false },
          { name: 'DeptID', dataType: 'INTEGER', isPk: false, isFk: true, references: 'DEPARTMENT.DeptID', nullable: false },
          { name: 'AdvisorID', dataType: 'INTEGER', isPk: false, isFk: true, references: 'FACULTY_ADVISOR.AdvisorID', nullable: false },
        ],
        primaryKey: 'StudentID',
        pkJustification: 'StudentID is the unique student identification number.',
      },
      {
        name: 'GRADE_REPORT',
        type: 'strong',
        purpose: 'Semester official academic transcript record.',
        attributes: [
          { name: 'ReportID', dataType: 'INTEGER', isPk: true, isFk: false, isUnique: true, nullable: false },
          { name: 'StudentID', dataType: 'INTEGER', isPk: false, isFk: true, references: 'STUDENT.StudentID', nullable: false },
          { name: 'Semester', dataType: 'VARCHAR', isPk: false, isFk: false, nullable: false },
          { name: 'GPA', dataType: 'DECIMAL(3, 2)', isPk: false, isFk: false, nullable: false, domainConstraint: 'CHECK (GPA BETWEEN 0.00 AND 4.00)' },
        ],
        primaryKey: 'ReportID',
        pkJustification: 'ReportID identifies the issued transcript report; (StudentID, Semester) is a candidate key.',
      },
    ],
    relationships: [
      {
        source: 'DEPARTMENT',
        target: 'FACULTY_ADVISOR',
        name: 'employs',
        cardinality: '1:N',
        sourceOptionality: '1..1',
        targetOptionality: '0..N',
        foreignKey: 'FACULTY_ADVISOR.DeptID → DEPARTMENT.DeptID',
        forwardSentence: 'One department employs many faculty advisors.',
        reverseSentence: 'Each faculty advisor belongs to exactly one department.',
        explanation: '1:N hierarchy. Foreign key DeptID placed on FACULTY_ADVISOR.',
      },
      {
        source: 'FACULTY_ADVISOR',
        target: 'STUDENT',
        name: 'mentors',
        cardinality: '1:N',
        sourceOptionality: '1..1',
        targetOptionality: '0..N',
        foreignKey: 'STUDENT.AdvisorID → FACULTY_ADVISOR.AdvisorID',
        forwardSentence: 'One faculty advisor mentors many students.',
        reverseSentence: 'Each student is mentored by exactly one faculty advisor.',
        explanation: '1:N relationship. Foreign key AdvisorID placed on STUDENT.',
      },
      {
        source: 'STUDENT',
        target: 'GRADE_REPORT',
        name: 'receives',
        cardinality: '1:N',
        sourceOptionality: '1..1',
        targetOptionality: '0..N',
        foreignKey: 'GRADE_REPORT.StudentID → STUDENT.StudentID',
        forwardSentence: 'One student receives multiple semester grade reports.',
        reverseSentence: 'Each grade report belongs to one student.',
        explanation: '1:N relationship. Foreign key StudentID placed on GRADE_REPORT.',
      },
    ],
    keyAnalysis: {
      primaryKeys: ['DEPARTMENT.DeptID', 'FACULTY_ADVISOR.AdvisorID', 'STUDENT.StudentID', 'GRADE_REPORT.ReportID'],
      foreignKeys: [
        'FACULTY_ADVISOR.DeptID → DEPARTMENT.DeptID',
        'STUDENT.DeptID → DEPARTMENT.DeptID',
        'STUDENT.AdvisorID → FACULTY_ADVISOR.AdvisorID',
        'GRADE_REPORT.StudentID → STUDENT.StudentID',
      ],
      compositeKeys: [],
      candidateKeys: ['STUDENT.Email', 'DEPARTMENT.DeptName', 'GRADE_REPORT(StudentID, Semester)'],
      uniqueConstraints: ['STUDENT(Email)', 'DEPARTMENT(DeptName)', 'GRADE_REPORT(StudentID, Semester)'],
    },
    normalization: {
      firstNormalForm: 'Attributes are atomic.',
      secondNormalForm: 'Single column primary keys satisfy 2NF trivially.',
      thirdNormalForm: 'Advisor and Department are separated so student table does not transitively store office rooms.',
    },
    mermaidDiagram: `erDiagram
    DEPARTMENT ||--o{ FACULTY_ADVISOR : "employs"
    FACULTY_ADVISOR ||--o{ STUDENT : "mentors"
    STUDENT ||--o{ GRADE_REPORT : "receives"
    DEPARTMENT {
        int DeptID PK
        string DeptName UK
        string BuildingCode
    }
    FACULTY_ADVISOR {
        int AdvisorID PK
        string AdvisorName
        string OfficeRoom
        int DeptID FK
    }
    STUDENT {
        int StudentID PK
        string FirstName
        string LastName
        string Email UK
        int AdvisorID FK
    }
    GRADE_REPORT {
        int ReportID PK
        int StudentID FK
        string Semester
        decimal GPA
    }`,
    sqlDdl: `CREATE TABLE Department (
    DeptID       INT PRIMARY KEY,
    DeptName     VARCHAR(100) NOT NULL UNIQUE,
    BuildingCode VARCHAR(20) NOT NULL
);

CREATE TABLE FacultyAdvisor (
    AdvisorID   INT PRIMARY KEY,
    AdvisorName VARCHAR(100) NOT NULL,
    OfficeRoom  VARCHAR(20) NOT NULL,
    DeptID      INT NOT NULL,
    FOREIGN KEY (DeptID) REFERENCES Department(DeptID)
);

CREATE TABLE Student (
    StudentID INT PRIMARY KEY,
    FirstName VARCHAR(50) NOT NULL,
    LastName  VARCHAR(50) NOT NULL,
    Email     VARCHAR(100) NOT NULL UNIQUE,
    DeptID    INT NOT NULL,
    AdvisorID INT NOT NULL,
    FOREIGN KEY (DeptID) REFERENCES Department(DeptID),
    FOREIGN KEY (AdvisorID) REFERENCES FacultyAdvisor(AdvisorID)
);

CREATE TABLE GradeReport (
    ReportID  INT PRIMARY KEY,
    StudentID INT NOT NULL,
    Semester  VARCHAR(20) NOT NULL,
    GPA       DECIMAL(3, 2) NOT NULL CHECK (GPA BETWEEN 0.00 AND 4.00),
    UNIQUE (StudentID, Semester),
    FOREIGN KEY (StudentID) REFERENCES Student(StudentID) ON DELETE CASCADE
);`,
    commonMistakes: [
      {
        mistake: 'Putting StudentID as a foreign key inside FACULTY_ADVISOR.',
        whyWrong: 'An advisor mentors multiple students. A single StudentID column inside FACULTY_ADVISOR would restrict an advisor to mentoring only 1 student!',
        correction: 'In 1:N, the FK goes on the "N" side (STUDENT contains AdvisorID).',
      },
    ],
    validationStatus: 'PASS',
  },

  // 3. Hospital System
  hospital: {
    scenarioId: 'hospital',
    title: 'Hospital Clinical Care & Appointments',
    domain: 'Healthcare / Clinical Administration',
    difficulty: 'Intermediate',
    problemStatement:
      'Manage patient clinical profiles, specialized hospital departments, licensed physicians, and medical consultation appointments.',
    businessRules: [
      'Each patient has a PatientID, full name, blood group, and emergency phone.',
      'Physicians belong to specialized departments (1:N from Department to Physician).',
      'Patients consult physicians through scheduled Appointments (M:N).',
      'Appointments can recur across different dates, recording vitals, scheduled time, and consultation fee.',
      'Consultation fees must be non-negative.',
    ],
    entities: [
      {
        name: 'DEPARTMENT',
        type: 'strong',
        purpose: 'Hospital medical division (e.g. Cardiology, Neurology).',
        attributes: [
          { name: 'DeptID', dataType: 'INTEGER', isPk: true, isFk: false, isUnique: true, nullable: false },
          { name: 'DeptName', dataType: 'VARCHAR', isPk: false, isFk: false, isUnique: true, nullable: false },
          { name: 'BuildingWing', dataType: 'VARCHAR', isPk: false, isFk: false, nullable: false },
        ],
        primaryKey: 'DeptID',
        pkJustification: 'DeptID is the standard hospital clinic identifier.',
      },
      {
        name: 'PHYSICIAN',
        type: 'strong',
        purpose: 'Licensed medical practitioner.',
        attributes: [
          { name: 'DoctorID', dataType: 'INTEGER', isPk: true, isFk: false, isUnique: true, nullable: false },
          { name: 'DoctorName', dataType: 'VARCHAR', isPk: false, isFk: false, nullable: false },
          { name: 'Specialization', dataType: 'VARCHAR', isPk: false, isFk: false, nullable: false },
          { name: 'DeptID', dataType: 'INTEGER', isPk: false, isFk: true, references: 'DEPARTMENT.DeptID', nullable: false },
        ],
        primaryKey: 'DoctorID',
        pkJustification: 'DoctorID is the physician state license identification number.',
      },
      {
        name: 'PATIENT',
        type: 'strong',
        purpose: 'Registered clinical outpatient or inpatient.',
        attributes: [
          { name: 'PatientID', dataType: 'INTEGER', isPk: true, isFk: false, isUnique: true, nullable: false },
          { name: 'FullName', dataType: 'VARCHAR', isPk: false, isFk: false, nullable: false },
          { name: 'BloodGroup', dataType: 'VARCHAR', isPk: false, isFk: false, nullable: false, domainConstraint: "CHECK (BloodGroup IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'))" },
          { name: 'Phone', dataType: 'VARCHAR', isPk: false, isFk: false, nullable: true },
        ],
        primaryKey: 'PatientID',
        pkJustification: 'PatientID provides permanent patient medical record tracking.',
      },
      {
        name: 'APPOINTMENT',
        type: 'associative',
        purpose: 'Consultation transaction resolving Patient M:N Physician with recurring timestamps.',
        attributes: [
          { name: 'AppointmentID', dataType: 'INTEGER', isPk: true, isFk: false, isUnique: true, nullable: false },
          { name: 'PatientID', dataType: 'INTEGER', isPk: false, isFk: true, references: 'PATIENT.PatientID', nullable: false },
          { name: 'DoctorID', dataType: 'INTEGER', isPk: false, isFk: true, references: 'PHYSICIAN.DoctorID', nullable: false },
          { name: 'AppointmentDate', dataType: 'DATETIME', isPk: false, isFk: false, nullable: false },
          { name: 'Fee', dataType: 'DECIMAL(10, 2)', isPk: false, isFk: false, nullable: false, domainConstraint: 'CHECK (Fee >= 0)' },
        ],
        primaryKey: 'AppointmentID',
        pkJustification:
          'Because a patient may consult the same doctor multiple times over several years, (PatientID, DoctorID) is not unique across time. AppointmentID serves as surrogate PK, with (PatientID, DoctorID, AppointmentDate) as candidate key.',
      },
    ],
    relationships: [
      {
        source: 'DEPARTMENT',
        target: 'PHYSICIAN',
        name: 'staffs',
        cardinality: '1:N',
        sourceOptionality: '1..1',
        targetOptionality: '0..N',
        foreignKey: 'PHYSICIAN.DeptID → DEPARTMENT.DeptID',
        forwardSentence: 'One department staffs multiple physicians.',
        reverseSentence: 'Each physician belongs to exactly one hospital department.',
        explanation: '1:N relationship. DeptID placed in PHYSICIAN.',
      },
      {
        source: 'PATIENT',
        target: 'APPOINTMENT',
        name: 'schedules',
        cardinality: '1:N',
        sourceOptionality: '1..1',
        targetOptionality: '0..N',
        foreignKey: 'APPOINTMENT.PatientID → PATIENT.PatientID',
        forwardSentence: 'One patient can schedule multiple appointments over time.',
        reverseSentence: 'Each appointment is scheduled for exactly one patient.',
        explanation: 'Patient side of M:N appointment resolution.',
      },
      {
        source: 'PHYSICIAN',
        target: 'APPOINTMENT',
        name: 'conducts',
        cardinality: '1:N',
        sourceOptionality: '1..1',
        targetOptionality: '0..N',
        foreignKey: 'APPOINTMENT.DoctorID → PHYSICIAN.DoctorID',
        forwardSentence: 'One physician conducts many patient appointments.',
        reverseSentence: 'Each appointment is attended by one primary physician.',
        explanation: 'Physician side of M:N appointment resolution.',
      },
    ],
    keyAnalysis: {
      primaryKeys: ['DEPARTMENT.DeptID', 'PHYSICIAN.DoctorID', 'PATIENT.PatientID', 'APPOINTMENT.AppointmentID'],
      foreignKeys: [
        'PHYSICIAN.DeptID → DEPARTMENT.DeptID',
        'APPOINTMENT.PatientID → PATIENT.PatientID',
        'APPOINTMENT.DoctorID → PHYSICIAN.DoctorID',
      ],
      compositeKeys: ['(PatientID, DoctorID, AppointmentDate) Candidate Key'],
      candidateKeys: ['APPOINTMENT(PatientID, DoctorID, AppointmentDate)'],
      uniqueConstraints: ['DEPARTMENT(DeptName)', 'APPOINTMENT(PatientID, DoctorID, AppointmentDate)'],
    },
    normalization: {
      firstNormalForm: 'All attributes are scalar atomic values.',
      secondNormalForm: 'Non-key attributes depend on the full primary key.',
      thirdNormalForm: 'Department information is not stored in Physician or Appointment tables.',
    },
    mermaidDiagram: `erDiagram
    DEPARTMENT ||--o{ PHYSICIAN : "staffs"
    PATIENT ||--o{ APPOINTMENT : "schedules"
    PHYSICIAN ||--o{ APPOINTMENT : "conducts"
    DEPARTMENT {
        int DeptID PK
        string DeptName UK
        string BuildingWing
    }
    PHYSICIAN {
        int DoctorID PK
        string DoctorName
        string Specialization
        int DeptID FK
    }
    PATIENT {
        int PatientID PK
        string FullName
        string BloodGroup
        string Phone
    }
    APPOINTMENT {
        int AppointmentID PK
        int PatientID FK
        int DoctorID FK
        datetime AppointmentDate
        decimal Fee
    }`,
    sqlDdl: `CREATE TABLE Department (
    DeptID       INT PRIMARY KEY,
    DeptName     VARCHAR(100) NOT NULL UNIQUE,
    BuildingWing VARCHAR(50) NOT NULL
);

CREATE TABLE Physician (
    DoctorID       INT PRIMARY KEY,
    DoctorName     VARCHAR(100) NOT NULL,
    Specialization VARCHAR(100) NOT NULL,
    DeptID         INT NOT NULL,
    FOREIGN KEY (DeptID) REFERENCES Department(DeptID)
);

CREATE TABLE Patient (
    PatientID  INT PRIMARY KEY,
    FullName   VARCHAR(100) NOT NULL,
    BloodGroup VARCHAR(5) NOT NULL CHECK (BloodGroup IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    Phone      VARCHAR(20)
);

CREATE TABLE Appointment (
    AppointmentID   INT PRIMARY KEY,
    PatientID       INT NOT NULL,
    DoctorID        INT NOT NULL,
    AppointmentDate DATETIME NOT NULL,
    Fee             DECIMAL(10, 2) NOT NULL CHECK (Fee >= 0),
    UNIQUE (PatientID, DoctorID, AppointmentDate),
    FOREIGN KEY (PatientID) REFERENCES Patient(PatientID),
    FOREIGN KEY (DoctorID)  REFERENCES Physician(DoctorID)
);`,
    commonMistakes: [
      {
        mistake: 'Using (PatientID, DoctorID) as primary key on APPOINTMENT without timestamp.',
        whyWrong: 'A patient can consult the same doctor more than once in their life. A 2-column PK prevents follow-up visits!',
        correction: 'Include AppointmentDate in composite key or use surrogate AppointmentID with unique constraint.',
      },
    ],
    validationStatus: 'PASS',
  },

  // 4. E-commerce System
  ecommerce: {
    scenarioId: 'ecommerce',
    title: 'E-commerce Retail Platform',
    domain: 'Business / Retail Order Processing',
    difficulty: 'Intermediate',
    problemStatement:
      'Manage online customers, catalog products, purchase orders, and multi-line item shopping receipts.',
    businessRules: [
      'Customers have unique CustomerID and unique Email.',
      'Products have unique ProductID, positive price, and stock levels.',
      'Customers place Orders (1:N from Customer to Order).',
      'Each order contains multiple products with quantity and unit purchase price.',
      'A product can appear at most once per order; (OrderID, ProductID) forms the composite PK of ORDER_ITEM.',
    ],
    entities: [
      {
        name: 'CUSTOMER',
        type: 'strong',
        purpose: 'Registered online marketplace shopper.',
        attributes: [
          { name: 'CustomerID', dataType: 'INTEGER', isPk: true, isFk: false, isUnique: true, nullable: false },
          { name: 'FullName', dataType: 'VARCHAR', isPk: false, isFk: false, nullable: false },
          { name: 'Email', dataType: 'VARCHAR', isPk: false, isFk: false, isUnique: true, nullable: false },
          { name: 'City', dataType: 'VARCHAR', isPk: false, isFk: false, nullable: false },
        ],
        primaryKey: 'CustomerID',
        pkJustification: 'CustomerID is the unique account identifier.',
      },
      {
        name: 'PURCHASE_ORDER',
        type: 'strong',
        purpose: 'Transaction invoice placed by a customer.',
        attributes: [
          { name: 'OrderID', dataType: 'INTEGER', isPk: true, isFk: false, isUnique: true, nullable: false },
          { name: 'CustomerID', dataType: 'INTEGER', isPk: false, isFk: true, references: 'CUSTOMER.CustomerID', nullable: false },
          { name: 'OrderDate', dataType: 'DATE', isPk: false, isFk: false, nullable: false },
          { name: 'TotalAmount', dataType: 'DECIMAL(12, 2)', isPk: false, isFk: false, nullable: false },
        ],
        primaryKey: 'OrderID',
        pkJustification: 'OrderID is the unique order invoice number.',
      },
      {
        name: 'PRODUCT',
        type: 'strong',
        purpose: 'Merchandise item available in catalog.',
        attributes: [
          { name: 'ProductID', dataType: 'INTEGER', isPk: true, isFk: false, isUnique: true, nullable: false },
          { name: 'Title', dataType: 'VARCHAR', isPk: false, isFk: false, nullable: false },
          { name: 'Price', dataType: 'DECIMAL(10, 2)', isPk: false, isFk: false, nullable: false, domainConstraint: 'CHECK (Price > 0)' },
          { name: 'StockQuantity', dataType: 'INTEGER', isPk: false, isFk: false, nullable: false, domainConstraint: 'CHECK (StockQuantity >= 0)' },
        ],
        primaryKey: 'ProductID',
        pkJustification: 'ProductID is the unique catalog SKU number.',
      },
      {
        name: 'ORDER_ITEM',
        type: 'associative',
        purpose: 'Order line item resolving Order M:N Product with composite primary key (OrderID, ProductID).',
        attributes: [
          { name: 'OrderID', dataType: 'INTEGER', isPk: true, isFk: true, references: 'PURCHASE_ORDER.OrderID', nullable: false },
          { name: 'ProductID', dataType: 'INTEGER', isPk: true, isFk: true, references: 'PRODUCT.ProductID', nullable: false },
          { name: 'Quantity', dataType: 'INTEGER', isPk: false, isFk: false, nullable: false, domainConstraint: 'CHECK (Quantity >= 1)' },
          { name: 'UnitPrice', dataType: 'DECIMAL(10, 2)', isPk: false, isFk: false, nullable: false },
        ],
        primaryKey: '(OrderID, ProductID)',
        pkJustification:
          'Because each product appears at most once in a given order line, (OrderID, ProductID) forms a natural composite primary key without requiring an arbitrary surrogate OrderItemID.',
      },
    ],
    relationships: [
      {
        source: 'CUSTOMER',
        target: 'PURCHASE_ORDER',
        name: 'places',
        cardinality: '1:N',
        sourceOptionality: '1..1',
        targetOptionality: '0..N',
        foreignKey: 'PURCHASE_ORDER.CustomerID → CUSTOMER.CustomerID',
        forwardSentence: 'One customer can place many orders.',
        reverseSentence: 'Each order is placed by exactly one customer.',
        explanation: '1:N relationship. CustomerID placed in PURCHASE_ORDER.',
      },
      {
        source: 'PURCHASE_ORDER',
        target: 'ORDER_ITEM',
        name: 'contains',
        cardinality: '1:N',
        sourceOptionality: '1..1',
        targetOptionality: '1..N',
        foreignKey: 'ORDER_ITEM.OrderID → PURCHASE_ORDER.OrderID',
        forwardSentence: 'One purchase order contains one or more line items.',
        reverseSentence: 'Each order item belongs to exactly one order.',
        explanation: 'Order side of M:N order decomposition.',
      },
      {
        source: 'PRODUCT',
        target: 'ORDER_ITEM',
        name: 'purchased_in',
        cardinality: '1:N',
        sourceOptionality: '1..1',
        targetOptionality: '0..N',
        foreignKey: 'ORDER_ITEM.ProductID → PRODUCT.ProductID',
        forwardSentence: 'One product can be purchased across many order line items.',
        reverseSentence: 'Each order line item specifies exactly one product.',
        explanation: 'Product side of M:N order decomposition.',
      },
    ],
    keyAnalysis: {
      primaryKeys: ['CUSTOMER.CustomerID', 'PURCHASE_ORDER.OrderID', 'PRODUCT.ProductID', 'ORDER_ITEM.(OrderID, ProductID)'],
      foreignKeys: [
        'PURCHASE_ORDER.CustomerID → CUSTOMER.CustomerID',
        'ORDER_ITEM.OrderID → PURCHASE_ORDER.OrderID',
        'ORDER_ITEM.ProductID → PRODUCT.ProductID',
      ],
      compositeKeys: ['ORDER_ITEM.(OrderID, ProductID)'],
      candidateKeys: ['CUSTOMER.Email'],
      uniqueConstraints: ['CUSTOMER(Email)'],
    },
    normalization: {
      firstNormalForm: 'Attributes are atomic; quantities and prices are scalar.',
      secondNormalForm: 'Quantity and UnitPrice depend on both OrderID and ProductID.',
      thirdNormalForm: 'Customer information is not duplicated on orders; product titles are not duplicated on order lines.',
    },
    mermaidDiagram: `erDiagram
    CUSTOMER ||--o{ PURCHASE_ORDER : "places"
    PURCHASE_ORDER ||--|{ ORDER_ITEM : "contains"
    PRODUCT ||--o{ ORDER_ITEM : "purchased_in"
    CUSTOMER {
        int CustomerID PK
        string FullName
        string Email UK
        string City
    }
    PURCHASE_ORDER {
        int OrderID PK
        int CustomerID FK
        date OrderDate
        decimal TotalAmount
    }
    ORDER_ITEM {
        int OrderID PK,FK
        int ProductID PK,FK
        int Quantity
        decimal UnitPrice
    }
    PRODUCT {
        int ProductID PK
        string Title
        decimal Price
        int StockQuantity
    }`,
    sqlDdl: `CREATE TABLE Customer (
    CustomerID INT PRIMARY KEY,
    FullName   VARCHAR(100) NOT NULL,
    Email      VARCHAR(100) NOT NULL UNIQUE,
    City       VARCHAR(100) NOT NULL
);

CREATE TABLE PurchaseOrder (
    OrderID     INT PRIMARY KEY,
    CustomerID  INT NOT NULL,
    OrderDate   DATE NOT NULL,
    TotalAmount DECIMAL(12, 2) NOT NULL,
    FOREIGN KEY (CustomerID) REFERENCES Customer(CustomerID)
);

CREATE TABLE Product (
    ProductID     INT PRIMARY KEY,
    Title         VARCHAR(150) NOT NULL,
    Price         DECIMAL(10, 2) NOT NULL CHECK (Price > 0),
    StockQuantity INT NOT NULL CHECK (StockQuantity >= 0)
);

CREATE TABLE OrderItem (
    OrderID   INT NOT NULL,
    ProductID INT NOT NULL,
    Quantity  INT NOT NULL CHECK (Quantity >= 1),
    UnitPrice DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (OrderID, ProductID),
    FOREIGN KEY (OrderID)   REFERENCES PurchaseOrder(OrderID) ON DELETE CASCADE,
    FOREIGN KEY (ProductID) REFERENCES Product(ProductID)
);`,
    commonMistakes: [
      {
        mistake: 'Adding a separate OrderItemID surrogate key when (OrderID, ProductID) already uniquely identifies the row.',
        whyWrong: 'An arbitrary ID permits the exact same product to be inserted into the same order multiple times unless an extra composite unique constraint is added.',
        correction: 'Use composite PK (OrderID, ProductID).',
      },
    ],
    validationStatus: 'PASS',
  },

  // 5. Supermarket POS System
  supermarket: {
    scenarioId: 'supermarket',
    title: 'Supermarket & Point of Sale (POS)',
    domain: 'Business / Retail POS & Barcode Scanner',
    difficulty: 'Intermediate',
    problemStatement:
      'Manage checkout register cashiers, scanned barcode sales receipts, grocery inventory, and checkout lines.',
    businessRules: [
      'Cashiers have unique CashierID, name, and shift (Morning, Evening, Night).',
      'One cashier can process many sale receipts (1:N); each receipt is processed by exactly one cashier.',
      'Receipts record ReceiptID, CashierID FK, ReceiptTime, and PaymentMethod.',
      'Products have unique Barcode numbers, name, positive price, and stock levels.',
      'Each receipt contains multiple scanned receipt lines (1:N from Receipt to ReceiptLine; 1:N from Product to ReceiptLine).',
    ],
    entities: [
      {
        name: 'CASHIER',
        type: 'strong',
        purpose: 'Supermarket checkout register operator.',
        attributes: [
          { name: 'CashierID', dataType: 'INTEGER', isPk: true, isFk: false, isUnique: true, nullable: false },
          { name: 'FullName', dataType: 'VARCHAR', isPk: false, isFk: false, nullable: false },
          { name: 'Shift', dataType: 'VARCHAR', isPk: false, isFk: false, nullable: false, domainConstraint: "CHECK (Shift IN ('Morning', 'Evening', 'Night'))" },
        ],
        primaryKey: 'CashierID',
        pkJustification: 'CashierID uniquely identifies store cashiers.',
      },
      {
        name: 'SALE_RECEIPT',
        type: 'strong',
        purpose: 'Point-of-sale checkout bill.',
        attributes: [
          { name: 'ReceiptID', dataType: 'INTEGER', isPk: true, isFk: false, isUnique: true, nullable: false },
          { name: 'CashierID', dataType: 'INTEGER', isPk: false, isFk: true, references: 'CASHIER.CashierID', nullable: false },
          { name: 'ReceiptTime', dataType: 'DATETIME', isPk: false, isFk: false, nullable: false },
          { name: 'PaymentMethod', dataType: 'VARCHAR', isPk: false, isFk: false, nullable: false, domainConstraint: "CHECK (PaymentMethod IN ('Cash', 'Card', 'Mobile'))" },
        ],
        primaryKey: 'ReceiptID',
        pkJustification: 'ReceiptID uniquely identifies the printed receipt.',
      },
      {
        name: 'BARCODE_PRODUCT',
        type: 'strong',
        purpose: 'Merchandise unit tracked by barcode scanner.',
        attributes: [
          { name: 'Barcode', dataType: 'VARCHAR', isPk: true, isFk: false, isUnique: true, nullable: false },
          { name: 'ProductName', dataType: 'VARCHAR', isPk: false, isFk: false, nullable: false },
          { name: 'UnitPrice', dataType: 'DECIMAL(10, 2)', isPk: false, isFk: false, nullable: false, domainConstraint: 'CHECK (UnitPrice > 0)' },
          { name: 'StockLevel', dataType: 'INTEGER', isPk: false, isFk: false, nullable: false, domainConstraint: 'CHECK (StockLevel >= 0)' },
        ],
        primaryKey: 'Barcode',
        pkJustification: 'Barcode is the universal product code (UPC/EAN) natural primary key.',
      },
      {
        name: 'RECEIPT_LINE',
        type: 'associative',
        purpose: 'Individual barcode scan line on receipt.',
        attributes: [
          { name: 'LineItemID', dataType: 'INTEGER', isPk: true, isFk: false, isUnique: true, nullable: false },
          { name: 'ReceiptID', dataType: 'INTEGER', isPk: false, isFk: true, references: 'SALE_RECEIPT.ReceiptID', nullable: false },
          { name: 'Barcode', dataType: 'VARCHAR', isPk: false, isFk: true, references: 'BARCODE_PRODUCT.Barcode', nullable: false },
          { name: 'Quantity', dataType: 'INTEGER', isPk: false, isFk: false, nullable: false, domainConstraint: 'CHECK (Quantity >= 1)' },
          { name: 'Subtotal', dataType: 'DECIMAL(10, 2)', isPk: false, isFk: false, nullable: false },
        ],
        primaryKey: 'LineItemID',
        pkJustification:
          'LineItemID is assigned when multiple scans of the same barcode can occur on separate lines; (ReceiptID, Barcode) is candidate key if items are aggregated.',
      },
    ],
    relationships: [
      {
        source: 'CASHIER',
        target: 'SALE_RECEIPT',
        name: 'rings_up',
        cardinality: '1:N',
        sourceOptionality: '1..1',
        targetOptionality: '0..N',
        foreignKey: 'SALE_RECEIPT.CashierID → CASHIER.CashierID',
        forwardSentence: 'One cashier can process many sale receipts (0..N).',
        reverseSentence: 'Each sale receipt is processed by exactly one cashier (1..1).',
        explanation: 'CRITICAL: Must NOT be 1:1! A cashier rings up hundreds of receipts over their shift.',
      },
      {
        source: 'SALE_RECEIPT',
        target: 'RECEIPT_LINE',
        name: 'contains',
        cardinality: '1:N',
        sourceOptionality: '1..1',
        targetOptionality: '1..N',
        foreignKey: 'RECEIPT_LINE.ReceiptID → SALE_RECEIPT.ReceiptID',
        forwardSentence: 'One sale receipt contains one or more receipt lines.',
        reverseSentence: 'Each receipt line belongs to one receipt.',
        explanation: '1:N relationship.',
      },
      {
        source: 'BARCODE_PRODUCT',
        target: 'RECEIPT_LINE',
        name: 'scanned_in',
        cardinality: '1:N',
        sourceOptionality: '1..1',
        targetOptionality: '0..N',
        foreignKey: 'RECEIPT_LINE.Barcode → BARCODE_PRODUCT.Barcode',
        forwardSentence: 'One barcode product can appear on many receipt lines.',
        reverseSentence: 'Each receipt line refers to one barcode product.',
        explanation: '1:N relationship.',
      },
    ],
    keyAnalysis: {
      primaryKeys: ['CASHIER.CashierID', 'SALE_RECEIPT.ReceiptID', 'BARCODE_PRODUCT.Barcode', 'RECEIPT_LINE.LineItemID'],
      foreignKeys: [
        'SALE_RECEIPT.CashierID → CASHIER.CashierID',
        'RECEIPT_LINE.ReceiptID → SALE_RECEIPT.ReceiptID',
        'RECEIPT_LINE.Barcode → BARCODE_PRODUCT.Barcode',
      ],
      compositeKeys: ['RECEIPT_LINE(ReceiptID, Barcode) Candidate Key'],
      candidateKeys: ['RECEIPT_LINE(ReceiptID, Barcode)'],
      uniqueConstraints: [],
    },
    normalization: {
      firstNormalForm: 'Attributes are atomic.',
      secondNormalForm: 'Subtotal depends on LineItemID; Barcode details reside in BARCODE_PRODUCT.',
      thirdNormalForm: 'PaymentMethod and Cashier details reside in respective tables, not duplicated across lines.',
    },
    mermaidDiagram: `erDiagram
    CASHIER ||--o{ SALE_RECEIPT : "rings_up"
    SALE_RECEIPT ||--|{ RECEIPT_LINE : "contains"
    BARCODE_PRODUCT ||--o{ RECEIPT_LINE : "scanned_in"
    CASHIER {
        int CashierID PK
        string FullName
        string Shift
    }
    SALE_RECEIPT {
        int ReceiptID PK
        int CashierID FK
        datetime ReceiptTime
        string PaymentMethod
    }
    RECEIPT_LINE {
        int LineItemID PK
        int ReceiptID FK
        string Barcode FK
        int Quantity
        decimal Subtotal
    }
    BARCODE_PRODUCT {
        string Barcode PK
        string ProductName
        decimal UnitPrice
        int StockLevel
    }`,
    sqlDdl: `CREATE TABLE Cashier (
    CashierID INT PRIMARY KEY,
    FullName  VARCHAR(100) NOT NULL,
    Shift     VARCHAR(20) NOT NULL CHECK (Shift IN ('Morning', 'Evening', 'Night'))
);

CREATE TABLE SaleReceipt (
    ReceiptID     INT PRIMARY KEY,
    CashierID     INT NOT NULL,
    ReceiptTime   DATETIME NOT NULL,
    PaymentMethod VARCHAR(20) NOT NULL CHECK (PaymentMethod IN ('Cash', 'Card', 'Mobile')),
    FOREIGN KEY (CashierID) REFERENCES Cashier(CashierID)
);

CREATE TABLE BarcodeProduct (
    Barcode     VARCHAR(50) PRIMARY KEY,
    ProductName VARCHAR(100) NOT NULL,
    UnitPrice   DECIMAL(10, 2) NOT NULL CHECK (UnitPrice > 0),
    StockLevel  INT NOT NULL CHECK (StockLevel >= 0)
);

CREATE TABLE ReceiptLine (
    LineItemID INT PRIMARY KEY,
    ReceiptID  INT NOT NULL,
    Barcode    VARCHAR(50) NOT NULL,
    Quantity   INT NOT NULL CHECK (Quantity >= 1),
    Subtotal   DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (ReceiptID) REFERENCES SaleReceipt(ReceiptID) ON DELETE CASCADE,
    FOREIGN KEY (Barcode)   REFERENCES BarcodeProduct(Barcode)
);`,
    commonMistakes: [
      {
        mistake: 'Modeling Cashier 1:1 SaleReceipt.',
        whyWrong: 'A cashier operates a register for hours, printing hundreds of receipts. A 1:1 relationship would mean a cashier can only ever process 1 single receipt.',
        correction: 'Cashier 1 ──── N SaleReceipt (1:N).',
      },
      {
        mistake: 'Placing Barcode directly in SaleReceipt.',
        whyWrong: 'A receipt can contain multiple items. Putting Barcode in SaleReceipt violates 1NF (repeating groups).',
        correction: 'Use RECEIPT_LINE to store individual product scans.',
      },
    ],
    validationStatus: 'PASS',
  },

  // 6. Airline System
  airline: {
    scenarioId: 'airline',
    title: 'Airline Flight & Ticket Reservation',
    domain: 'Transportation / Aviation Routing',
    difficulty: 'Advanced',
    problemStatement:
      'Schedule non-stop flights, manage aircraft fleet tails, airport routing, passenger bookings, and seat passes.',
    businessRules: [
      'Airports have a 3-letter IATA code (e.g. JFK, LHR), name, and city location.',
      'Aircraft have unique TailNumber (e.g. N102AA), model, and seat capacity.',
      'Flights fly from an Origin Airport to a Destination Airport using an assigned Aircraft (multiple 1:N relationships between Airport and Flight).',
      'Passengers register with unique PassengerID and unique PassportNumber.',
      'Boarding passes confirm a passenger seat on a flight; seat allocation cannot be double booked (composite unique on FlightNumber, SeatNumber).',
    ],
    entities: [
      {
        name: 'AIRPORT',
        type: 'strong',
        purpose: 'Aviation terminal gateway (origin / destination).',
        attributes: [
          { name: 'AirportCode', dataType: 'VARCHAR(3)', isPk: true, isFk: false, isUnique: true, nullable: false },
          { name: 'AirportName', dataType: 'VARCHAR', isPk: false, isFk: false, nullable: false },
          { name: 'City', dataType: 'VARCHAR', isPk: false, isFk: false, nullable: false },
        ],
        primaryKey: 'AirportCode',
        pkJustification: '3-letter IATA code is the universal natural identifier.',
      },
      {
        name: 'AIRCRAFT',
        type: 'strong',
        purpose: 'Commercial aircraft fleet airframe.',
        attributes: [
          { name: 'TailNumber', dataType: 'VARCHAR', isPk: true, isFk: false, isUnique: true, nullable: false },
          { name: 'Model', dataType: 'VARCHAR', isPk: false, isFk: false, nullable: false },
          { name: 'Capacity', dataType: 'INTEGER', isPk: false, isFk: false, nullable: false, domainConstraint: 'CHECK (Capacity > 0)' },
        ],
        primaryKey: 'TailNumber',
        pkJustification: 'FAA / ICAO registration tail number is naturally unique.',
      },
      {
        name: 'FLIGHT_SCHEDULE',
        type: 'strong',
        purpose: 'Scheduled commercial airline route departure.',
        attributes: [
          { name: 'FlightNumber', dataType: 'VARCHAR', isPk: true, isFk: false, isUnique: true, nullable: false },
          { name: 'OriginCode', dataType: 'VARCHAR(3)', isPk: false, isFk: true, references: 'AIRPORT.AirportCode', nullable: false },
          { name: 'DestCode', dataType: 'VARCHAR(3)', isPk: false, isFk: true, references: 'AIRPORT.AirportCode', nullable: false },
          { name: 'AircraftTail', dataType: 'VARCHAR', isPk: false, isFk: true, references: 'AIRCRAFT.TailNumber', nullable: false },
          { name: 'DepartureTime', dataType: 'DATETIME', isPk: false, isFk: false, nullable: false },
        ],
        primaryKey: 'FlightNumber',
        pkJustification: 'FlightNumber identifies the scheduled commercial flight.',
      },
      {
        name: 'PASSENGER',
        type: 'strong',
        purpose: 'Ticketed flyer traveling on flight.',
        attributes: [
          { name: 'PassengerID', dataType: 'INTEGER', isPk: true, isFk: false, isUnique: true, nullable: false },
          { name: 'FullName', dataType: 'VARCHAR', isPk: false, isFk: false, nullable: false },
          { name: 'PassportNumber', dataType: 'VARCHAR', isPk: false, isFk: false, isUnique: true, nullable: false },
        ],
        primaryKey: 'PassengerID',
        pkJustification: 'PassengerID uniquely identifies passenger accounts.',
      },
      {
        name: 'BOARDING_PASS',
        type: 'associative',
        purpose: 'Seat coupon issued to passenger for a specific flight with composite unique seat constraint.',
        attributes: [
          { name: 'PassID', dataType: 'INTEGER', isPk: true, isFk: false, isUnique: true, nullable: false },
          { name: 'FlightNumber', dataType: 'VARCHAR', isPk: false, isFk: true, references: 'FLIGHT_SCHEDULE.FlightNumber', nullable: false },
          { name: 'PassengerID', dataType: 'INTEGER', isPk: false, isFk: true, references: 'PASSENGER.PassengerID', nullable: false },
          { name: 'SeatNumber', dataType: 'VARCHAR', isPk: false, isFk: false, nullable: false },
        ],
        primaryKey: 'PassID',
        pkJustification:
          'PassID identifies the ticket voucher; (FlightNumber, SeatNumber) has a mandatory UNIQUE constraint to prevent double-booking.',
      },
    ],
    relationships: [
      {
        source: 'AIRPORT',
        target: 'FLIGHT_SCHEDULE',
        name: 'departs_from',
        cardinality: '1:N',
        sourceOptionality: '1..1',
        targetOptionality: '0..N',
        foreignKey: 'FLIGHT_SCHEDULE.OriginCode → AIRPORT.AirportCode',
        forwardSentence: 'One airport serves as departure origin for many scheduled flights.',
        reverseSentence: 'Each scheduled flight departs from one origin airport.',
        explanation: 'Role 1 of Airport in Flight.',
      },
      {
        source: 'AIRPORT',
        target: 'FLIGHT_SCHEDULE',
        name: 'arrives_at',
        cardinality: '1:N',
        sourceOptionality: '1..1',
        targetOptionality: '0..N',
        foreignKey: 'FLIGHT_SCHEDULE.DestCode → AIRPORT.AirportCode',
        forwardSentence: 'One airport serves as destination for many scheduled flights.',
        reverseSentence: 'Each scheduled flight arrives at one destination airport.',
        explanation: 'Role 2 of Airport in Flight (Multiple 1:N between same entities).',
      },
      {
        source: 'AIRCRAFT',
        target: 'FLIGHT_SCHEDULE',
        name: 'operates',
        cardinality: '1:N',
        sourceOptionality: '1..1',
        targetOptionality: '0..N',
        foreignKey: 'FLIGHT_SCHEDULE.AircraftTail → AIRCRAFT.TailNumber',
        forwardSentence: 'One aircraft operates multiple scheduled flights.',
        reverseSentence: 'Each scheduled flight is operated by one aircraft.',
        explanation: '1:N relationship.',
      },
      {
        source: 'FLIGHT_SCHEDULE',
        target: 'BOARDING_PASS',
        name: 'issues',
        cardinality: '1:N',
        sourceOptionality: '1..1',
        targetOptionality: '0..N',
        foreignKey: 'BOARDING_PASS.FlightNumber → FLIGHT_SCHEDULE.FlightNumber',
        forwardSentence: 'One flight schedule issues many passenger boarding passes.',
        reverseSentence: 'Each boarding pass belongs to one flight.',
        explanation: '1:N relationship.',
      },
      {
        source: 'PASSENGER',
        target: 'BOARDING_PASS',
        name: 'holds',
        cardinality: '1:N',
        sourceOptionality: '1..1',
        targetOptionality: '0..N',
        foreignKey: 'BOARDING_PASS.PassengerID → PASSENGER.PassengerID',
        forwardSentence: 'One passenger can hold multiple boarding passes.',
        reverseSentence: 'Each boarding pass is issued to one passenger.',
        explanation: '1:N relationship.',
      },
    ],
    keyAnalysis: {
      primaryKeys: ['AIRPORT.AirportCode', 'AIRCRAFT.TailNumber', 'FLIGHT_SCHEDULE.FlightNumber', 'PASSENGER.PassengerID', 'BOARDING_PASS.PassID'],
      foreignKeys: [
        'FLIGHT_SCHEDULE.OriginCode → AIRPORT.AirportCode',
        'FLIGHT_SCHEDULE.DestCode → AIRPORT.AirportCode',
        'FLIGHT_SCHEDULE.AircraftTail → AIRCRAFT.TailNumber',
        'BOARDING_PASS.FlightNumber → FLIGHT_SCHEDULE.FlightNumber',
        'BOARDING_PASS.PassengerID → PASSENGER.PassengerID',
      ],
      compositeKeys: ['BOARDING_PASS(FlightNumber, SeatNumber) Unique', 'BOARDING_PASS(FlightNumber, PassengerID) Unique'],
      candidateKeys: ['PASSENGER.PassportNumber', 'BOARDING_PASS(FlightNumber, SeatNumber)'],
      uniqueConstraints: ['PASSENGER(PassportNumber)', 'BOARDING_PASS(FlightNumber, SeatNumber)', 'BOARDING_PASS(FlightNumber, PassengerID)'],
    },
    normalization: {
      firstNormalForm: 'All attributes are scalar atomic values.',
      secondNormalForm: 'All non-key attributes in BoardingPass depend on the primary key.',
      thirdNormalForm: 'Origin/Destination city details are kept in Airport, avoiding transitive dependencies.',
    },
    mermaidDiagram: `erDiagram
    AIRPORT ||--o{ FLIGHT_SCHEDULE : "departs_from"
    AIRPORT ||--o{ FLIGHT_SCHEDULE : "arrives_at"
    AIRCRAFT ||--o{ FLIGHT_SCHEDULE : "operates"
    FLIGHT_SCHEDULE ||--o{ BOARDING_PASS : "issues"
    PASSENGER ||--o{ BOARDING_PASS : "holds"
    AIRPORT {
        string AirportCode PK
        string AirportName
        string City
    }
    AIRCRAFT {
        string TailNumber PK
        string Model
        int Capacity
    }
    FLIGHT_SCHEDULE {
        string FlightNumber PK
        string OriginCode FK
        string DestCode FK
        string AircraftTail FK
        datetime DepartureTime
    }
    PASSENGER {
        int PassengerID PK
        string FullName
        string PassportNumber UK
    }
    BOARDING_PASS {
        int PassID PK
        string FlightNumber FK
        int PassengerID FK
        string SeatNumber
    }`,
    sqlDdl: `CREATE TABLE Airport (
    AirportCode VARCHAR(3) PRIMARY KEY,
    AirportName VARCHAR(100) NOT NULL,
    City        VARCHAR(100) NOT NULL
);

CREATE TABLE Aircraft (
    TailNumber VARCHAR(20) PRIMARY KEY,
    Model      VARCHAR(50) NOT NULL,
    Capacity   INT NOT NULL CHECK (Capacity > 0)
);

CREATE TABLE FlightSchedule (
    FlightNumber  VARCHAR(20) PRIMARY KEY,
    OriginCode    VARCHAR(3) NOT NULL,
    DestCode      VARCHAR(3) NOT NULL,
    AircraftTail  VARCHAR(20) NOT NULL,
    DepartureTime DATETIME NOT NULL,
    FOREIGN KEY (OriginCode)   REFERENCES Airport(AirportCode),
    FOREIGN KEY (DestCode)     REFERENCES Airport(AirportCode),
    FOREIGN KEY (AircraftTail) REFERENCES Aircraft(TailNumber)
);

CREATE TABLE Passenger (
    PassengerID    INT PRIMARY KEY,
    FullName       VARCHAR(100) NOT NULL,
    PassportNumber VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE BoardingPass (
    PassID       INT PRIMARY KEY,
    FlightNumber VARCHAR(20) NOT NULL,
    PassengerID  INT NOT NULL,
    SeatNumber   VARCHAR(10) NOT NULL,
    UNIQUE (FlightNumber, SeatNumber),
    UNIQUE (FlightNumber, PassengerID),
    FOREIGN KEY (FlightNumber) REFERENCES FlightSchedule(FlightNumber),
    FOREIGN KEY (PassengerID)  REFERENCES Passenger(PassengerID)
);`,
    commonMistakes: [
      {
        mistake: 'Only drawing one relationship between Airport and FlightSchedule.',
        whyWrong: 'A flight has both an Origin airport and a Destination airport. Modeling only one relationship ignores where the plane lands!',
        correction: 'Draw two distinct 1:N relationships: "departs_from" and "arrives_at".',
      },
      {
        mistake: 'Omitting the UNIQUE constraint on (FlightNumber, SeatNumber).',
        whyWrong: 'Allows two passengers to be assigned seat 12A on the same flight!',
        correction: 'Add UNIQUE (FlightNumber, SeatNumber).',
      },
    ],
    validationStatus: 'PASS',
  },

  // 7. Library System
  library: {
    scenarioId: 'library',
    title: 'Library Circulation & Book Loan System',
    domain: 'Education / Library Information Systems',
    difficulty: 'Beginner',
    problemStatement:
      'Circulate books, track physical shelf copies, issue member borrowing cards, and monitor due dates.',
    businessRules: [
      'Members have MemberID, name, email, and Status (Active, Suspended, Expired).',
      'Books have an ISBN identifier, title, author, and publication year.',
      'Each conceptual Book title has multiple physical Book Copies with CopyID (1:N).',
      'Members borrow specific physical copies through Loan checkout records with IssueDate and DueDate.',
    ],
    entities: [
      {
        name: 'MEMBER',
        type: 'strong',
        purpose: 'Registered cardholding library patron.',
        attributes: [
          { name: 'MemberID', dataType: 'INTEGER', isPk: true, isFk: false, isUnique: true, nullable: false },
          { name: 'FullName', dataType: 'VARCHAR', isPk: false, isFk: false, nullable: false },
          { name: 'Email', dataType: 'VARCHAR', isPk: false, isFk: false, isUnique: true, nullable: false },
          { name: 'Status', dataType: 'VARCHAR', isPk: false, isFk: false, nullable: false, domainConstraint: "CHECK (Status IN ('Active', 'Suspended', 'Expired'))" },
        ],
        primaryKey: 'MemberID',
        pkJustification: 'MemberID uniquely identifies the cardholder.',
      },
      {
        name: 'BOOK',
        type: 'strong',
        purpose: 'Cataloged literary work and bibliographic title.',
        attributes: [
          { name: 'ISBN', dataType: 'VARCHAR', isPk: true, isFk: false, isUnique: true, nullable: false },
          { name: 'Title', dataType: 'VARCHAR', isPk: false, isFk: false, nullable: false },
          { name: 'Author', dataType: 'VARCHAR', isPk: false, isFk: false, nullable: false },
          { name: 'PublicationYear', dataType: 'INTEGER', isPk: false, isFk: false, nullable: false },
        ],
        primaryKey: 'ISBN',
        pkJustification: 'ISBN is the international standard bibliographic key.',
      },
      {
        name: 'BOOK_COPY',
        type: 'strong',
        purpose: 'Physical barcoded book on library shelf.',
        attributes: [
          { name: 'CopyID', dataType: 'INTEGER', isPk: true, isFk: false, isUnique: true, nullable: false },
          { name: 'ISBN', dataType: 'VARCHAR', isPk: false, isFk: true, references: 'BOOK.ISBN', nullable: false },
          { name: 'Condition', dataType: 'VARCHAR', isPk: false, isFk: false, nullable: false, domainConstraint: "CHECK (Condition IN ('New', 'Good', 'Fair'))" },
        ],
        primaryKey: 'CopyID',
        pkJustification: 'CopyID is the barcoded sticker on the physical spine.',
      },
      {
        name: 'LOAN',
        type: 'associative',
        purpose: 'Circulation borrowing transaction.',
        attributes: [
          { name: 'LoanID', dataType: 'INTEGER', isPk: true, isFk: false, isUnique: true, nullable: false },
          { name: 'MemberID', dataType: 'INTEGER', isPk: false, isFk: true, references: 'MEMBER.MemberID', nullable: false },
          { name: 'CopyID', dataType: 'INTEGER', isPk: false, isFk: true, references: 'BOOK_COPY.CopyID', nullable: false },
          { name: 'IssueDate', dataType: 'DATE', isPk: false, isFk: false, nullable: false },
          { name: 'DueDate', dataType: 'DATE', isPk: false, isFk: false, nullable: false },
        ],
        primaryKey: 'LoanID',
        pkJustification:
          'LoanID identifies the checkout event because the same member can borrow the same copy multiple times across different loan periods.',
      },
    ],
    relationships: [
      {
        source: 'BOOK',
        target: 'BOOK_COPY',
        name: 'has_copy',
        cardinality: '1:N',
        sourceOptionality: '1..1',
        targetOptionality: '1..N',
        foreignKey: 'BOOK_COPY.ISBN → BOOK.ISBN',
        forwardSentence: 'One conceptual book has multiple physical copies.',
        reverseSentence: 'Each physical copy belongs to one book ISBN.',
        explanation: 'Separates abstract title from physical shelf items.',
      },
      {
        source: 'MEMBER',
        target: 'LOAN',
        name: 'borrows',
        cardinality: '1:N',
        sourceOptionality: '1..1',
        targetOptionality: '0..N',
        foreignKey: 'LOAN.MemberID → MEMBER.MemberID',
        forwardSentence: 'One member can have multiple loan transactions.',
        reverseSentence: 'Each loan transaction belongs to one member.',
        explanation: '1:N relationship.',
      },
      {
        source: 'BOOK_COPY',
        target: 'LOAN',
        name: 'loaned_in',
        cardinality: '1:N',
        sourceOptionality: '1..1',
        targetOptionality: '0..N',
        foreignKey: 'LOAN.CopyID → BOOK_COPY.CopyID',
        forwardSentence: 'One physical book copy can be loaned out multiple times across history.',
        reverseSentence: 'Each loan refers to exactly one physical copy.',
        explanation: '1:N relationship.',
      },
    ],
    keyAnalysis: {
      primaryKeys: ['MEMBER.MemberID', 'BOOK.ISBN', 'BOOK_COPY.CopyID', 'LOAN.LoanID'],
      foreignKeys: ['BOOK_COPY.ISBN → BOOK.ISBN', 'LOAN.MemberID → MEMBER.MemberID', 'LOAN.CopyID → BOOK_COPY.CopyID'],
      compositeKeys: [],
      candidateKeys: ['MEMBER.Email'],
      uniqueConstraints: ['MEMBER(Email)'],
    },
    normalization: {
      firstNormalForm: 'Attributes are atomic.',
      secondNormalForm: 'BookCopy attributes depend on CopyID.',
      thirdNormalForm: 'Book metadata (Title, Author) resides in BOOK and is not duplicated across copies.',
    },
    mermaidDiagram: `erDiagram
    BOOK ||--|{ BOOK_COPY : "has_copy"
    MEMBER ||--o{ LOAN : "borrows"
    BOOK_COPY ||--o{ LOAN : "loaned_in"
    BOOK {
        string ISBN PK
        string Title
        string Author
        int PublicationYear
    }
    BOOK_COPY {
        int CopyID PK
        string ISBN FK
        string Condition
    }
    MEMBER {
        int MemberID PK
        string FullName
        string Email UK
        string Status
    }
    LOAN {
        int LoanID PK
        int MemberID FK
        int CopyID FK
        date IssueDate
        date DueDate
    }`,
    sqlDdl: `CREATE TABLE Member (
    MemberID INT PRIMARY KEY,
    FullName VARCHAR(100) NOT NULL,
    Email    VARCHAR(100) NOT NULL UNIQUE,
    Status   VARCHAR(20) NOT NULL CHECK (Status IN ('Active', 'Suspended', 'Expired'))
);

CREATE TABLE Book (
    ISBN            VARCHAR(20) PRIMARY KEY,
    Title           VARCHAR(150) NOT NULL,
    Author          VARCHAR(100) NOT NULL,
    PublicationYear INT NOT NULL
);

CREATE TABLE BookCopy (
    CopyID    INT PRIMARY KEY,
    ISBN      VARCHAR(20) NOT NULL,
    Condition VARCHAR(20) NOT NULL CHECK (Condition IN ('New', 'Good', 'Fair')),
    FOREIGN KEY (ISBN) REFERENCES Book(ISBN) ON DELETE CASCADE
);

CREATE TABLE Loan (
    LoanID    INT PRIMARY KEY,
    MemberID  INT NOT NULL,
    CopyID    INT NOT NULL,
    IssueDate DATE NOT NULL,
    DueDate   DATE NOT NULL,
    FOREIGN KEY (MemberID) REFERENCES Member(MemberID),
    FOREIGN KEY (CopyID)   REFERENCES BookCopy(CopyID)
);`,
    commonMistakes: [
      {
        mistake: 'Connecting MEMBER directly to BOOK without BOOK_COPY.',
        whyWrong: 'A library owns 5 physical copies of "Dune". If a member checks out "Dune", which copy did they take? What if one copy is damaged?',
        correction: 'Separate BOOK (the title) from BOOK_COPY (the barcode shelf copy).',
      },
    ],
    validationStatus: 'PASS',
  },

  // 8. Hotel Booking System
  hotel: {
    scenarioId: 'hotel',
    title: 'Hotel Management & Room Booking',
    domain: 'Hospitality / Lodging Reservation',
    difficulty: 'Beginner',
    problemStatement:
      'Manage guest check-ins, boutique room categories, housekeeping statuses, and date-range reservations.',
    businessRules: [
      'Room types define TypeID, category name (Standard, Deluxe, Suite, Penthouse), and nightly base price.',
      'Physical hotel rooms have RoomNumber, TypeID FK, floor number, and housekeeping Status.',
      'Guests register with GuestID, full name, phone number, and verified email.',
      'Reservations link Guest and Room, recording CheckInDate, CheckOutDate, and total billed amount.',
    ],
    entities: [
      {
        name: 'ROOM_TYPE',
        type: 'strong',
        purpose: 'Tier or category of hotel room.',
        attributes: [
          { name: 'TypeID', dataType: 'INTEGER', isPk: true, isFk: false, isUnique: true, nullable: false },
          { name: 'TypeName', dataType: 'VARCHAR', isPk: false, isFk: false, isUnique: true, nullable: false },
          { name: 'BaseRate', dataType: 'DECIMAL(10, 2)', isPk: false, isFk: false, nullable: false, domainConstraint: 'CHECK (BaseRate >= 50.0)' },
        ],
        primaryKey: 'TypeID',
        pkJustification: 'TypeID identifies room tier classifications.',
      },
      {
        name: 'ROOM',
        type: 'strong',
        purpose: 'Specific physical guest room number in hotel building.',
        attributes: [
          { name: 'RoomNumber', dataType: 'INTEGER', isPk: true, isFk: false, isUnique: true, nullable: false },
          { name: 'TypeID', dataType: 'INTEGER', isPk: false, isFk: true, references: 'ROOM_TYPE.TypeID', nullable: false },
          { name: 'Floor', dataType: 'INTEGER', isPk: false, isFk: false, nullable: false },
          { name: 'Status', dataType: 'VARCHAR', isPk: false, isFk: false, nullable: false, domainConstraint: "CHECK (Status IN ('Vacant', 'Occupied', 'Cleaning'))" },
        ],
        primaryKey: 'RoomNumber',
        pkJustification: 'RoomNumber is the actual door number on the hotel floor.',
      },
      {
        name: 'GUEST',
        type: 'strong',
        purpose: 'Lodging visitor checking into room.',
        attributes: [
          { name: 'GuestID', dataType: 'INTEGER', isPk: true, isFk: false, isUnique: true, nullable: false },
          { name: 'FullName', dataType: 'VARCHAR', isPk: false, isFk: false, nullable: false },
          { name: 'Phone', dataType: 'VARCHAR', isPk: false, isFk: false, nullable: false },
          { name: 'Email', dataType: 'VARCHAR', isPk: false, isFk: false, isUnique: true, nullable: false },
        ],
        primaryKey: 'GuestID',
        pkJustification: 'GuestID uniquely identifies registered hotel patrons.',
      },
      {
        name: 'RESERVATION',
        type: 'associative',
        purpose: 'Booking transaction allocating Room to Guest over a date range.',
        attributes: [
          { name: 'ReservationID', dataType: 'INTEGER', isPk: true, isFk: false, isUnique: true, nullable: false },
          { name: 'GuestID', dataType: 'INTEGER', isPk: false, isFk: true, references: 'GUEST.GuestID', nullable: false },
          { name: 'RoomNumber', dataType: 'INTEGER', isPk: false, isFk: true, references: 'ROOM.RoomNumber', nullable: false },
          { name: 'CheckInDate', dataType: 'DATE', isPk: false, isFk: false, nullable: false },
          { name: 'CheckOutDate', dataType: 'DATE', isPk: false, isFk: false, nullable: false },
          { name: 'TotalCost', dataType: 'DECIMAL(10, 2)', isPk: false, isFk: false, nullable: false },
        ],
        primaryKey: 'ReservationID',
        pkJustification:
          'ReservationID identifies booking invoices; a room is booked repeatedly over different check-in dates.',
      },
    ],
    relationships: [
      {
        source: 'ROOM_TYPE',
        target: 'ROOM',
        name: 'defines_tier',
        cardinality: '1:N',
        sourceOptionality: '1..1',
        targetOptionality: '1..N',
        foreignKey: 'ROOM.TypeID → ROOM_TYPE.TypeID',
        forwardSentence: 'One room type classifies multiple physical rooms.',
        reverseSentence: 'Each physical room has one room type.',
        explanation: '1:N classification hierarchy.',
      },
      {
        source: 'GUEST',
        target: 'RESERVATION',
        name: 'books',
        cardinality: '1:N',
        sourceOptionality: '1..1',
        targetOptionality: '0..N',
        foreignKey: 'RESERVATION.GuestID → GUEST.GuestID',
        forwardSentence: 'One guest can book multiple hotel reservations over time.',
        reverseSentence: 'Each reservation is held by one primary guest.',
        explanation: '1:N relationship.',
      },
      {
        source: 'ROOM',
        target: 'RESERVATION',
        name: 'allocated_to',
        cardinality: '1:N',
        sourceOptionality: '1..1',
        targetOptionality: '0..N',
        foreignKey: 'RESERVATION.RoomNumber → ROOM.RoomNumber',
        forwardSentence: 'One physical room can have many non-overlapping reservations.',
        reverseSentence: 'Each reservation designates one room.',
        explanation: '1:N relationship.',
      },
    ],
    keyAnalysis: {
      primaryKeys: ['ROOM_TYPE.TypeID', 'ROOM.RoomNumber', 'GUEST.GuestID', 'RESERVATION.ReservationID'],
      foreignKeys: ['ROOM.TypeID → ROOM_TYPE.TypeID', 'RESERVATION.GuestID → GUEST.GuestID', 'RESERVATION.RoomNumber → ROOM.RoomNumber'],
      compositeKeys: ['RESERVATION(RoomNumber, CheckInDate) Unique'],
      candidateKeys: ['GUEST.Email', 'ROOM_TYPE.TypeName'],
      uniqueConstraints: ['GUEST(Email)', 'ROOM_TYPE(TypeName)'],
    },
    normalization: {
      firstNormalForm: 'Attributes are atomic.',
      secondNormalForm: 'Room attributes depend on RoomNumber.',
      thirdNormalForm: 'RoomType base rates are isolated in ROOM_TYPE, preventing transitive dependency in ROOM.',
    },
    mermaidDiagram: `erDiagram
    ROOM_TYPE ||--|{ ROOM : "defines_tier"
    GUEST ||--o{ RESERVATION : "books"
    ROOM ||--o{ RESERVATION : "allocated_to"
    ROOM_TYPE {
        int TypeID PK
        string TypeName UK
        decimal BaseRate
    }
    ROOM {
        int RoomNumber PK
        int TypeID FK
        int Floor
        string Status
    }
    GUEST {
        int GuestID PK
        string FullName
        string Phone
        string Email UK
    }
    RESERVATION {
        int ReservationID PK
        int GuestID FK
        int RoomNumber FK
        date CheckInDate
        date CheckOutDate
        decimal TotalCost
    }`,
    sqlDdl: `CREATE TABLE RoomType (
    TypeID   INT PRIMARY KEY,
    TypeName VARCHAR(50) NOT NULL UNIQUE,
    BaseRate DECIMAL(10, 2) NOT NULL CHECK (BaseRate >= 50.0)
);

CREATE TABLE Room (
    RoomNumber INT PRIMARY KEY,
    TypeID     INT NOT NULL,
    Floor      INT NOT NULL,
    Status     VARCHAR(20) NOT NULL CHECK (Status IN ('Vacant', 'Occupied', 'Cleaning')),
    FOREIGN KEY (TypeID) REFERENCES RoomType(TypeID)
);

CREATE TABLE Guest (
    GuestID  INT PRIMARY KEY,
    FullName VARCHAR(100) NOT NULL,
    Phone    VARCHAR(20) NOT NULL,
    Email    VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE Reservation (
    ReservationID INT PRIMARY KEY,
    GuestID       INT NOT NULL,
    RoomNumber    INT NOT NULL,
    CheckInDate   DATE NOT NULL,
    CheckOutDate  DATE NOT NULL,
    TotalCost     DECIMAL(10, 2) NOT NULL,
    CHECK (CheckOutDate > CheckInDate),
    FOREIGN KEY (GuestID)    REFERENCES Guest(GuestID),
    FOREIGN KEY (RoomNumber) REFERENCES Room(RoomNumber)
);`,
    commonMistakes: [
      {
        mistake: 'Putting GuestID inside ROOM directly.',
        whyWrong: 'Would mean a room can only ever be booked by 1 guest forever! When the guest checks out, you would have to overwrite the data.',
        correction: 'Use RESERVATION table to link Guest and Room across date intervals.',
      },
    ],
    validationStatus: 'PASS',
  },

  // 9. Restaurant POS System
  restaurant: {
    scenarioId: 'restaurant',
    title: 'Restaurant Table & Order Management',
    domain: 'Hospitality / Restaurant Point-of-Sale',
    difficulty: 'Beginner',
    problemStatement:
      'Kitchen orders, dining tables, waiters, food menu items, customer checks, and itemized ticket lines.',
    businessRules: [
      'Dining tables have TableNumber, seating Capacity, and LocationArea (Indoor, Patio, Bar).',
      'Waiters have WaiterID, full name, and phone contact.',
      'Menu items have ItemID, dish name, Category, and price.',
      'Order tickets record TicketID, TableNumber FK, WaiterID FK, OrderTime, and TotalCheck.',
      'Order tickets contain ordered menu items with quantity and subtotal (M:N resolved via TICKET_ITEM with composite PK (TicketID, ItemID)).',
    ],
    entities: [
      {
        name: 'DINING_TABLE',
        type: 'strong',
        purpose: 'Physical dining seating spot in restaurant floor plan.',
        attributes: [
          { name: 'TableNumber', dataType: 'INTEGER', isPk: true, isFk: false, isUnique: true, nullable: false },
          { name: 'Capacity', dataType: 'INTEGER', isPk: false, isFk: false, nullable: false, domainConstraint: 'CHECK (Capacity > 0)' },
          { name: 'LocationArea', dataType: 'VARCHAR', isPk: false, isFk: false, nullable: false, domainConstraint: "CHECK (LocationArea IN ('Indoor', 'Patio', 'Bar'))" },
        ],
        primaryKey: 'TableNumber',
        pkJustification: 'TableNumber is the physical table identifier.',
      },
      {
        name: 'WAITER',
        type: 'strong',
        purpose: 'Front of house hospitality server.',
        attributes: [
          { name: 'WaiterID', dataType: 'INTEGER', isPk: true, isFk: false, isUnique: true, nullable: false },
          { name: 'FullName', dataType: 'VARCHAR', isPk: false, isFk: false, nullable: false },
          { name: 'Phone', dataType: 'VARCHAR', isPk: false, isFk: false, nullable: true },
        ],
        primaryKey: 'WaiterID',
        pkJustification: 'WaiterID uniquely identifies waitstaff.',
      },
      {
        name: 'ORDER_TICKET',
        type: 'strong',
        purpose: 'Meal ticket sent to kitchen for cooking.',
        attributes: [
          { name: 'TicketID', dataType: 'INTEGER', isPk: true, isFk: false, isUnique: true, nullable: false },
          { name: 'TableNumber', dataType: 'INTEGER', isPk: false, isFk: true, references: 'DINING_TABLE.TableNumber', nullable: false },
          { name: 'WaiterID', dataType: 'INTEGER', isPk: false, isFk: true, references: 'WAITER.WaiterID', nullable: false },
          { name: 'OrderTime', dataType: 'DATETIME', isPk: false, isFk: false, nullable: false },
          { name: 'TotalCheck', dataType: 'DECIMAL(10, 2)', isPk: false, isFk: false, nullable: false },
        ],
        primaryKey: 'TicketID',
        pkJustification: 'TicketID identifies the guest order check.',
      },
      {
        name: 'TICKET_ITEM',
        type: 'associative',
        purpose: 'Ordered menu item line with composite PK (TicketID, ItemID).',
        attributes: [
          { name: 'TicketID', dataType: 'INTEGER', isPk: true, isFk: true, references: 'ORDER_TICKET.TicketID', nullable: false },
          { name: 'ItemID', dataType: 'INTEGER', isPk: true, isFk: true, references: 'MENU_ITEM.ItemID', nullable: false },
          { name: 'Quantity', dataType: 'INTEGER', isPk: false, isFk: false, nullable: false, domainConstraint: 'CHECK (Quantity >= 1)' },
          { name: 'ItemSubtotal', dataType: 'DECIMAL(10, 2)', isPk: false, isFk: false, nullable: false },
        ],
        primaryKey: '(TicketID, ItemID)',
        pkJustification: 'Composite PK (TicketID, ItemID) uniquely identifies the ordered dish on the ticket.',
      },
      {
        name: 'MENU_ITEM',
        type: 'strong',
        purpose: 'Culinary dish prepared by chefs.',
        attributes: [
          { name: 'ItemID', dataType: 'INTEGER', isPk: true, isFk: false, isUnique: true, nullable: false },
          { name: 'ItemName', dataType: 'VARCHAR', isPk: false, isFk: false, isUnique: true, nullable: false },
          { name: 'Category', dataType: 'VARCHAR', isPk: false, isFk: false, nullable: false, domainConstraint: "CHECK (Category IN ('Appetizer', 'Main', 'Dessert', 'Drink'))" },
          { name: 'Price', dataType: 'DECIMAL(10, 2)', isPk: false, isFk: false, nullable: false, domainConstraint: 'CHECK (Price > 0)' },
        ],
        primaryKey: 'ItemID',
        pkJustification: 'ItemID identifies menu items.',
      },
    ],
    relationships: [
      {
        source: 'DINING_TABLE',
        target: 'ORDER_TICKET',
        name: 'seats',
        cardinality: '1:N',
        sourceOptionality: '1..1',
        targetOptionality: '0..N',
        foreignKey: 'ORDER_TICKET.TableNumber → DINING_TABLE.TableNumber',
        forwardSentence: 'One dining table can host multiple order tickets throughout service.',
        reverseSentence: 'Each order ticket is seated at one dining table.',
        explanation: '1:N relationship.',
      },
      {
        source: 'WAITER',
        target: 'ORDER_TICKET',
        name: 'serves',
        cardinality: '1:N',
        sourceOptionality: '1..1',
        targetOptionality: '0..N',
        foreignKey: 'ORDER_TICKET.WaiterID → WAITER.WaiterID',
        forwardSentence: 'One waiter serves many order tickets.',
        reverseSentence: 'Each order ticket is served by one waiter.',
        explanation: '1:N relationship.',
      },
      {
        source: 'ORDER_TICKET',
        target: 'TICKET_ITEM',
        name: 'contains',
        cardinality: '1:N',
        sourceOptionality: '1..1',
        targetOptionality: '1..N',
        foreignKey: 'TICKET_ITEM.TicketID → ORDER_TICKET.TicketID',
        forwardSentence: 'One order ticket contains one or more itemized lines.',
        reverseSentence: 'Each ticket line belongs to one order ticket.',
        explanation: '1:N relationship.',
      },
      {
        source: 'MENU_ITEM',
        target: 'TICKET_ITEM',
        name: 'ordered_in',
        cardinality: '1:N',
        sourceOptionality: '1..1',
        targetOptionality: '0..N',
        foreignKey: 'TICKET_ITEM.ItemID → MENU_ITEM.ItemID',
        forwardSentence: 'One menu item can be ordered across many ticket lines.',
        reverseSentence: 'Each ticket line references one menu item.',
        explanation: '1:N relationship.',
      },
    ],
    keyAnalysis: {
      primaryKeys: ['DINING_TABLE.TableNumber', 'WAITER.WaiterID', 'ORDER_TICKET.TicketID', 'MENU_ITEM.ItemID', 'TICKET_ITEM.(TicketID, ItemID)'],
      foreignKeys: [
        'ORDER_TICKET.TableNumber → DINING_TABLE.TableNumber',
        'ORDER_TICKET.WaiterID → WAITER.WaiterID',
        'TICKET_ITEM.TicketID → ORDER_TICKET.TicketID',
        'TICKET_ITEM.ItemID → MENU_ITEM.ItemID',
      ],
      compositeKeys: ['TICKET_ITEM.(TicketID, ItemID)'],
      candidateKeys: ['MENU_ITEM.ItemName'],
      uniqueConstraints: ['MENU_ITEM(ItemName)'],
    },
    normalization: {
      firstNormalForm: 'Attributes are atomic.',
      secondNormalForm: 'ItemSubtotal depends on (TicketID, ItemID).',
      thirdNormalForm: 'Menu item price and description are stored once in MENU_ITEM.',
    },
    mermaidDiagram: `erDiagram
    DINING_TABLE ||--o{ ORDER_TICKET : "seats"
    WAITER ||--o{ ORDER_TICKET : "serves"
    ORDER_TICKET ||--|{ TICKET_ITEM : "contains"
    MENU_ITEM ||--o{ TICKET_ITEM : "ordered_in"
    DINING_TABLE {
        int TableNumber PK
        int Capacity
        string LocationArea
    }
    WAITER {
        int WaiterID PK
        string FullName
        string Phone
    }
    ORDER_TICKET {
        int TicketID PK
        int TableNumber FK
        int WaiterID FK
        datetime OrderTime
        decimal TotalCheck
    }
    TICKET_ITEM {
        int TicketID PK,FK
        int ItemID PK,FK
        int Quantity
        decimal ItemSubtotal
    }
    MENU_ITEM {
        int ItemID PK
        string ItemName UK
        string Category
        decimal Price
    }`,
    sqlDdl: `CREATE TABLE DiningTable (
    TableNumber  INT PRIMARY KEY,
    Capacity     INT NOT NULL CHECK (Capacity > 0),
    LocationArea VARCHAR(20) NOT NULL CHECK (LocationArea IN ('Indoor', 'Patio', 'Bar'))
);

CREATE TABLE Waiter (
    WaiterID INT PRIMARY KEY,
    FullName VARCHAR(100) NOT NULL,
    Phone    VARCHAR(20)
);

CREATE TABLE OrderTicket (
    TicketID    INT PRIMARY KEY,
    TableNumber INT NOT NULL,
    WaiterID    INT NOT NULL,
    OrderTime   DATETIME NOT NULL,
    TotalCheck  DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (TableNumber) REFERENCES DiningTable(TableNumber),
    FOREIGN KEY (WaiterID)    REFERENCES Waiter(WaiterID)
);

CREATE TABLE MenuItem (
    ItemID   INT PRIMARY KEY,
    ItemName VARCHAR(100) NOT NULL UNIQUE,
    Category VARCHAR(20) NOT NULL CHECK (Category IN ('Appetizer', 'Main', 'Dessert', 'Drink')),
    Price    DECIMAL(10, 2) NOT NULL CHECK (Price > 0)
);

CREATE TABLE TicketItem (
    TicketID     INT NOT NULL,
    ItemID       INT NOT NULL,
    Quantity     INT NOT NULL CHECK (Quantity >= 1),
    ItemSubtotal DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (TicketID, ItemID),
    FOREIGN KEY (TicketID) REFERENCES OrderTicket(TicketID) ON DELETE CASCADE,
    FOREIGN KEY (ItemID)   REFERENCES MenuItem(ItemID)
);`,
    commonMistakes: [
      {
        mistake: 'Leaving MENU_ITEM disconnected from ORDER_TICKET.',
        whyWrong: 'An order ticket must record what dishes the guests ordered! Leaving MENU_ITEM floating creates an orphan entity.',
        correction: 'Connect ORDER_TICKET and MENU_ITEM via TICKET_ITEM associative entity.',
      },
    ],
    validationStatus: 'PASS',
  },

  // 10. Banking System
  banking: {
    scenarioId: 'banking',
    title: 'Banking & Account Transactions',
    domain: 'Business / Financial Ledger Administration',
    difficulty: 'Advanced',
    problemStatement:
      'Customer bank accounts, regional branches, deposits, withdrawals, and ledger audit transactions.',
    businessRules: [
      'Bank branches have BranchID, branch name, and city location.',
      'Bank customers have unique CustomerID, full name, unique TaxNumber, and unique Email.',
      'Accounts belong to a customer and home branch, with AccountType (Checking, Savings) and Balance (CHECK >= 0).',
      'Ledger transactions record TransactionID, AccountNumber FK, TransactionType (Deposit, Withdrawal), Amount, and Timestamp.',
    ],
    entities: [
      {
        name: 'BRANCH',
        type: 'strong',
        purpose: 'Physical bank location and regional clearing branch.',
        attributes: [
          { name: 'BranchID', dataType: 'INTEGER', isPk: true, isFk: false, isUnique: true, nullable: false },
          { name: 'BranchName', dataType: 'VARCHAR', isPk: false, isFk: false, nullable: false },
          { name: 'City', dataType: 'VARCHAR', isPk: false, isFk: false, nullable: false },
        ],
        primaryKey: 'BranchID',
        pkJustification: 'BranchID is the financial routing branch number.',
      },
      {
        name: 'BANK_CUSTOMER',
        type: 'strong',
        purpose: 'Account holder and banking client.',
        attributes: [
          { name: 'CustomerID', dataType: 'INTEGER', isPk: true, isFk: false, isUnique: true, nullable: false },
          { name: 'FullName', dataType: 'VARCHAR', isPk: false, isFk: false, nullable: false },
          { name: 'TaxNumber', dataType: 'VARCHAR', isPk: false, isFk: false, isUnique: true, nullable: false },
          { name: 'Email', dataType: 'VARCHAR', isPk: false, isFk: false, isUnique: true, nullable: false },
        ],
        primaryKey: 'CustomerID',
        pkJustification: 'CustomerID is the unique bank customer identity number.',
      },
      {
        name: 'ACCOUNT',
        type: 'strong',
        purpose: 'Depository ledger account held by customer at branch.',
        attributes: [
          { name: 'AccountNumber', dataType: 'INTEGER', isPk: true, isFk: false, isUnique: true, nullable: false },
          { name: 'CustomerID', dataType: 'INTEGER', isPk: false, isFk: true, references: 'BANK_CUSTOMER.CustomerID', nullable: false },
          { name: 'BranchID', dataType: 'INTEGER', isPk: false, isFk: true, references: 'BRANCH.BranchID', nullable: false },
          { name: 'AccountType', dataType: 'VARCHAR', isPk: false, isFk: false, nullable: false, domainConstraint: "CHECK (AccountType IN ('Checking', 'Savings'))" },
          { name: 'Balance', dataType: 'DECIMAL(12, 2)', isPk: false, isFk: false, nullable: false, domainConstraint: 'CHECK (Balance >= 0)' },
        ],
        primaryKey: 'AccountNumber',
        pkJustification: 'AccountNumber is the standard ledger account number.',
      },
      {
        name: 'BANK_TRANSACTION',
        type: 'strong',
        purpose: 'Audit journal ledger entry for monetary transfers.',
        attributes: [
          { name: 'TransactionID', dataType: 'INTEGER', isPk: true, isFk: false, isUnique: true, nullable: false },
          { name: 'AccountNumber', dataType: 'INTEGER', isPk: false, isFk: true, references: 'ACCOUNT.AccountNumber', nullable: false },
          { name: 'TransactionType', dataType: 'VARCHAR', isPk: false, isFk: false, nullable: false, domainConstraint: "CHECK (TransactionType IN ('Deposit', 'Withdrawal'))" },
          { name: 'Amount', dataType: 'DECIMAL(12, 2)', isPk: false, isFk: false, nullable: false, domainConstraint: 'CHECK (Amount > 0)' },
          { name: 'Timestamp', dataType: 'DATETIME', isPk: false, isFk: false, nullable: false },
        ],
        primaryKey: 'TransactionID',
        pkJustification: 'TransactionID is the unique ledger audit entry number.',
      },
    ],
    relationships: [
      {
        source: 'BRANCH',
        target: 'ACCOUNT',
        name: 'manages',
        cardinality: '1:N',
        sourceOptionality: '1..1',
        targetOptionality: '0..N',
        foreignKey: 'ACCOUNT.BranchID → BRANCH.BranchID',
        forwardSentence: 'One bank branch manages many accounts.',
        reverseSentence: 'Each account is managed at one home branch.',
        explanation: '1:N relationship.',
      },
      {
        source: 'BANK_CUSTOMER',
        target: 'ACCOUNT',
        name: 'holds',
        cardinality: '1:N',
        sourceOptionality: '1..1',
        targetOptionality: '1..N',
        foreignKey: 'ACCOUNT.CustomerID → BANK_CUSTOMER.CustomerID',
        forwardSentence: 'One customer can hold multiple bank accounts (e.g. Checking and Savings).',
        reverseSentence: 'Each account belongs to one customer.',
        explanation: '1:N relationship.',
      },
      {
        source: 'ACCOUNT',
        target: 'BANK_TRANSACTION',
        name: 'records',
        cardinality: '1:N',
        sourceOptionality: '1..1',
        targetOptionality: '0..N',
        foreignKey: 'BANK_TRANSACTION.AccountNumber → ACCOUNT.AccountNumber',
        forwardSentence: 'One account records many ledger transactions.',
        reverseSentence: 'Each transaction occurs on one account.',
        explanation: '1:N ledger relationship.',
      },
    ],
    keyAnalysis: {
      primaryKeys: ['BRANCH.BranchID', 'BANK_CUSTOMER.CustomerID', 'ACCOUNT.AccountNumber', 'BANK_TRANSACTION.TransactionID'],
      foreignKeys: ['ACCOUNT.BranchID → BRANCH.BranchID', 'ACCOUNT.CustomerID → BANK_CUSTOMER.CustomerID', 'BANK_TRANSACTION.AccountNumber → ACCOUNT.AccountNumber'],
      compositeKeys: [],
      candidateKeys: ['BANK_CUSTOMER.TaxNumber', 'BANK_CUSTOMER.Email'],
      uniqueConstraints: ['BANK_CUSTOMER(TaxNumber)', 'BANK_CUSTOMER(Email)'],
    },
    normalization: {
      firstNormalForm: 'Attributes are atomic.',
      secondNormalForm: 'All attributes depend on their respective primary keys.',
      thirdNormalForm: 'Customer and Branch info are kept separate from Account and Transaction records.',
    },
    mermaidDiagram: `erDiagram
    BRANCH ||--o{ ACCOUNT : "manages"
    BANK_CUSTOMER ||--|{ ACCOUNT : "holds"
    ACCOUNT ||--o{ BANK_TRANSACTION : "records"
    BRANCH {
        int BranchID PK
        string BranchName
        string City
    }
    BANK_CUSTOMER {
        int CustomerID PK
        string FullName
        string TaxNumber UK
        string Email UK
    }
    ACCOUNT {
        int AccountNumber PK
        int CustomerID FK
        int BranchID FK
        string AccountType
        decimal Balance
    }
    BANK_TRANSACTION {
        int TransactionID PK
        int AccountNumber FK
        string TransactionType
        decimal Amount
        datetime Timestamp
    }`,
    sqlDdl: `CREATE TABLE Branch (
    BranchID   INT PRIMARY KEY,
    BranchName VARCHAR(100) NOT NULL,
    City       VARCHAR(100) NOT NULL
);

CREATE TABLE BankCustomer (
    CustomerID INT PRIMARY KEY,
    FullName   VARCHAR(100) NOT NULL,
    TaxNumber  VARCHAR(50) NOT NULL UNIQUE,
    Email      VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE Account (
    AccountNumber INT PRIMARY KEY,
    CustomerID    INT NOT NULL,
    BranchID      INT NOT NULL,
    AccountType   VARCHAR(20) NOT NULL CHECK (AccountType IN ('Checking', 'Savings')),
    Balance       DECIMAL(12, 2) NOT NULL CHECK (Balance >= 0),
    FOREIGN KEY (CustomerID) REFERENCES BankCustomer(CustomerID),
    FOREIGN KEY (BranchID)   REFERENCES Branch(BranchID)
);

CREATE TABLE BankTransaction (
    TransactionID   INT PRIMARY KEY,
    AccountNumber   INT NOT NULL,
    TransactionType VARCHAR(20) NOT NULL CHECK (TransactionType IN ('Deposit', 'Withdrawal')),
    Amount          DECIMAL(12, 2) NOT NULL CHECK (Amount > 0),
    Timestamp       DATETIME NOT NULL,
    FOREIGN KEY (AccountNumber) REFERENCES Account(AccountNumber)
);`,
    commonMistakes: [
      {
        mistake: 'Allowing negative Account balance without CHECK constraint.',
        whyWrong: 'Standard ledger invariants require non-negative checking/savings balances.',
        correction: 'Add CHECK (Balance >= 0).',
      },
    ],
    validationStatus: 'PASS',
  },

  // 11. Payroll System
  payroll: {
    scenarioId: 'payroll',
    title: 'Payroll & Salary Disbursement',
    domain: 'Business / Corporate Compensation',
    difficulty: 'Intermediate',
    problemStatement:
      'Corporate staff compensation, department cost centers, monthly pay slips, and tax deductions.',
    businessRules: [
      'Departments have DeptID and unique DeptName.',
      'Employees have EmployeeID, full name, job title, base salary (CHECK > 0), and DeptID FK.',
      'Salary slips record SlipID, EmployeeID FK, pay month period, gross earnings, taxes withheld, and net pay.',
    ],
    entities: [
      {
        name: 'PAYROLL_DEPARTMENT',
        type: 'strong',
        purpose: 'Corporate organizational cost center.',
        attributes: [
          { name: 'DeptID', dataType: 'INTEGER', isPk: true, isFk: false, isUnique: true, nullable: false },
          { name: 'DeptName', dataType: 'VARCHAR', isPk: false, isFk: false, isUnique: true, nullable: false },
        ],
        primaryKey: 'DeptID',
        pkJustification: 'DeptID is the cost center accounting identifier.',
      },
      {
        name: 'EMPLOYEE',
        type: 'strong',
        purpose: 'Corporate staff member receiving monthly compensation.',
        attributes: [
          { name: 'EmployeeID', dataType: 'INTEGER', isPk: true, isFk: false, isUnique: true, nullable: false },
          { name: 'FullName', dataType: 'VARCHAR', isPk: false, isFk: false, nullable: false },
          { name: 'JobTitle', dataType: 'VARCHAR', isPk: false, isFk: false, nullable: false },
          { name: 'BaseSalary', dataType: 'DECIMAL(10, 2)', isPk: false, isFk: false, nullable: false, domainConstraint: 'CHECK (BaseSalary > 0)' },
          { name: 'DeptID', dataType: 'INTEGER', isPk: false, isFk: true, references: 'PAYROLL_DEPARTMENT.DeptID', nullable: false },
        ],
        primaryKey: 'EmployeeID',
        pkJustification: 'EmployeeID is the employee personnel number.',
      },
      {
        name: 'SALARY_SLIP',
        type: 'strong',
        purpose: 'Itemized monthly earnings stub.',
        attributes: [
          { name: 'SlipID', dataType: 'INTEGER', isPk: true, isFk: false, isUnique: true, nullable: false },
          { name: 'EmployeeID', dataType: 'INTEGER', isPk: false, isFk: true, references: 'EMPLOYEE.EmployeeID', nullable: false },
          { name: 'PayPeriod', dataType: 'VARCHAR', isPk: false, isFk: false, nullable: false },
          { name: 'GrossPay', dataType: 'DECIMAL(10, 2)', isPk: false, isFk: false, nullable: false },
          { name: 'Deductions', dataType: 'DECIMAL(10, 2)', isPk: false, isFk: false, nullable: false },
          { name: 'NetPay', dataType: 'DECIMAL(10, 2)', isPk: false, isFk: false, nullable: false },
        ],
        primaryKey: 'SlipID',
        pkJustification: 'SlipID identifies the issued paystub; (EmployeeID, PayPeriod) is candidate key.',
      },
    ],
    relationships: [
      {
        source: 'PAYROLL_DEPARTMENT',
        target: 'EMPLOYEE',
        name: 'employs',
        cardinality: '1:N',
        sourceOptionality: '1..1',
        targetOptionality: '0..N',
        foreignKey: 'EMPLOYEE.DeptID → PAYROLL_DEPARTMENT.DeptID',
        forwardSentence: 'One department employs multiple employees.',
        reverseSentence: 'Each employee belongs to one department.',
        explanation: '1:N relationship.',
      },
      {
        source: 'EMPLOYEE',
        target: 'SALARY_SLIP',
        name: 'issued_to',
        cardinality: '1:N',
        sourceOptionality: '1..1',
        targetOptionality: '0..N',
        foreignKey: 'SALARY_SLIP.EmployeeID → EMPLOYEE.EmployeeID',
        forwardSentence: 'One employee receives monthly salary slips over their tenure.',
        reverseSentence: 'Each salary slip is issued to one employee.',
        explanation: '1:N relationship.',
      },
    ],
    keyAnalysis: {
      primaryKeys: ['PAYROLL_DEPARTMENT.DeptID', 'EMPLOYEE.EmployeeID', 'SALARY_SLIP.SlipID'],
      foreignKeys: ['EMPLOYEE.DeptID → PAYROLL_DEPARTMENT.DeptID', 'SALARY_SLIP.EmployeeID → EMPLOYEE.EmployeeID'],
      compositeKeys: ['SALARY_SLIP(EmployeeID, PayPeriod) Unique'],
      candidateKeys: ['PAYROLL_DEPARTMENT.DeptName', 'SALARY_SLIP(EmployeeID, PayPeriod)'],
      uniqueConstraints: ['PAYROLL_DEPARTMENT(DeptName)', 'SALARY_SLIP(EmployeeID, PayPeriod)'],
    },
    normalization: {
      firstNormalForm: 'Attributes are atomic.',
      secondNormalForm: 'Non-key attributes depend on primary key.',
      thirdNormalForm: 'Department name is not duplicated in employee salary slips.',
    },
    mermaidDiagram: `erDiagram
    PAYROLL_DEPARTMENT ||--o{ EMPLOYEE : "employs"
    EMPLOYEE ||--o{ SALARY_SLIP : "issued_to"
    PAYROLL_DEPARTMENT {
        int DeptID PK
        string DeptName UK
    }
    EMPLOYEE {
        int EmployeeID PK
        string FullName
        string JobTitle
        decimal BaseSalary
        int DeptID FK
    }
    SALARY_SLIP {
        int SlipID PK
        int EmployeeID FK
        string PayPeriod
        decimal GrossPay
        decimal Deductions
        decimal NetPay
    }`,
    sqlDdl: `CREATE TABLE PayrollDepartment (
    DeptID   INT PRIMARY KEY,
    DeptName VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE Employee (
    EmployeeID INT PRIMARY KEY,
    FullName   VARCHAR(100) NOT NULL,
    JobTitle   VARCHAR(100) NOT NULL,
    BaseSalary DECIMAL(10, 2) NOT NULL CHECK (BaseSalary > 0),
    DeptID     INT NOT NULL,
    FOREIGN KEY (DeptID) REFERENCES PayrollDepartment(DeptID)
);

CREATE TABLE SalarySlip (
    SlipID     INT PRIMARY KEY,
    EmployeeID INT NOT NULL,
    PayPeriod  VARCHAR(20) NOT NULL,
    GrossPay   DECIMAL(10, 2) NOT NULL,
    Deductions DECIMAL(10, 2) NOT NULL,
    NetPay     DECIMAL(10, 2) NOT NULL,
    UNIQUE (EmployeeID, PayPeriod),
    FOREIGN KEY (EmployeeID) REFERENCES Employee(EmployeeID) ON DELETE CASCADE
);`,
    commonMistakes: [
      {
        mistake: 'Putting DeptID inside SalarySlip directly.',
        whyWrong: 'Violates 3NF. Employee already belongs to a department; repeating it in SalarySlip introduces transitive dependency.',
        correction: 'Link SalarySlip only to Employee.',
      },
    ],
    validationStatus: 'PASS',
  },

  // 12. Inventory Warehouse System
  inventory: {
    scenarioId: 'inventory',
    title: 'Warehouse Inventory & Stock Supply',
    domain: 'Business / Logistics & Supply Chain',
    difficulty: 'Intermediate',
    problemStatement:
      'Central logistics fulfillment depot managing bulk stock across warehouses, wholesale suppliers, and incoming shipment batches.',
    businessRules: [
      'Warehouses have WarehouseID, warehouse name, and geographic city.',
      'Suppliers have SupplierID, company name, and unique contact email.',
      'Inventory items have unique SKU codes, item descriptions, unit costs, and reorder threshold levels.',
      'Stock batches record incoming shipments arriving at a warehouse from a supplier for a designated SKU.',
    ],
    entities: [
      {
        name: 'WAREHOUSE',
        type: 'strong',
        purpose: 'Physical depot storage facility.',
        attributes: [
          { name: 'WarehouseID', dataType: 'INTEGER', isPk: true, isFk: false, isUnique: true, nullable: false },
          { name: 'WarehouseName', dataType: 'VARCHAR', isPk: false, isFk: false, nullable: false },
          { name: 'LocationCity', dataType: 'VARCHAR', isPk: false, isFk: false, nullable: false },
        ],
        primaryKey: 'WarehouseID',
        pkJustification: 'WarehouseID identifies the physical storage building.',
      },
      {
        name: 'SUPPLIER',
        type: 'strong',
        purpose: 'Wholesale manufacturing vendor.',
        attributes: [
          { name: 'SupplierID', dataType: 'INTEGER', isPk: true, isFk: false, isUnique: true, nullable: false },
          { name: 'CompanyName', dataType: 'VARCHAR', isPk: false, isFk: false, nullable: false },
          { name: 'ContactEmail', dataType: 'VARCHAR', isPk: false, isFk: false, isUnique: true, nullable: false },
        ],
        primaryKey: 'SupplierID',
        pkJustification: 'SupplierID identifies vendors.',
      },
      {
        name: 'INVENTORY_ITEM',
        type: 'strong',
        purpose: 'Catalog master SKU profile.',
        attributes: [
          { name: 'SKU', dataType: 'VARCHAR', isPk: true, isFk: false, isUnique: true, nullable: false },
          { name: 'ItemName', dataType: 'VARCHAR', isPk: false, isFk: false, nullable: false },
          { name: 'UnitCost', dataType: 'DECIMAL(10, 2)', isPk: false, isFk: false, nullable: false, domainConstraint: 'CHECK (UnitCost > 0)' },
          { name: 'ReorderThreshold', dataType: 'INTEGER', isPk: false, isFk: false, nullable: false, domainConstraint: 'CHECK (ReorderThreshold >= 0)' },
        ],
        primaryKey: 'SKU',
        pkJustification: 'Stock Keeping Unit (SKU) is the universal natural identifier.',
      },
      {
        name: 'STOCK_BATCH',
        type: 'associative',
        purpose: 'Received lot parcel placed into warehouse storage.',
        attributes: [
          { name: 'BatchID', dataType: 'INTEGER', isPk: true, isFk: false, isUnique: true, nullable: false },
          { name: 'WarehouseID', dataType: 'INTEGER', isPk: false, isFk: true, references: 'WAREHOUSE.WarehouseID', nullable: false },
          { name: 'SupplierID', dataType: 'INTEGER', isPk: false, isFk: true, references: 'SUPPLIER.SupplierID', nullable: false },
          { name: 'SKU', dataType: 'VARCHAR', isPk: false, isFk: true, references: 'INVENTORY_ITEM.SKU', nullable: false },
          { name: 'QuantityReceived', dataType: 'INTEGER', isPk: false, isFk: false, nullable: false, domainConstraint: 'CHECK (QuantityReceived >= 1)' },
          { name: 'ExpiryDate', dataType: 'DATE', isPk: false, isFk: false, nullable: true },
        ],
        primaryKey: 'BatchID',
        pkJustification: 'BatchID identifies individual manufactured lot arrivals.',
      },
    ],
    relationships: [
      {
        source: 'WAREHOUSE',
        target: 'STOCK_BATCH',
        name: 'stores',
        cardinality: '1:N',
        sourceOptionality: '1..1',
        targetOptionality: '0..N',
        foreignKey: 'STOCK_BATCH.WarehouseID → WAREHOUSE.WarehouseID',
        forwardSentence: 'One warehouse stores many stock batches.',
        reverseSentence: 'Each stock batch is stored at one warehouse.',
        explanation: '1:N relationship.',
      },
      {
        source: 'SUPPLIER',
        target: 'STOCK_BATCH',
        name: 'supplies',
        cardinality: '1:N',
        sourceOptionality: '1..1',
        targetOptionality: '0..N',
        foreignKey: 'STOCK_BATCH.SupplierID → SUPPLIER.SupplierID',
        forwardSentence: 'One supplier supplies many stock batches.',
        reverseSentence: 'Each stock batch is supplied by one vendor.',
        explanation: '1:N relationship.',
      },
      {
        source: 'INVENTORY_ITEM',
        target: 'STOCK_BATCH',
        name: 'batched_as',
        cardinality: '1:N',
        sourceOptionality: '1..1',
        targetOptionality: '0..N',
        foreignKey: 'STOCK_BATCH.SKU → INVENTORY_ITEM.SKU',
        forwardSentence: 'One SKU item can have many physical incoming batches.',
        reverseSentence: 'Each stock batch consists of one SKU item.',
        explanation: '1:N relationship.',
      },
    ],
    keyAnalysis: {
      primaryKeys: ['WAREHOUSE.WarehouseID', 'SUPPLIER.SupplierID', 'INVENTORY_ITEM.SKU', 'STOCK_BATCH.BatchID'],
      foreignKeys: [
        'STOCK_BATCH.WarehouseID → WAREHOUSE.WarehouseID',
        'STOCK_BATCH.SupplierID → SUPPLIER.SupplierID',
        'STOCK_BATCH.SKU → INVENTORY_ITEM.SKU',
      ],
      compositeKeys: [],
      candidateKeys: ['SUPPLIER.ContactEmail'],
      uniqueConstraints: ['SUPPLIER(ContactEmail)'],
    },
    normalization: {
      firstNormalForm: 'Attributes are atomic.',
      secondNormalForm: 'All attributes depend on primary key.',
      thirdNormalForm: 'Supplier details and SKU details are decoupled from the physical batch record.',
    },
    mermaidDiagram: `erDiagram
    WAREHOUSE ||--o{ STOCK_BATCH : "stores"
    SUPPLIER ||--o{ STOCK_BATCH : "supplies"
    INVENTORY_ITEM ||--o{ STOCK_BATCH : "batched_as"
    WAREHOUSE {
        int WarehouseID PK
        string WarehouseName
        string LocationCity
    }
    SUPPLIER {
        int SupplierID PK
        string CompanyName
        string ContactEmail UK
    }
    INVENTORY_ITEM {
        string SKU PK
        string ItemName
        decimal UnitCost
        int ReorderThreshold
    }
    STOCK_BATCH {
        int BatchID PK
        int WarehouseID FK
        int SupplierID FK
        string SKU FK
        int QuantityReceived
        date ExpiryDate
    }`,
    sqlDdl: `CREATE TABLE Warehouse (
    WarehouseID  INT PRIMARY KEY,
    WarehouseName VARCHAR(100) NOT NULL,
    LocationCity VARCHAR(100) NOT NULL
);

CREATE TABLE Supplier (
    SupplierID   INT PRIMARY KEY,
    CompanyName  VARCHAR(100) NOT NULL,
    ContactEmail VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE InventoryItem (
    SKU              VARCHAR(50) PRIMARY KEY,
    ItemName         VARCHAR(150) NOT NULL,
    UnitCost         DECIMAL(10, 2) NOT NULL CHECK (UnitCost > 0),
    ReorderThreshold INT NOT NULL CHECK (ReorderThreshold >= 0)
);

CREATE TABLE StockBatch (
    BatchID          INT PRIMARY KEY,
    WarehouseID      INT NOT NULL,
    SupplierID       INT NOT NULL,
    SKU              VARCHAR(50) NOT NULL,
    QuantityReceived INT NOT NULL CHECK (QuantityReceived >= 1),
    ExpiryDate       DATE,
    FOREIGN KEY (WarehouseID) REFERENCES Warehouse(WarehouseID),
    FOREIGN KEY (SupplierID)  REFERENCES Supplier(SupplierID),
    FOREIGN KEY (SKU)         REFERENCES InventoryItem(SKU)
);`,
    commonMistakes: [
      {
        mistake: 'Directly connecting Warehouse to Supplier with M:N without StockBatch.',
        whyWrong: 'Does not track which goods were shipped, what quantity was received, or expiry dates.',
        correction: 'Use STOCK_BATCH as ternary associative entity linking Warehouse, Supplier, and SKU.',
      },
    ],
    validationStatus: 'PASS',
  },

  // 13. Movie Tickets System
  movietickets: {
    scenarioId: 'movietickets',
    title: 'Movie Theater & Ticket Booking',
    domain: 'Entertainment / Cinema Box Office',
    difficulty: 'Intermediate',
    problemStatement:
      'Cinema auditoriums, featured film showtimes, seat reservations, and moviegoer tickets.',
    businessRules: [
      'Cinema halls have HallID, hall name (e.g. IMAX Screen 1), and seating capacity.',
      'Movies have MovieID, title, duration in minutes, and parental Rating (G, PG, PG-13, R).',
      'Showtimes schedule a movie in a cinema hall with StartTime and TicketPrice.',
      'Ticket bookings record ShowtimeID FK, customer email, and seat code; seat code cannot be double-booked for the same show (UNIQUE (ShowtimeID, SeatCode)).',
    ],
    entities: [
      {
        name: 'CINEMA_HALL',
        type: 'strong',
        purpose: 'Auditorium screening room in theater complex.',
        attributes: [
          { name: 'HallID', dataType: 'INTEGER', isPk: true, isFk: false, isUnique: true, nullable: false },
          { name: 'HallName', dataType: 'VARCHAR', isPk: false, isFk: false, isUnique: true, nullable: false },
          { name: 'TotalSeats', dataType: 'INTEGER', isPk: false, isFk: false, nullable: false, domainConstraint: 'CHECK (TotalSeats >= 10)' },
        ],
        primaryKey: 'HallID',
        pkJustification: 'HallID identifies the auditorium.',
      },
      {
        name: 'MOVIE',
        type: 'strong',
        purpose: 'Motion picture feature film.',
        attributes: [
          { name: 'MovieID', dataType: 'INTEGER', isPk: true, isFk: false, isUnique: true, nullable: false },
          { name: 'Title', dataType: 'VARCHAR', isPk: false, isFk: false, nullable: false },
          { name: 'DurationMinutes', dataType: 'INTEGER', isPk: false, isFk: false, nullable: false, domainConstraint: 'CHECK (DurationMinutes >= 1)' },
          { name: 'Rating', dataType: 'VARCHAR', isPk: false, isFk: false, nullable: false, domainConstraint: "CHECK (Rating IN ('G', 'PG', 'PG-13', 'R'))" },
        ],
        primaryKey: 'MovieID',
        pkJustification: 'MovieID identifies the catalog film.',
      },
      {
        name: 'SHOWTIME',
        type: 'strong',
        purpose: 'Screening time slot connecting Movie and Hall.',
        attributes: [
          { name: 'ShowtimeID', dataType: 'INTEGER', isPk: true, isFk: false, isUnique: true, nullable: false },
          { name: 'MovieID', dataType: 'INTEGER', isPk: false, isFk: true, references: 'MOVIE.MovieID', nullable: false },
          { name: 'HallID', dataType: 'INTEGER', isPk: false, isFk: true, references: 'CINEMA_HALL.HallID', nullable: false },
          { name: 'StartTime', dataType: 'DATETIME', isPk: false, isFk: false, nullable: false },
          { name: 'TicketPrice', dataType: 'DECIMAL(10, 2)', isPk: false, isFk: false, nullable: false, domainConstraint: 'CHECK (TicketPrice >= 5.0)' },
        ],
        primaryKey: 'ShowtimeID',
        pkJustification: 'ShowtimeID identifies the scheduled screening.',
      },
      {
        name: 'TICKET_BOOKING',
        type: 'strong',
        purpose: 'Customer admission seat ticket.',
        attributes: [
          { name: 'BookingID', dataType: 'INTEGER', isPk: true, isFk: false, isUnique: true, nullable: false },
          { name: 'ShowtimeID', dataType: 'INTEGER', isPk: false, isFk: true, references: 'SHOWTIME.ShowtimeID', nullable: false },
          { name: 'CustomerEmail', dataType: 'VARCHAR', isPk: false, isFk: false, nullable: false },
          { name: 'SeatCode', dataType: 'VARCHAR', isPk: false, isFk: false, nullable: false },
        ],
        primaryKey: 'BookingID',
        pkJustification:
          'BookingID identifies the ticket receipt; (ShowtimeID, SeatCode) is candidate key with mandatory UNIQUE constraint.',
      },
    ],
    relationships: [
      {
        source: 'CINEMA_HALL',
        target: 'SHOWTIME',
        name: 'hosts',
        cardinality: '1:N',
        sourceOptionality: '1..1',
        targetOptionality: '0..N',
        foreignKey: 'SHOWTIME.HallID → CINEMA_HALL.HallID',
        forwardSentence: 'One cinema hall hosts many scheduled showtimes.',
        reverseSentence: 'Each showtime occurs in one cinema hall.',
        explanation: '1:N relationship.',
      },
      {
        source: 'MOVIE',
        target: 'SHOWTIME',
        name: 'screened_at',
        cardinality: '1:N',
        sourceOptionality: '1..1',
        targetOptionality: '0..N',
        foreignKey: 'SHOWTIME.MovieID → MOVIE.MovieID',
        forwardSentence: 'One movie can be screened at multiple showtimes.',
        reverseSentence: 'Each showtime presents one movie.',
        explanation: '1:N relationship.',
      },
      {
        source: 'SHOWTIME',
        target: 'TICKET_BOOKING',
        name: 'issues',
        cardinality: '1:N',
        sourceOptionality: '1..1',
        targetOptionality: '0..N',
        foreignKey: 'TICKET_BOOKING.ShowtimeID → SHOWTIME.ShowtimeID',
        forwardSentence: 'One showtime issues many seat ticket bookings.',
        reverseSentence: 'Each ticket booking belongs to one showtime.',
        explanation: '1:N relationship.',
      },
    ],
    keyAnalysis: {
      primaryKeys: ['CINEMA_HALL.HallID', 'MOVIE.MovieID', 'SHOWTIME.ShowtimeID', 'TICKET_BOOKING.BookingID'],
      foreignKeys: ['SHOWTIME.HallID → CINEMA_HALL.HallID', 'SHOWTIME.MovieID → MOVIE.MovieID', 'TICKET_BOOKING.ShowtimeID → SHOWTIME.ShowtimeID'],
      compositeKeys: ['TICKET_BOOKING(ShowtimeID, SeatCode) Unique'],
      candidateKeys: ['CINEMA_HALL.HallName', 'TICKET_BOOKING(ShowtimeID, SeatCode)'],
      uniqueConstraints: ['CINEMA_HALL(HallName)', 'TICKET_BOOKING(ShowtimeID, SeatCode)'],
    },
    normalization: {
      firstNormalForm: 'Attributes are atomic.',
      secondNormalForm: 'All attributes depend on primary key.',
      thirdNormalForm: 'Hall total seats and movie ratings are decoupled from ticket bookings.',
    },
    mermaidDiagram: `erDiagram
    CINEMA_HALL ||--o{ SHOWTIME : "hosts"
    MOVIE ||--o{ SHOWTIME : "screened_at"
    SHOWTIME ||--o{ TICKET_BOOKING : "issues"
    CINEMA_HALL {
        int HallID PK
        string HallName UK
        int TotalSeats
    }
    MOVIE {
        int MovieID PK
        string Title
        int DurationMinutes
        string Rating
    }
    SHOWTIME {
        int ShowtimeID PK
        int MovieID FK
        int HallID FK
        datetime StartTime
        decimal TicketPrice
    }
    TICKET_BOOKING {
        int BookingID PK
        int ShowtimeID FK
        string CustomerEmail
        string SeatCode
    }`,
    sqlDdl: `CREATE TABLE CinemaHall (
    HallID     INT PRIMARY KEY,
    HallName   VARCHAR(100) NOT NULL UNIQUE,
    TotalSeats INT NOT NULL CHECK (TotalSeats >= 10)
);

CREATE TABLE Movie (
    MovieID         INT PRIMARY KEY,
    Title           VARCHAR(150) NOT NULL,
    DurationMinutes INT NOT NULL CHECK (DurationMinutes >= 1),
    Rating          VARCHAR(10) NOT NULL CHECK (Rating IN ('G', 'PG', 'PG-13', 'R'))
);

CREATE TABLE Showtime (
    ShowtimeID  INT PRIMARY KEY,
    MovieID     INT NOT NULL,
    HallID      INT NOT NULL,
    StartTime   DATETIME NOT NULL,
    TicketPrice DECIMAL(10, 2) NOT NULL CHECK (TicketPrice >= 5.0),
    FOREIGN KEY (MovieID) REFERENCES Movie(MovieID),
    FOREIGN KEY (HallID)  REFERENCES CinemaHall(HallID)
);

CREATE TABLE TicketBooking (
    BookingID     INT PRIMARY KEY,
    ShowtimeID    INT NOT NULL,
    CustomerEmail VARCHAR(100) NOT NULL,
    SeatCode      VARCHAR(10) NOT NULL,
    UNIQUE (ShowtimeID, SeatCode),
    FOREIGN KEY (ShowtimeID) REFERENCES Showtime(ShowtimeID) ON DELETE CASCADE
);`,
    commonMistakes: [
      {
        mistake: 'Allowing duplicate seat bookings by missing UNIQUE (ShowtimeID, SeatCode).',
        whyWrong: 'Two moviegoers cannot sit in seat E7 for the same showtime!',
        correction: 'Add UNIQUE (ShowtimeID, SeatCode).',
      },
    ],
    validationStatus: 'PASS',
  },

  // 14. Social Media Network
  socialmedia: {
    scenarioId: 'socialmedia',
    title: 'Social Media & Messaging Network',
    domain: 'Social / Online Community Graph',
    difficulty: 'Advanced',
    problemStatement:
      'User follower graphs, recursive subscriptions, published micro-posts, and threaded feedback comments.',
    businessRules: [
      'Users have UserID, unique @handle, full name, and bio text.',
      'Users author Posts with PostID, UserID FK, content text, and CreatedAt timestamp.',
      'Comments are attached to posts, recording CommentID, PostID FK, AuthorID FK, and CommentText.',
      'Users follow other users in a self-referencing follower graph (FollowerID, FolloweeID, FollowDate) with composite PK (FollowerID, FolloweeID).',
    ],
    entities: [
      {
        name: 'USER_PROFILE',
        type: 'strong',
        purpose: 'Registered social network identity account.',
        attributes: [
          { name: 'UserID', dataType: 'INTEGER', isPk: true, isFk: false, isUnique: true, nullable: false },
          { name: 'Handle', dataType: 'VARCHAR', isPk: false, isFk: false, isUnique: true, nullable: false },
          { name: 'FullName', dataType: 'VARCHAR', isPk: false, isFk: false, nullable: false },
          { name: 'Bio', dataType: 'TEXT', isPk: false, isFk: false, nullable: true },
        ],
        primaryKey: 'UserID',
        pkJustification: 'UserID identifies the account holder.',
      },
      {
        name: 'USER_POST',
        type: 'strong',
        purpose: 'Broadcast post feed publication.',
        attributes: [
          { name: 'PostID', dataType: 'INTEGER', isPk: true, isFk: false, isUnique: true, nullable: false },
          { name: 'UserID', dataType: 'INTEGER', isPk: false, isFk: true, references: 'USER_PROFILE.UserID', nullable: false },
          { name: 'Content', dataType: 'TEXT', isPk: false, isFk: false, nullable: false },
          { name: 'CreatedAt', dataType: 'DATETIME', isPk: false, isFk: false, nullable: false },
        ],
        primaryKey: 'PostID',
        pkJustification: 'PostID identifies each distinct post.',
      },
      {
        name: 'POST_COMMENT',
        type: 'strong',
        purpose: 'Threaded commentary on published post.',
        attributes: [
          { name: 'CommentID', dataType: 'INTEGER', isPk: true, isFk: false, isUnique: true, nullable: false },
          { name: 'PostID', dataType: 'INTEGER', isPk: false, isFk: true, references: 'USER_POST.PostID', nullable: false },
          { name: 'AuthorID', dataType: 'INTEGER', isPk: false, isFk: true, references: 'USER_PROFILE.UserID', nullable: false },
          { name: 'CommentText', dataType: 'TEXT', isPk: false, isFk: false, nullable: false },
        ],
        primaryKey: 'CommentID',
        pkJustification: 'CommentID identifies each comment.',
      },
      {
        name: 'USER_FOLLOW',
        type: 'associative',
        purpose: 'Recursive junction table with composite PK (FollowerID, FolloweeID).',
        attributes: [
          { name: 'FollowerID', dataType: 'INTEGER', isPk: true, isFk: true, references: 'USER_PROFILE.UserID', nullable: false },
          { name: 'FolloweeID', dataType: 'INTEGER', isPk: true, isFk: true, references: 'USER_PROFILE.UserID', nullable: false },
          { name: 'FollowDate', dataType: 'DATE', isPk: false, isFk: false, nullable: false },
        ],
        primaryKey: '(FollowerID, FolloweeID)',
        pkJustification:
          'A user follows another user at most once. (FollowerID, FolloweeID) forms a clean composite primary key without a redundant surrogate FollowID.',
      },
    ],
    relationships: [
      {
        source: 'USER_PROFILE',
        target: 'USER_POST',
        name: 'publishes',
        cardinality: '1:N',
        sourceOptionality: '1..1',
        targetOptionality: '0..N',
        foreignKey: 'USER_POST.UserID → USER_PROFILE.UserID',
        forwardSentence: 'One user publishes many posts.',
        reverseSentence: 'Each post is published by one author user.',
        explanation: '1:N relationship.',
      },
      {
        source: 'USER_POST',
        target: 'POST_COMMENT',
        name: 'has_comment',
        cardinality: '1:N',
        sourceOptionality: '1..1',
        targetOptionality: '0..N',
        foreignKey: 'POST_COMMENT.PostID → USER_POST.PostID',
        forwardSentence: 'One post has multiple user comments.',
        reverseSentence: 'Each comment belongs to one parent post.',
        explanation: '1:N relationship.',
      },
      {
        source: 'USER_PROFILE',
        target: 'POST_COMMENT',
        name: 'authors_comment',
        cardinality: '1:N',
        sourceOptionality: '1..1',
        targetOptionality: '0..N',
        foreignKey: 'POST_COMMENT.AuthorID → USER_PROFILE.UserID',
        forwardSentence: 'One user can author multiple comments.',
        reverseSentence: 'Each comment is written by one author.',
        explanation: '1:N relationship.',
      },
      {
        source: 'USER_PROFILE',
        target: 'USER_FOLLOW',
        name: 'initiates_follow',
        cardinality: '1:N',
        sourceOptionality: '1..1',
        targetOptionality: '0..N',
        foreignKey: 'USER_FOLLOW.FollowerID → USER_PROFILE.UserID',
        forwardSentence: 'One user can follow many other users (outgoing follow edge).',
        reverseSentence: 'Each follow relationship specifies one follower.',
        explanation: 'Recursive M:N resolution (Follower role).',
      },
      {
        source: 'USER_PROFILE',
        target: 'USER_FOLLOW',
        name: 'receives_follow',
        cardinality: '1:N',
        sourceOptionality: '1..1',
        targetOptionality: '0..N',
        foreignKey: 'USER_FOLLOW.FolloweeID → USER_PROFILE.UserID',
        forwardSentence: 'One user can be followed by many other users (incoming follow edge).',
        reverseSentence: 'Each follow relationship specifies one followee.',
        explanation: 'Recursive M:N resolution (Followee role).',
      },
    ],
    keyAnalysis: {
      primaryKeys: ['USER_PROFILE.UserID', 'USER_POST.PostID', 'POST_COMMENT.CommentID', 'USER_FOLLOW.(FollowerID, FolloweeID)'],
      foreignKeys: [
        'USER_POST.UserID → USER_PROFILE.UserID',
        'POST_COMMENT.PostID → USER_POST.PostID',
        'POST_COMMENT.AuthorID → USER_PROFILE.UserID',
        'USER_FOLLOW.FollowerID → USER_PROFILE.UserID',
        'USER_FOLLOW.FolloweeID → USER_PROFILE.UserID',
      ],
      compositeKeys: ['USER_FOLLOW.(FollowerID, FolloweeID)'],
      candidateKeys: ['USER_PROFILE.Handle'],
      uniqueConstraints: ['USER_PROFILE(Handle)'],
    },
    normalization: {
      firstNormalForm: 'Attributes are atomic.',
      secondNormalForm: 'All attributes in USER_FOLLOW depend on (FollowerID, FolloweeID).',
      thirdNormalForm: 'Post content and author details are isolated in respective tables.',
    },
    mermaidDiagram: `erDiagram
    USER_PROFILE ||--o{ USER_POST : "publishes"
    USER_POST ||--o{ POST_COMMENT : "has_comment"
    USER_PROFILE ||--o{ POST_COMMENT : "authors_comment"
    USER_PROFILE ||--o{ USER_FOLLOW : "initiates_follow"
    USER_PROFILE ||--o{ USER_FOLLOW : "receives_follow"
    USER_PROFILE {
        int UserID PK
        string Handle UK
        string FullName
        string Bio
    }
    USER_POST {
        int PostID PK
        int UserID FK
        string Content
        datetime CreatedAt
    }
    POST_COMMENT {
        int CommentID PK
        int PostID FK
        int AuthorID FK
        string CommentText
    }
    USER_FOLLOW {
        int FollowerID PK,FK
        int FolloweeID PK,FK
        date FollowDate
    } `,
    sqlDdl: `CREATE TABLE UserProfile (
    UserID   INT PRIMARY KEY,
    Handle   VARCHAR(50) NOT NULL UNIQUE,
    FullName VARCHAR(100) NOT NULL,
    Bio      TEXT
);

CREATE TABLE UserPost (
    PostID    INT PRIMARY KEY,
    UserID    INT NOT NULL,
    Content   TEXT NOT NULL,
    CreatedAt DATETIME NOT NULL,
    FOREIGN KEY (UserID) REFERENCES UserProfile(UserID) ON DELETE CASCADE
);

CREATE TABLE PostComment (
    CommentID   INT PRIMARY KEY,
    PostID      INT NOT NULL,
    AuthorID    INT NOT NULL,
    CommentText TEXT NOT NULL,
    FOREIGN KEY (PostID)   REFERENCES UserPost(PostID) ON DELETE CASCADE,
    FOREIGN KEY (AuthorID) REFERENCES UserProfile(UserID)
);

CREATE TABLE UserFollow (
    FollowerID INT NOT NULL,
    FolloweeID INT NOT NULL,
    FollowDate DATE NOT NULL,
    CHECK (FollowerID <> FolloweeID),
    PRIMARY KEY (FollowerID, FolloweeID),
    FOREIGN KEY (FollowerID) REFERENCES UserProfile(UserID) ON DELETE CASCADE,
    FOREIGN KEY (FolloweeID) REFERENCES UserProfile(UserID) ON DELETE CASCADE
);`,
    commonMistakes: [
      {
        mistake: 'Adding a surrogate FollowID on the USER_FOLLOW junction table.',
        whyWrong: 'A user cannot follow another user multiple times. (FollowerID, FolloweeID) is already natural, composite, and prevents duplicate follows.',
        correction: 'Use composite primary key (FollowerID, FolloweeID).',
      },
    ],
    validationStatus: 'PASS',
  },

  // 15. Ride Sharing System
  ridesharing: {
    scenarioId: 'ridesharing',
    title: 'Ride Sharing & Driver Dispatch',
    domain: 'Transportation / Urban Mobility',
    difficulty: 'Intermediate',
    problemStatement:
      'On-demand GPS trip bookings, drivers, personal vehicles, rider ratings, and fare receipts.',
    businessRules: [
      'Riders have RiderID, full name, mobile phone, and average star rating (1.0 to 5.0).',
      'Drivers have DriverID, full name, unique driver license number, and star rating.',
      'Each vehicle is operated by exactly one driver via a strict 1:1 relationship (enforced by UNIQUE FK DriverID in Vehicle).',
      'Trips link Rider and Driver, recording PickupLocation, DropoffLocation, Fare amount, and trip Status.',
    ],
    entities: [
      {
        name: 'RIDER',
        type: 'strong',
        purpose: 'Passenger requesting urban transport.',
        attributes: [
          { name: 'RiderID', dataType: 'INTEGER', isPk: true, isFk: false, isUnique: true, nullable: false },
          { name: 'FullName', dataType: 'VARCHAR', isPk: false, isFk: false, nullable: false },
          { name: 'Phone', dataType: 'VARCHAR', isPk: false, isFk: false, isUnique: true, nullable: false },
          { name: 'Rating', dataType: 'DECIMAL(2, 1)', isPk: false, isFk: false, nullable: false, domainConstraint: 'CHECK (Rating BETWEEN 1.0 AND 5.0)' },
        ],
        primaryKey: 'RiderID',
        pkJustification: 'RiderID identifies the rider passenger account.',
      },
      {
        name: 'DRIVER',
        type: 'strong',
        purpose: 'Active ride-share chauffeur.',
        attributes: [
          { name: 'DriverID', dataType: 'INTEGER', isPk: true, isFk: false, isUnique: true, nullable: false },
          { name: 'FullName', dataType: 'VARCHAR', isPk: false, isFk: false, nullable: false },
          { name: 'LicenseNumber', dataType: 'VARCHAR', isPk: false, isFk: false, isUnique: true, nullable: false },
          { name: 'Rating', dataType: 'DECIMAL(2, 1)', isPk: false, isFk: false, nullable: false, domainConstraint: 'CHECK (Rating BETWEEN 1.0 AND 5.0)' },
        ],
        primaryKey: 'DriverID',
        pkJustification: 'DriverID identifies the contracted driver.',
      },
      {
        name: 'VEHICLE',
        type: 'strong',
        purpose: 'Automobile registered 1:1 with an individual driver.',
        attributes: [
          { name: 'VehicleID', dataType: 'INTEGER', isPk: true, isFk: false, isUnique: true, nullable: false },
          { name: 'DriverID', dataType: 'INTEGER', isPk: false, isFk: true, references: 'DRIVER.DriverID', isUnique: true, nullable: false },
          { name: 'MakeModel', dataType: 'VARCHAR', isPk: false, isFk: false, nullable: false },
          { name: 'LicensePlate', dataType: 'VARCHAR', isPk: false, isFk: false, isUnique: true, nullable: false },
        ],
        primaryKey: 'VehicleID',
        pkJustification: 'VehicleID identifies the registered car.',
      },
      {
        name: 'TRIP_BOOKING',
        type: 'associative',
        purpose: 'Point-to-point transit ride dispatch record.',
        attributes: [
          { name: 'TripID', dataType: 'INTEGER', isPk: true, isFk: false, isUnique: true, nullable: false },
          { name: 'RiderID', dataType: 'INTEGER', isPk: false, isFk: true, references: 'RIDER.RiderID', nullable: false },
          { name: 'DriverID', dataType: 'INTEGER', isPk: false, isFk: true, references: 'DRIVER.DriverID', nullable: false },
          { name: 'Pickup', dataType: 'VARCHAR', isPk: false, isFk: false, nullable: false },
          { name: 'Dropoff', dataType: 'VARCHAR', isPk: false, isFk: false, nullable: false },
          { name: 'Fare', dataType: 'DECIMAL(10, 2)', isPk: false, isFk: false, nullable: false, domainConstraint: 'CHECK (Fare >= 2.50)' },
          { name: 'Status', dataType: 'VARCHAR', isPk: false, isFk: false, nullable: false, domainConstraint: "CHECK (Status IN ('Completed', 'Cancelled', 'InProgress'))" },
        ],
        primaryKey: 'TripID',
        pkJustification: 'TripID identifies each ride voucher.',
      },
    ],
    relationships: [
      {
        source: 'DRIVER',
        target: 'VEHICLE',
        name: 'operates',
        cardinality: '1:1',
        sourceOptionality: '1..1',
        targetOptionality: '1..1',
        foreignKey: 'VEHICLE.DriverID (UNIQUE) → DRIVER.DriverID',
        forwardSentence: 'One driver operates exactly one registered vehicle.',
        reverseSentence: 'Each registered vehicle is operated by exactly one driver.',
        explanation: '1:1 relationship enforced via UNIQUE constraint on Foreign Key DriverID in VEHICLE.',
      },
      {
        source: 'RIDER',
        target: 'TRIP_BOOKING',
        name: 'requests',
        cardinality: '1:N',
        sourceOptionality: '1..1',
        targetOptionality: '0..N',
        foreignKey: 'TRIP_BOOKING.RiderID → RIDER.RiderID',
        forwardSentence: 'One rider can request multiple trips.',
        reverseSentence: 'Each trip is requested by one rider.',
        explanation: '1:N relationship.',
      },
      {
        source: 'DRIVER',
        target: 'TRIP_BOOKING',
        name: 'fulfills',
        cardinality: '1:N',
        sourceOptionality: '1..1',
        targetOptionality: '0..N',
        foreignKey: 'TRIP_BOOKING.DriverID → DRIVER.DriverID',
        forwardSentence: 'One driver fulfills multiple trips.',
        reverseSentence: 'Each trip is fulfilled by one driver.',
        explanation: '1:N relationship.',
      },
    ],
    keyAnalysis: {
      primaryKeys: ['RIDER.RiderID', 'DRIVER.DriverID', 'VEHICLE.VehicleID', 'TRIP_BOOKING.TripID'],
      foreignKeys: [
        'VEHICLE.DriverID (UNIQUE) → DRIVER.DriverID',
        'TRIP_BOOKING.RiderID → RIDER.RiderID',
        'TRIP_BOOKING.DriverID → DRIVER.DriverID',
      ],
      compositeKeys: [],
      candidateKeys: ['DRIVER.LicenseNumber', 'VEHICLE.LicensePlate', 'RIDER.Phone'],
      uniqueConstraints: ['DRIVER(LicenseNumber)', 'VEHICLE(LicensePlate)', 'VEHICLE(DriverID)', 'RIDER(Phone)'],
    },
    normalization: {
      firstNormalForm: 'Attributes are atomic.',
      secondNormalForm: 'Non-key attributes depend entirely on the primary keys.',
      thirdNormalForm: 'Driver license and vehicle license plate details are decoupled into dedicated tables.',
    },
    mermaidDiagram: `erDiagram
    DRIVER ||--|| VEHICLE : "operates"
    RIDER ||--o{ TRIP_BOOKING : "requests"
    DRIVER ||--o{ TRIP_BOOKING : "fulfills"
    RIDER {
        int RiderID PK
        string FullName
        string Phone UK
        decimal Rating
    }
    DRIVER {
        int DriverID PK
        string FullName
        string LicenseNumber UK
        decimal Rating
    }
    VEHICLE {
        int VehicleID PK
        int DriverID FK,UK
        string MakeModel
        string LicensePlate UK
    }
    TRIP_BOOKING {
        int TripID PK
        int RiderID FK
        int DriverID FK
        string Pickup
        string Dropoff
        decimal Fare
        string Status
    }`,
    sqlDdl: `CREATE TABLE Rider (
    RiderID  INT PRIMARY KEY,
    FullName VARCHAR(100) NOT NULL,
    Phone    VARCHAR(20) NOT NULL UNIQUE,
    Rating   DECIMAL(2, 1) NOT NULL CHECK (Rating BETWEEN 1.0 AND 5.0)
);

CREATE TABLE Driver (
    DriverID      INT PRIMARY KEY,
    FullName      VARCHAR(100) NOT NULL,
    LicenseNumber VARCHAR(50) NOT NULL UNIQUE,
    Rating        DECIMAL(2, 1) NOT NULL CHECK (Rating BETWEEN 1.0 AND 5.0)
);

CREATE TABLE Vehicle (
    VehicleID    INT PRIMARY KEY,
    DriverID     INT NOT NULL UNIQUE,
    MakeModel    VARCHAR(100) NOT NULL,
    LicensePlate VARCHAR(20) NOT NULL UNIQUE,
    FOREIGN KEY (DriverID) REFERENCES Driver(DriverID)
);

CREATE TABLE TripBooking (
    TripID   INT PRIMARY KEY,
    RiderID  INT NOT NULL,
    DriverID INT NOT NULL,
    Pickup   VARCHAR(150) NOT NULL,
    Dropoff  VARCHAR(150) NOT NULL,
    Fare     DECIMAL(10, 2) NOT NULL CHECK (Fare >= 2.50),
    Status   VARCHAR(20) NOT NULL CHECK (Status IN ('Completed', 'Cancelled', 'InProgress')),
    FOREIGN KEY (RiderID)  REFERENCES Rider(RiderID),
    FOREIGN KEY (DriverID) REFERENCES Driver(DriverID)
);`,
    commonMistakes: [
      {
        mistake: 'Failing to make DriverID UNIQUE in VEHICLE for a 1:1 relationship.',
        whyWrong: 'Without UNIQUE on the foreign key, multiple vehicles could reference the same driver, turning the relationship into 1:N.',
        correction: 'Add UNIQUE (DriverID) on the VEHICLE table.',
      },
    ],
    validationStatus: 'PASS',
  },
};

/**
 * Helper to retrieve or generate the authoritative solution for any system scenario.
 */
export function getAuthoritativeSolution(scenarioId: string): AuthoritativeSolution | undefined {
  return AUTHORITATIVE_SOLUTIONS[scenarioId];
}
