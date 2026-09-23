import type { NormalizationStage, FunctionalDependency } from '../../types/normalization';

export class NormalizationEngine {
  public static getCanonicalStages(): NormalizationStage[] {
    return [
      {
        level: 'UNF',
        title: 'Unnormalized Form (UNF)',
        definition: 'A table that contains repeating groups, multi-valued attributes, or composite fields.',
        problemStatement:
          'In this table, Student courses and instructors are bundled together. A single student row contains multiple courses, causing update, insertion, and deletion anomalies.',
        tables: [
          {
            name: 'StudentCourse_UNF',
            columns: ['StudentID', 'StudentName', 'Courses (Repeating)', 'Instructors'],
            primaryKey: [],
            sampleRows: [
              {
                StudentID: '101',
                StudentName: 'Ram Sharma',
                'Courses (Repeating)': 'Database Systems, Web Engineering',
                Instructors: 'Dr. Alan Turing, Dr. Alan Turing',
              },
              {
                StudentID: '102',
                StudentName: 'Sarah Chen',
                'Courses (Repeating)': 'Database Systems, Algorithms',
                Instructors: 'Dr. Alan Turing, Prof. Ada Lovelace',
              },
            ],
          },
        ],
        violations: [
          'Repeating groups: Multiple course values stored in single cells.',
          'Non-atomic values: Courses cannot be queried individually without string splitting.',
          'No unique primary key identified.',
        ],
        solutionExplanation:
          'Flatten repeating groups by ensuring each cell contains strictly one atomic value, and define a composite primary key (StudentID, CourseID).',
      },
      {
        level: '1NF',
        title: 'First Normal Form (1NF)',
        definition: 'Every column contains atomic (indivisible) values, and each record is unique with a defined Primary Key.',
        problemStatement:
          'Values are now atomic and records are unique with composite key (StudentID, CourseID). However, StudentName depends only on StudentID, and CourseName/InstructorName depend only on CourseID. This is a Partial Dependency!',
        tables: [
          {
            name: 'StudentCourse_1NF',
            columns: ['StudentID', 'CourseID', 'StudentName', 'CourseName', 'InstructorName', 'Grade'],
            primaryKey: ['StudentID', 'CourseID'],
            sampleRows: [
              { StudentID: '101', CourseID: '201', StudentName: 'Ram Sharma', CourseName: 'Database Systems', InstructorName: 'Dr. Alan Turing', Grade: 'A' },
              { StudentID: '101', CourseID: '203', StudentName: 'Ram Sharma', CourseName: 'Web Engineering', InstructorName: 'Dr. Alan Turing', Grade: 'B+' },
              { StudentID: '102', CourseID: '201', StudentName: 'Sarah Chen', CourseName: 'Database Systems', InstructorName: 'Dr. Alan Turing', Grade: 'A+' },
              { StudentID: '102', CourseID: '202', StudentName: 'Sarah Chen', CourseName: 'Algorithms', InstructorName: 'Prof. Ada Lovelace', Grade: 'A' },
            ],
          },
        ],
        violations: [
          'Partial Dependency: StudentName is functionally dependent on StudentID alone, which is only part of the composite primary key.',
          'Partial Dependency: CourseName and InstructorName depend only on CourseID.',
          'Update Anomaly: If Ram changes his name, multiple rows must be updated.',
          'Insertion Anomaly: Cannot add a new Course before any student enrolls in it.',
        ],
        solutionExplanation:
          'Decompose into 2NF: Remove partial dependencies by splitting into separate tables where non-key attributes depend on the WHOLE primary key.',
      },
      {
        level: '2NF',
        title: 'Second Normal Form (2NF)',
        definition: 'In 1NF, and EVERY non-key attribute is fully functionally dependent on the entire primary key (no partial dependencies).',
        problemStatement:
          'Partial dependencies removed! We now have Student, Course, and Enrollment tables. But in the Course table: InstructorName depends on InstructorID, which is non-key. That is a Transitive Dependency!',
        tables: [
          {
            name: 'STUDENT (2NF)',
            columns: ['StudentID', 'StudentName'],
            primaryKey: ['StudentID'],
            sampleRows: [
              { StudentID: '101', StudentName: 'Ram Sharma' },
              { StudentID: '102', StudentName: 'Sarah Chen' },
            ],
          },
          {
            name: 'COURSE (2NF with Transitive Dependency)',
            columns: ['CourseID', 'CourseName', 'InstructorID', 'InstructorName'],
            primaryKey: ['CourseID'],
            sampleRows: [
              { CourseID: '201', CourseName: 'Database Systems', InstructorID: '501', InstructorName: 'Dr. Alan Turing' },
              { CourseID: '202', CourseName: 'Algorithms', InstructorID: '502', InstructorName: 'Prof. Ada Lovelace' },
              { CourseID: '203', CourseName: 'Web Engineering', InstructorID: '501', InstructorName: 'Dr. Alan Turing' },
            ],
          },
          {
            name: 'ENROLLMENT (2NF)',
            columns: ['StudentID', 'CourseID', 'Grade'],
            primaryKey: ['StudentID', 'CourseID'],
            sampleRows: [
              { StudentID: '101', CourseID: '201', Grade: 'A' },
              { StudentID: '101', CourseID: '203', Grade: 'B+' },
              { StudentID: '102', CourseID: '201', Grade: 'A+' },
              { StudentID: '102', CourseID: '202', Grade: 'A' },
            ],
          },
        ],
        violations: [
          'Transitive Dependency: In Course, CourseID -> InstructorID, and InstructorID -> InstructorName.',
          'Non-key attribute (InstructorName) depends on another non-key attribute (InstructorID).',
          'Deletion Anomaly: If Course 202 is canceled, we lose all record of Prof. Ada Lovelace!',
        ],
        solutionExplanation:
          'Decompose into 3NF: Move InstructorID and InstructorName into a separate INSTRUCTOR table and keep InstructorID as a foreign key in COURSE.',
      },
      {
        level: '3NF',
        title: 'Third Normal Form (3NF)',
        definition: 'In 2NF, and no non-key attribute is transitively dependent on the primary key (X -> Y where Y is non-prime and X is not a superkey).',
        problemStatement:
          'Fully normalized! Every non-key attribute depends on "the key, the whole key, and nothing but the key". Zero redundancy, no update/delete/insert anomalies.',
        tables: [
          {
            name: 'STUDENT',
            columns: ['StudentID (PK)', 'StudentName'],
            primaryKey: ['StudentID'],
            sampleRows: [
              { 'StudentID (PK)': '101', StudentName: 'Ram Sharma' },
              { 'StudentID (PK)': '102', StudentName: 'Sarah Chen' },
            ],
          },
          {
            name: 'INSTRUCTOR',
            columns: ['InstructorID (PK)', 'InstructorName'],
            primaryKey: ['InstructorID'],
            sampleRows: [
              { 'InstructorID (PK)': '501', InstructorName: 'Dr. Alan Turing' },
              { 'InstructorID (PK)': '502', InstructorName: 'Prof. Ada Lovelace' },
            ],
          },
          {
            name: 'COURSE',
            columns: ['CourseID (PK)', 'CourseName', 'InstructorID (FK)'],
            primaryKey: ['CourseID'],
            sampleRows: [
              { 'CourseID (PK)': '201', CourseName: 'Database Systems', 'InstructorID (FK)': '501' },
              { 'CourseID (PK)': '202', CourseName: 'Algorithms', 'InstructorID (FK)': '502' },
              { 'CourseID (PK)': '203', CourseName: 'Web Engineering', 'InstructorID (FK)': '501' },
            ],
          },
          {
            name: 'ENROLLMENT',
            columns: ['StudentID (PK, FK)', 'CourseID (PK, FK)', 'Grade'],
            primaryKey: ['StudentID', 'CourseID'],
            sampleRows: [
              { 'StudentID (PK, FK)': '101', 'CourseID (PK, FK)': '201', Grade: 'A' },
              { 'StudentID (PK, FK)': '101', 'CourseID (PK, FK)': '203', Grade: 'B+' },
              { 'StudentID (PK, FK)': '102', 'CourseID (PK, FK)': '201', Grade: 'A+' },
              { 'StudentID (PK, FK)': '102', 'CourseID (PK, FK)': '202', Grade: 'A' },
            ],
          },
        ],
        violations: [],
        solutionExplanation: 'Congratulations! The schema is now in 3NF and ready for production database deployment.',
      },
    ];
  }

  public static getCanonicalDependencies(): FunctionalDependency[] {
    return [
      {
        id: 'fd_1',
        determinants: ['StudentID'],
        dependents: ['StudentName'],
        type: 'partial',
        explanation: 'StudentName is determined strictly by StudentID, regardless of course.',
      },
      {
        id: 'fd_2',
        determinants: ['CourseID'],
        dependents: ['CourseName', 'InstructorID'],
        type: 'partial',
        explanation: 'CourseName is determined strictly by CourseID, regardless of student.',
      },
      {
        id: 'fd_3',
        determinants: ['StudentID', 'CourseID'],
        dependents: ['Grade'],
        type: 'full',
        explanation: 'Grade requires BOTH StudentID and CourseID (Full Functional Dependency).',
      },
      {
        id: 'fd_4',
        determinants: ['InstructorID'],
        dependents: ['InstructorName'],
        type: 'transitive',
        explanation: 'InstructorName is determined by InstructorID (Transitive Dependency inside Course table).',
      },
    ];
  }
}
