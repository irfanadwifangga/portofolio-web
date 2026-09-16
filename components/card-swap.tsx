// Vendored from React Bits — https://reactbits.dev/components/card-swap
// Variant: TS + Tailwind. Changed from upstream:
//   1. "use client" directive.
//   2. The Card shell drops `border-white bg-black` for this site's surface
//      tokens — a pure-white hairline on pure black reads as a foreign element
//      next to every other card here.
//   3. Honours prefers-reduced-motion: the stack is placed in its resting
//      layout and the swap interval never starts.
//   4. The positioning wrapper is a prop-driven className instead of the
//      hardcoded bottom-right offsets, which assumed a full-bleed hero.
//   5. Added `onActiveChange` so a sibling panel can follow the front card.
//   6. The card shadow uses the --shadow token (`shadow-shadow/40`) instead of
//      `shadow-black/40`, so it softens in the light theme instead of reading
//      as a dirty smudge.
"use client";

import React, {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  type ReactElement,
  type ReactNode,
  type RefObject,
  useEffect,
  useMemo,
  useRef
} from "react";
import gsap from "gsap";

export interface CardSwapProps {
  width?: number | string;
  height?: number | string;
  cardDistance?: number;
  verticalDistance?: number;
  delay?: number;
  pauseOnHover?: boolean;
  onCardClick?: (idx: number) => void;
  /** Fires with the index of the card currently in front. Not in upstream. */
  onActiveChange?: (idx: number) => void;
  skewAmount?: number;
  easing?: "linear" | "elastic";
  className?: string;
  children: ReactNode;
}

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  customClass?: string;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(({ customClass, ...rest }, ref) => (
  <div
    ref={ref}
    {...rest}
    className={`absolute top-1/2 left-1/2 overflow-hidden rounded-xl border border-border bg-surface shadow-2xl shadow-shadow/40 [backface-visibility:hidden] [transform-style:preserve-3d] [will-change:transform] ${customClass ?? ""} ${rest.className ?? ""}`.trim()}
  />
));
Card.displayName = "Card";

type CardRef = RefObject<HTMLDivElement | null>;
interface Slot {
  x: number;
  y: number;
  z: number;
  zIndex: number;
}

const makeSlot = (i: number, distX: number, distY: number, total: number): Slot => ({
  x: i * distX,
  y: -i * distY,
  z: -i * distX * 1.5,
  zIndex: total - i
});

const placeNow = (el: HTMLElement, slot: Slot, skew: number) =>
  gsap.set(el, {
    x: slot.x,
    y: slot.y,
    z: slot.z,
    xPercent: -50,
    yPercent: -50,
    skewY: skew,
    transformOrigin: "center center",
    zIndex: slot.zIndex,
    force3D: true
  });

const CardSwap: React.FC<CardSwapProps> = ({
  width = 500,
  height = 400,
  cardDistance = 60,
  verticalDistance = 70,
  delay = 5000,
  pauseOnHover = false,
  onCardClick,
  onActiveChange,
  skewAmount = 6,
  easing = "elastic",
  className = "",
  children
}) => {
  const config = useMemo(
    () =>
      easing === "elastic"
        ? {
            ease: "elastic.out(0.6,0.9)",
            durDrop: 2,
            durMove: 2,
            durReturn: 2,
            promoteOverlap: 0.9,
            returnDelay: 0.05
          }
        : {
            ease: "power1.inOut",
            durDrop: 0.8,
            durMove: 0.8,
            durReturn: 0.8,
            promoteOverlap: 0.45,
            returnDelay: 0.2
          },
    [easing]
  );

  const childArr = useMemo(
    () => Children.toArray(children) as ReactElement<CardProps>[],
    [children]
  );
  // Keyed on the COUNT, not the array. `children` is a fresh array on every
  // parent render, so depending on it made refs unstable — the main effect
  // re-ran on each render and fired onActiveChange(0), snapping the stack back
  // to the first card every time anything above it changed state.
  const refs = useMemo<CardRef[]>(
    () => childArr.map(() => React.createRef<HTMLDivElement>()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [childArr.length]
  );

  const order = useRef<number[]>([]);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const intervalRef = useRef<number>(0);
  const container = useRef<HTMLDivElement>(null);
  // stable ref so the swap effect does not restart when the callback identity changes
  const onActiveRef = useRef(onActiveChange);
  useEffect(() => {
    onActiveRef.current = onActiveChange;
  }, [onActiveChange]);

  useEffect(() => {
    const total = refs.length;
    if (!total) return;
    order.current = Array.from({ length: total }, (_, i) => i);
    onActiveRef.current?.(0);

    refs.forEach((r, i) => {
      if (r.current)
        placeNow(r.current, makeSlot(i, cardDistance, verticalDistance, total), skewAmount);
    });

    // The whole point of this component is the motion; with it suppressed the
    // stack simply sits in its resting arrangement.
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    const swap = () => {
      if (order.current.length < 2) return;
      const [front, ...rest] = order.current;
      const elFront = refs[front].current;
      if (!elFront) return;

      const tl = gsap.timeline();
      tlRef.current = tl;

      tl.to(elFront, {
        y: "+=500",
        duration: config.durDrop,
        ease: config.ease
      });
      tl.addLabel("promote", `-=${config.durDrop * config.promoteOverlap}`);

      rest.forEach((idx, i) => {
        const el = refs[idx].current;
        if (!el) return;
        const slot = makeSlot(i, cardDistance, verticalDistance, refs.length);
        tl.set(el, { zIndex: slot.zIndex }, "promote");
        tl.to(
          el,
          {
            x: slot.x,
            y: slot.y,
            z: slot.z,
            duration: config.durMove,
            ease: config.ease
          },
          `promote+=${i * 0.15}`
        );
      });

      const backSlot = makeSlot(refs.length - 1, cardDistance, verticalDistance, refs.length);
      tl.addLabel("return", `promote+=${config.durMove * config.returnDelay}`);
      tl.call(() => gsap.set(elFront, { zIndex: backSlot.zIndex }), undefined, "return");
      tl.to(
        elFront,
        {
          x: backSlot.x,
          y: backSlot.y,
          z: backSlot.z,
          duration: config.durReturn,
          ease: config.ease
        },
        "return"
      );
      // Announce at "promote", not at the end. With elastic easing the timeline
      // runs ~4s while the incoming card reaches the front almost immediately —
      // notifying on completion made the copy trail the card by seconds.
      tl.call(() => onActiveRef.current?.(rest[0]), undefined, "promote");

      tl.call(() => {
        order.current = [...rest, front];
      });
    };

    swap();
    intervalRef.current = window.setInterval(swap, delay);

    const node = container.current;
    if (pauseOnHover && node) {
      const pause = () => {
        tlRef.current?.pause();
        clearInterval(intervalRef.current);
      };
      const resume = () => {
        tlRef.current?.play();
        intervalRef.current = window.setInterval(swap, delay);
      };
      node.addEventListener("mouseenter", pause);
      node.addEventListener("mouseleave", resume);
      return () => {
        node.removeEventListener("mouseenter", pause);
        node.removeEventListener("mouseleave", resume);
        clearInterval(intervalRef.current);
        tlRef.current?.kill();
      };
    }
    return () => {
      clearInterval(intervalRef.current);
      tlRef.current?.kill();
    };
  }, [cardDistance, verticalDistance, delay, pauseOnHover, skewAmount, config, refs]);

  const rendered = childArr.map((child, i) =>
    isValidElement<CardProps>(child)
      ? cloneElement(child, {
          key: i,
          ref: refs[i],
          style: { width, height, ...(child.props.style ?? {}) },
          onClick: (e) => {
            child.props.onClick?.(e as React.MouseEvent<HTMLDivElement>);
            onCardClick?.(i);
          }
        } as CardProps & React.RefAttributes<HTMLDivElement>)
      : child
  );

  return (
    <div
      ref={container}
      className={`relative [perspective:900px] ${className}`.trim()}
      style={{ width, height }}>
      {rendered}
    </div>
  );
};

export default CardSwap;
