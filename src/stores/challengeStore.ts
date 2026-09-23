import { create } from 'zustand';
import type { Entity, Relationship } from '../types/erd';
import type { SystemScenario, ChallengeEvaluation } from '../types/system';

interface ChallengeStoreState {
  lastEvaluation: ChallengeEvaluation | null;
  isEvaluationModalOpen: boolean;

  evaluateErd: (entities: Entity[], relationships: Relationship[], scenario: SystemScenario) => ChallengeEvaluation;
  closeEvaluationModal: () => void;
}

export const useChallengeStore = create<ChallengeStoreState>((set) => ({
  lastEvaluation: null,
  isEvaluationModalOpen: false,

  evaluateErd: (entities, relationships, scenario) => {
    const canonicalEntities = scenario.canonicalEntities;
    const canonicalRels = scenario.canonicalRelationships;

    // 1. Entities Check
    let entScore = 0;
    const entFeedback: string[] = [];
    const entityNames = entities.map((e) => e.name.toUpperCase().trim());

    for (const cEnt of canonicalEntities) {
      if (entityNames.includes(cEnt.name.toUpperCase().trim())) {
        entScore++;
        entFeedback.push(`✓ Identified required entity '${cEnt.name}'.`);
      } else {
        entFeedback.push(`✗ Missing expected entity '${cEnt.name}'.`);
      }
    }

    // 2. Attributes Check
    let attrScore = 0;
    let attrMax = 0;
    const attrFeedback: string[] = [];

    for (const cEnt of canonicalEntities) {
      const userEnt = entities.find((e) => e.name.toUpperCase().trim() === cEnt.name.toUpperCase().trim());
      for (const cAttr of cEnt.attributes) {
        attrMax++;
        if (userEnt) {
          const hasAttr = userEnt.attributes.some(
            (a) => a.name.toLowerCase().trim() === cAttr.name.toLowerCase().trim()
          );
          if (hasAttr) {
            attrScore++;
          } else {
            attrFeedback.push(`Missing attribute '${cAttr.name}' in entity '${cEnt.name}'.`);
          }
        }
      }
    }
    if (attrScore === attrMax && attrMax > 0) {
      attrFeedback.unshift('✓ All expected attributes successfully defined.');
    }

    // 3. Primary Keys Check
    let pkScore = 0;
    const pkFeedback: string[] = [];

    for (const cEnt of canonicalEntities) {
      const userEnt = entities.find((e) => e.name.toUpperCase().trim() === cEnt.name.toUpperCase().trim());
      if (userEnt) {
        const userPks = userEnt.attributes.filter((a) => a.isPrimaryKey);
        const canonPks = cEnt.attributes.filter((a) => a.isPrimaryKey);

        if (canonPks.length > 0 && userPks.length > 0) {
          const allMatch = canonPks.every((cpk) =>
            userPks.some((upk) => upk.name.toLowerCase() === cpk.name.toLowerCase())
          );
          if (allMatch) {
            pkScore++;
            pkFeedback.push(`✓ Correct primary key defined for '${userEnt.name}'.`);
          } else {
            pkFeedback.push(`Primary key mismatch on '${userEnt.name}'. Expected (${canonPks.map((k) => k.name).join(', ')}).`);
          }
        }
      }
    }

    // 4. Relationships Check
    let relScore = 0;
    const relFeedback: string[] = [];
    for (const cRel of canonicalRels) {
      const cSource = canonicalEntities.find((e) => e.id === cRel.sourceEntityId)?.name.toUpperCase();
      const cTarget = canonicalEntities.find((e) => e.id === cRel.targetEntityId)?.name.toUpperCase();

      const matchedRel = relationships.find((r) => {
        const uSource = entities.find((e) => e.id === r.sourceEntityId)?.name.toUpperCase();
        const uTarget = entities.find((e) => e.id === r.targetEntityId)?.name.toUpperCase();
        return (
          (uSource === cSource && uTarget === cTarget) ||
          (uSource === cTarget && uTarget === cSource)
        );
      });

      if (matchedRel) {
        relScore++;
        relFeedback.push(`✓ Connection found between ${cSource} and ${cTarget}.`);
      } else {
        relFeedback.push(`✗ Missing relationship between ${cSource} and ${cTarget}.`);
      }
    }

    // 5. Cardinality Check
    let cardScore = 0;
    const cardFeedback: string[] = [];
    for (const cRel of canonicalRels) {
      const cSource = canonicalEntities.find((e) => e.id === cRel.sourceEntityId)?.name.toUpperCase();
      const cTarget = canonicalEntities.find((e) => e.id === cRel.targetEntityId)?.name.toUpperCase();

      const matchedRel = relationships.find((r) => {
        const uSource = entities.find((e) => e.id === r.sourceEntityId)?.name.toUpperCase();
        const uTarget = entities.find((e) => e.id === r.targetEntityId)?.name.toUpperCase();
        return (
          (uSource === cSource && uTarget === cTarget) ||
          (uSource === cTarget && uTarget === cSource)
        );
      });

      if (matchedRel) {
        if (matchedRel.cardinality === cRel.cardinality) {
          cardScore++;
          cardFeedback.push(`✓ Cardinality '${matchedRel.cardinality}' correctly specified.`);
        } else {
          cardFeedback.push(`Cardinality for ${cSource}–${cTarget} is '${matchedRel.cardinality}'. Expected '${cRel.cardinality}'.`);
        }
      }
    }

    // 6. Foreign Keys Check
    let fkScore = 0;
    const fkFeedback: string[] = [];
    // Count entities with valid FKs
    for (const cEnt of canonicalEntities) {
      const canonFks = cEnt.attributes.filter((a) => a.isForeignKey);
      if (canonFks.length > 0) {
        const userEnt = entities.find((e) => e.name.toUpperCase().trim() === cEnt.name.toUpperCase().trim());
        if (userEnt) {
          const userFks = userEnt.attributes.filter((a) => a.isForeignKey);
          if (userFks.length >= canonFks.length) {
            fkScore++;
            fkFeedback.push(`✓ Foreign keys accurately configured in '${userEnt.name}'.`);
          } else {
            fkFeedback.push(`Missing expected foreign key in '${userEnt.name}'.`);
          }
        }
      }
    }

    const totalScore = entScore * 10 + attrScore * 3 + pkScore * 10 + relScore * 10 + cardScore * 10 + fkScore * 10;
    const maxScore =
      canonicalEntities.length * 10 +
      attrMax * 3 +
      canonicalEntities.length * 10 +
      canonicalRels.length * 10 +
      canonicalRels.length * 10 +
      Math.max(1, canonicalEntities.filter((e) => e.attributes.some((a) => a.isForeignKey)).length) * 10;

    const percentage = Math.min(100, Math.round((totalScore / Math.max(1, maxScore)) * 100));

    const generalFeedback: string[] = [];
    if (percentage >= 90) {
      generalFeedback.push('Outstanding database design! Your ERD aligns thoroughly with normal form standards.');
    } else if (percentage >= 70) {
      generalFeedback.push('Good job! Your primary structure is sound. Review the specific feedback items to reach perfection.');
    } else {
      generalFeedback.push('Keep practicing! Look closely at the requirements and make sure all entities and associations are represented.');
    }

    const evaluation: ChallengeEvaluation = {
      score: totalScore,
      maxScore,
      percentage,
      entitiesScore: { score: entScore, max: canonicalEntities.length, feedback: entFeedback },
      attributesScore: { score: attrScore, max: attrMax, feedback: attrFeedback.slice(0, 5) },
      keysScore: { score: pkScore, max: canonicalEntities.length, feedback: pkFeedback },
      relationshipsScore: { score: relScore, max: canonicalRels.length, feedback: relFeedback },
      cardinalityScore: { score: cardScore, max: canonicalRels.length, feedback: cardFeedback },
      foreignKeysScore: { score: fkScore, max: Math.max(1, canonicalEntities.filter((e) => e.attributes.some((a) => a.isForeignKey)).length), feedback: fkFeedback },
      generalFeedback,
    };

    set({ lastEvaluation: evaluation, isEvaluationModalOpen: true });
    return evaluation;
  },

  closeEvaluationModal: () => set({ isEvaluationModalOpen: false }),
}));
