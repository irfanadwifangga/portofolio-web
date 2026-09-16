import * as React from "react";
import type { SnippetLang } from "./code-snippets";

const KEYWORDS: Record<SnippetLang, string[]> = {
  typescript: [
    "import",
    "export",
    "from",
    "const",
    "let",
    "var",
    "function",
    "async",
    "await",
    "return",
    "if",
    "else",
    "for",
    "of",
    "in",
    "new",
    "class",
    "extends",
    "interface",
    "type",
    "public",
    "private",
    "static",
    "this",
    "try",
    "catch",
    "throw",
    "default",
  ],
  java: [
    "public",
    "private",
    "protected",
    "class",
    "final",
    "static",
    "void",
    "new",
    "return",
    "throws",
    "throw",
    "try",
    "catch",
    "if",
    "else",
    "for",
    "this",
    "extends",
    "implements",
    "import",
    "package",
    "record",
    "var",
  ],
  python: [
    "class",
    "def",
    "return",
    "if",
    "else",
    "elif",
    "for",
    "in",
    "import",
    "from",
    "as",
    "raise",
    "try",
    "except",
    "with",
    "self",
    "True",
    "False",
    "None",
    "and",
    "or",
    "not",
  ],
  go: [
    "package",
    "import",
    "func",
    "type",
    "struct",
    "return",
    "if",
    "else",
    "for",
    "range",
    "defer",
    "var",
    "const",
  ],
};

const TYPES: Record<SnippetLang, string[]> = {
  typescript: [
    "string",
    "number",
    "boolean",
    "void",
    "NextRequest",
    "NextResponse",
    "DuitkuCallback",
    "Promise",
    "Profile",
  ],
  java: [
    "String",
    "int",
    "long",
    "boolean",
    "void",
    "Socket",
    "IOException",
    "RconPacket",
    "PacketType",
    "Profile",
    "List",
  ],
  python: [
    "APIView",
    "Serializer",
    "IntegerField",
    "ChoiceField",
    "Response",
    "ValidationError",
    "IsAuthenticated",
    "Profile",
    "str",
    "list",
  ],
  go: [
    "int",
    "string",
    "http",
    "json",
    "StockRequest",
    "ResponseWriter",
    "Request",
    "Profile",
  ],
};

interface Token {
  text: string;
  cls: string;
}

function buildPattern(lang: SnippetLang): RegExp {
  const kw = KEYWORDS[lang].sort((a, b) => b.length - a.length).join("|");
  const ty = TYPES[lang].sort((a, b) => b.length - a.length).join("|");
  return new RegExp(
    [
      String.raw`(?<comment>//[^\n]*|#[^\n]*)`,
      String.raw`(?<string>"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|` +
        "`(?:\\\\.|[^`\\\\])*`)",
      String.raw`(?<tag>@[A-Za-z][A-Za-z0-9]*(?:\([^)]*\))?)`,
      String.raw`(?<number>\b\d+(?:\.\d+)?\b)`,
      String.raw`(?<keyword>\b(?:${kw})\b)`,
      String.raw`(?<type>\b(?:${ty})\b)`,
      String.raw`(?<func>\b[A-Za-z_][A-Za-z0-9_]*(?=\s*\())`,
      String.raw`(?<punct>=>|==|!=|&&|\|\||[{}()\[\];,.:+\-*/%=<>!&|^~])`,
    ].join("|"),
    "g",
  );
}

const CLASS_MAP: Record<string, string> = {
  comment: "text-syntax-comment italic",
  string: "text-syntax-string",
  tag: "text-syntax-func",
  number: "text-syntax-number",
  keyword: "text-syntax-keyword",
  type: "text-syntax-type",
  func: "text-syntax-func",
  punct: "text-syntax-punct",
};

function tokenizeLine(line: string, pattern: RegExp): Token[] {
  const tokens: Token[] = [];
  let lastIndex = 0;
  pattern.lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(line))) {
    if (match.index > lastIndex) {
      tokens.push({
        text: line.slice(lastIndex, match.index),
        cls: "text-editor-text",
      });
    }
    const groups = match.groups ?? {};
    const kind = Object.keys(groups).find((k) => groups[k] !== undefined);
    tokens.push({
      text: match[0],
      cls: kind ? CLASS_MAP[kind] : "text-editor-text",
    });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < line.length) {
    tokens.push({ text: line.slice(lastIndex), cls: "text-editor-text" });
  }
  return tokens;
}

/**
 * Lines soft-wrap below `sm` and stay unwrapped above it.
 *
 * The snippets are budgeted to fit the desktop panel, but that panel is 607px
 * and a phone gives the code cell about 270px — long lines were being clipped
 * by overflow-hidden with no way to scroll to the rest. Wrapping keeps every
 * character reachable without reintroducing a scrollbar; align-top keeps the
 * line number pinned to the first visual row of a wrapped line.
 */
export function highlight(code: string, lang: SnippetLang): React.ReactNode[] {
  const pattern = buildPattern(lang);
  return code.split("\n").map((line, i) => {
    const tokens = tokenizeLine(line, pattern);
    return (
      <div key={i} className="table-row">
        <span className="table-cell w-10 pr-4 text-right align-top text-editor-gutter select-none">
          {i + 1}
        </span>
        <span className="table-cell align-top whitespace-pre-wrap sm:whitespace-pre">
          {tokens.map((t, j) => (
            <span key={j} className={t.cls}>
              {t.text}
            </span>
          ))}
          {line.length === 0 ? " " : null}
        </span>
      </div>
    );
  });
}
