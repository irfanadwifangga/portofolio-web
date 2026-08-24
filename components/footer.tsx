export function Footer() {
  return (
    <footer className="border-t border-border py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 font-mono text-xs text-muted-2 sm:flex-row">
        <span>© {new Date().getFullYear()} Irfana Dwi Fangga</span>
        <span>Built with Next.js, Tailwind CSS &amp; Motion</span>
      </div>
    </footer>
  );
}
