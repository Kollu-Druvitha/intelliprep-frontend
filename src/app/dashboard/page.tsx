"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

interface User {
  id: string;
  name: string;
  email: string;
  githubUsername?: string;
}

interface Stats {
  totalSolved: number;
  byDifficulty: { _id: string; count: number }[];
}

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
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">
          Welcome back, {user?.name}
        </h1>
        <p className="text-gray-500">{user?.email}</p>
      </header>

      <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Problems Solved</p>
          <p className="mt-1 text-3xl font-semibold text-gray-900">
            {stats?.totalSolved ?? 0}
          </p>
        </div>

        {stats?.byDifficulty.map((d) => (
          <div
            key={d._id}
            className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
          >
            <p className="text-sm text-gray-500">{d._id}</p>
            <p className="mt-1 text-3xl font-semibold text-gray-900">{d.count}</p>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/resume"
          className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition hover:border-blue-400"
        >
          <h3 className="font-medium text-gray-900">Resume Analyzer</h3>
          <p className="mt-1 text-sm text-gray-500">Check your resume against a job description</p>
        </Link>

        <Link
          href="/mentor"
          className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition hover:border-blue-400"
        >
          <h3 className="font-medium text-gray-900">AI Mentor</h3>
          <p className="mt-1 text-sm text-gray-500">Get feedback on your code</p>
        </Link>

        <Link
          href="/mock-interview"
          className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition hover:border-blue-400"
        >
          <h3 className="font-medium text-gray-900">Mock Interview</h3>
          <p className="mt-1 text-sm text-gray-500">Practice with an AI interviewer</p>
        </Link>

        <Link
          href="/roadmap"
          className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition hover:border-blue-400"
        >
          <h3 className="font-medium text-gray-900">Your Roadmap</h3>
          <p className="mt-1 text-sm text-gray-500">See your personalized study plan</p>
        </Link>
      </section>
    </div>
  );
}