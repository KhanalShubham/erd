import type { Entity, Relationship } from './erd';
import type { DatabaseRow } from './database';

export type SystemCategory =
  | 'Education'
  | 'Business'
  | 'Healthcare'
  | 'Transportation'
  | 'Hospitality'
  | 'Entertainment'
  | 'Social'
  | 'Government';

export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface SystemRequirement {
  id: string;
  text: string;
  nounHints: string[]; // e.g. "Student", "Course"
  verbHints: string[]; // e.g. "enrolls in", "teaches"
  attributeHints: string[]; // e.g. "StudentID", "name"
  cardinalityHint?: string;
}

export interface SystemScenario {
  id: string;
  name: string;
  category: SystemCategory;
  difficulty: DifficultyLevel;
  shortDescription: string;
  scenarioStory: string;
  learningObjectives: string[];
  conceptsCovered: string[];
  entityCount: number;
  requirements: SystemRequirement[];
  initialEntities?: Entity[];
  canonicalEntities: Entity[];
  canonicalRelationships: Relationship[];
  sampleData?: Record<string, DatabaseRow[]>;
}

export interface ChallengeEvaluation {
  score: number;
  maxScore: number;
  percentage: number;
  entitiesScore: { score: number; max: number; feedback: string[] };
  attributesScore: { score: number; max: number; feedback: string[] };
  keysScore: { score: number; max: number; feedback: string[] };
  relationshipsScore: { score: number; max: number; feedback: string[] };
  cardinalityScore: { score: number; max: number; feedback: string[] };
  foreignKeysScore: { score: number; max: number; feedback: string[] };
  generalFeedback: string[];
}
