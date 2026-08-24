"use client";

import * as React from "react";
import type { ReactNode } from "react";
import { codeSnippets, type SnippetLang } from "@/lib/code-snippets";
import { highlight } from "@/lib/highlight";
import DecryptedText from "@/components/decrypted-text";

export interface CodeEditorProps {
  /**
   * Tab icons, already rendered. They are passed in rather than imported
   * because this is a client component and @thesvg/react bundles every variant
   * of an icon into the chunk that imports it — see components/orbit-mark.tsx.
   * The nodes are static; only the wrapper's opacity tracks the active tab.
   */
  langIcons: Record<SnippetLang, ReactNode>;
}

export function CodeEditor({ langIcons }: CodeEditorProps) {
  const [active, setActive] = React.useState(codeSnippets[0].id);
  const snippet = codeSnippets.find((s) => s.id === active)!;
  const lines = React.useMemo(() => snippet.code.split("\n"), [snippet.code]);
  // All lines reveal in parallel at the same per-character rate, so the longest
  // one settles last — that is the signal the whole block is done.
  const longestLine = React.useMemo(
    () => lines.reduce((best, l, i) => (l.length > lines[best].length ? i : best), 0),
    [lines]
  );

  /**
   * The code body decrypts in two phases.
   *
   * DecryptedText takes a plain string, while the body is a tree of coloured
   * token spans — feeding one to the other would throw the syntax highlighting
   * away. So the scramble runs over the raw source in a single dim colour, and
   * `onComplete` swaps in the highlighted render. Reads as "decrypt, then
   * colourise" rather than a compromise.
   *
   * Layout is safe throughout: the panel is monospace with a fixed min-height
   * and overflow-hidden, so nothing can reflow while the characters churn.
   */
  const [decoded, setDecoded] = React.useState(false);
  const markDecoded = React.useCallback(() => setDecoded(true), []);

  // Safety net. The scramble is driven by DecryptedText's IntersectionObserver;
  // if that never fires, its mount effect still settles the text to the final
  // value but `onComplete` never runs — and the panel would keep the dim
  // monochrome phase forever, permanently losing syntax highlighting. The
  // Lines run in parallel, so the budget is the longest LINE (~52 chars at
  // 26ms = ~1.4s), not the whole snippet. 3s keeps ~2x margin.
  React.useEffect(() => {
    if (decoded) return;
    const t = setTimeout(() => setDecoded(true), 3000);
    return () => clearTimeout(t);
  }, [decoded, active]);

  return (
    <div className="w-full max-w-2xl overflow-hidden rounded-xl border border-white/10 bg-editor-bg shadow-2xl shadow-black/40 backdrop-blur">
      {/* window chrome */}
      <div className="flex items-center justify-between border-b border-white/10 bg-editor-chrome px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
          <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
          <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
        </div>
        <span className="font-mono text-xs text-[#8b949e]">
          <DecryptedText
            key={snippet.filename}
            text={snippet.filename}
            animateOn="view"
            sequential
            speed={28}
            useOriginalCharsOnly
            encryptedClassName="text-[#3a4048]"
          />
        </span>
        <span className="w-16" />
      </div>

      {/* tabs */}
      <div
        role="tablist"
        aria-label="Profile in each language"
        className="scrollbar-thin flex gap-0.5 overflow-x-auto border-b border-white/10 bg-editor-chrome px-2 pt-1">
        {codeSnippets.map((s) => {
          const isActive = s.id === active;
          return (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => {
                setActive(s.id);
                setDecoded(false);
              }}
              className={`relative flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-t-lg px-3 py-2.5 font-mono text-xs transition-colors focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:outline-none ${
                isActive ? "bg-editor-bg text-[#e5e7eb]" : "text-[#8b949e] hover:text-[#c9d1d9]"
              }`}>
              <span
                aria-hidden
                className={`flex shrink-0 transition-opacity ${isActive ? "opacity-100" : "opacity-60"}`}>
                {langIcons[s.id]}
              </span>
              {s.label}
              {s.badge ? (
                <span className="rounded-full bg-amber-400/15 px-1.5 py-0.5 text-2xs leading-none font-medium text-amber-400">
                  {s.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* code */}
      {/* Height follows the snippet (min-h-auto), so the two phases MUST have
          identical structure — same table, same line-number gutter — or the
          panel would jump when the decrypt hands over to the highlighter.
          The scramble therefore runs per line rather than over the whole
          string: every line starts at once and resolves left to right, instead
          of one long top-to-bottom crawl through 400+ characters. */}
      <div className="min-h-auto overflow-hidden px-5 py-5">
        <div className="table w-full font-mono text-code">
          {decoded
            ? highlight(snippet.code, snippet.id)
            : lines.map((line, i) => (
                <div key={i} className="table-row">
                  <span className="table-cell w-10 pr-4 text-right align-top text-[#7d8590] select-none">
                    {i + 1}
                  </span>
                  <span className="table-cell align-top whitespace-pre-wrap text-[#6e7681] sm:whitespace-pre">
                    {line.length === 0 ? (
                      " "
                    ) : (
                      <DecryptedText
                        key={`${snippet.id}-${i}`}
                        text={line}
                        animateOn="view"
                        sequential
                        revealDirection="start"
                        speed={26}
                        useOriginalCharsOnly
                        parentClassName="whitespace-pre-wrap sm:whitespace-pre"
                        onComplete={i === longestLine ? markDecoded : undefined}
                      />
                    )}
                  </span>
                </div>
              ))}
        </div>
      </div>
    </div>
  );
}
