"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/resume", label: "Resume Analyzer" },
  { href: "/mentor", label: "AI Mentor" },
  { href: "/mock-interview", label: "Mock Interview" },
  { href: "/roadmap", label: "Roadmap" },
];

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-paper text-ink">
      <aside className="w-56 shrink-0 border-r border-rule px-6 py-8">
        <p className="font-display text-xl">IntelliPrep</p>
        <p className="mt-1 mb-8 text-xs text-graphite">interview prep, logged</p>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block border-l-2 py-1.5 pl-3 text-sm transition-colors ${
                  active
                    ? "border-signal font-medium text-ink"
                    : "border-transparent text-graphite hover:border-rule hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 px-10 py-8">{children}</main>
    </div>
  );
}