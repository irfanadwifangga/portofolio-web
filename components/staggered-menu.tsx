// Vendored from React Bits — https://reactbits.dev/components/staggered-menu
// Variant: TS + Tailwind. Changed from upstream, deliberately:
//
//  1. "use client" directive (Next App Router).
//  2. `isFixed` made optional. Upstream declares it `isFixed: boolean` (no `?`)
//     while giving it a default, so every consumer is forced to pass it.
//  3. BUG FIX: with isFixed the outer .sm-scope is a full-viewport fixed div
//     with default pointer-events, so it swallowed every click on the page
//     underneath it. It is now pointer-events-none (the header and panel
//     already re-enable pointer events on themselves).
//  4. `logo` ReactNode prop replaces the hard-coded <img>. This site's mark is
//     text, not an image file.
//  5. Menu items close the panel on click. Upstream only closes on click-away,
//     so an in-page anchor would navigate with the panel left open.
//  6. Restyled for this site: dark surface tokens instead of the hard-coded
//     white panel / black text, a 56px header bar instead of `p-2em`, and a
//     2.4rem item size instead of 4rem (6 items at 4rem overflow a 420px panel).
//  7. `headerActions` slot, rendered left of the Menu toggle (the theme
//     toggle). It is hidden and `inert` while the panel is open, because the
//     panel covers the right of the header and the Menu toggle travels across.
//  8. `labels` prop for every built-in string (toggle text, aria labels, the
//     socials heading), so the menu can render in another language.
"use client";

import React, { useCallback, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";

export interface StaggeredMenuItem {
  label: string;
  ariaLabel: string;
  link: string;
}
export interface StaggeredMenuSocialItem {
  label: string;
  link: string;
}
export interface StaggeredMenuLabels {
  menu: string;
  close: string;
  openAria: string;
  closeAria: string;
  header: string;
  socialsTitle: string;
  socialsAria: string;
}

const DEFAULT_LABELS: StaggeredMenuLabels = {
  menu: "Menu",
  close: "Close",
  openAria: "Open menu",
  closeAria: "Close menu",
  header: "Main navigation header",
  socialsTitle: "Elsewhere",
  socialsAria: "Social links"
};

export interface StaggeredMenuProps {
  position?: "left" | "right";
  labels?: StaggeredMenuLabels;
  colors?: string[];
  items?: StaggeredMenuItem[];
  socialItems?: StaggeredMenuSocialItem[];
  displaySocials?: boolean;
  displayItemNumbering?: boolean;
  className?: string;
  logo?: React.ReactNode;
  headerActions?: React.ReactNode;
  menuButtonColor?: string;
  openMenuButtonColor?: string;
  accentColor?: string;
  isFixed?: boolean;
  changeMenuColorOnOpen?: boolean;
  closeOnClickAway?: boolean;
  onMenuOpen?: () => void;
  onMenuClose?: () => void;
}

export const StaggeredMenu: React.FC<StaggeredMenuProps> = ({
  position = "right",
  labels = DEFAULT_LABELS,
  colors = ["#B497CF", "#5227FF"],
  items = [],
  socialItems = [],
  displaySocials = true,
  displayItemNumbering = true,
  className,
  logo,
  headerActions,
  menuButtonColor = "#fff",
  openMenuButtonColor = "#fff",
  changeMenuColorOnOpen = true,
  accentColor = "#5227FF",
  isFixed = false,
  closeOnClickAway = true,
  onMenuOpen,
  onMenuClose
}: StaggeredMenuProps) => {
  const [open, setOpen] = useState(false);
  const openRef = useRef(false);

  const panelRef = useRef<HTMLDivElement | null>(null);
  const preLayersRef = useRef<HTMLDivElement | null>(null);
  const preLayerElsRef = useRef<HTMLElement[]>([]);

  const plusHRef = useRef<HTMLSpanElement | null>(null);
  const plusVRef = useRef<HTMLSpanElement | null>(null);
  const iconRef = useRef<HTMLSpanElement | null>(null);

  const textInnerRef = useRef<HTMLSpanElement | null>(null);
  const textWrapRef = useRef<HTMLSpanElement | null>(null);
  const [textLines, setTextLines] = useState<string[]>([labels.menu, labels.close]);

  const openTlRef = useRef<gsap.core.Timeline | null>(null);
  const closeTweenRef = useRef<gsap.core.Tween | null>(null);
  const spinTweenRef = useRef<gsap.core.Timeline | null>(null);
  const textCycleAnimRef = useRef<gsap.core.Tween | null>(null);
  const colorTweenRef = useRef<gsap.core.Tween | null>(null);

  const toggleBtnRef = useRef<HTMLButtonElement | null>(null);
  const toggleShiftRef = useRef<HTMLSpanElement | null>(null);
  const scopeRef = useRef<HTMLDivElement | null>(null);
  const busyRef = useRef(false);

  const itemEntranceTweenRef = useRef<gsap.core.Tween | null>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const panel = panelRef.current;
      const preContainer = preLayersRef.current;

      const plusH = plusHRef.current;
      const plusV = plusVRef.current;
      const icon = iconRef.current;
      const textInner = textInnerRef.current;

      if (!panel || !plusH || !plusV || !icon || !textInner) return;

      let preLayers: HTMLElement[] = [];
      if (preContainer) {
        preLayers = Array.from(preContainer.querySelectorAll(".sm-prelayer")) as HTMLElement[];
      }
      preLayerElsRef.current = preLayers;

      const offscreen = position === "left" ? -100 : 100;
      gsap.set([panel, ...preLayers], { xPercent: offscreen, opacity: 1 });
      if (preContainer) {
        gsap.set(preContainer, { xPercent: 0, opacity: 1 });
      }

      gsap.set(plusH, { transformOrigin: "50% 50%", rotate: 0 });
      gsap.set(plusV, { transformOrigin: "50% 50%", rotate: 90 });
      gsap.set(icon, { rotate: 0, transformOrigin: "50% 50%" });

      gsap.set(textInner, { yPercent: 0 });

      if (toggleBtnRef.current) gsap.set(toggleBtnRef.current, { color: menuButtonColor });

      scopeRef.current?.setAttribute("data-ready", "");
    });
    return () => ctx.revert();
  }, [menuButtonColor, position]);

  const buildOpenTimeline = useCallback(() => {
    const panel = panelRef.current;
    const layers = preLayerElsRef.current;
    if (!panel) return null;

    openTlRef.current?.kill();
    if (closeTweenRef.current) {
      closeTweenRef.current.kill();
      closeTweenRef.current = null;
    }
    itemEntranceTweenRef.current?.kill();

    const itemEls = Array.from(panel.querySelectorAll(".sm-panel-itemLabel")) as HTMLElement[];
    const numberEls = Array.from(
      panel.querySelectorAll(".sm-panel-list[data-numbering] .sm-panel-item")
    ) as HTMLElement[];
    const socialTitle = panel.querySelector(".sm-socials-title") as HTMLElement | null;
    const socialLinks = Array.from(panel.querySelectorAll(".sm-socials-link")) as HTMLElement[];

    const offscreen = position === "left" ? -100 : 100;
    const layerStates = layers.map((el) => ({ el, start: offscreen }));
    const panelStart = offscreen;

    if (itemEls.length) gsap.set(itemEls, { yPercent: 140, rotate: 10 });
    if (numberEls.length) gsap.set(numberEls, { "--sm-num-opacity": 0 });
    if (socialTitle) gsap.set(socialTitle, { opacity: 0 });
    if (socialLinks.length) gsap.set(socialLinks, { y: 25, opacity: 0 });

    const tl = gsap.timeline({ paused: true });

    layerStates.forEach((ls, i) => {
      tl.fromTo(
        ls.el,
        { xPercent: ls.start },
        { xPercent: 0, duration: 0.5, ease: "power4.out" },
        i * 0.07
      );
    });

    const lastTime = layerStates.length ? (layerStates.length - 1) * 0.07 : 0;
    const panelInsertTime = lastTime + (layerStates.length ? 0.08 : 0);
    const panelDuration = 0.65;

    tl.fromTo(
      panel,
      { xPercent: panelStart },
      { xPercent: 0, duration: panelDuration, ease: "power4.out" },
      panelInsertTime
    );

    if (itemEls.length) {
      const itemsStartRatio = 0.15;
      const itemsStart = panelInsertTime + panelDuration * itemsStartRatio;

      tl.to(
        itemEls,
        {
          yPercent: 0,
          rotate: 0,
          duration: 1,
          ease: "power4.out",
          stagger: { each: 0.1, from: "start" }
        },
        itemsStart
      );

      if (numberEls.length) {
        tl.to(
          numberEls,
          {
            duration: 0.6,
            ease: "power2.out",
            "--sm-num-opacity": 1,
            stagger: { each: 0.08, from: "start" }
          },
          itemsStart + 0.1
        );
      }
    }

    if (socialTitle || socialLinks.length) {
      const socialsStart = panelInsertTime + panelDuration * 0.4;

      if (socialTitle)
        tl.to(socialTitle, { opacity: 1, duration: 0.5, ease: "power2.out" }, socialsStart);
      if (socialLinks.length) {
        tl.to(
          socialLinks,
          {
            y: 0,
            opacity: 1,
            duration: 0.55,
            ease: "power3.out",
            stagger: { each: 0.08, from: "start" },
            onComplete: () => {
              gsap.set(socialLinks, { clearProps: "opacity" });
            }
          },
          socialsStart + 0.04
        );
      }
    }

    openTlRef.current = tl;
    return tl;
  }, [position]);

  const playOpen = useCallback(() => {
    if (busyRef.current) return;
    busyRef.current = true;
    const tl = buildOpenTimeline();
    if (tl) {
      tl.eventCallback("onComplete", () => {
        busyRef.current = false;
      });
      tl.play(0);
    } else {
      busyRef.current = false;
    }
  }, [buildOpenTimeline]);

  const playClose = useCallback(() => {
    openTlRef.current?.kill();
    openTlRef.current = null;
    itemEntranceTweenRef.current?.kill();

    const panel = panelRef.current;
    const layers = preLayerElsRef.current;
    if (!panel) return;

    const all: HTMLElement[] = [...layers, panel];
    closeTweenRef.current?.kill();

    const offscreen = position === "left" ? -100 : 100;

    closeTweenRef.current = gsap.to(all, {
      xPercent: offscreen,
      duration: 0.32,
      ease: "power3.in",
      overwrite: "auto",
      onComplete: () => {
        const itemEls = Array.from(panel.querySelectorAll(".sm-panel-itemLabel")) as HTMLElement[];
        if (itemEls.length) gsap.set(itemEls, { yPercent: 140, rotate: 10 });

        const numberEls = Array.from(
          panel.querySelectorAll(".sm-panel-list[data-numbering] .sm-panel-item")
        ) as HTMLElement[];
        if (numberEls.length) gsap.set(numberEls, { "--sm-num-opacity": 0 });

        const socialTitle = panel.querySelector(".sm-socials-title") as HTMLElement | null;
        const socialLinks = Array.from(panel.querySelectorAll(".sm-socials-link")) as HTMLElement[];
        if (socialTitle) gsap.set(socialTitle, { opacity: 0 });
        if (socialLinks.length) gsap.set(socialLinks, { y: 25, opacity: 0 });

        busyRef.current = false;
      }
    });
  }, [position]);

  const animateIcon = useCallback((opening: boolean) => {
    const icon = iconRef.current;
    const h = plusHRef.current;
    const v = plusVRef.current;
    if (!icon || !h || !v) return;

    spinTweenRef.current?.kill();

    if (opening) {
      gsap.set(icon, { rotate: 0, transformOrigin: "50% 50%" });
      spinTweenRef.current = gsap
        .timeline({ defaults: { ease: "power4.out" } })
        .to(h, { rotate: 45, duration: 0.5 }, 0)
        .to(v, { rotate: -45, duration: 0.5 }, 0);
    } else {
      spinTweenRef.current = gsap
        .timeline({ defaults: { ease: "power3.inOut" } })
        .to(h, { rotate: 0, duration: 0.35 }, 0)
        .to(v, { rotate: 90, duration: 0.35 }, 0)
        .to(icon, { rotate: 0, duration: 0.001 }, 0);
    }
  }, []);

  const animateColor = useCallback(
    (opening: boolean) => {
      const btn = toggleBtnRef.current;
      if (!btn) return;
      colorTweenRef.current?.kill();
      if (changeMenuColorOnOpen) {
        const targetColor = opening ? openMenuButtonColor : menuButtonColor;
        colorTweenRef.current = gsap.to(btn, {
          color: targetColor,
          delay: 0.18,
          duration: 0.3,
          ease: "power2.out"
        });
      } else {
        gsap.set(btn, { color: menuButtonColor });
      }
    },
    [openMenuButtonColor, menuButtonColor, changeMenuColorOnOpen]
  );

  React.useEffect(() => {
    if (toggleBtnRef.current) {
      if (changeMenuColorOnOpen) {
        const targetColor = openRef.current ? openMenuButtonColor : menuButtonColor;
        gsap.set(toggleBtnRef.current, { color: targetColor });
      } else {
        gsap.set(toggleBtnRef.current, { color: menuButtonColor });
      }
    }
  }, [changeMenuColorOnOpen, menuButtonColor, openMenuButtonColor]);

  const animateText = useCallback((opening: boolean) => {
    const inner = textInnerRef.current;
    if (!inner) return;

    textCycleAnimRef.current?.kill();

    const currentLabel = opening ? labels.menu : labels.close;
    const targetLabel = opening ? labels.close : labels.menu;
    const cycles = 3;

    const seq: string[] = [currentLabel];
    let last = currentLabel;
    for (let i = 0; i < cycles; i++) {
      last = last === labels.menu ? labels.close : labels.menu;
      seq.push(last);
    }
    if (last !== targetLabel) seq.push(targetLabel);
    seq.push(targetLabel);

    setTextLines(seq);
    gsap.set(inner, { yPercent: 0 });

    const lineCount = seq.length;
    const finalShift = ((lineCount - 1) / lineCount) * 100;

    textCycleAnimRef.current = gsap.to(inner, {
      yPercent: -finalShift,
      duration: 0.5 + lineCount * 0.07,
      ease: "power4.out"
    });
  }, [labels.menu, labels.close]);

  const toggleMenu = useCallback(() => {
    const target = !openRef.current;
    openRef.current = target;
    setOpen(target);

    if (target) {
      onMenuOpen?.();
      playOpen();
    } else {
      onMenuClose?.();
      playClose();
    }

    animateIcon(target);
    animateColor(target);
    animateText(target);
  }, [playOpen, playClose, animateIcon, animateColor, animateText, onMenuOpen, onMenuClose]);

  const closeMenu = useCallback(() => {
    if (openRef.current) {
      openRef.current = false;
      setOpen(false);
      onMenuClose?.();
      playClose();
      animateIcon(false);
      animateColor(false);
      animateText(false);
    }
  }, [playClose, animateIcon, animateColor, animateText, onMenuClose]);

  /* How far the toggle must travel to sit on the panel's inner right edge.
     Computed in JS rather than as a CSS calc: a `max()` mixing vw, rem and px
     does not resolve to a used value for `transform` in every engine. */
  React.useEffect(() => {
    const el = toggleShiftRef.current;
    if (!el) return;
    const apply = () => {
      const contentGutter = Math.max(0, (window.innerWidth - 1152) / 2);
      const distance = window.innerWidth <= 640 ? 0 : Math.max(0, contentGutter - 8);
      el.style.setProperty("--sm-toggle-shift", `${distance}px`);
    };
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, []);

  React.useEffect(() => {
    if (!closeOnClickAway || !open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        toggleBtnRef.current &&
        !toggleBtnRef.current.contains(event.target as Node)
      ) {
        closeMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [closeOnClickAway, open, closeMenu]);

  // Escape closes the panel — it is a modal-ish overlay and the only other way
  // out is finding the toggle again.
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closeMenu]);

  return (
    <div
      ref={scopeRef}
      className={`sm-scope pointer-events-none z-40 ${
        isFixed ? "fixed top-0 left-0 h-screen w-screen overflow-hidden" : "h-full w-full"
      }`}>
      <div
        className={
          (className ? className + " " : "") +
          "staggered-menu-wrapper pointer-events-none relative z-40 h-full w-full"
        }
        style={accentColor ? ({ "--sm-accent": accentColor } as React.CSSProperties) : undefined}
        data-position={position}
        data-open={open || undefined}>
        <div
          ref={preLayersRef}
          className="sm-prelayers pointer-events-none absolute top-0 right-0 bottom-0 z-[5]"
          aria-hidden="true">
          {(() => {
            const raw = colors && colors.length ? colors.slice(0, 4) : ["#1e1e22", "#35353c"];
            const arr = [...raw];
            if (arr.length >= 3) {
              const mid = Math.floor(arr.length / 2);
              arr.splice(mid, 1);
            }
            return arr.map((c, i) => (
              <div
                key={i}
                className="sm-prelayer absolute top-0 right-0 h-full w-full"
                style={{ background: c }}
              />
            ));
          })()}
        </div>

        <header
          className="staggered-menu-header pointer-events-none absolute top-0 left-0 z-20 w-full"
          aria-label={labels.header}>
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
            <div className="sm-logo pointer-events-auto flex items-center select-none">{logo}</div>

            <div className="flex items-center gap-4">
              {headerActions ? (
                <div className="sm-header-actions pointer-events-auto inline-flex items-center" inert={open}>
                  {headerActions}
                </div>
              ) : null}
            <span ref={toggleShiftRef} className="sm-toggle-shift pointer-events-auto inline-flex">
              <button
                ref={toggleBtnRef}
                className="sm-toggle pointer-events-auto relative -m-2.5 inline-flex cursor-pointer items-center gap-[0.4rem] overflow-visible border-0 bg-transparent p-2.5 font-mono text-sm leading-none font-medium transition-[scale] duration-150 ease-out active:scale-[0.96]"
                aria-label={open ? labels.closeAria : labels.openAria}
                aria-expanded={open}
                aria-controls="staggered-menu-panel"
                onClick={toggleMenu}
                type="button">
                <span
                  ref={textWrapRef}
                  className="sm-toggle-textWrap relative inline-block h-[1em] overflow-hidden whitespace-nowrap"
                  aria-hidden="true">
                  <span
                    ref={textInnerRef}
                    className="sm-toggle-textInner flex flex-col leading-none">
                    {textLines.map((l, i) => (
                      <span className="sm-toggle-line block h-[1em] leading-none" key={i}>
                        {l}
                      </span>
                    ))}
                  </span>
                </span>

                <span
                  ref={iconRef}
                  className="sm-icon relative inline-flex h-[14px] w-[14px] shrink-0 items-center justify-center [will-change:transform]"
                  aria-hidden="true">
                  <span
                    ref={plusHRef}
                    className="sm-icon-line absolute top-1/2 left-1/2 h-[2px] w-full -translate-x-1/2 -translate-y-1/2 rounded-[2px] bg-current [will-change:transform]"
                  />
                  <span
                    ref={plusVRef}
                    className="sm-icon-line sm-icon-line-v absolute top-1/2 left-1/2 h-[2px] w-full -translate-x-1/2 -translate-y-1/2 rounded-[2px] bg-current [will-change:transform]"
                  />
                </span>
              </button>
            </span>
            </div>
          </div>
        </header>

        <aside
          id="staggered-menu-panel"
          ref={panelRef}
          className="staggered-menu-panel scrollbar-thin pointer-events-auto absolute top-0 right-0 z-10 flex h-full flex-col overflow-y-auto"
          aria-hidden={!open}>
          <div className="sm-panel-inner flex flex-1 flex-col gap-5">
            <ul
              className="sm-panel-list m-0 flex list-none flex-col gap-2 p-0"
              role="list"
              data-numbering={displayItemNumbering || undefined}>
              {items && items.length ? (
                items.map((it, idx) => (
                  <li
                    className="sm-panel-itemWrap relative overflow-hidden leading-none"
                    key={it.label + idx}>
                    <a
                      className="sm-panel-item relative inline-block cursor-pointer leading-none no-underline"
                      href={it.link}
                      aria-label={it.ariaLabel}
                      data-index={idx + 1}
                      onClick={closeMenu}>
                      <span className="sm-panel-itemLabel inline-block will-change-transform [transform-origin:50%_100%]">
                        {it.label}
                      </span>
                    </a>
                  </li>
                ))
              ) : (
                <li
                  className="sm-panel-itemWrap relative overflow-hidden leading-none"
                  aria-hidden="true">
                  <span className="sm-panel-item relative inline-block cursor-pointer leading-none no-underline">
                    <span className="sm-panel-itemLabel inline-block will-change-transform [transform-origin:50%_100%]">
                      No items
                    </span>
                  </span>
                </li>
              )}
            </ul>

            {displaySocials && socialItems && socialItems.length > 0 && (
              <div
                className="sm-socials mt-auto flex flex-col gap-3 pt-8"
                aria-label={labels.socialsAria}>
                <h3 className="sm-socials-title m-0 text-base font-medium">{labels.socialsTitle}</h3>
                <ul
                  className="sm-socials-list m-0 flex list-none flex-row flex-wrap items-center gap-4 p-0"
                  role="list">
                  {socialItems.map((s, i) => (
                    <li key={s.label + i} className="sm-socials-item">
                      <a
                        href={s.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="sm-socials-link relative inline-block py-[2px] no-underline">
                        {s.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </aside>
      </div>

      <style>{`
.sm-scope:not([data-ready]) .staggered-menu-panel,
.sm-scope:not([data-ready]) .sm-prelayer { visibility: hidden; }
.sm-scope .staggered-menu-wrapper { position: relative; width: 100%; height: 100%; z-index: 40; pointer-events: none; }
.sm-scope .staggered-menu-header > * { pointer-events: auto; }
.sm-scope .sm-logo { display: flex; align-items: center; user-select: none; }
.sm-scope .sm-toggle { position: relative; display: inline-flex; align-items: center; gap: 0.4rem; background: transparent; border: none; cursor: pointer; font-weight: 500; line-height: 1; overflow: visible; }
/* The travel transform lives on this wrapper, not the button: gsap writes an
   inline transform on the button while tweening its colour, which would
   override any transform set from CSS. */
.sm-scope .sm-toggle-shift { transition: transform 0.5s cubic-bezier(0.2, 0, 0, 1); }
/* When the panel is open the toggle has to travel with it, otherwise it is
   left stranded in the content column while the panel covers the right edge.
   72rem is the max-w-6xl header row; 8px reconciles the row's px-6 with the
   panel's 2rem padding so the button lands on the panel's inner right edge. */
.sm-scope [data-open] .sm-toggle-shift { transform: translateX(var(--sm-toggle-shift, 0px)); }
/* Header actions step aside while the panel is open. Visibility is delayed on
   the way out so the fade is seen, and applied at once on the way back. */
.sm-scope .sm-header-actions { transition: opacity 0.2s ease, visibility 0s linear 0s; }
.sm-scope [data-open] .sm-header-actions { opacity: 0; visibility: hidden; transition: opacity 0.2s ease, visibility 0s linear 0.2s; }

.sm-scope .sm-toggle:focus-visible { outline: 2px solid var(--accent); outline-offset: 4px; border-radius: 4px; }
.sm-scope .sm-toggle-textWrap { position: relative; margin-right: 0.15em; display: inline-block; height: 1em; overflow: hidden; white-space: nowrap; }
.sm-scope .sm-toggle-textInner { display: flex; flex-direction: column; line-height: 1; }
.sm-scope .sm-toggle-line { display: block; height: 1em; line-height: 1; }
.sm-scope .sm-icon { position: relative; width: 14px; height: 14px; flex: 0 0 14px; display: inline-flex; align-items: center; justify-content: center; will-change: transform; }
.sm-scope .sm-panel-itemWrap { position: relative; overflow: hidden; line-height: 1; }
.sm-scope .sm-icon-line { position: absolute; left: 50%; top: 50%; width: 100%; height: 2px; background: currentColor; border-radius: 2px; transform: translate(-50%, -50%); will-change: transform; }
.sm-scope .staggered-menu-panel { position: absolute; top: 0; right: 0; width: clamp(280px, 38vw, 420px); height: 100%; background: var(--surface); border-left: 1px solid var(--border); display: flex; flex-direction: column; padding: 6rem 2rem 2rem 2rem; overflow-y: auto; z-index: 10; }
.sm-scope [data-position='left'] .staggered-menu-panel { right: auto; left: 0; border-left: none; border-right: 1px solid var(--border); }
.sm-scope .sm-prelayers { position: absolute; top: 0; right: 0; bottom: 0; width: clamp(280px, 38vw, 420px); pointer-events: none; z-index: 5; }
.sm-scope [data-position='left'] .sm-prelayers { right: auto; left: 0; }
.sm-scope .sm-prelayer { position: absolute; top: 0; right: 0; height: 100%; width: 100%; }
.sm-scope .sm-panel-inner { flex: 1; display: flex; flex-direction: column; gap: 1.25rem; }
.sm-scope .sm-socials { margin-top: auto; padding-top: 2rem; display: flex; flex-direction: column; gap: 0.75rem; }
.sm-scope .sm-socials-title { margin: 0; font-size: 0.8125rem; font-weight: 500; font-family: var(--font-mono); text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted-2); }
.sm-scope .sm-socials-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: row; align-items: center; gap: 1rem; flex-wrap: wrap; }
.sm-scope .sm-socials-list .sm-socials-link { opacity: 1; transition: opacity 0.3s ease; }
.sm-scope .sm-socials-list:hover .sm-socials-link:not(:hover) { opacity: 0.35; }
.sm-scope .sm-socials-list:focus-within .sm-socials-link:not(:focus-visible) { opacity: 0.35; }
.sm-scope .sm-socials-list .sm-socials-link:hover,
.sm-scope .sm-socials-list .sm-socials-link:focus-visible { opacity: 1; }
.sm-scope .sm-socials-link:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; border-radius: 3px; }
.sm-scope .sm-socials-link { font-family: var(--font-mono); font-size: 0.9375rem; font-weight: 500; color: var(--muted); text-decoration: none; position: relative; padding: 0.6rem 0; display: inline-flex; align-items: center; min-height: 44px; transition: color 0.3s ease, opacity 0.3s ease; }
.sm-scope .sm-socials-link:hover { color: var(--sm-accent, var(--accent)); }
.sm-scope .sm-panel-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.5rem; }
.sm-scope .sm-panel-item { position: relative; color: var(--foreground); font-weight: 600; font-size: 2.4rem; cursor: pointer; line-height: 1; letter-spacing: -1px; text-transform: uppercase; transition: color 0.25s; display: inline-block; text-decoration: none; padding-right: 1.6em; }
.sm-scope .sm-panel-item:focus-visible { outline: 2px solid var(--accent); outline-offset: 4px; border-radius: 4px; }
.sm-scope .sm-panel-itemLabel { display: inline-block; will-change: transform; transform-origin: 50% 100%; }
.sm-scope .sm-panel-item:hover { color: var(--sm-accent, var(--accent)); }
.sm-scope .sm-panel-list[data-numbering] { counter-reset: smItem -1; }
.sm-scope .sm-panel-list[data-numbering] .sm-panel-item::after { counter-increment: smItem; content: counter(smItem, decimal-leading-zero); position: absolute; top: 0.35em; right: 0.2em; font-family: var(--font-mono); font-size: 0.8125rem; font-weight: 400; color: var(--sm-accent, var(--accent)); letter-spacing: 0; pointer-events: none; user-select: none; opacity: var(--sm-num-opacity, 0); }
@media (max-width: 640px) { .sm-scope .staggered-menu-panel { width: 100%; left: 0; right: 0; border-left: none; } .sm-scope .sm-prelayers { width: 100%; left: 0; right: 0; } .sm-scope .sm-panel-item { font-size: 2rem; } }
      `}</style>
    </div>
  );
};

export default StaggeredMenu;
