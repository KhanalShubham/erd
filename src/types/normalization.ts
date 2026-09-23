export interface FunctionalDependency {
  id: string;
  determinants: string[]; // LHS: e.g. ["StudentID", "CourseID"]
  dependents: string[];   // RHS: e.g. ["Grade"]
  type: 'full' | 'partial' | 'transitive';
  explanation: string;
}

export type NormalFormLevel = 'UNF' | '1NF' | '2NF' | '3NF';

export interface NormalizationStage {
  level: NormalFormLevel;
  title: string;
  definition: string;
  problemStatement: string;
  tables: {
    name: string;
    columns: string[];
    primaryKey: string[];
    sampleRows: Record<string, string>[];
  }[];
  violations: string[];
  solutionExplanation: string;
}
