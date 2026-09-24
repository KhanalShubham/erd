import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  isDark?: boolean;
}

/**
 * Preprocesses markdown text so that common non-standard syntax (like unicode bullets)
 * and tight line breaks parse cleanly into valid CommonMark blocks.
 */
function preprocessMarkdown(raw: string): string {
  if (!raw) return '';
  return (
    raw
      // Normalize CRLF to LF
      .replace(/\r\n/g, '\n')
      // Convert unicode bullets at the start of a line to standard markdown list items
      .replace(/^[ \t]*[•●○▪]\s*/gm, '- ')
      // Ensure blank line before markdown headings if preceded by non-heading text
      .replace(/([^\n])\n(#{1,6}\s+)/g, '$1\n\n$2')
      // Ensure blank line after markdown headings if followed directly by text
      .replace(/^(#{1,6}\s+[^\n]+)\n([^\n#])/gm, '$1\n\n$2')
      // Ensure blank line before bullet list items if preceded by regular text
      .replace(/([^\n\-\*\d\.\s])\n([ \t]*[\-\*]\s+)/g, '$1\n\n$2')
      // Ensure blank line before numbered list items if preceded by regular text
      .replace(/([^\n\-\*\d\.\s])\n([ \t]*\d+\.\s+)/g, '$1\n\n$2')
  );
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className = '',
  isDark = false,
}) => {
  const processed = preprocessMarkdown(content);

  return (
    <div
      className={`markdown-content font-sans leading-relaxed ${
        isDark ? 'text-zinc-100' : 'text-zinc-800'
      } ${className}`}
    >
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1
              className={`text-sm font-bold font-mono uppercase tracking-wide mt-2 mb-2 pb-1 border-b ${
                isDark ? 'text-white border-zinc-700' : 'text-zinc-950 border-zinc-200'
              }`}
            >
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2
              className={`text-sm font-bold font-mono mt-2 mb-1.5 ${
                isDark ? 'text-white' : 'text-zinc-950'
              }`}
            >
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3
              className={`text-[13px] font-bold font-mono tracking-wide mt-2.5 mb-1.5 flex items-center gap-1.5 ${
                isDark ? 'text-yellow-300' : 'text-zinc-950'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block shrink-0" />
              <span>{children}</span>
            </h3>
          ),
          h4: ({ children }) => (
            <h4
              className={`text-xs font-bold font-mono mt-2 mb-1 ${
                isDark ? 'text-yellow-200' : 'text-zinc-900'
              }`}
            >
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="my-1.5 first:mt-0 last:mb-0 leading-relaxed text-[12.5px]">
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong
              className={`font-bold ${isDark ? 'text-white' : 'text-zinc-950'}`}
            >
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className={`italic ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
              {children}
            </em>
          ),
          ul: ({ children }) => (
            <ul
              className={`my-2 space-y-1 pl-4 list-disc list-outside text-[12px] ${
                isDark ? 'marker:text-yellow-400' : 'marker:text-amber-600'
              }`}
            >
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol
              className={`my-2 space-y-1 pl-4 list-decimal list-outside text-[12px] marker:font-mono marker:font-bold ${
                isDark ? 'marker:text-yellow-400' : 'marker:text-zinc-700'
              }`}
            >
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed pl-0.5">{children}</li>
          ),
          code: ({ children, className: codeClassName, ...props }) => {
            const isMultiLine =
              typeof children === 'string' && children.includes('\n');
            if (!codeClassName && !isMultiLine) {
              return (
                <code
                  className={`px-1.5 py-0.5 rounded font-mono text-[11px] font-semibold ${
                    isDark
                      ? 'bg-zinc-800 text-yellow-300 border border-zinc-700'
                      : 'bg-zinc-100 text-amber-900 border border-zinc-300 shadow-2xs'
                  }`}
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <code
                className={`font-mono text-xs block overflow-x-auto ${
                  codeClassName || ''
                }`}
                {...props}
              >
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="p-2.5 rounded-md bg-zinc-950 text-zinc-100 font-mono text-xs overflow-x-auto my-2 border border-zinc-800 shadow-inner">
              {children}
            </pre>
          ),
          blockquote: ({ children }) => (
            <blockquote
              className={`border-l-2 pl-3 py-1 my-2 italic rounded-r text-xs ${
                isDark
                  ? 'border-yellow-400 text-zinc-300 bg-zinc-800/60'
                  : 'border-amber-500 text-zinc-700 bg-amber-50/70'
              }`}
            >
              {children}
            </blockquote>
          ),
        }}
      >
        {processed}
      </ReactMarkdown>
    </div>
  );
};
