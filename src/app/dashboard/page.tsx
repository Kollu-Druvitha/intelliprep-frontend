"use client";

import { useEffect, useState } from "react";
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
  }, [router]);

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