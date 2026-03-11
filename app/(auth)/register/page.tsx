"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [shopName, setShopName] = useState("");
  const [shopSlug, setShopSlug] = useState("");
  const [error, setError] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);

  function slugFromName(s: string) {
    return s
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  }

  function handleShopNameChange(value: string) {
    setShopName(value);
    if (!shopSlug || slugFromName(shopName) === shopSlug) {
      setShopSlug(slugFromName(value));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError({});
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          name: name.trim() || undefined,
          shopName,
          shopSlug: shopSlug || slugFromName(shopName),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? { _: ["Registration failed"] });
        return;
      }
      router.push("/login");
      router.refresh();
    } catch {
      setError({ _: ["Something went wrong"] });
    } finally {
      setLoading(false);
    }
  }

  const flatError = Object.values(error).flat();

  if (status === "loading" || status === "authenticated") {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-100">
        <p className="text-slate-500">Loading…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-100">
      <div className="w-full max-w-sm rounded-2xl border-2 border-slate-200 bg-white p-6 shadow-lg space-y-6">
        <div className="text-center space-y-2">
          <Link
            href="/"
            className="inline-block text-2xl font-bold text-slate-800 tracking-tight hover:text-slate-600 transition-colors"
          >
            Showroom
          </Link>
          <h1 className="text-xl font-semibold text-slate-800">
            Create account
          </h1>
          <p className="text-slate-500 text-sm">
            Register your shop to get started
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {flatError.length > 0 && (
            <div className="text-sm text-red-600 bg-red-50 rounded-lg p-3 border border-red-200 space-y-1">
              {flatError.map((msg, i) => (
                <p key={i}>{msg}</p>
              ))}
            </div>
          )}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-9 rounded-lg border-2 border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:border-slate-300"
              placeholder="you@example.com"
            />
            {error.email?.map((m, i) => (
              <p key={i} className="text-xs text-red-600 mt-1">
                {m}
              </p>
            ))}
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full h-9 rounded-lg border-2 border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:border-slate-300"
            />
            {error.password?.map((m, i) => (
              <p key={i} className="text-xs text-red-600 mt-1">
                {m}
              </p>
            ))}
          </div>
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              Your name
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full h-9 rounded-lg border-2 border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:border-slate-300"
              placeholder="Mario Rossi"
            />
          </div>
          <div>
            <label
              htmlFor="shopName"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              Shop name
            </label>
            <input
              id="shopName"
              type="text"
              value={shopName}
              onChange={(e) => handleShopNameChange(e.target.value)}
              required
              className="w-full h-9 rounded-lg border-2 border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:border-slate-300"
              placeholder="Pescheria Centro"
            />
          </div>
          <div>
            <label
              htmlFor="shopSlug"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              Storefront URL slug
            </label>
            <input
              id="shopSlug"
              type="text"
              value={shopSlug}
              onChange={(e) => setShopSlug(e.target.value)}
              required
              pattern="[a-z0-9-]+"
              className="w-full h-9 rounded-lg border-2 border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:border-slate-300"
              placeholder="pescheria-centro"
            />
            <p className="text-xs text-slate-500 mt-1">
              Only lowercase letters, numbers, hyphens. Your storefront will be
              /s/{shopSlug || "…"}
            </p>
            {error.shopSlug?.map((m, i) => (
              <p key={i} className="text-xs text-red-600 mt-1">
                {m}
              </p>
            ))}
          </div>
          <Button type="submit" className="w-full bg-slate-800 hover:bg-slate-700 text-white" disabled={loading}>
            {loading ? "Creating account…" : "Create account"}
          </Button>
        </form>
        <p className="text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-slate-800 font-medium underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
        <p className="text-center">
          <Link href="/" className="text-xs text-slate-400 hover:text-slate-600">
            ← Back to home
          </Link>
        </p>
      </div>
    </main>
  );
}
