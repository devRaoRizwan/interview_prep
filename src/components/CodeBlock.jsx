import React, { useState } from 'react';
import { Check, Copy, Terminal } from 'lucide-react';

export default function CodeBlock({ code, language = 'bash', label = 'COMMAND / CODE' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Syntax highlight parser
  const renderHighlightedCode = (text) => {
    // If multiple lines or single line
    const lines = text.split('\n');

    return lines.map((line, lineIdx) => {
      // Split tokens by spaces, parenthesis, quotes, brackets
      const tokens = line.split(/(\s+|[(),|&;{}[\]]|"[^"]*"|'[^']*')/g).filter(Boolean);

      return (
        <div key={lineIdx} className="leading-relaxed">
          {tokens.map((token, tokenIdx) => {
            // Strings: "..." or '...'
            if ((token.startsWith('"') && token.endsWith('"')) || (token.startsWith("'") && token.endsWith("'"))) {
              return <span key={tokenIdx} className="text-emerald-300 font-mono">{token}</span>;
            }

            // Flags / Options: --version, -m, -5s, etc.
            if (token.startsWith('--') || token.startsWith('-')) {
              return <span key={tokenIdx} className="text-rose-400 font-semibold font-mono">{token}</span>;
            }

            // CLI Commands & Python Keywords
            const keywords = [
              'pip', 'python', 'django-admin', 'manage.py', 'install', 'runserver', 'makemigrations',
              'migrate', 'createsuperuser', 'inspectdb', 'collectstatic', 'def', 'class', 'import',
              'from', 'return', 'yield', 'lambda', 'with', 'as', 'if', 'else', 'elif', 'for', 'in',
              'try', 'except', 'finally', 'break', 'continue', 'pass', 'del', 'and', 'or', 'not'
            ];
            if (keywords.includes(token.trim().toLowerCase())) {
              return <span key={tokenIdx} className="text-cyan-300 font-bold font-mono">{token}</span>;
            }

            // Functions / Methods / ORM Lookups
            const functions = [
              'all', 'filter', 'get', 'create', 'update', 'delete', 'union', 'select_related',
              'prefetch_related', 'render', 'include', 'len', 'range', 'xrange', 'print', 'super',
              '__init__', 'keys', 'values', 'items', 'pop', 'append', 'split', 'map', 'deepcopy',
              'copy', 'read', 'write', 'dump', 'load'
            ];
            const cleanToken = token.replace(/[^a-zA-Z0-9_]/g, '');
            if (functions.includes(cleanToken)) {
              return <span key={tokenIdx} className="text-amber-300 font-semibold font-mono">{token}</span>;
            }

            // Operators and punctuation
            if (['=', '==', '!=', '>=', '<=', '&&', '||', '|', '&', '>>', '->'].includes(token.trim())) {
              return <span key={tokenIdx} className="text-pink-400 font-bold font-mono">{token}</span>;
            }

            // Decorators (@something)
            if (token.startsWith('@')) {
              return <span key={tokenIdx} className="text-purple-300 font-bold font-mono">{token}</span>;
            }

            // Model Names / Classes (Capitalized)
            if (/^[A-Z][a-zA-Z0-9_]*$/.test(token.trim())) {
              return <span key={tokenIdx} className="text-indigo-300 font-bold font-mono">{token}</span>;
            }

            // Default token
            return <span key={tokenIdx} className="text-slate-200 font-mono">{token}</span>;
          })}
        </div>
      );
    });
  };

  const isCommand = code.includes('pip') || code.includes('python') || code.includes('django-admin') || code.includes('manage.py');

  return (
    <div className="rounded-xl overflow-hidden border border-[#2c3343] bg-[#1a1e27] shadow-md text-xs my-2 transition-all">
      {/* Terminal Title Bar */}
      <div className="px-3.5 py-2 bg-[#202531] border-b border-[#2c3343] flex items-center justify-between gap-2 select-none">
        <div className="flex items-center gap-2">
          {/* macOS window control dots */}
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56] opacity-80" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e] opacity-80" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f] opacity-80" />
          </div>

          <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 font-mono ml-2">
            {isCommand ? 'TERMINAL' : 'CODE PREVIEW'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-semibold">
            {isCommand ? 'BASH' : 'PYTHON'}
          </span>

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            title="Copy command to clipboard"
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold text-zinc-300 hover:text-white bg-zinc-800/80 hover:bg-zinc-700 transition-colors border border-zinc-700"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400 stroke-[2.5]" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Body */}
      <div className="p-3 sm:p-3.5 font-mono text-xs sm:text-[13px] overflow-x-auto flex items-start gap-2.5">
        <span className="text-emerald-400 select-none font-bold">
          {isCommand ? '$' : '>>>'}
        </span>
        <div className="flex-1 overflow-x-auto">
          {renderHighlightedCode(code)}
        </div>
      </div>
    </div>
  );
}

