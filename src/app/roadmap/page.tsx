"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

interface RoadmapItem {
  topic: string;
  priority: "High" | "Medium" | "Low";
  reason: string;
}

interface RoadmapResponse {
  readinessNote: string;
  roadmap: RoadmapItem[];
}

const priorityStyles: Record<string, string> = {
  High: "bg-red-50 text-red-700",
  Medium: "bg-yellow-50 text-yellow-700",
  Low: "bg-green-50 text-green-700",
};

export default function RoadmapPage() {
  const [data, setData] = useState<RoadmapResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadRoadmap() {
      try {
        const res = await apiFetch("/api/roadmap");
        const result = await res.json();

        if (!res.ok) {
          setError(result.message || "Failed to load roadmap");
          return;
        }

        setData(result);
      } catch (err) {
        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadRoadmap();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-semibold text-gray-900">Your Roadmap</h1>

        {loading && <p className="text-gray-500">Generating your personalized roadmap...</p>}

        {error && (
          <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        )}

        {data && (
          <>
            <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-700">{data.readinessNote}</p>
            </div>

            <div className="space-y-3">
              {data.roadmap.map((item, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <div className="mb-1 flex items-center justify-between">
                    <h3 className="font-medium text-gray-900">{item.topic}</h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${priorityStyles[item.priority]}`}
                    >
                      {item.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{item.reason}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}