import React from 'react';
import { Lightbulb } from 'lucide-react';
import { useLearningStore } from '../../stores/learningStore';
import { guidedLessons } from '../../data/lessons/guidedLessons';

export const EducationalCard: React.FC = () => {
  const { guidedStepIndex } = useLearningStore();
  const currentStep = guidedLessons[guidedStepIndex] || guidedLessons[0];

  return (
    <div className="h-full p-5 overflow-y-auto space-y-5 max-w-4xl mx-auto bg-[#FAF9F5] text-zinc-900">
      {/* Step Header */}
      <div className="flex items-center justify-between pb-3 border-b-2 border-zinc-900">
        <div>
          <span className="text-[10px] font-bold font-mono tracking-wider uppercase bg-[#FEF08A] text-zinc-900 px-2 py-0.5 rounded border border-zinc-900 shadow-[1px_1px_0px_#18181B]">
            Educational Deep Dive — Step {currentStep.stepNumber} of 11
          </span>
          <h2 className="text-base font-bold text-zinc-900 font-mono mt-1.5">{currentStep.title}</h2>
          <p className="text-xs text-zinc-600 font-handwriting text-sm">{currentStep.subtitle}</p>
        </div>
      </div>

      {/* The 3 Core Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* WHAT Card */}
        <div className="p-4 rounded-xl bg-white border-2 border-zinc-900 space-y-2 shadow-[3px_3px_0px_#18181B]">
          <div className="flex items-center gap-2 text-zinc-900 font-bold text-xs uppercase tracking-wide font-mono">
            <span className="px-1.5 py-0.5 rounded bg-zinc-900 text-white font-mono text-[10px]">01</span>
            <span>WHAT am I creating?</span>
          </div>
          <p className="text-xs text-zinc-700 leading-relaxed">
            {currentStep.conceptExplainer.what}
          </p>
        </div>

        {/* WHY Card */}
        <div className="p-4 rounded-xl bg-white border-2 border-zinc-900 space-y-2 shadow-[3px_3px_0px_#18181B]">
          <div className="flex items-center gap-2 text-zinc-900 font-bold text-xs uppercase tracking-wide font-mono">
            <span className="px-1.5 py-0.5 rounded bg-[#FEF08A] text-zinc-900 border border-zinc-900 font-mono text-[10px]">02</span>
            <span>WHY am I creating it?</span>
          </div>
          <p className="text-xs text-zinc-700 leading-relaxed">
            {currentStep.conceptExplainer.why}
          </p>
        </div>

        {/* DATABASE EFFECT Card */}
        <div className="p-4 rounded-xl bg-white border-2 border-zinc-900 space-y-2 shadow-[3px_3px_0px_#18181B]">
          <div className="flex items-center gap-2 text-zinc-900 font-bold text-xs uppercase tracking-wide font-mono">
            <span className="px-1.5 py-0.5 rounded bg-zinc-900 text-white font-mono text-[10px]">03</span>
            <span>DATABASE Effect</span>
          </div>
          <p className="text-xs text-zinc-700 leading-relaxed">
            {currentStep.conceptExplainer.databaseEffect}
          </p>
        </div>
      </div>

      {/* Practical Scenario Demonstration */}
      <div className="p-4 rounded-xl bg-amber-50/60 border-2 border-zinc-900 space-y-3 shadow-[3px_3px_0px_#18181B]">
        <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 font-mono">
          <Lightbulb className="w-4 h-4 text-amber-600" />
          <span>Real-World Scenario Demonstration</span>
        </div>
        <div className="p-3 rounded bg-white border border-zinc-900 text-xs font-mono space-y-1 text-zinc-800 shadow-[1px_1px_0px_#18181B]">
          <span className="text-zinc-900 block font-bold font-sans">University LMS Case Study:</span>
          <div>• Entity: STUDENT (StudentID PK, Name, Email UNIQUE)</div>
          <div>• Entity: COURSE (CourseID PK, CourseName, CreditHours CHECK)</div>
          <div>• Relationship: Student M ──── N Course (Resolved via ENROLLMENT)</div>
          <div>• Associative: ENROLLMENT (StudentID FK, CourseID FK, Grade, Date)</div>
        </div>
      </div>
    </div>
  );
};
