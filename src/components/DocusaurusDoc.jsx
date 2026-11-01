import React, { useState } from 'react';
import { 
  Check, 
  Copy, 
  Terminal, 
  Info, 
  AlertTriangle, 
  Lightbulb, 
  FileCode,
  ShieldAlert
} from 'lucide-react';

// Docusaurus-style Admonition Callout (Note, Tip, Caution, Warning)
export function Admonition({ type = 'note', title, children }) {
  const configs = {
    note: {
      borderColor: 'border-sky-500',
      bgColor: 'bg-sky-50/60',
      iconColor: 'text-sky-600',
      titleColor: 'text-sky-900',
      Icon: Info,
      defaultTitle: 'NOTE'
    },
    tip: {
      borderColor: 'border-emerald-500',
      bgColor: 'bg-emerald-50/60',
      iconColor: 'text-emerald-600',
      titleColor: 'text-emerald-900',
      Icon: Lightbulb,
      defaultTitle: 'TIP'
    },
    caution: {
      borderColor: 'border-amber-500',
      bgColor: 'bg-amber-50/60',
      iconColor: 'text-amber-600',
      titleColor: 'text-amber-900',
      Icon: AlertTriangle,
      defaultTitle: 'CAUTION'
    },
    warning: {
      borderColor: 'border-rose-500',
      bgColor: 'bg-rose-50/60',
      iconColor: 'text-rose-600',
      titleColor: 'text-rose-900',
      Icon: ShieldAlert,
      defaultTitle: 'WARNING'
    }
  };

  const config = configs[type] || configs.note;
  const { Icon } = config;

  return (
    <div className={`rounded-xl border-l-4 ${config.borderColor} ${config.bgColor} border border-zinc-200/70 p-4 space-y-2 text-xs sm:text-[13px] my-3 shadow-2xs`}>
      <div className="flex items-center gap-2">
        <Icon className={`w-4 h-4 ${config.iconColor} flex-shrink-0`} />
        <span className={`font-mono font-extrabold uppercase tracking-wider text-[11px] ${config.titleColor}`}>
          {title || config.defaultTitle}
        </span>
      </div>
      <div className="text-zinc-800 leading-relaxed font-sans pl-6">
        {children}
      </div>
    </div>
  );
}

// Docusaurus-style Code Block with Title Bar and Interactive Copy Button
export function DocCodeBlock({ code, language = 'bash', label = '', description = '' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-1 my-3">
      {description && (
        <p className="text-xs text-zinc-600 font-sans m-0 leading-relaxed">
          {description}
        </p>
      )}
      
      <div className="rounded-xl overflow-hidden border border-[#2c3343] bg-[#1a1e27] shadow-sm text-xs transition-all">
        {/* Code Header Bar */}
        <div className="px-3.5 py-2 bg-[#202531] border-b border-[#2c3343] flex items-center justify-between gap-2 select-none">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56] opacity-80" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e] opacity-80" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f] opacity-80" />
            </div>

            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 ml-1.5 flex items-center gap-1">
              <Terminal className="w-3 h-3 text-zinc-400" />
              <span>{label || language.toUpperCase()}</span>
            </span>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono text-zinc-300 hover:text-white bg-[#2c3343]/60 hover:bg-[#2c3343] transition-all"
            title="Copy code to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />
                <span className="text-emerald-400 font-bold">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-zinc-400" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Code Pre Area */}
        <div className="p-3.5 font-mono text-xs sm:text-[13px] text-emerald-300 overflow-x-auto leading-relaxed">
          <pre className="m-0 whitespace-pre font-mono">
            {code}
          </pre>
        </div>
      </div>
    </div>
  );
}

// Docusaurus-style Specification / Parameters Table
export function DocTable({ headers = [], rows = [] }) {
  if (!rows || rows.length === 0) return null;

  return (
    <div className="w-full my-3 rounded-xl border border-zinc-200/90 overflow-hidden shadow-2xs bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-zinc-50/90 border-b border-zinc-200 text-zinc-700">
              {headers.map((h, i) => (
                <th key={i} className="py-2.5 px-3.5 font-mono font-bold text-[11px] uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {rows.map((row, rowIdx) => (
              <tr 
                key={rowIdx} 
                className={`transition-colors hover:bg-zinc-50/80 ${rowIdx % 2 === 1 ? 'bg-zinc-50/30' : 'bg-white'}`}
              >
                {row.map((cell, cellIdx) => (
                  <td key={cellIdx} className="py-2.5 px-3.5 text-zinc-800 leading-relaxed font-sans align-top">
                    {typeof cell === 'string' && (cell.startsWith('`') || cell.includes('`')) ? (
                      <span className="font-mono text-[11px] bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-900 border border-zinc-200/70 inline-block font-semibold">
                        {cell.replace(/`/g, '')}
                      </span>
                    ) : (
                      cell
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

