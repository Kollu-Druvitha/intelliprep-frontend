"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";

interface Message {
  role: "interviewer" | "candidate";
  content: string;
}

interface Evaluation {
  score: number;
  strengths: string[];
  weaknesses: string[];
  summary: string;
}

export default function MockInterviewPage() {
  const [interviewId, setInterviewId] = useState<string | null>(null);
  const [type, setType] = useState<"DSA" | "HR" | "SystemDesign">("DSA");
  const [messages, setMessages] = useState<Message[]>([]);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [error, setError] = useState("");

  async function startInterview() {
    setError("");
    setLoading(true);
    try {
      const res = await apiFetch("/api/mock-interview/start", {
        method: "POST",
        body: JSON.stringify({ type }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to start interview");
        return;
      }

      setInterviewId(data.interviewId);
      setMessages([{ role: "interviewer", content: data.question }]);
    } catch (err) {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function sendAnswer() {
    if (!answer.trim() || !interviewId) return;

    const candidateMessage: Message = { role: "candidate", content: answer };
    setMessages((prev) => [...prev, candidateMessage]);
    setAnswer("");
    setLoading(true);

    try {
      const res = await apiFetch("/api/mock-interview/respond", {
        method: "POST",
        body: JSON.stringify({ interviewId, answer }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to get response");
        return;
      }

      setMessages((prev) => [...prev, { role: "interviewer", content: data.question }]);
    } catch (err) {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function endInterview() {
    if (!interviewId) return;
    setLoading(true);

    try {
      const res = await apiFetch("/api/mock-interview/end", {
        method: "POST",
        body: JSON.stringify({ interviewId }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to end interview");
        return;
      }

      setEvaluation(data.evaluation);
    } catch (err) {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-semibold text-gray-900">Mock Interview</h1>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        )}

        {!interviewId && !evaluation && (
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Interview Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as typeof type)}
              className="mb-4 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="DSA">DSA</option>
              <option value="HR">HR</option>
              <option value="SystemDesign">System Design</option>
            </select>

            <button
              onClick={startInterview}
              disabled={loading}
              className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Starting..." : "Start Interview"}
            </button>
          </div>
        )}

        {interviewId && !evaluation && (
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 max-h-96 space-y-3 overflow-y-auto">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`rounded-lg p-3 text-sm ${
                    msg.role === "interviewer"
                      ? "bg-gray-100 text-gray-800"
                      : "ml-8 bg-blue-50 text-blue-900"
                  }`}
                >
                  <p className="mb-1 text-xs font-medium uppercase text-gray-400">
                    {msg.role === "interviewer" ? "Interviewer" : "You"}
                  </p>
                  {msg.content}
                </div>
              ))}
            </div>

            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={3}
              placeholder="Type your answer..."
              className="mb-3 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />

            <div className="flex gap-2">
              <button
                onClick={sendAnswer}
                disabled={loading}
                className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Answer"}
              </button>
              <button
                onClick={endInterview}
                disabled={loading}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                End Interview
              </button>
            </div>
          </div>
        )}

        {evaluation && (
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Score</p>
            <p className="mb-4 text-4xl font-semibold text-gray-900">{evaluation.score}/100</p>

            <p className="mb-4 text-sm text-gray-700">{evaluation.summary}</p>

            <p className="mb-2 text-sm font-medium text-gray-700">Strengths</p>
            <ul className="mb-4 list-inside list-disc space-y-1 text-sm text-gray-600">
              {evaluation.strengths.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>

            <p className="mb-2 text-sm font-medium text-gray-700">Areas to Improve</p>
            <ul className="list-inside list-disc space-y-1 text-sm text-gray-600">
              {evaluation.weaknesses.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}