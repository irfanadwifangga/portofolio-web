// Vendored from React Bits — https://reactbits.dev/animations/click-spark
// Variant: TS + Tailwind. Changed from upstream, deliberately:
//
//  1. "use client" directive (Next App Router).
//  2. The draw loop parks itself when no sparks remain. Upstream runs
//     requestAnimationFrame and clears the canvas every frame for the life of
//     the page, even when nothing is animating.
//  3. The wrapper is `display: contents` instead of `relative w-full h-full`.
//     <body> here is `flex flex-col` and <main> relies on `flex-1`; a real
//     wrapper box would swallow that and unstick the footer.
//  4. The canvas is viewport-fixed and sized to the window rather than to the
//     parent element. Sized to the parent it would be the full document
//     height (~4700px => ~22MB of canvas memory). Because it is fixed,
//     clientX/clientY map to canvas coordinates directly.
"use client";

import React, { useRef, useEffect, useCallback } from "react";

interface ClickSparkProps {
  sparkColor?: string;
  sparkSize?: number;
  sparkRadius?: number;
  sparkCount?: number;
  duration?: number;
  easing?: "linear" | "ease-in" | "ease-out" | "ease-in-out";
  extraScale?: number;
  children?: React.ReactNode;
}

interface Spark {
  x: number;
  y: number;
  angle: number;
  startTime: number;
}

const ClickSpark: React.FC<ClickSparkProps> = ({
  sparkColor = "#fff",
  sparkSize = 10,
  sparkRadius = 15,
  sparkCount = 8,
  duration = 400,
  easing = "ease-out",
  extraScale = 1,
  children
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sparksRef = useRef<Spark[]>([]);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let resizeTimeout: ReturnType<typeof setTimeout>;

    const resizeCanvas = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    };

    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(resizeCanvas, 100);
    };

    window.addEventListener("resize", handleResize);
    resizeCanvas();

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimeout);
    };
  }, []);

  const easeFunc = useCallback(
    (t: number) => {
      switch (easing) {
        case "linear":
          return t;
        case "ease-in":
          return t * t;
        case "ease-in-out":
          return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        default:
          return t * (2 - t);
      }
    },
    [easing]
  );

  const draw = useCallback(
    (timestamp: number) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) {
        rafRef.current = null;
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      sparksRef.current = sparksRef.current.filter((spark) => {
        const elapsed = timestamp - spark.startTime;
        if (elapsed >= duration) return false;

        const eased = easeFunc(elapsed / duration);
        const distance = eased * sparkRadius * extraScale;
        const lineLength = sparkSize * (1 - eased);

        const x1 = spark.x + distance * Math.cos(spark.angle);
        const y1 = spark.y + distance * Math.sin(spark.angle);
        const x2 = spark.x + (distance + lineLength) * Math.cos(spark.angle);
        const y2 = spark.y + (distance + lineLength) * Math.sin(spark.angle);

        ctx.strokeStyle = sparkColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        return true;
      });

      // eslint-disable-next-line react-hooks/immutability -- self-scheduling rAF loop (upstream)
      rafRef.current = sparksRef.current.length ? requestAnimationFrame(draw) : null;
    },
    [duration, easeFunc, extraScale, sparkColor, sparkRadius, sparkSize]
  );

  useEffect(
    () => () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    },
    []
  );

  const handleClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (!canvasRef.current) return;

    const now = performance.now();
    sparksRef.current.push(
      ...Array.from({ length: sparkCount }, (_, i) => ({
        x: e.clientX,
        y: e.clientY,
        angle: (2 * Math.PI * i) / sparkCount,
        startTime: now
      }))
    );

    if (rafRef.current == null) rafRef.current = requestAnimationFrame(draw);
  };

  return (
    <div style={{ display: "contents" }} onClick={handleClick}>
      <canvas ref={canvasRef} aria-hidden className="pointer-events-none fixed inset-0 z-[60]" />
      {children}
    </div>
  );
};

export default ClickSpark;
