"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import Shell from "@/components/Shell";

interface User {
  id: string;
  name: string;
  email: string;
}

interface Stats {
  totalSolved: number;
  byDifficulty: { _id: string; count: number }[];
}

interface LeetcodeStats {
  username: string;
  ranking: number | null;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
}

type LeetcodeState =
  | { status: "loading" }
  | { status: "not-connected" }
  | { status: "error"; message: string }
  | { status: "ready"; data: LeetcodeStats };

const features = [
  { href: "/resume", label: "Resume Analyzer", description: "Check your resume against a job description" },
  { href: "/mentor", label: "AI Mentor", description: "Get feedback on your code" },
  { href: "/mock-interview", label: "Mock Interview", description: "Practice with an AI interviewer" },
  { href: "/roadmap", label: "Your Roadmap", description: "See your personalized study plan" },
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const [leetcode, setLeetcode] = useState<LeetcodeState>({ status: "loading" });
  const [handle, setHandle] = useState("");
  const [connecting, setConnecting] = useState(false);

  const loadLeetcode = useCallback(async () => {
    setLeetcode({ status: "loading" });

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);

    try {
      const res = await apiFetch("/api/leetcode", { signal: controller.signal });
      const data = await res.json();

      if (res.status === 400) {
        setLeetcode({ status: "not-connected" });
        return;
      }
      if (!res.ok) {
        setLeetcode({
          status: "error",
          message: data.message || "Could not load LeetCode stats",
        });
        return;
      }
      setLeetcode({ status: "ready", data });
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        setLeetcode({
          status: "error",
          message: "LeetCode is taking too long to respond. Check the backend terminal.",
        });
      } else {
        setLeetcode({ status: "error", message: "Could not reach the server." });
      }
    } finally {
      clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login");
      return;
    }

    async function loadDashboard() {
      try {
        const [meRes, statsRes] = await Promise.all([
          apiFetch("/api/auth/me"),
          apiFetch("/api/activities/stats"),
        ]);
        const meData = await meRes.json();
        const statsData = await statsRes.json();
        setUser(meData.user);
        setStats(statsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
    loadLeetcode(); // runs independently so a slow LeetCode call never blocks the page
  }, [router, loadLeetcode]);

  async function connectLeetcode(e: React.FormEvent) {
    e.preventDefault();
    if (!handle.trim()) return;

    setConnecting(true);
    try {
      const res = await apiFetch("/api/users/me", {
        method: "PATCH",
        body: JSON.stringify({ leetcodeUsername: handle.trim() }),
      });

      if (!res.ok) {
        setLeetcode({ status: "error", message: "Could not save your LeetCode username." });
        return;
      }

      await loadLeetcode();
    } finally {
      setConnecting(false);
    }
  }

  if (loading) {
    return (
      <Shell>
        <p className="text-graphite">Loading your dashboard…</p>
      </Shell>
    );
  }

  return (
    <Shell>
      <header className="mb-10">
        <h1 className="font-display text-3xl">Welcome back, {user?.name}</h1>
        <p className="mt-1 text-sm text-graphite">{user?.email}</p>
      </header>

      <section className="mb-12 flex flex-wrap items-baseline gap-x-10 gap-y-4 border-y border-rule py-6">
        <div>
          <p className="font-mono text-4xl">{stats?.totalSolved ?? 0}</p>
          <p className="mt-1 text-sm text-graphite">problems solved</p>
        </div>
        {stats?.byDifficulty.map((d) => (
          <div key={d._id} className="border-l border-rule pl-10">
            <p className="font-mono text-2xl text-graphite">{d.count}</p>
            <p className="mt-1 text-sm text-graphite">{d._id}</p>
          </div>
        ))}
      </section>

      <section className="mb-12">
        <p className="mb-4 text-sm text-graphite">LeetCode</p>

        {leetcode.status === "loading" && (
          <p className="text-sm text-graphite">Fetching your LeetCode stats…</p>
        )}

        {(leetcode.status === "not-connected" || leetcode.status === "error") && (
          <form onSubmit={connectLeetcode} className="max-w-sm">
            {leetcode.status === "error" && (
              <p className="mb-4 border-l-2 border-danger pl-3 text-sm text-danger">
                {leetcode.message}
              </p>
            )}
            <label className="block text-sm text-graphite">LeetCode username</label>
            <input
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              className="mb-4 w-full border-0 border-b border-rule bg-transparent py-2 text-ink outline-none focus:border-signal"
            />
            <button
              type="submit"
              disabled={connecting || !handle.trim()}
              className="bg-ink px-5 py-2 text-sm font-medium text-paper transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {connecting ? "Connecting…" : "Connect"}
            </button>
          </form>
        )}

        {leetcode.status === "ready" && (
          <div className="flex flex-wrap items-baseline gap-x-10 gap-y-4 border-y border-rule py-6">
            <div>
              <p className="font-mono text-4xl">{leetcode.data.totalSolved}</p>
              <p className="mt-1 text-sm text-graphite">
                solved as {leetcode.data.username}
              </p>
            </div>
            <div className="border-l border-rule pl-10">
              <p className="font-mono text-2xl text-graphite">{leetcode.data.easySolved}</p>
              <p className="mt-1 text-sm text-graphite">Easy</p>
            </div>
            <div className="border-l border-rule pl-10">
              <p className="font-mono text-2xl text-graphite">{leetcode.data.mediumSolved}</p>
              <p className="mt-1 text-sm text-graphite">Medium</p>
            </div>
            <div className="border-l border-rule pl-10">
              <p className="font-mono text-2xl text-graphite">{leetcode.data.hardSolved}</p>
              <p className="mt-1 text-sm text-graphite">Hard</p>
            </div>
            <div className="border-l border-rule pl-10">
              <p className="font-mono text-2xl text-graphite">
                {leetcode.data.ranking ? leetcode.data.ranking.toLocaleString() : "n/a"}
              </p>
              <p className="mt-1 text-sm text-graphite">global ranking</p>
            </div>
          </div>
        )}
      </section>

      <section>
        <p className="mb-4 text-sm text-graphite">Continue</p>
        <div className="divide-y divide-rule border-y border-rule">
          {features.map((f) => (
            <Link
              key={f.href}
              href={f.href}
              className="group -ml-4 flex items-baseline gap-4 border-l-2 border-transparent py-4 pl-4 transition-colors hover:border-signal"
            >
              <span className="font-display text-lg group-hover:text-signal">{f.label}</span>
              <span className="text-sm text-graphite">{f.description}</span>
            </Link>
          ))}
        </div>
      </section>
    </Shell>
  );
}