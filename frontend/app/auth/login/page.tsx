"use client";

import { useState } from "react";

const API = "http://localhost/noty/backend/src";

type Note = {
  id: number;
  title: string;
  content: string;
  created_at: string;
  folder_id: number | null;
};

type User = {
  id: number;
  username: string;
  email: string;
};

export default function Login() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/login.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Errore sconosciuto");
        return;
      }
      setToken(data.token);
      setUser(data.user);
      await fetchNotes(data.token);
    } catch {
      setError("Impossibile connettersi al backend");
    } finally {
      setLoading(false);
    }
  }

  async function fetchNotes(t: string) {
    try {
      const res = await fetch(`${API}/documents.php`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      const data = await res.json();
      if (res.ok) setNotes(data.data ?? []);
    } catch {
      // notes non ancora implementate, silenzioso
    }
  }

  function handleLogout() {
    setToken(null);
    setUser(null);
    setNotes([]);
    setLogin("");
    setPassword("");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <div className="w-full max-w-sm space-y-4">

        {!token ? (
          <form onSubmit={handleLogin} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 space-y-3">
            <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
              Test login
            </p>

            {error && (
              <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <input
              type="text"
              placeholder="Username o email"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              required
              className="w-full text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 outline-none focus:border-zinc-400 dark:focus:border-zinc-500"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 outline-none focus:border-zinc-400 dark:focus:border-zinc-500"
            />
            <button
              type="submit"
              disabled={loading}
              onClick={handleLogin}
              className="w-full text-sm font-medium rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 py-2 hover:bg-zinc-700 dark:hover:bg-zinc-300 disabled:opacity-50 transition-colors"
            >
              {loading ? "Accesso..." : "Accedi"}
            </button>

          </form>
        ) : (
          <div className="space-y-3">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
                  {user?.username}
                </p>
                <p className="text-xs text-zinc-400">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-1.5 transition-colors"
              >
                Logout
              </button>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-3 uppercase tracking-wide">
                Note ({notes.length})
              </p>
              {notes.length === 0 ? (
                <p className="text-xs text-zinc-400 italic">
                  Nessuna nota — verifica che{" "}
                  <code className="font-mono">/src/documents.php</code> risponda al GET.
                </p>
              ) : (
                <ul className="space-y-2">
                  {notes.map((n) => (
                    <li
                      key={n.id}
                      className="border-b border-zinc-100 dark:border-zinc-800 pb-2 last:border-0 last:pb-0"
                    >
                      <p className="text-sm text-zinc-800 dark:text-zinc-100 font-medium truncate">
                        {n.title || "(senza titolo)"}
                      </p>
                      <p className="text-xs text-zinc-400 truncate">
                        {n.content.slice(0, 60)}…
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg px-3 py-2">
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono break-all">
                token: {token.slice(0, 24)}…
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}