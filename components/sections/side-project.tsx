import { existsSync } from "node:fs";
import { join } from "node:path";
import Image from "next/image";
import { SectionEntrance } from "@/components/section-entrance";
import { Reveal } from "@/components/reveal";
import { TechIcon } from "@/components/tech-icon";
import { DeepDiveCard } from "@/components/deep-dive-card";
import { sideProject } from "@/lib/content";
import { getDictionary } from "@/lib/i18n";
import { formatPeriod } from "@/lib/i18n/format";
import { fill, type Locale } from "@/lib/i18n/locales";
import { resolveDeepDive } from "@/lib/i18n/resolve";

/** Arrow-up-right, matching the external links in the contact section. */
function ExternalArrow() {
  return (
    <svg
      width={13}
      height={13}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="shrink-0 opacity-60 transition-[opacity,transform] duration-150 ease-out group-hover:translate-x-px group-hover:-translate-y-px group-hover:opacity-100">
      <path d="M7 17 17 7M8 7h9v9" />
    </svg>
  );
}

/**
 * Work done on my own time.
 *
 * Kept out of "Currently building" on purpose: that section states three
 * production systems for real clients, and folding a personal tool into its
 * card stack would make the sentence above it untrue.
 *
 * The screenshot is optional. Its presence is checked when the page renders,
 * which for this statically prerendered page means once, at build time.
 * Without it the copy takes the width instead of framing a broken image.
 */
export function SideProject({ locale }: { locale: Locale }) {
  const dictionary = getDictionary(locale);
  const t = dictionary.sideProject;
  const p = sideProject;
  const hasImage = existsSync(join(process.cwd(), "public", p.image));

  return (
    <section id="side-project" className="border-t border-border">
      <SectionEntrance index="03" title={t.title} description={t.description} />

      <div className="mx-auto max-w-6xl px-6 pb-24">
        <Reveal>
          {/* Top-aligned, not centred: the copy column runs about twice the
              height of the screenshot, and centring left the image floating
              ~150px below the project name it belongs to. */}
          <div
            className={
              hasImage
                ? "grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-start"
                : "max-w-3xl"
            }>
            {hasImage ? (
              <div className="min-w-0 overflow-hidden rounded-xl border border-border bg-surface shadow-2xl shadow-shadow/40">
                <div className="relative aspect-[1920/1032]">
                  <Image
                    src={p.image}
                    alt={fill(t.imageAlt, { name: p.name })}
                    fill
                    sizes="(min-width: 1152px) 620px, (min-width: 1024px) 55vw, 100vw"
                    className="object-cover object-top"
                  />
                </div>
              </div>
            ) : null}

            <div className="min-w-0">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="font-mono text-base font-medium">{p.name}</h3>
                <span className="font-mono text-xs text-muted-2">{formatPeriod(p.period, locale)}</span>
              </div>
              <p className="mt-2 text-sm text-accent">{p.tagline[locale]}</p>

              <p className="mt-5 text-sm leading-relaxed text-muted">{p.summary[locale]}</p>

              <ul className="mt-5 space-y-2">
                {p.highlights[locale].map((h) => (
                  <li key={h} className="flex gap-2 text-sm leading-relaxed text-foreground/85">
                    <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-accent" />
                    {h}
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex flex-wrap items-center gap-2">
                {p.stack.map((s) => (
                  <TechIcon key={s} label={s} />
                ))}
              </div>

              <a
                href={p.repo}
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-6 inline-flex min-h-11 items-center gap-2 rounded-md border border-border px-4 font-mono text-sm text-foreground transition-colors duration-150 ease-out hover:border-accent focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none">
                {t.viewSource}
                <ExternalArrow />
                <span className="sr-only">{dictionary.common.newTab}</span>
              </a>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.06}>
          <dl className="mt-12 grid grid-cols-2 gap-6 border-y border-border py-7 sm:grid-cols-4">
            {p.facts.map((f) => (
              <div key={f.label.en} className="flex flex-col-reverse gap-1">
                <dt className="font-mono text-xs text-muted-2">{f.label[locale]}</dt>
                <dd className="font-mono text-2xl font-medium tracking-tight text-foreground">
                  {f.value}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {p.dives.map((d, i) => (
            <Reveal key={d.title.en} delay={0.1 + i * 0.06}>
              <DeepDiveCard dive={resolveDeepDive(d, locale)} showProject={false} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
