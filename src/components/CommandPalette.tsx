{/*  ===================================THIS FILE WAS AUTO GENERATED=================================== */}


import React from "react";
import { useNavigate } from "react-router-dom";

export interface CommandItem { key: string; label: string; action: () => void }
export interface CommandPaletteHandle { openPalette: () => void }
export interface CommandPaletteProps {
  items?: CommandItem[];
}

const defaultPagesConfig = [
  { key: "overview", label: "Overview", url: "/overview" },

  { key: "ticket", label: "Ticket", url: "/tickets" },
];

const CommandPalette = React.forwardRef<CommandPaletteHandle, CommandPaletteProps>(({ items }, ref) => {
  const navigate = useNavigate();
  // If no items are provided, use defaultPages with navigation actions
  const defaultPages: CommandItem[] = React.useMemo(() =>
    defaultPagesConfig.map(p => ({ ...p, action: () => navigate(p.url) })),
    [navigate]
  );
  const paletteItems = items || defaultPages;

  const [open, setOpen]   = React.useState(false);
  const [query, setQuery] = React.useState("");

  React.useImperativeHandle(ref, () => ({
    openPalette: () => { setOpen(true); setQuery(""); }
  }));

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setOpen(true); setQuery(""); }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const filtered = paletteItems.filter(p => p.label.toLowerCase().includes(query.toLowerCase()));
  if (!open) return null;

  return (
    <div className="cmd-overlay" onClick={() => setOpen(false)}>
      <div
        className="cmd"
        onClick={e => e.stopPropagation()}
        // layout only – all colors come from CSS variables/theme
        style={{ minWidth: 440, maxWidth: 520, width: "100%" }}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
      >
        <input
          autoFocus
          className="cmd-input"
          placeholder="Type to search…"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <div className="cmd-list">
          {filtered.map(p => (
            <button
              key={p.key}
              className="cmd-item"
              onClick={() => { p.action(); setOpen(false); }}
              style={{
                background: 'var(--cmd-input-bg, var(--surface-2, #23232a))',
                color: 'var(--fg, #fff)',
                width: '100%',
                textAlign: 'left',
                padding: '18px 24px',
                fontSize: 16,
                fontWeight: 600,
                borderRadius: 0,
                border: 'none',
                cursor: 'pointer',
                borderBottom: '1px solid var(--border, #27272a)',
                transition: 'background 0.18s',
              }}
            >
              {p.label}
            </button>
          ))}
          {!filtered.length && <div className="cmd-empty">No results</div>}
        </div>
        <div className="cmd-help">Press Esc to close • Enter to select</div>
      </div>
    </div>
  );
});

CommandPalette.displayName = "CommandPalette";
export default CommandPalette;
