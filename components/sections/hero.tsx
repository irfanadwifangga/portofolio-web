import DecryptedText from "@/components/decrypted-text";
import { HeroBackdrop } from "@/components/hero-backdrop";
import { CodeEditor } from "@/components/code-editor";
import { Typescript, Java, Python, Go } from "@thesvg/react";

/**
 * Rendered here, in a server component, so the four language marks reach the
 * browser as markup instead of dragging @thesvg/react into the hero's client
 * chunk. Each of those modules carries every variant of its icon.
 */
const LANG_ICONS = {
  typescript: <Typescript width={14} height={14} />,
  java: <Java width={14} height={14} />,
  python: <Python width={14} height={14} />,
  go: <Go width={14} height={14} />
};

export function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-screen items-center overflow-hidden pt-14"
    >
      <HeroBackdrop />

      <div className="relative mx-auto grid w-full max-w-6xl gap-12 px-6 py-20 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <div className="min-w-0">
          <p className="font-mono text-xs tracking-widest text-accent uppercase">
            <DecryptedText
              text="Fullstack Developer"
              animateOn="view"
              sequential
              revealDirection="start"
              speed={38}
              useOriginalCharsOnly={false}
              characters="ABCDEFGHIJKLMNOPQRSTUVWXYZ01<>/_"
              parentClassName="tracking-[0.18em]"
              encryptedClassName="text-muted-2"
            />
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            <DecryptedText
              text="Irfana D. F"
              animateOn="view"
              sequential
              revealDirection="start"
              speed={45}
              useOriginalCharsOnly
              encryptedClassName="text-muted-2"
            />
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-muted">
            <DecryptedText
              text="I build the parts of a product most people never see — payment flows that can't double-charge, real-time bridges that can't drop a message, APIs that hold up under concurrent writes. Currently freelancing across three production systems, backend-first."
              animateOn="view"
              sequential
              revealDirection="start"
              speed={5}
              useOriginalCharsOnly
              encryptedClassName="text-encrypted"
            />
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#deep-dives"
              className="rounded-md border border-transparent bg-foreground px-5 py-2.5 font-mono text-sm font-medium text-background transition-[opacity,transform] duration-150 ease-out hover:opacity-85 active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none"
            >
              <DecryptedText
                text="See the systems"
                animateOn="view"
                sequential
                speed={30}
                useOriginalCharsOnly
                encryptedClassName="text-background/40"
              />
            </a>
            <a
              href="#contact"
              className="rounded-md border border-border bg-background hover:bg-accent-soft/20 px-5 py-2.5 font-mono text-sm text-foreground transition-[border-color,transform] duration-150 ease-out hover:border-accent active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none"
            >
              <DecryptedText
                text="Get in touch"
                animateOn="view"
                sequential
                speed={30}
                useOriginalCharsOnly
                encryptedClassName="text-muted-2"
              />
            </a>
          </div>
          <p className="mt-8 font-mono text-xs text-muted-2">
            <DecryptedText
              text="Bandar Lampung, Indonesia · building since Aug 2023"
              animateOn="view"
              sequential
              revealDirection="start"
              speed={22}
              useOriginalCharsOnly={false}
              characters="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789·"
              encryptedClassName="text-encrypted"
            />
          </p>
        </div>

        <div className="flex min-w-0 justify-center lg:justify-end">
          <CodeEditor langIcons={LANG_ICONS} />
        </div>
      </div>
    </section>
  );
}
