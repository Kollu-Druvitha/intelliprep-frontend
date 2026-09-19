"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";

interface ReviewResult {
  timeComplexity: string;
  spaceComplexity: string;
  issues: string[];
  suggestions: string[];
}

export default function MentorPage() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("Python");
  const [result, setResult] = useState<ReviewResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!code.trim()) {
      setError("Please paste some code to review.");
      return;
    }

    setLoading(true);

    try {
      const res = await apiFetch("/api/mentor/review", {
        method: "POST",
        body: JSON.stringify({ code, language }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Review failed");
        setLoading(false);
        return;
      }

      setResult(data);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-semibold text-gray-900">AI Mentor</h1>

        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
        >
          {error && (
            <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <label className="mb-1 block text-sm font-medium text-gray-700">Language</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="mb-4 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            <option>Python</option>
            <option>JavaScript</option>
            <option>TypeScript</option>
            <option>C++</option>
            <option>Java</option>
          </select>

          <label className="mb-1 block text-sm font-medium text-gray-700">Your Code</label>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows={12}
            className="mb-4 w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm focus:border-blue-500 focus:outline-none"
            placeholder="Paste your solution here..."
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Reviewing..." : "Review Code"}
          </button>
        </form>

        {result && (
          <div className="mt-6 space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex gap-6">
              <div>
                <p className="text-sm text-gray-500">Time Complexity</p>
                <p className="text-lg font-semibold text-gray-900">{result.timeComplexity}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Space Complexity</p>
                <p className="text-lg font-semibold text-gray-900">{result.spaceComplexity}</p>
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-gray-700">Issues</p>
              <ul className="list-inside list-disc space-y-1 text-sm text-gray-600">
                {result.issues.map((issue, i) => (
                  <li key={i}>{issue}</li>
                ))}
              </ul>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-gray-700">Suggestions</p>
              <ul className="list-inside list-disc space-y-1 text-sm text-gray-600">
                {result.suggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}