"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
        setLoading(false);
        return;
      }

      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      router.push("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-6 text-ink">
      <div className="w-full max-w-sm">
        <p className="font-display text-2xl">IntelliPrep</p>
        <h1 className="mt-6 mb-8 font-display text-xl text-graphite">
          Log in to continue your prep
        </h1>

        <form onSubmit={handleSubmit}>
          {error && (
            <p className="mb-6 border-l-2 border-danger pl-3 text-sm text-danger">{error}</p>
          )}

          <label className="block text-sm text-graphite">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mb-6 w-full border-0 border-b border-rule bg-transparent py-2 text-ink outline-none focus:border-signal"
          />

          <label className="block text-sm text-graphite">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mb-8 w-full border-0 border-b border-rule bg-transparent py-2 text-ink outline-none focus:border-signal"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ink py-3 text-sm font-medium text-paper transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Logging in…" : "Log in"}
          </button>
        </form>
      </div>
    </div>
  );
}