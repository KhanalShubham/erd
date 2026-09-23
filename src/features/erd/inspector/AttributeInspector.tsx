import React, { useState } from 'react';
import {
  Key,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Play,
} from 'lucide-react';
import type { Attribute, AttributeType, DataType, Entity } from '../../../types/erd';
import { useErdStore } from '../../../stores/erdStore';

interface AttributeInspectorProps {
  entity: Entity;
  attribute: Attribute;
}

export const AttributeInspector: React.FC<AttributeInspectorProps> = ({ entity, attribute }) => {
  const { updateAttribute, deleteAttribute, togglePrimaryKey } = useErdStore();

  const [testValue, setTestValue] = useState('');
  const [testResult, setTestResult] = useState<{ valid: boolean; message: string } | null>(null);
  const [newChildName, setNewChildName] = useState('');

  // Handle Domain Testing in Real Time
  const handleTestDomain = () => {
    if (!testValue) {
      setTestResult({ valid: false, message: 'Please enter a test value.' });
      return;
    }

    const domain = attribute.domain;
    if (!domain) {
      setTestResult({ valid: true, message: 'Valid! No domain constraints set.' });
      return;
    }

    if (domain.minValue !== undefined && Number(testValue) < domain.minValue) {
      setTestResult({ valid: false, message: `INVALID: Value must be ≥ ${domain.minValue}.` });
      return;
    }
    if (domain.maxValue !== undefined && Number(testValue) > domain.maxValue) {
      setTestResult({ valid: false, message: `INVALID: Value must be ≤ ${domain.maxValue}.` });
      return;
    }
    if (domain.minLength !== undefined && testValue.length < domain.minLength) {
      setTestResult({ valid: false, message: `INVALID: Must be at least ${domain.minLength} chars.` });
      return;
    }
    if (domain.maxLength !== undefined && testValue.length > domain.maxLength) {
      setTestResult({ valid: false, message: `INVALID: Exceeds max length of ${domain.maxLength}.` });
      return;
    }
    if (domain.allowedValues && domain.allowedValues.length > 0) {
      const match = domain.allowedValues.some((v) => v.toLowerCase() === testValue.trim().toLowerCase());
      if (!match) {
        setTestResult({ valid: false, message: `INVALID: Value must be in [${domain.allowedValues.join(', ')}].` });
        return;
      }
    }
    if (domain.pattern === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(testValue)) {
        setTestResult({ valid: false, message: 'INVALID: Value must be a valid email format.' });
        return;
      }
    }

    setTestResult({ valid: true, message: `VALID: "${testValue}" satisfies domain rules.` });
  };

  const handleAddCompositeChild = () => {
    if (!newChildName.trim()) return;
    const current = attribute.compositeChildren || [];
    const updated = [
      ...current,
      {
        id: `child_${Date.now()}`,
        name: newChildName.trim(),
        dataType: 'VARCHAR' as DataType,
      },
    ];
    updateAttribute(entity.id, attribute.id, { compositeChildren: updated });
    setNewChildName('');
  };

  const handleRemoveCompositeChild = (childId: string) => {
    const current = attribute.compositeChildren || [];
    updateAttribute(entity.id, attribute.id, {
      compositeChildren: current.filter((c) => c.id !== childId),
    });
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Column Name */}
      <div>
        <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Column Name</label>
        <input
          type="text"
          value={attribute.name}
          onChange={(e) => updateAttribute(entity.id, attribute.id, { name: e.target.value.replace(/\s+/g, '_') })}
          className="w-full px-2.5 py-1.5 rounded border border-zinc-300 bg-white text-zinc-900 font-mono text-xs focus:outline-none focus:border-zinc-900"
        />
      </div>

      {/* Primary Key Toggle */}
      <div>
        <button
          type="button"
          onClick={() => togglePrimaryKey(entity.id, attribute.id)}
          className={`w-full py-2 px-3 rounded border text-xs font-semibold flex items-center justify-between transition-colors ${
            attribute.isPrimaryKey
              ? 'bg-[#FEF08A] border-zinc-900 text-zinc-950 font-bold shadow-xs'
              : 'bg-zinc-50 border-zinc-300 text-zinc-700 hover:bg-zinc-100'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5 text-zinc-900" />
            <span>Primary Key (PK)</span>
          </span>
          <span className="font-mono text-[11px]">
            {attribute.isPrimaryKey ? 'YES' : 'NO'}
          </span>
        </button>
      </div>

      {/* Data Type */}
      <div>
        <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Data Type</label>
        <select
          value={attribute.dataType}
          onChange={(e) => updateAttribute(entity.id, attribute.id, { dataType: e.target.value as DataType })}
          className="w-full px-2.5 py-1.5 rounded border border-zinc-300 bg-white text-zinc-900 text-xs focus:outline-none focus:border-zinc-900 font-mono"
        >
          <option value="INTEGER">INTEGER (Whole numbers: 1, 2, 100)</option>
          <option value="VARCHAR">VARCHAR (Variable string text)</option>
          <option value="TEXT">TEXT (Long narrative text)</option>
          <option value="DECIMAL">DECIMAL (Currency / decimal numbers)</option>
          <option value="DATE">DATE (Calendar dates: YYYY-MM-DD)</option>
          <option value="DATETIME">DATETIME (Date + timestamp)</option>
          <option value="BOOLEAN">BOOLEAN (True / False)</option>
        </select>
      </div>

      {/* Constraints: Nullable & Unique */}
      <div className="grid grid-cols-2 gap-2">
        <label className="p-2 rounded border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 cursor-pointer flex items-center gap-2">
          <input
            type="checkbox"
            checked={!attribute.isNullable}
            disabled={attribute.isPrimaryKey}
            onChange={(e) => updateAttribute(entity.id, attribute.id, { isNullable: !e.target.checked })}
            className="rounded border-zinc-400 text-zinc-900 focus:ring-0"
          />
          <span className="text-[11px] text-zinc-800 font-medium">NOT NULL</span>
        </label>

        <label className="p-2 rounded border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 cursor-pointer flex items-center gap-2">
          <input
            type="checkbox"
            checked={attribute.isUnique || attribute.isPrimaryKey}
            disabled={attribute.isPrimaryKey}
            onChange={(e) => updateAttribute(entity.id, attribute.id, { isUnique: e.target.checked })}
            className="rounded border-zinc-400 text-zinc-900 focus:ring-0"
          />
          <span className="text-[11px] text-zinc-800 font-medium">UNIQUE</span>
        </label>
      </div>

      {/* Attribute Type (Simple, Composite, Derived, Multivalued) */}
      <div>
        <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Attribute Type</label>
        <select
          value={attribute.type}
          onChange={(e) => updateAttribute(entity.id, attribute.id, { type: e.target.value as AttributeType })}
          className="w-full px-2.5 py-1.5 rounded border border-zinc-300 bg-white text-zinc-900 text-xs focus:outline-none focus:border-zinc-900"
        >
          <option value="simple">Simple (Atomic column)</option>
          <option value="composite">Composite (Subdivided, e.g. Name, Address)</option>
          <option value="multivalued">Multivalued (Repeating values - 1NF violation)</option>
          <option value="derived">Derived (Computed attribute, e.g. Age)</option>
        </select>
      </div>

      {/* Composite Children if Composite */}
      {attribute.type === 'composite' && (
        <div className="p-2.5 rounded bg-zinc-50 border border-zinc-300 space-y-2">
          <span className="text-[11px] font-bold text-zinc-800 block">Sub-components:</span>
          <div className="space-y-1">
            {(attribute.compositeChildren || []).map((child) => (
              <div key={child.id} className="flex items-center justify-between text-xs bg-white px-2 py-1 rounded border border-zinc-200">
                <span className="font-mono text-zinc-800">├─ {child.name}</span>
                <button
                  onClick={() => handleRemoveCompositeChild(child.id)}
                  className="text-zinc-400 hover:text-red-600 font-bold px-1"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-1">
            <input
              type="text"
              placeholder="e.g. FirstName"
              value={newChildName}
              onChange={(e) => setNewChildName(e.target.value)}
              className="flex-1 px-2 py-1 rounded border border-zinc-300 text-xs font-mono"
            />
            <button
              onClick={handleAddCompositeChild}
              className="px-2.5 py-1 rounded bg-zinc-900 text-white text-xs font-medium"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* Domain Rules & Value Tester */}
      <div className="p-2.5 rounded bg-zinc-50 border border-zinc-300 space-y-2">
        <span className="text-[11px] font-bold text-zinc-800 block">Domain Constraints & Rules</span>

        {(attribute.dataType === 'INTEGER' || attribute.dataType === 'DECIMAL' || attribute.dataType === 'BIGINT') && (
          <div className="grid grid-cols-2 gap-1.5">
            <div>
              <label className="block text-[10px] text-zinc-600 mb-0.5">Min Value</label>
              <input
                type="number"
                value={attribute.domain?.minValue ?? ''}
                onChange={(e) =>
                  updateAttribute(entity.id, attribute.id, {
                    domain: { ...attribute.domain, minValue: e.target.value === '' ? undefined : Number(e.target.value) },
                  })
                }
                placeholder="e.g. 0"
                className="w-full px-2 py-1 rounded border border-zinc-300 bg-white text-xs"
              />
            </div>
            <div>
              <label className="block text-[10px] text-zinc-600 mb-0.5">Max Value</label>
              <input
                type="number"
                value={attribute.domain?.maxValue ?? ''}
                onChange={(e) =>
                  updateAttribute(entity.id, attribute.id, {
                    domain: { ...attribute.domain, maxValue: e.target.value === '' ? undefined : Number(e.target.value) },
                  })
                }
                placeholder="e.g. 100"
                className="w-full px-2 py-1 rounded border border-zinc-300 bg-white text-xs"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-[10px] text-zinc-600 mb-0.5">Allowed Values (Comma-separated)</label>
          <input
            type="text"
            value={(attribute.domain?.allowedValues || []).join(', ')}
            onChange={(e) =>
              updateAttribute(entity.id, attribute.id, {
                domain: {
                  ...attribute.domain,
                  allowedValues: e.target.value
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean),
                },
              })
            }
            placeholder="e.g. Active, Inactive, Suspended"
            className="w-full px-2 py-1 rounded border border-zinc-300 bg-white text-xs"
          />
        </div>

        {/* Test candidate value */}
        <div className="pt-2 border-t border-zinc-200">
          <label className="block text-[10px] font-semibold text-zinc-700 mb-1">
            Test Sample Value
          </label>
          <div className="flex gap-1.5">
            <input
              type="text"
              placeholder="e.g. 25, admin@site.com"
              value={testValue}
              onChange={(e) => {
                setTestValue(e.target.value);
                setTestResult(null);
              }}
              className="flex-1 px-2 py-1 rounded border border-zinc-300 bg-white text-xs"
            />
            <button
              onClick={handleTestDomain}
              className="px-2.5 py-1 rounded bg-zinc-900 text-white text-xs font-semibold flex items-center gap-1"
            >
              <Play className="w-3 h-3" />
              <span>Test</span>
            </button>
          </div>

          {testResult && (
            <div
              className={`mt-2 p-2 rounded text-[11px] flex items-start gap-1.5 ${
                testResult.valid
                  ? 'bg-emerald-50 border border-emerald-300 text-emerald-800'
                  : 'bg-rose-50 border border-rose-300 text-rose-800'
              }`}
            >
              {testResult.valid ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" /> : <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />}
              <span>{testResult.message}</span>
            </div>
          )}
        </div>
      </div>

      {/* Educational Note */}
      <div className="p-2.5 rounded bg-yellow-50/80 border border-yellow-200 text-zinc-800 space-y-1 text-[11px]">
        <span className="font-bold block text-zinc-900">Database Role:</span>
        <p className="leading-relaxed">
          {attribute.isPrimaryKey
            ? `Designated as the Primary Key. Enforces Entity Integrity in table '${entity.name}'.`
            : `Regular attribute mapped to column '${attribute.name}' of type ${attribute.dataType}.`}
        </p>
      </div>

      {/* Delete Column Button */}
      <div className="pt-2 border-t border-zinc-200 flex justify-end">
        <button
          onClick={() => deleteAttribute(entity.id, attribute.id)}
          className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 px-2 py-1 rounded hover:bg-red-50 transition-colors"
        >
          <Trash2 className="w-3 h-3" />
          <span>Delete Column</span>
        </button>
      </div>
    </div>
  );
};
