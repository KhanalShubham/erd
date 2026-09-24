import React, { useState } from 'react';
import {
  X,
  Bot,
  Send,
  Sparkles,
  AlertTriangle,
  Award,
  CheckCircle2,
  ChevronRight,
  Copy,
  Check,
  Compass,
} from 'lucide-react';
import {
  generateAiTutorResponse,
  COMMON_MISCONCEPTIONS,
  SOCRATIC_LMS_STEPS,
  INSTRUCTOR_LAB_SOLUTIONS,
  COMPOSITE_VS_SURROGATE_COMPARISON,
  type ChatMessage,
} from '../../engine/ai/aiKnowledgeBase';
import { useLearningStore } from '../../stores/learningStore';
import { useErdStore } from '../../stores/erdStore';
import { MarkdownRenderer } from '../../components/common/MarkdownRenderer';

interface AiTutorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TutorTab = 'chat' | 'solutions' | 'socratic' | 'misconceptions' | 'mastery';

export const AiTutorModal: React.FC<AiTutorModalProps> = ({ isOpen, onClose }) => {
  const { currentSystem } = useLearningStore();
  const { entities } = useErdStore();

  const [activeTab, setActiveTab] = useState<TutorTab>('chat');

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm_welcome',
      sender: 'ai',
      text: `Hello! I'm your interactive Database AI Tutor. I can explain any database concept, test your designs, break down Primary & Foreign Keys, or explain why we resolve Many-to-Many relationships. What would you like to explore today?`,
      timestamp: 'Just now',
      suggestedChips: [
        'Primary key decision flowchart',
        'Surrogate vs composite keys',
        'Show me Q6 Enrollment solution',
        'Show me Q7 OrderItem solution',
        'Where does the FK go in a 1:N relationship?',
      ],
    },
  ]);
  const [inputValue, setInputValue] = useState('');

  // Lab Solutions State
  const [selectedLabSubTab, setSelectedLabSubTab] = useState<
    'flowchart' | 'Q6' | 'Q7' | 'Q8' | 'Q9' | 'Q10' | 'matrix'
  >('flowchart');
  const [copiedSql, setCopiedSql] = useState(false);

  // Socratic Guide State
  const [socraticStepIdx, setSocraticStepIdx] = useState(0);
  const [socraticAnswerFeedback, setSocraticAnswerFeedback] = useState<{
    selectedOption: string;
    feedback: string;
    explanation: string;
    isOptimal: boolean;
  } | null>(null);

  // Misconception Filter
  const [selectedMisconceptionCategory, setSelectedMisconceptionCategory] = useState<string>('All');
  const [expandedMisconceptionId, setExpandedMisconceptionId] = useState<string | null>(
    'misc_junction_surrogate'
  );

  if (!isOpen) return null;

  // Handle sending a chat query
  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || inputValue;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: query.trim(),
      timestamp: 'Now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');

    // Generate AI response
    setTimeout(() => {
      const response = generateAiTutorResponse(query, {
        activeScenarioName: currentSystem.name,
        entityCount: entities.length,
      });

      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: response.text,
        diagram: response.diagram,
        analogy: response.analogy,
        suggestedChips: response.chips,
        timestamp: 'Just now',
      };

      setMessages((prev) => [...prev, aiMsg]);
    }, 200);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const filteredMisconceptions =
    selectedMisconceptionCategory === 'All'
      ? COMMON_MISCONCEPTIONS
      : COMMON_MISCONCEPTIONS.filter((m) => m.category === selectedMisconceptionCategory);

  const currentLabSolution = INSTRUCTOR_LAB_SOLUTIONS.find((s) => s.id === selectedLabSubTab);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white border-2 border-zinc-900 rounded-lg w-full max-w-3xl h-[660px] max-h-[92vh] shadow-[4px_4px_0px_#18181B] flex flex-col overflow-hidden text-zinc-900 font-sans">
        {/* Notebook Header Bar */}
        <div className="bg-[#F6E77A] px-4 py-3 border-b-2 border-zinc-900 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-zinc-900 text-[#F6E77A] flex items-center justify-center font-bold text-sm shadow-[1px_1px_0px_#18181B]">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-mono font-black text-sm uppercase tracking-wider text-zinc-950 flex items-center gap-2">
                <span>AI Database Tutor</span>
                <span className="text-[10px] font-sans font-bold bg-white text-zinc-900 px-1.5 py-0.2 rounded border border-zinc-900">
                  Relational Strategy Edition
                </span>
              </h2>
              <div className="text-[11px] text-zinc-800 font-medium">
                Context: {currentSystem.name} ({entities.length} tables active)
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-zinc-700 hover:text-zinc-950 hover:bg-yellow-300 transition-colors"
            title="Close AI Tutor"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-zinc-200 bg-zinc-100 px-3 pt-1.5 gap-1 shrink-0 font-mono text-xs font-bold overflow-x-auto">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1.5 rounded-t transition-colors border-t border-x shrink-0 ${
              activeTab === 'chat'
                ? 'bg-white text-zinc-950 border-zinc-900 border-b-white translate-y-[1px]'
                : 'border-transparent text-zinc-600 hover:text-zinc-950'
            }`}
          >
            💬 Ask Tutor
          </button>
          <button
            onClick={() => setActiveTab('solutions')}
            className={`px-3 py-1.5 rounded-t transition-colors border-t border-x shrink-0 ${
              activeTab === 'solutions'
                ? 'bg-white text-zinc-950 border-zinc-900 border-b-white translate-y-[1px]'
                : 'border-transparent text-zinc-600 hover:text-zinc-950'
            }`}
          >
            📐 PK Strategy & Labs (Q6-Q10)
          </button>
          <button
            onClick={() => setActiveTab('socratic')}
            className={`px-3 py-1.5 rounded-t transition-colors border-t border-x shrink-0 ${
              activeTab === 'socratic'
                ? 'bg-white text-zinc-950 border-zinc-900 border-b-white translate-y-[1px]'
                : 'border-transparent text-zinc-600 hover:text-zinc-950'
            }`}
          >
            🎓 Socratic Guide
          </button>
          <button
            onClick={() => setActiveTab('misconceptions')}
            className={`px-3 py-1.5 rounded-t transition-colors border-t border-x shrink-0 ${
              activeTab === 'misconceptions'
                ? 'bg-white text-zinc-950 border-zinc-900 border-b-white translate-y-[1px]'
                : 'border-transparent text-zinc-600 hover:text-zinc-950'
            }`}
          >
            ⚠️ Misconceptions
          </button>
          <button
            onClick={() => setActiveTab('mastery')}
            className={`px-3 py-1.5 rounded-t transition-colors border-t border-x shrink-0 ${
              activeTab === 'mastery'
                ? 'bg-white text-zinc-950 border-zinc-900 border-b-white translate-y-[1px]'
                : 'border-transparent text-zinc-600 hover:text-zinc-950'
            }`}
          >
            📊 Concept Mastery
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-[#FCFBF7]">
          {/* TAB 1: Free-Form Chat */}
          {activeTab === 'chat' && (
            <div className="flex flex-col h-full space-y-3">
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[92%] p-3 rounded-lg text-xs leading-relaxed border ${
                        msg.sender === 'user'
                          ? 'bg-zinc-900 text-white border-zinc-900 rounded-br-none shadow-[2px_2px_0px_#18181B]'
                          : 'bg-white text-zinc-900 border-zinc-300 rounded-bl-none shadow-xs'
                      }`}
                    >
                      {/* Formatted Text */}
                      <MarkdownRenderer
                        content={msg.text}
                        isDark={msg.sender === 'user'}
                        className="text-[12.5px]"
                      />

                      {/* Visual Diagram if attached */}
                      {msg.diagram && (
                        <div className="mt-2 p-2 bg-zinc-900 text-zinc-100 rounded font-mono text-[10.5px] whitespace-pre overflow-x-auto border border-zinc-800">
                          {msg.diagram.trim()}
                        </div>
                      )}

                      {/* Real-World Analogy if attached */}
                      {msg.analogy && (
                        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-zinc-800 text-[11.5px] italic">
                          <span className="font-bold font-sans not-italic mr-1 text-amber-900">💡 Analogy:</span>
                          <MarkdownRenderer content={msg.analogy} className="inline italic" />
                        </div>
                      )}
                    </div>

                    {/* Suggested Question Chips */}
                    {msg.suggestedChips && msg.suggestedChips.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {msg.suggestedChips.map((chip, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSendMessage(chip)}
                            className="px-2 py-1 rounded bg-white hover:bg-yellow-100 border border-zinc-300 text-zinc-800 font-mono text-[11px] transition-colors shadow-2xs text-left"
                          >
                            ↳ {chip}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Chat Input Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2 pt-2 border-t border-zinc-200 shrink-0"
              >
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask a question (e.g. 'Show me Q7 OrderItem solution' or 'Why avoid surrogate keys on junctions?')..."
                  className="flex-1 px-3 py-2 text-xs border border-zinc-300 rounded bg-white text-zinc-900 focus:outline-none focus:border-zinc-900 shadow-inner"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim()}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-white font-mono font-bold text-xs rounded shadow-[2px_2px_0px_#18181B] flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Ask</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: PK Strategy & Verified Solutions */}
          {activeTab === 'solutions' && (
            <div className="space-y-4">
              {/* Sub-tab pills */}
              <div className="flex items-center gap-1.5 flex-wrap border-b border-zinc-200 pb-2">
                {[
                  { id: 'flowchart', label: '🧭 PK Decision Flow' },
                  { id: 'Q6', label: 'Q6: Enrollment' },
                  { id: 'Q7', label: 'Q7: Order Items' },
                  { id: 'Q8', label: 'Q8: Banking' },
                  { id: 'Q9', label: 'Q9: Marketplace' },
                  { id: 'Q10', label: 'Q10: Healthcare' },
                  { id: 'matrix', label: '⚖️ Surrogate vs. Composite' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedLabSubTab(tab.id as any)}
                    className={`px-2.5 py-1 rounded font-mono text-[11px] font-bold border transition-colors ${
                      selectedLabSubTab === tab.id
                        ? 'bg-[#F6E77A] text-zinc-950 border-zinc-900 shadow-[1px_1px_0px_#18181B]'
                        : 'bg-white text-zinc-600 border-zinc-300 hover:bg-zinc-50'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* View 1: Flowchart */}
              {selectedLabSubTab === 'flowchart' && (
                <div className="space-y-3">
                  <div className="bg-yellow-50 border border-zinc-900 rounded p-3 shadow-[2px_2px_0px_#18181B]">
                    <div className="flex items-center gap-2 mb-1">
                      <Compass className="w-4 h-4 text-amber-700" />
                      <span className="font-mono font-bold text-xs uppercase tracking-wider text-zinc-950">
                        Primary Key Decision Rule & Policy
                      </span>
                    </div>
                    <p className="text-zinc-700 text-xs leading-relaxed">
                      Primary keys must be derived from <strong>business rules and relationship cardinalities</strong>.
                      Never automatically introduce an artificial surrogate ID to a junction table by default.
                    </p>
                  </div>

                  {/* Flowchart Diagram */}
                  <div className="p-3 bg-zinc-900 text-zinc-100 rounded font-mono text-[11px] whitespace-pre overflow-x-auto border border-zinc-800 leading-snug">
{`START: Define Table
  │
  ├──► 1. Is this a Many-to-Many associative / junction table?
  │      ├── YES ──► Use COMPOSITE PRIMARY KEY of all participating Foreign Keys!
  │      │           (Do NOT add a separate surrogate ID column)
  │      └── NO
  │            │
  │            ├──► 2. Is there a single natural candidate key?
  │            │      ├── YES ──► Use that natural column as Primary Key
  │            │      └── NO
  │            │            │
  │            │            ├──► 3. Is there a natural composite key?
  │            │            │      ├── YES ──► Use composite of natural attributes
  │            │            │      └── NO
  │            │            │            │
  │            │            │            └──► 4. Introduce SURROGATE PK (e.g. ID, UUID)
  │            │            │                   AND enforce candidate key with UNIQUE constraint!
  ▼
DONE: Fully Normalized 3NF Schema`}
                  </div>

                  {/* Self Check Questions */}
                  <div className="bg-white border border-zinc-300 rounded p-3 space-y-2 text-xs">
                    <h4 className="font-mono font-bold text-zinc-900 uppercase tracking-wider text-[11px]">
                      Mandatory Self-Check Questions for Each Table:
                    </h4>
                    <ul className="space-y-1 text-zinc-700 list-disc list-inside">
                      <li>What does one individual row represent in the business domain?</li>
                      <li>Which attribute(s) make a row unique (candidate keys)?</li>
                      <li>Is this table an associative bridge table resolving an $M:N$ relationship?</li>
                      <li>If $M:N$, can the participating foreign keys alone form a unique composite primary key?</li>
                      <li>If using a surrogate key, have I placed an explicit <code>UNIQUE</code> constraint on the business key?</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* View 2: Lab Question Q6 - Q10 */}
              {currentLabSolution && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
                    <div>
                      <h3 className="font-bold text-sm text-zinc-950 flex items-center gap-2">
                        <span className="font-mono bg-zinc-900 text-white px-1.5 py-0.5 rounded text-[11px]">
                          {currentLabSolution.id}
                        </span>
                        <span>{currentLabSolution.title}</span>
                      </h3>
                      <div className="text-[11px] text-zinc-600 font-mono mt-0.5">
                        Domain: {currentLabSolution.domain} • Difficulty: {currentLabSolution.difficulty}
                      </div>
                    </div>
                  </div>

                  {/* Scenario */}
                  <div className="p-3 bg-zinc-50 border border-zinc-200 rounded text-xs leading-relaxed text-zinc-800">
                    <strong className="font-mono text-zinc-900 block mb-0.5">Scenario:</strong>
                    {currentLabSolution.scenario}
                  </div>

                  {/* PK Justification */}
                  <div className="p-3 bg-yellow-50/70 border border-amber-300 rounded text-xs space-y-1">
                    <span className="font-mono font-bold text-[11px] text-amber-900 uppercase tracking-wider block">
                      🔑 Primary Key Choice & Justification:
                    </span>
                    <p className="text-zinc-800 leading-relaxed">{currentLabSolution.pkJustification}</p>
                  </div>

                  {/* SQL DDL */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-mono font-bold text-zinc-700">
                      <span>SQL DDL Statement</span>
                      <button
                        onClick={() => handleCopyCode(currentLabSolution.sqlDdl)}
                        className="px-2 py-0.5 bg-white border border-zinc-300 rounded text-[11px] hover:bg-zinc-100 flex items-center gap-1 shadow-2xs"
                      >
                        {copiedSql ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedSql ? 'Copied!' : 'Copy SQL'}</span>
                      </button>
                    </div>
                    <pre className="p-3 bg-zinc-900 text-zinc-100 rounded font-mono text-[11px] whitespace-pre overflow-x-auto border border-zinc-800 max-h-52">
                      {currentLabSolution.sqlDdl}
                    </pre>
                  </div>

                  {/* Test Queries */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-mono font-bold text-zinc-700 block">
                      Validation & Integrity Test Queries
                    </span>
                    <pre className="p-3 bg-zinc-800 text-emerald-400 rounded font-mono text-[11px] whitespace-pre overflow-x-auto border border-zinc-700 max-h-36">
                      {currentLabSolution.testQueries}
                    </pre>
                  </div>

                  {/* Verification Checklist */}
                  <div className="bg-white border border-zinc-200 rounded p-3 space-y-1 text-xs">
                    <span className="font-mono font-bold text-[11px] uppercase tracking-wider text-zinc-800 block mb-1">
                      Verification Checklist:
                    </span>
                    {currentLabSolution.checklist.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-zinc-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* View 3: Comparison Matrix */}
              {selectedLabSubTab === 'matrix' && (
                <div className="space-y-3">
                  <div className="bg-yellow-50 border border-zinc-900 rounded p-3 shadow-[2px_2px_0px_#18181B]">
                    <span className="font-mono font-bold text-xs uppercase tracking-wider text-zinc-900 block mb-1">
                      ⚖️ Composite Primary Key vs. Surrogate Key Matrix
                    </span>
                    <p className="text-zinc-700 text-xs">
                      Compare the architectural tradeoffs between natural composite keys and system-generated artificial IDs.
                    </p>
                  </div>

                  <div className="overflow-x-auto border border-zinc-300 rounded bg-white shadow-2xs">
                    <table className="w-full text-left text-xs border-collapse font-sans">
                      <thead>
                        <tr className="bg-zinc-100 border-b border-zinc-300 font-mono text-[11px] uppercase text-zinc-900">
                          <th className="p-2.5 font-bold border-r border-zinc-200">Dimension</th>
                          <th className="p-2.5 font-bold border-r border-zinc-200 bg-amber-50/50">
                            Composite Primary Key
                          </th>
                          <th className="p-2.5 font-bold">Surrogate (Synthetic) Key</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200">
                        {COMPOSITE_VS_SURROGATE_COMPARISON.map((row, idx) => (
                          <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-zinc-50/60'}>
                            <td className="p-2.5 font-mono font-bold text-zinc-900 border-r border-zinc-200 text-[11px] align-top">
                              {row.aspect}
                            </td>
                            <td className="p-2.5 text-zinc-800 border-r border-zinc-200 align-top whitespace-pre-line leading-relaxed">
                              {row.composite}
                            </td>
                            <td className="p-2.5 text-zinc-800 align-top whitespace-pre-line leading-relaxed">
                              {row.surrogate}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Socratic Guidance */}
          {activeTab === 'socratic' && (
            <div className="space-y-4 max-w-xl mx-auto">
              <div className="bg-yellow-50 border border-zinc-900 rounded p-3 shadow-[2px_2px_0px_#18181B]">
                <span className="font-mono font-bold text-xs uppercase tracking-wider text-zinc-900 block mb-1">
                  🎓 Guided Socratic Inquiry — {currentSystem.name}
                </span>
                <p className="text-zinc-700 text-xs">
                  Instead of giving you the answers directly, I will ask guiding questions so you discover why databases are designed this way.
                </p>
              </div>

              {/* Current Question Step */}
              {SOCRATIC_LMS_STEPS[socraticStepIdx] && (
                <div className="bg-white border border-zinc-300 rounded p-4 shadow-sm space-y-3">
                  <div className="flex items-center justify-between text-[11px] font-mono font-bold text-zinc-500">
                    <span>STEP {socraticStepIdx + 1} OF {SOCRATIC_LMS_STEPS.length}</span>
                    <span className="text-amber-700 font-bold">
                      {SOCRATIC_LMS_STEPS[socraticStepIdx].context}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-zinc-950">
                    {SOCRATIC_LMS_STEPS[socraticStepIdx].question}
                  </h3>

                  <div className="space-y-2 pt-1">
                    {SOCRATIC_LMS_STEPS[socraticStepIdx].options.map((option, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSocraticAnswerFeedback({
                            selectedOption: option.label,
                            feedback: option.feedback,
                            explanation: option.explanation,
                            isOptimal: option.isOptimal,
                          });
                        }}
                        className={`w-full p-3 rounded border text-left text-xs transition-all ${
                          socraticAnswerFeedback?.selectedOption === option.label
                            ? option.isOptimal
                              ? 'bg-emerald-50 border-emerald-500 font-medium'
                              : 'bg-rose-50 border-rose-400 font-medium'
                            : 'bg-zinc-50 hover:bg-zinc-100 border-zinc-300 text-zinc-800'
                        }`}
                      >
                        <div className="font-medium text-[12.5px]">{option.label}</div>
                      </button>
                    ))}
                  </div>

                  {/* Feedback Card */}
                  {socraticAnswerFeedback && (
                    <div
                      className={`p-3 rounded border text-xs space-y-1 animate-in fade-in duration-100 ${
                        socraticAnswerFeedback.isOptimal
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                          : 'bg-amber-50 border-amber-300 text-amber-950'
                      }`}
                    >
                      <div className="font-bold font-mono text-[11.5px]">
                        {socraticAnswerFeedback.isOptimal ? '✓ Great Insight!' : '💡 Let\'s Reflect:'}
                      </div>
                      <MarkdownRenderer content={socraticAnswerFeedback.feedback} className="text-xs" />
                      <div className="text-[11px] text-zinc-700 italic">
                        <MarkdownRenderer content={socraticAnswerFeedback.explanation} className="text-[11px] italic" />
                      </div>

                      {socraticAnswerFeedback.isOptimal &&
                        socraticStepIdx < SOCRATIC_LMS_STEPS.length - 1 && (
                          <div className="pt-2">
                            <button
                              onClick={() => {
                                setSocraticStepIdx((prev) => prev + 1);
                                setSocraticAnswerFeedback(null);
                              }}
                              className="px-3 py-1 bg-zinc-900 hover:bg-zinc-800 text-white font-mono text-xs font-bold rounded shadow-[1px_1px_0px_#18181B] flex items-center gap-1"
                            >
                              <span>Next Question</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                    </div>
                  )}
                </div>
              )}

              {/* Reset Socratic Guide */}
              {socraticStepIdx === SOCRATIC_LMS_STEPS.length - 1 && socraticAnswerFeedback?.isOptimal && (
                <div className="p-3 bg-emerald-100 border border-emerald-400 rounded text-center space-y-2">
                  <span className="font-bold font-mono text-xs text-emerald-950 block">
                    🎉 Excellent! You have derived why the LMS needs an Associative Entity with a Composite Primary Key!
                  </span>
                  <button
                    onClick={() => {
                      setSocraticStepIdx(0);
                      setSocraticAnswerFeedback(null);
                    }}
                    className="px-3 py-1 bg-white border border-emerald-600 text-emerald-900 rounded font-mono text-xs font-bold hover:bg-emerald-50"
                  >
                    Restart Socratic Session
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Common Misconceptions Database */}
          {activeTab === 'misconceptions' && (
            <div className="space-y-3">
              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {['All', 'Keys', 'Relationships', 'Entities', 'Constraints'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedMisconceptionCategory(cat)}
                    className={`px-2.5 py-1 rounded font-mono text-[11px] font-bold border transition-colors ${
                      selectedMisconceptionCategory === cat
                        ? 'bg-[#F6E77A] text-zinc-950 border-zinc-900 shadow-[1px_1px_0px_#18181B]'
                        : 'bg-white text-zinc-600 border-zinc-300 hover:bg-zinc-50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Misconception Accordion Cards */}
              <div className="space-y-2.5">
                {filteredMisconceptions.map((item) => {
                  const isExpanded = expandedMisconceptionId === item.id;
                  return (
                    <div
                      key={item.id}
                      className="bg-white border border-zinc-300 rounded overflow-hidden shadow-2xs transition-all"
                    >
                      <button
                        onClick={() => setExpandedMisconceptionId(isExpanded ? null : item.id)}
                        className="w-full p-3 text-left flex items-center justify-between gap-2 hover:bg-zinc-50"
                      >
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                          <span className="font-mono text-xs font-bold text-zinc-900 line-through">
                            "{item.myth}"
                          </span>
                        </div>
                        <span className="font-mono text-[10px] text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">
                          {item.category}
                        </span>
                      </button>

                      {isExpanded && (
                        <div className="p-3 border-t border-zinc-200 bg-yellow-50/40 space-y-2 text-xs">
                          <div>
                            <span className="font-mono font-bold text-[11px] uppercase tracking-wider text-rose-800 block mb-0.5">
                              Why it is false:
                            </span>
                            <MarkdownRenderer content={item.whyItsFalse} className="text-zinc-700 text-xs" />
                          </div>

                          <div>
                            <span className="font-mono font-bold text-[11px] uppercase tracking-wider text-emerald-800 block mb-0.5">
                              The Correct Principle:
                            </span>
                            <MarkdownRenderer content={item.correctPrinciple} className="text-zinc-900 font-medium text-xs" />
                          </div>

                          <div className="p-2 bg-white rounded border border-zinc-200 text-zinc-700 text-[11px]">
                            <strong className="font-mono text-zinc-900">Example: </strong>
                            <MarkdownRenderer content={item.example} className="inline text-zinc-700 text-[11px]" />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: Student Concept Mastery Profile */}
          {activeTab === 'mastery' && (
            <div className="space-y-4 max-w-lg mx-auto">
              <div className="bg-white border border-zinc-300 rounded p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-mono font-bold text-xs uppercase tracking-wider text-zinc-900 flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-600" />
                    <span>Your Database Design Proficiency</span>
                  </div>
                  <span className="text-xs font-mono font-bold bg-[#F6E77A] px-2 py-0.5 rounded border border-zinc-900">
                    INTERMEDIATE
                  </span>
                </div>

                {/* Concept Badges */}
                <div className="space-y-2">
                  {[
                    { name: 'Entity Identification', level: '100% (Mastered)', status: 'done' },
                    { name: 'Attributes & Atomic Domains', level: '100% (Mastered)', status: 'done' },
                    { name: 'Primary Keys & Uniqueness', level: '100% (Mastered)', status: 'done' },
                    { name: 'Composite Primary Keys (Junction Tables)', level: '95% (Mastered)', status: 'done' },
                    { name: 'Foreign Keys & Referential Integrity', level: '85% (Proficient)', status: 'prog' },
                    { name: 'Cardinality (1:1, 1:N, M:N)', level: '80% (Proficient)', status: 'prog' },
                    { name: 'Normalization (1NF, 2NF, 3NF)', level: '65% (Exploring)', status: 'learning' },
                  ].map((concept, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs p-2 rounded bg-zinc-50 border border-zinc-200">
                      <div className="flex items-center gap-2">
                        {concept.status === 'done' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        )}
                        <span className="font-medium text-zinc-900">{concept.name}</span>
                      </div>
                      <span className="font-mono text-[11px] text-zinc-600 font-bold">{concept.level}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendation */}
              <div className="p-3 bg-yellow-50 border border-zinc-900 rounded shadow-[2px_2px_0px_#18181B] space-y-1">
                <span className="font-mono font-bold text-xs uppercase tracking-wider text-zinc-950 block">
                  Recommended Next Step:
                </span>
                <p className="text-zinc-800 text-xs">
                  Review the Primary Key strategy in <strong>Q7 (Order Items)</strong> and <strong>Q8 (Banking Joint Accounts)</strong> to observe how composite keys prevent duplicate line items and joint ownership without artificial surrogate columns.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
