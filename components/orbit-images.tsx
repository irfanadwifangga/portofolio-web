// Vendored from React Bits — https://reactbits.dev/animations/orbit-images
// Component created by Dominik Koch — https://x.com/dominikkoch
// Variant: TS + Tailwind. Changed from upstream:
//   1. "use client" directive.
//   2. Accepts `items?: ReactNode[]` alongside `images?: string[]`. Upstream
//      only orbits <img> from URLs; this site's marks are React components
//      from the icon set, which have no URL to point at.
//   3. `paused` also respects prefers-reduced-motion.
//   4. The orbit holds still while it is off screen; upstream animated every
//      item's position on every frame for the life of the page.
//   5. Plain CSS instead of Motion. Each item runs a keyframe animation on
//      offset-distance, spaced along the path with a negative animation-delay,
//      so the site no longer ships an animation library for one loop.
"use client";

import { useMemo, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";

type OrbitShape =
  | "ellipse"
  | "circle"
  | "square"
  | "rectangle"
  | "triangle"
  | "star"
  | "heart"
  | "infinity"
  | "wave"
  | "custom";

interface OrbitImagesProps {
  images?: string[];
  items?: ReactNode[];
  altPrefix?: string;
  shape?: OrbitShape;
  customPath?: string;
  baseWidth?: number;
  radiusX?: number;
  radiusY?: number;
  radius?: number;
  starPoints?: number;
  starInnerRatio?: number;
  rotation?: number;
  duration?: number;
  itemSize?: number;
  direction?: "normal" | "reverse";
  fill?: boolean;
  width?: number | "100%";
  height?: number | "auto";
  className?: string;
  showPath?: boolean;
  pathColor?: string;
  pathWidth?: number;
  easing?: "linear" | "easeIn" | "easeOut" | "easeInOut";
  paused?: boolean;
  centerContent?: ReactNode;
  responsive?: boolean;
}

interface OrbitItemProps {
  item: ReactNode;
  index: number;
  totalItems: number;
  path: string;
  itemSize: number;
  rotation: number;
  duration: number;
  direction: "normal" | "reverse";
  easing: string;
  fill: boolean;
}

function generateEllipsePath(cx: number, cy: number, rx: number, ry: number): string {
  return `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy}`;
}

function generateCirclePath(cx: number, cy: number, r: number): string {
  return generateEllipsePath(cx, cy, r, r);
}

function generateSquarePath(cx: number, cy: number, size: number): string {
  const h = size / 2;
  return `M ${cx - h} ${cy - h} L ${cx + h} ${cy - h} L ${cx + h} ${cy + h} L ${cx - h} ${cy + h} Z`;
}

function generateRectanglePath(cx: number, cy: number, w: number, h: number): string {
  const hw = w / 2;
  const hh = h / 2;
  return `M ${cx - hw} ${cy - hh} L ${cx + hw} ${cy - hh} L ${cx + hw} ${cy + hh} L ${cx - hw} ${cy + hh} Z`;
}

function generateTrianglePath(cx: number, cy: number, size: number): string {
  const height = (size * Math.sqrt(3)) / 2;
  const hs = size / 2;
  return `M ${cx} ${cy - height / 1.5} L ${cx + hs} ${cy + height / 3} L ${cx - hs} ${cy + height / 3} Z`;
}

function generateStarPath(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  points: number
): string {
  const step = Math.PI / points;
  let path = "";
  for (let i = 0; i < 2 * points; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = i * step - Math.PI / 2;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    path += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
  }
  return path + " Z";
}

function generateHeartPath(cx: number, cy: number, size: number): string {
  const s = size / 30;
  return `M ${cx} ${cy + 12 * s} C ${cx - 20 * s} ${cy - 5 * s}, ${cx - 12 * s} ${cy - 18 * s}, ${cx} ${cy - 8 * s} C ${cx + 12 * s} ${cy - 18 * s}, ${cx + 20 * s} ${cy - 5 * s}, ${cx} ${cy + 12 * s}`;
}

function generateInfinityPath(cx: number, cy: number, w: number, h: number): string {
  const hw = w / 2;
  const hh = h / 2;
  return `M ${cx} ${cy} C ${cx + hw * 0.5} ${cy - hh}, ${cx + hw} ${cy - hh}, ${cx + hw} ${cy} C ${cx + hw} ${cy + hh}, ${cx + hw * 0.5} ${cy + hh}, ${cx} ${cy} C ${cx - hw * 0.5} ${cy + hh}, ${cx - hw} ${cy + hh}, ${cx - hw} ${cy} C ${cx - hw} ${cy - hh}, ${cx - hw * 0.5} ${cy - hh}, ${cx} ${cy}`;
}

function generateWavePath(
  cx: number,
  cy: number,
  w: number,
  amplitude: number,
  waves: number
): string {
  const pts: string[] = [];
  const segs = waves * 20;
  const hw = w / 2;
  for (let i = 0; i <= segs; i++) {
    const x = cx - hw + (w * i) / segs;
    const y = cy + Math.sin((i / segs) * waves * 2 * Math.PI) * amplitude;
    pts.push(i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`);
  }
  for (let i = segs; i >= 0; i--) {
    const x = cx - hw + (w * i) / segs;
    const y = cy - Math.sin((i / segs) * waves * 2 * Math.PI) * amplitude;
    pts.push(`L ${x} ${y}`);
  }
  return pts.join(" ") + " Z";
}

const EASING: Record<string, string> = {
  linear: "linear",
  easeIn: "ease-in",
  easeOut: "ease-out",
  easeInOut: "ease-in-out"
};

function OrbitItem({
  item,
  index,
  totalItems,
  path,
  itemSize,
  rotation,
  duration,
  direction,
  easing,
  fill
}: OrbitItemProps) {
  // Where along the path this item starts, as a share of one lap. A negative
  // delay starts the animation that far in, which spaces the items out.
  const start = fill ? index / totalItems : 0;
  const lapsIn = direction === "reverse" ? 1 - start : start;

  return (
    <div
      className="orbit-item absolute will-change-transform select-none"
      style={{
        width: itemSize,
        height: itemSize,
        offsetPath: `path("${path}")`,
        offsetRotate: "0deg",
        offsetAnchor: "center center",
        animationName: direction === "reverse" ? "orbit-lap-reverse" : "orbit-lap",
        animationDuration: `${duration}s`,
        animationTimingFunction: EASING[easing] ?? "linear",
        animationIterationCount: "infinite",
        animationDelay: `${-lapsIn * duration}s`
      }}>
      <div style={{ transform: `rotate(${-rotation}deg)` }}>{item}</div>
    </div>
  );
}

export default function OrbitImages({
  images = [],
  items: providedItems,
  altPrefix = "Orbiting image",
  shape = "ellipse",
  customPath,
  baseWidth = 1400,
  radiusX = 700,
  radiusY = 170,
  radius = 300,
  starPoints = 5,
  starInnerRatio = 0.5,
  rotation = -8,
  duration = 40,
  itemSize = 64,
  direction = "normal",
  fill = true,
  width = 100,
  height = 100,
  className = "",
  showPath = false,
  pathColor = "rgba(0,0,0,0.1)",
  pathWidth = 2,
  easing = "linear",
  paused = false,
  centerContent,
  responsive = false
}: OrbitImagesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number | null>(null);

  const designCenterX = baseWidth / 2;
  const designCenterY = baseWidth / 2;

  const path = useMemo(() => {
    switch (shape) {
      case "circle":
        return generateCirclePath(designCenterX, designCenterY, radius);
      case "ellipse":
        return generateEllipsePath(designCenterX, designCenterY, radiusX, radiusY);
      case "square":
        return generateSquarePath(designCenterX, designCenterY, radius * 2);
      case "rectangle":
        return generateRectanglePath(designCenterX, designCenterY, radiusX * 2, radiusY * 2);
      case "triangle":
        return generateTrianglePath(designCenterX, designCenterY, radius * 2);
      case "star":
        return generateStarPath(
          designCenterX,
          designCenterY,
          radius,
          radius * starInnerRatio,
          starPoints
        );
      case "heart":
        return generateHeartPath(designCenterX, designCenterY, radius * 2);
      case "infinity":
        return generateInfinityPath(designCenterX, designCenterY, radiusX * 2, radiusY * 2);
      case "wave":
        return generateWavePath(designCenterX, designCenterY, radiusX * 2, radiusY, 3);
      case "custom":
        return customPath || generateCirclePath(designCenterX, designCenterY, radius);
      default:
        return generateEllipsePath(designCenterX, designCenterY, radiusX, radiusY);
    }
  }, [
    shape,
    customPath,
    designCenterX,
    designCenterY,
    radiusX,
    radiusY,
    radius,
    starPoints,
    starInnerRatio
  ]);

  useLayoutEffect(() => {
    if (!responsive || !containerRef.current) return;
    const updateScale = () => {
      if (!containerRef.current) return;
      setScale(containerRef.current.clientWidth / baseWidth);
    };
    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [responsive, baseWidth]);

  // Deviation 4: hold the orbit still while it is off screen. The attribute is
  // written straight to the DOM; a state update would re-render every item.
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const visibility = new IntersectionObserver(([entry]) => {
      node.toggleAttribute("data-offscreen", !entry.isIntersecting);
    });
    visibility.observe(node);
    return () => visibility.disconnect();
  }, []);

  const containerWidth = responsive ? "100%" : typeof width === "number" ? width : "100%";
  const containerHeight = responsive
    ? "auto"
    : typeof height === "number"
      ? height
      : typeof width === "number"
        ? width
        : "auto";

  const items =
    providedItems ??
    images.map((src, index) => (
      // eslint-disable-next-line @next/next/no-img-element -- upstream API takes arbitrary URLs
      <img
        key={src}
        src={src}
        alt={`${altPrefix} ${index + 1}`}
        draggable={false}
        className="h-full w-full object-contain"
      />
    ));

  return (
    <div
      ref={containerRef}
      className={`orbit-images relative mx-auto ${className}`}
      data-paused={paused || undefined}
      style={{
        width: containerWidth,
        height: containerHeight,
        aspectRatio: responsive ? "1 / 1" : undefined
      }}
      aria-hidden="true">
      <div
        className={responsive ? "absolute top-1/2 left-1/2" : "relative h-full w-full"}
        style={{
          width: responsive ? baseWidth : "100%",
          height: responsive ? baseWidth : "100%",
          transform:
            responsive && scale !== null ? `translate(-50%, -50%) scale(${scale})` : undefined,
          visibility: responsive && scale === null ? "hidden" : undefined,
          transformOrigin: "center center"
        }}>
        <div
          className="relative h-full w-full"
          style={{
            transform: `rotate(${rotation}deg)`,
            transformOrigin: "center center"
          }}>
          {showPath && (
            <svg
              width="100%"
              height="100%"
              viewBox={`0 0 ${baseWidth} ${baseWidth}`}
              className="pointer-events-none absolute inset-0">
              <path
                d={path}
                fill="none"
                stroke={pathColor}
                strokeWidth={pathWidth / (scale ?? 1)}
              />
            </svg>
          )}

          {items.map((item, index) => (
            <OrbitItem
              key={index}
              item={item}
              index={index}
              totalItems={items.length}
              path={path}
              itemSize={itemSize}
              rotation={rotation}
              duration={duration}
              direction={direction}
              easing={easing}
              fill={fill}
            />
          ))}
        </div>
      </div>

      <style>{`
@keyframes orbit-lap { from { offset-distance: 0%; } to { offset-distance: 100%; } }
@keyframes orbit-lap-reverse { from { offset-distance: 100%; } to { offset-distance: 0%; } }
.orbit-images[data-offscreen] .orbit-item,
.orbit-images[data-paused] .orbit-item { animation-play-state: paused; }
@media (prefers-reduced-motion: reduce) { .orbit-images .orbit-item { animation-play-state: paused; } }
`}</style>

      {centerContent && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          {centerContent}
        </div>
      )}
    </div>
  );
}
