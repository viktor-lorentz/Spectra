import { ArchiveIcon, HelpIcon, MoonIcon, StatsIcon, SunIcon } from "./icons";

interface Props {
  onHowTo: () => void;
  onStats: () => void;
  onArchive: () => void;
  dark: boolean;
  onToggleTheme: () => void;
}

export default function Header({ onHowTo, onStats, onArchive, dark, onToggleTheme }: Props) {
  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-bg/80 backdrop-blur">
      <div className="mx-auto flex max-w-xl items-center justify-between gap-2 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span
            className="h-6 w-6 rounded-md spectrum-rail shadow-[0_0_0_1px_rgb(var(--border))]"
            aria-hidden
          />
          <h1 className="font-display text-xl font-extrabold tracking-tight spectrum-text">
            Spectra
          </h1>
        </div>
        <nav className="flex items-center gap-0.5">
          <button className="icon-btn" onClick={onArchive} aria-label="Archive">
            <ArchiveIcon />
          </button>
          <button className="icon-btn" onClick={onStats} aria-label="Statistics">
            <StatsIcon />
          </button>
          <button className="icon-btn" onClick={onHowTo} aria-label="How to play">
            <HelpIcon />
          </button>
          <button
            className="icon-btn"
            onClick={onToggleTheme}
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {dark ? <SunIcon /> : <MoonIcon />}
          </button>
        </nav>
      </div>
    </header>
  );
}
