import React from 'react';
import {
  Table,
  Database,
  Code2,
  ShieldCheck,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { useLearningStore } from '../../stores/learningStore';
import { useDatabaseStore } from '../../stores/databaseStore';
import { RelationalTablesView } from '../../features/database/RelationalTablesView';
import { DataSandboxView } from '../../features/database/DataSandboxView';
import { SqlPreviewView } from '../../features/database/SqlPreviewView';
import { IntegrityReportView } from '../../features/database/IntegrityReportView';

export const BottomDock: React.FC = () => {
  const {
    activeBottomTab,
    setActiveBottomTab,
    isBottomDockExpanded,
    toggleBottomDock,
  } = useLearningStore();

  const { tables, violations } = useDatabaseStore();

  interface DockTab {
    id: 'relational' | 'sandbox' | 'sql' | 'validation';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }

  const tabs: DockTab[] = [
    {
      id: 'relational',
      label: 'Relational Tables',
      icon: Table,
      badge: `${tables.length}`,
    },
    {
      id: 'sandbox',
      label: 'Data Sandbox',
      icon: Database,
      badge: violations.length > 0 ? `${violations.length} violations` : undefined,
    },
    {
      id: 'sql',
      label: 'SQL Generator',
      icon: Code2,
    },
    {
      id: 'validation',
      label: 'Integrity Check',
      icon: ShieldCheck,
    },
  ];

  return (
    <div
      className={`border-t border-zinc-300 bg-white flex flex-col transition-all duration-200 z-30 select-none shadow-xs ${
        isBottomDockExpanded ? 'h-72 sm:h-80' : 'h-9'
      }`}
    >
      {/* Tab Navigation Header Bar */}
      <div className="h-9 px-3 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between shrink-0 text-xs">
        <div className="flex items-center gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeBottomTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveBottomTab(tab.id);
                  if (!isBottomDockExpanded) toggleBottomDock(true);
                }}
                className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0 ${
                  isActive && isBottomDockExpanded
                    ? 'bg-white text-zinc-950 font-bold border border-zinc-300 shadow-2xs'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5 text-zinc-500" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-zinc-200 text-zinc-700">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Toggle Minimize/Maximize Drawer Button */}
        <button
          onClick={() => toggleBottomDock()}
          className="p-1 text-zinc-500 hover:text-zinc-900 rounded hover:bg-zinc-200 transition-colors flex items-center gap-1 text-[11px] font-medium"
          title={isBottomDockExpanded ? 'Minimize drawer' : 'Expand drawer'}
        >
          <span>{isBottomDockExpanded ? 'Minimize' : 'Expand'}</span>
          {isBottomDockExpanded ? (
            <ChevronDown className="w-3.5 h-3.5" />
          ) : (
            <ChevronUp className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Dock Content Body (Displayed when expanded) */}
      {isBottomDockExpanded && (
        <div className="flex-1 overflow-auto p-4 bg-[#FAF9F5] text-zinc-900">
          {activeBottomTab === 'relational' && <RelationalTablesView />}
          {activeBottomTab === 'sandbox' && <DataSandboxView />}
          {activeBottomTab === 'sql' && <SqlPreviewView />}
          {activeBottomTab === 'validation' && <IntegrityReportView />}
        </div>
      )}
    </div>
  );
};
