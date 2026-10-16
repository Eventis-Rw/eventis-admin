import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Topbar({
  title,
  subtitle,
  onMenuClick,
}: {
  title: string;
  subtitle: string;
  onMenuClick?: () => void;
}) {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-zinc-200 bg-white/80 px-4 py-4 backdrop-blur-sm sm:px-6">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          className="flex h-10 w-10 md:hidden"
          onClick={onMenuClick}
          aria-label="Toggle navigation"
        >
          <span className="sr-only">Open menu</span>
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
          </svg>
        </Button>

        <div>
          <p className="text-sm font-medium text-zinc-500">Admin dashboard</p>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">{title}</h1>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-500 md:flex">
          <Search className="h-4 w-4" />
          <span>{subtitle}</span>
        </div>

        <Button variant="outline" size="icon" aria-label="Notifications">
          <Bell className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
