// Adapted from React Bits — https://reactbits.dev/text-animations/decrypted-text
// Rewritten from upstream; what is left is its look: characters resolve left to
// right while the rest of the text churns through random glyphs.
//   1. "use client" directive.
//   2. Scrambling is skipped under prefers-reduced-motion — the text just
//      renders plain instead of thrashing through random glyphs.
//   3. `onComplete`, and whitespace survives the scramble, so multi-line code
//      keeps its shape.
//   4. A11Y FIX: the sr-only node holds the real `text`. Upstream put the
//      scrambled string there, so screen readers announced noise.
//   5. No layout shift while scrambling. Scrambled glyphs have different
//      widths, so upstream re-wrapped the text on every tick and pushed
//      everything below it around (measured CLS 8–18 on a phone). Each original
//      character stays in the flow, hidden, and its scrambled stand-in is
//      drawn over it absolutely, so line breaks never change. Once settled —
//      and in the server HTML — the text renders as one plain span.
//   6. Timed by the clock, written straight to the DOM. Upstream revealed one
//      character per setInterval tick and re-rendered every character through
//      React on each one. On a slow phone a tick took far longer than `speed`,
//      so the hero lead took 15–20 s to resolve with the main thread pinned the
//      whole time. Now progress follows elapsed time, so the reveal takes
//      text.length × speed ms on any device, and each frame only rewrites text
//      nodes. React renders twice: once to lay out the characters, once to
//      settle. A device that stalls for a quarter second mid-reveal skips to
//      the settled text.
//      Per frame, the browser's paint and layout outweighed the script (a
//      mobile trace: 663 ms paint and 641 ms layout against ~100 ms of script),
//      so the frame work is kept to what is visible: the placeholder characters
//      are visibility:hidden rather than transparent, so they are not painted;
//      revealing a character swaps visibility instead of text, which needs no
//      layout; and the glyphs are re-rolled at most 30 times a second.
//   7. Only the modes this site uses: reveal on first view, from the start.
//   8. The reveal never delays the largest contentful paint. It waits for a
//      painted frame before replacing the text with per-character spans —
//      otherwise, where hydration beats the first paint, the browser never sees
//      the paragraph as one block of text and only counts it once the scramble
//      settles (PageSpeed measured a 2,560 ms render delay on the hero lead).
//      A long text also reveals several characters per step so that no reveal
//      runs longer than MAX_REVEAL_MS.
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { HTMLAttributes } from "react";

interface DecryptedTextProps extends HTMLAttributes<HTMLSpanElement> {
  text: string;
  /** Milliseconds per revealed character. */
  speed?: number;
  /** Scramble with the text's own characters instead of `characters`. */
  useOriginalCharsOnly?: boolean;
  characters?: string;
  className?: string;
  encryptedClassName?: string;
  parentClassName?: string;
  /** Fired when the reveal finishes. */
  onComplete?: () => void;
}

/** A gap between frames this long means the device is choking; finish at once. */
const STALL_MS = 250;

const WHITESPACE = /\s/;

/** Fastest re-roll of the scrambled glyphs, in milliseconds (30 per second). */
const MIN_REROLL_MS = 33;

/** Deviation 8: the longest a reveal may run, however long the text is. */
const MAX_REVEAL_MS = 800;

export default function DecryptedText({
  text,
  speed = 50,
  useOriginalCharsOnly = false,
  characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+",
  className = "",
  parentClassName = "",
  encryptedClassName = "",
  onComplete,
  ...props
}: DecryptedTextProps) {
  const [scrambling, setScrambling] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);
  const glyphRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const holderRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const pool = useMemo(
    () =>
      useOriginalCharsOnly
        ? Array.from(new Set(text.split(""))).filter((char) => !WHITESPACE.test(char))
        : characters.split(""),
    [useOriginalCharsOnly, text, characters]
  );

  // Start on first view.
  useEffect(() => {
    const node = containerRef.current;
    if (!node || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        // Deviation 8: two frames guarantee the settled text has been painted.
        frame = requestAnimationFrame(() => {
          frame = requestAnimationFrame(() => setScrambling(true));
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [text]);

  // Drive the reveal once the per-character spans are in the DOM.
  useEffect(() => {
    if (!scrambling) return;
    const glyphs = glyphRefs.current;
    const holders = holderRefs.current;
    const reroll = Math.max(speed, MIN_REROLL_MS);
    // Deviation 8: `speed` per character, unless that would overrun the cap.
    const step = Math.min(speed, MAX_REVEAL_MS / text.length);
    const random = () => pool[Math.floor(Math.random() * pool.length)] ?? "";
    let revealed = 0;
    let lastScramble = -Infinity;
    let lastFrame = 0;
    let frame = 0;
    const start = performance.now();

    const finish = () => {
      setScrambling(false);
      onCompleteRef.current?.();
    };

    const tick = (now: number) => {
      const stalled = lastFrame > 0 && now - lastFrame > STALL_MS;
      lastFrame = now;
      const target = Math.min(text.length, Math.floor((now - start) / step));
      if (stalled || target >= text.length) return finish();

      // Revealing shows the real character and hides its stand-in: a style
      // change only, so the line needs no layout.
      for (; revealed < target; revealed++) {
        const holder = holders[revealed];
        const glyph = glyphs[revealed];
        if (holder) holder.className = className;
        if (glyph) glyph.className = "absolute top-0 left-0 invisible";
      }
      // Re-roll the unrevealed glyphs every `speed` ms, capped at 30 per second.
      if (now - lastScramble >= reroll) {
        lastScramble = now;
        for (let i = revealed; i < text.length; i++) {
          const glyph = glyphs[i];
          if (glyph && !WHITESPACE.test(text[i])) glyph.textContent = random();
        }
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [scrambling, text, speed, pool, className]);

  return (
    <span
      ref={containerRef}
      className={`inline-block whitespace-pre-wrap ${parentClassName}`}
      {...props}>
      <span className="sr-only">{text}</span>

      {scrambling ? (
        <span aria-hidden="true">
          {text.split("").map((char, index) => (
            // Deviation 5: the real character holds the layout; the scrambled
            // one is painted over it and cannot move anything.
            <span key={index} className="relative">
              <span
                ref={(el) => {
                  holderRefs.current[index] = el;
                }}
                className="invisible">
                {char}
              </span>
              <span
                ref={(el) => {
                  glyphRefs.current[index] = el;
                }}
                className={`absolute top-0 left-0 ${encryptedClassName}`}>
                {char}
              </span>
            </span>
          ))}
        </span>
      ) : (
        <span aria-hidden="true" className={className}>
          {text}
        </span>
      )}
    </span>
  );
}
