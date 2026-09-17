// Vendored from React Bits — https://reactbits.dev/backgrounds/faulty-terminal
// Variant: TS + Tailwind. Changed from upstream:
//   1. Transparent canvas. The renderer sets alpha and premultipliedAlpha:
//      false explicitly and clears to transparent, and the shader outputs
//      straight alpha from the glyph intensity instead of an opaque pixel. The
//      page shows through, so the same backdrop works on a light theme.
//   2. `tint` and `brightness` update the existing program's uniforms in place.
//      Upstream lists them as dependencies of the effect that creates the WebGL
//      context, so changing either rebuilt the context, flickered, and replayed
//      the page-load animation — which would happen on every theme switch.
//   3. The shaders are compiled and linked in the background first
//      (KHR_parallel_shader_compile, polled once per frame), and the scene is
//      only built once that has finished. OGL's Program asks for the link status
//      synchronously, and on a cold mobile load that single call kept the main
//      thread waiting ~2.1 s for the GPU process (measured with a DevTools
//      trace). With the program already in the browser's cache, OGL's own link
//      returns at once.
//   4. Draws at most ~30 frames a second, and not at all while the backdrop is
//      off screen. The glitch drifts slowly (timeScale 0.28), so 30 fps reads
//      the same, and upstream kept rendering a full-viewport shader at the
//      display's refresh rate for as long as the page stayed open.
//   5. Freezes into a still frame where animating it would drag the page down.
//      The shader samples the glyph pattern ten times per pixel; with graphics
//      acceleration off the browser runs it on the CPU, and a desktop measured
//      11 cores busy, 15 fps and a 350 ms input delay. So it draws one frame and
//      stops when the browser renders WebGL in software, when the visitor
//      prefers reduced motion (`pause`), or when frames keep arriving slower
//      than 20 fps while it runs. A frozen backdrop redraws only on resize and
//      on a theme change.
//   6. No crash without WebGL. OGL throws when it cannot get a context, which
//      took the page down with it; the backdrop is simply left out instead.
import { Renderer, Program, Mesh, Color, Triangle } from "ogl";
import React, { useEffect, useRef, useMemo, useCallback } from "react";

type Vec2 = [number, number];

/** Deviation 4: ~30 fps, with a little slack so a 60 Hz display hits every other frame. */
const FRAME_INTERVAL_MS = 1000 / 30 - 2;

/** Deviation 5: a median gap between frames above this means the device can't keep up. */
const SLOW_FRAME_MS = 50;
/** Frames per slow-frame check. */
const SLOW_WINDOW = 24;
/** Frames drawn in the first moments after start are ignored: they share the load. */
const SLOW_GRACE_MS = 1000;

/**
 * Deviation 5: whether WebGL runs on the CPU (SwiftShader, llvmpipe and the
 * like), as it does when a visitor turns off graphics acceleration. A context
 * that refuses a major performance caveat is the browser's own answer; the
 * renderer string backs it up where that check is not honoured.
 */
function rendersInSoftware(gl: WebGLRenderingContext | WebGL2RenderingContext): boolean {
  const probe = document.createElement("canvas").getContext("webgl", { failIfMajorPerformanceCaveat: true });
  if (!probe) return true;
  probe.getExtension("WEBGL_lose_context")?.loseContext();
  const debug = gl.getExtension("WEBGL_debug_renderer_info");
  const name = debug ? String(gl.getParameter(debug.UNMASKED_RENDERER_WEBGL)) : "";
  return /swiftshader|llvmpipe|softpipe|software|basic render/i.test(name);
}

/**
 * Compiles and links a shader pair without blocking the main thread, then
 * discards the result: its only purpose is to fill the browser's program cache
 * before OGL links the same sources synchronously. Resolves straight away when
 * the extension is unavailable, which is exactly the old behaviour.
 */
function compileInBackground(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  vertex: string,
  fragment: string,
  isCancelled: () => boolean
): Promise<void> {
  const ext = gl.getExtension("KHR_parallel_shader_compile");
  const vs = gl.createShader(gl.VERTEX_SHADER);
  const fs = gl.createShader(gl.FRAGMENT_SHADER);
  const program = gl.createProgram();
  if (!ext || !vs || !fs || !program) return Promise.resolve();

  gl.shaderSource(vs, vertex);
  gl.compileShader(vs);
  gl.shaderSource(fs, fragment);
  gl.compileShader(fs);
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);

  return new Promise((resolve) => {
    const poll = () => {
      if (!isCancelled() && !gl.getProgramParameter(program, ext.COMPLETION_STATUS_KHR)) {
        requestAnimationFrame(poll);
        return;
      }
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      resolve();
    };
    requestAnimationFrame(poll);
  });
}

export interface FaultyTerminalProps extends React.HTMLAttributes<HTMLDivElement> {
  scale?: number;
  gridMul?: Vec2;
  digitSize?: number;
  timeScale?: number;
  pause?: boolean;
  scanlineIntensity?: number;
  glitchAmount?: number;
  flickerAmount?: number;
  noiseAmp?: number;
  chromaticAberration?: number;
  dither?: number | boolean;
  curvature?: number;
  tint?: string;
  mouseReact?: boolean;
  mouseStrength?: number;
  dpr?: number;
  pageLoadAnimation?: boolean;
  brightness?: number;
}

const vertexShader = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragmentShader = `
precision mediump float;

varying vec2 vUv;

uniform float iTime;
uniform vec3  iResolution;
uniform float uScale;

uniform vec2  uGridMul;
uniform float uDigitSize;
uniform float uScanlineIntensity;
uniform float uGlitchAmount;
uniform float uFlickerAmount;
uniform float uNoiseAmp;
uniform float uChromaticAberration;
uniform float uDither;
uniform float uCurvature;
uniform vec3  uTint;
uniform vec2  uMouse;
uniform float uMouseStrength;
uniform float uUseMouse;
uniform float uPageLoadProgress;
uniform float uUsePageLoadAnimation;
uniform float uBrightness;

float time;

float hash21(vec2 p){
  p = fract(p * 234.56);
  p += dot(p, p + 34.56);
  return fract(p.x * p.y);
}

float noise(vec2 p)
{
  return sin(p.x * 10.0) * sin(p.y * (3.0 + sin(time * 0.090909))) + 0.2; 
}

mat2 rotate(float angle)
{
  float c = cos(angle);
  float s = sin(angle);
  return mat2(c, -s, s, c);
}

float fbm(vec2 p)
{
  p *= 1.1;
  float f = 0.0;
  float amp = 0.5 * uNoiseAmp;
  
  mat2 modify0 = rotate(time * 0.02);
  f += amp * noise(p);
  p = modify0 * p * 2.0;
  amp *= 0.454545;
  
  mat2 modify1 = rotate(time * 0.02);
  f += amp * noise(p);
  p = modify1 * p * 2.0;
  amp *= 0.454545;
  
  mat2 modify2 = rotate(time * 0.08);
  f += amp * noise(p);
  
  return f;
}

float pattern(vec2 p, out vec2 q, out vec2 r) {
  vec2 offset1 = vec2(1.0);
  vec2 offset0 = vec2(0.0);
  mat2 rot01 = rotate(0.1 * time);
  mat2 rot1 = rotate(0.1);
  
  q = vec2(fbm(p + offset1), fbm(rot01 * p + offset1));
  r = vec2(fbm(rot1 * q + offset0), fbm(q + offset0));
  return fbm(p + r);
}

float digit(vec2 p){
    vec2 grid = uGridMul * 15.0;
    vec2 s = floor(p * grid) / grid;
    p = p * grid;
    vec2 q, r;
    float intensity = pattern(s * 0.1, q, r) * 1.3 - 0.03;
    
    if(uUseMouse > 0.5){
        vec2 mouseWorld = uMouse * uScale;
        float distToMouse = distance(s, mouseWorld);
        float mouseInfluence = exp(-distToMouse * 8.0) * uMouseStrength * 10.0;
        intensity += mouseInfluence;
        
        float ripple = sin(distToMouse * 20.0 - iTime * 5.0) * 0.1 * mouseInfluence;
        intensity += ripple;
    }
    
    if(uUsePageLoadAnimation > 0.5){
        float cellRandom = fract(sin(dot(s, vec2(12.9898, 78.233))) * 43758.5453);
        float cellDelay = cellRandom * 0.8;
        float cellProgress = clamp((uPageLoadProgress - cellDelay) / 0.2, 0.0, 1.0);
        
        float fadeAlpha = smoothstep(0.0, 1.0, cellProgress);
        intensity *= fadeAlpha;
    }
    
    p = fract(p);
    p *= uDigitSize;
    
    float px5 = p.x * 5.0;
    float py5 = (1.0 - p.y) * 5.0;
    float x = fract(px5);
    float y = fract(py5);
    
    float i = floor(py5) - 2.0;
    float j = floor(px5) - 2.0;
    float n = i * i + j * j;
    float f = n * 0.0625;
    
    float isOn = step(0.1, intensity - f);
    float brightness = isOn * (0.2 + y * 0.8) * (0.75 + x * 0.25);
    
    return step(0.0, p.x) * step(p.x, 1.0) * step(0.0, p.y) * step(p.y, 1.0) * brightness;
}

float onOff(float a, float b, float c)
{
  return step(c, sin(iTime + a * cos(iTime * b))) * uFlickerAmount;
}

float displace(vec2 look)
{
    float y = look.y - mod(iTime * 0.25, 1.0);
    float window = 1.0 / (1.0 + 50.0 * y * y);
    return sin(look.y * 20.0 + iTime) * 0.0125 * onOff(4.0, 2.0, 0.8) * (1.0 + cos(iTime * 60.0)) * window;
}

vec3 getColor(vec2 p){
    
    float bar = step(mod(p.y + time * 20.0, 1.0), 0.2) * 0.4 + 1.0;
    bar *= uScanlineIntensity;
    
    float displacement = displace(p);
    p.x += displacement;

    if (uGlitchAmount != 1.0) {
      float extra = displacement * (uGlitchAmount - 1.0);
      p.x += extra;
    }

    float middle = digit(p);
    
    const float off = 0.002;
    float sum = digit(p + vec2(-off, -off)) + digit(p + vec2(0.0, -off)) + digit(p + vec2(off, -off)) +
                digit(p + vec2(-off, 0.0)) + digit(p + vec2(0.0, 0.0)) + digit(p + vec2(off, 0.0)) +
                digit(p + vec2(-off, off)) + digit(p + vec2(0.0, off)) + digit(p + vec2(off, off));
    
    vec3 baseColor = vec3(0.9) * middle + sum * 0.1 * vec3(1.0) * bar;
    return baseColor;
}

vec2 barrel(vec2 uv){
  vec2 c = uv * 2.0 - 1.0;
  float r2 = dot(c, c);
  c *= 1.0 + uCurvature * r2;
  return c * 0.5 + 0.5;
}

void main() {
    time = iTime * 0.333333;
    vec2 uv = vUv;

    if(uCurvature != 0.0){
      uv = barrel(uv);
    }
    
    vec2 p = uv * uScale;
    vec3 col = getColor(p);

    if(uChromaticAberration != 0.0){
      vec2 ca = vec2(uChromaticAberration) / iResolution.xy;
      col.r = getColor(p + ca).r;
      col.b = getColor(p - ca).b;
    }

    // Alpha comes from the glyph intensity before tinting, so the tint sets
    // the hue alone and the page shows through between glyphs.
    float alpha = clamp(max(col.r, max(col.g, col.b)) * uBrightness, 0.0, 1.0);

    if(uDither > 0.0){
      float rnd = hash21(gl_FragCoord.xy);
      alpha = clamp(alpha + (rnd - 0.5) * (uDither * 0.003922), 0.0, 1.0);
    }

    gl_FragColor = vec4(uTint, alpha);
}
`;

function hexToRgb(hex: string): [number, number, number] {
  let h = hex.replace("#", "").trim();
  if (h.length === 3)
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  const num = parseInt(h.slice(0, 6), 16);
  return [((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255];
}

export default function FaultyTerminal({
  scale = 1,
  gridMul = [2, 1],
  digitSize = 1.5,
  timeScale = 0.3,
  pause = false,
  scanlineIntensity = 0.3,
  glitchAmount = 1,
  flickerAmount = 1,
  noiseAmp = 1,
  chromaticAberration = 0,
  dither = 0,
  curvature = 0.2,
  tint = "#ffffff",
  mouseReact = true,
  mouseStrength = 0.2,
  dpr = Math.min(window.devicePixelRatio || 1, 2),
  pageLoadAnimation = true,
  brightness = 1,
  className,
  style,
  ...rest
}: FaultyTerminalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const programRef = useRef<Program>(null);
  const rendererRef = useRef<Renderer>(null);
  /** Redraws a frozen backdrop; null while it animates, since the loop redraws. */
  const redrawStillRef = useRef<(() => void) | null>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const smoothMouseRef = useRef({ x: 0.5, y: 0.5 });
  const frozenTimeRef = useRef(0);
  const rafRef = useRef<number>(0);
  const loadAnimationStartRef = useRef<number>(0);
  // Upstream React Bits code. The value is a ref initializer, so only the
  // first render's result is ever kept — the impurity is harmless here, and
  // patching it would make re-syncing with upstream harder.
  // eslint-disable-next-line react-hooks/purity
  const timeOffsetRef = useRef<number>(Math.random() * 100);

  const tintVec = useMemo(() => hexToRgb(tint), [tint]);

  const ditherValue = useMemo(
    () => (typeof dither === "boolean" ? (dither ? 1 : 0) : dither),
    [dither]
  );

  // Deviation 2. The context-creating effect below reads these refs instead of
  // depending on tint and brightness; this effect pushes later changes straight
  // into the live program. Declared first, so on mount the refs are set before
  // that effect reads them.
  const tintRef = useRef(tintVec);
  const brightnessRef = useRef(brightness);
  useEffect(() => {
    tintRef.current = tintVec;
    brightnessRef.current = brightness;
    const program = programRef.current;
    if (!program) return;
    program.uniforms.uTint.value = new Color(tintVec[0], tintVec[1], tintVec[2]);
    program.uniforms.uBrightness.value = brightness;
    redrawStillRef.current?.();
  }, [tintVec, brightness]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const ctn = containerRef.current;
    if (!ctn) return;
    const rect = ctn.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = 1 - (e.clientY - rect.top) / rect.height;
    mouseRef.current = { x, y };
  }, []);

  useEffect(() => {
    const ctn = containerRef.current;
    if (!ctn) return;

    // Deviation 6.
    let renderer: Renderer;
    try {
      renderer = new Renderer({ dpr, alpha: true, premultipliedAlpha: false });
    } catch {
      return;
    }
    rendererRef.current = renderer;
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);

    const geometry = new Triangle(gl);

    // Deviation 3: build the scene only once the shaders are ready.
    let cancelled = false;
    let stopScene = () => {};

    const startScene = () => {
      if (cancelled) return;

      const program = new Program(gl, {
        vertex: vertexShader,
        fragment: fragmentShader,
        uniforms: {
          iTime: { value: 0 },
          iResolution: {
            value: new Color(gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height)
          },
          uScale: { value: scale },

          uGridMul: { value: new Float32Array(gridMul) },
          uDigitSize: { value: digitSize },
          uScanlineIntensity: { value: scanlineIntensity },
          uGlitchAmount: { value: glitchAmount },
          uFlickerAmount: { value: flickerAmount },
          uNoiseAmp: { value: noiseAmp },
          uChromaticAberration: { value: chromaticAberration },
          uDither: { value: ditherValue },
          uCurvature: { value: curvature },
          uTint: { value: new Color(tintRef.current[0], tintRef.current[1], tintRef.current[2]) },
          uMouse: {
            value: new Float32Array([smoothMouseRef.current.x, smoothMouseRef.current.y])
          },
          uMouseStrength: { value: mouseStrength },
          uUseMouse: { value: mouseReact ? 1 : 0 },
          uPageLoadProgress: { value: pageLoadAnimation ? 0 : 1 },
          uUsePageLoadAnimation: { value: pageLoadAnimation ? 1 : 0 },
          uBrightness: { value: brightnessRef.current }
        }
      });
      programRef.current = program;

      const mesh = new Mesh(gl, { geometry, program });

      // Deviation 5: a still frame, fully faded in, at the current time.
      let frozen = false;
      const drawStill = () => {
        program.uniforms.uPageLoadProgress.value = 1;
        program.uniforms.iTime.value = frozenTimeRef.current || timeOffsetRef.current * timeScale;
        renderer.render({ scene: mesh });
      };

      function resize() {
        if (!ctn || !renderer) return;
        renderer.setSize(ctn.offsetWidth, ctn.offsetHeight);
        program.uniforms.iResolution.value = new Color(
          gl.canvas.width,
          gl.canvas.height,
          gl.canvas.width / gl.canvas.height
        );
        // Resizing clears the canvas, and a frozen backdrop has no loop to refill it.
        if (frozen) drawStill();
      }

      const resizeObserver = new ResizeObserver(() => resize());
      resizeObserver.observe(ctn);
      resize();

      // Deviation 4: capped frame rate, and no frames while off screen.
      let running = false;
      let lastFrame = -Infinity;
      // Deviation 5: gaps between animation frames, checked in windows.
      let previousTick = 0;
      let watchFrom = 0;
      const gaps: number[] = [];
      const update = (t: number) => {
        if (!running) return;
        if (previousTick > 0 && t >= watchFrom) gaps.push(t - previousTick);
        previousTick = t;
        if (gaps.length >= SLOW_WINDOW) {
          const median = gaps.sort((a, b) => a - b)[SLOW_WINDOW >> 1];
          gaps.length = 0;
          if (median > SLOW_FRAME_MS) {
            freeze();
            return;
          }
        }
        rafRef.current = requestAnimationFrame(update);
        if (t - lastFrame < FRAME_INTERVAL_MS) return;
        lastFrame = t;

        if (pageLoadAnimation && loadAnimationStartRef.current === 0) {
          loadAnimationStartRef.current = t;
        }

        if (!pause) {
          const elapsed = (t * 0.001 + timeOffsetRef.current) * timeScale;
          program.uniforms.iTime.value = elapsed;
          frozenTimeRef.current = elapsed;
        } else {
          program.uniforms.iTime.value = frozenTimeRef.current;
        }

        if (pageLoadAnimation && loadAnimationStartRef.current > 0) {
          const animationDuration = 2000;
          const animationElapsed = t - loadAnimationStartRef.current;
          const progress = Math.min(animationElapsed / animationDuration, 1);
          program.uniforms.uPageLoadProgress.value = progress;
        }

        if (mouseReact) {
          const dampingFactor = 0.08;
          const smoothMouse = smoothMouseRef.current;
          const mouse = mouseRef.current;
          smoothMouse.x += (mouse.x - smoothMouse.x) * dampingFactor;
          smoothMouse.y += (mouse.y - smoothMouse.y) * dampingFactor;

          const mouseUniform = program.uniforms.uMouse.value as Float32Array;
          mouseUniform[0] = smoothMouse.x;
          mouseUniform[1] = smoothMouse.y;
        }

        renderer.render({ scene: mesh });
      };
      const play = () => {
        if (running || frozen) return;
        running = true;
        // A gap spent off screen or in a background tab is not a slow frame.
        previousTick = 0;
        gaps.length = 0;
        watchFrom = performance.now() + SLOW_GRACE_MS;
        rafRef.current = requestAnimationFrame(update);
      };
      const halt = () => {
        running = false;
        cancelAnimationFrame(rafRef.current);
      };
      const freeze = () => {
        frozen = true;
        halt();
        // Marks the still frame for scripts/theme-audit.mjs and DevTools.
        ctn.dataset.frozen = "";
        drawStill();
        redrawStillRef.current = drawStill;
      };
      const visibility = new IntersectionObserver(([entry]) => (entry.isIntersecting ? play() : halt()));
      visibility.observe(ctn);
      ctn.appendChild(gl.canvas);
      if (pause || rendersInSoftware(gl)) freeze();

      if (mouseReact) ctn.addEventListener("mousemove", handleMouseMove);

      stopScene = () => {
        halt();
        redrawStillRef.current = null;
        visibility.disconnect();
        resizeObserver.disconnect();
        if (mouseReact) ctn.removeEventListener("mousemove", handleMouseMove);
        if (gl.canvas.parentElement === ctn) ctn.removeChild(gl.canvas);
      };
    };

    compileInBackground(gl, vertexShader, fragmentShader, () => cancelled).then(startScene);

    return () => {
      cancelled = true;
      stopScene();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      loadAnimationStartRef.current = 0;
      timeOffsetRef.current = Math.random() * 100;
    };
  }, [
    dpr,
    pause,
    timeScale,
    scale,
    gridMul,
    digitSize,
    scanlineIntensity,
    glitchAmount,
    flickerAmount,
    noiseAmp,
    chromaticAberration,
    ditherValue,
    curvature,
    mouseReact,
    mouseStrength,
    pageLoadAnimation,
    handleMouseMove
  ]);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full relative overflow-hidden ${className}`}
      style={style}
      {...rest}
    />
  );
}
