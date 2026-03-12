"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type Category = {
  id: string;
  name: string;
  sortOrder: number;
  productCount: number;
};

const inputClass =
  "w-full min-h-[48px] rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:border-emerald-400";

export function CategoriesPageClient() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addName, setAddName] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function fetchCategories() {
    setError("");
    try {
      const res = await fetch("/api/shops/me/categories");
      if (!res.ok) {
        setError("Could not load categories");
        return;
      }
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      setError("Could not load categories");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const name = addName.trim();
    if (!name) return;
    setAdding(true);
    setError("");
    try {
      const res = await fetch("/api/shops/me/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error?.name?.[0] ?? data.error ?? "Failed to add");
        return;
      }
      setAddName("");
      await fetchCategories();
      router.refresh();
    } catch {
      setError("Failed to add category");
    } finally {
      setAdding(false);
    }
  }

  function startEdit(c: Category) {
    setEditingId(c.id);
    setEditName(c.name);
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    const name = editName.trim();
    if (!name) return;
    setError("");
    try {
      const res = await fetch(`/api/shops/me/categories/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error?.name?.[0] ?? data.error ?? "Failed to update");
        return;
      }
      setEditingId(null);
      setEditName("");
      await fetchCategories();
      router.refresh();
    } catch {
      setError("Failed to update");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this category? You can only delete it if it has no products.")) return;
    setDeletingId(id);
    setError("");
    try {
      const res = await fetch(`/api/shops/me/categories/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not delete. Remove products from this category first.");
        return;
      }
      await fetchCategories();
      router.refresh();
    } catch {
      setError("Failed to delete");
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-[120px] flex items-center justify-center text-slate-500">
        Loading…
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {error && (
        <div className="text-sm text-red-600 bg-red-50 rounded-xl p-4 border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={addName}
          onChange={(e) => setAddName(e.target.value)}
          placeholder="Category name"
          className={inputClass}
          maxLength={100}
          disabled={adding}
        />
        <Button
          type="submit"
          disabled={adding || !addName.trim()}
          className="min-h-[48px] px-6 rounded-xl font-medium bg-emerald-600 hover:bg-emerald-500 shrink-0"
        >
          {adding ? "Adding…" : "Add"}
        </Button>
      </form>

      <ul className="space-y-2">
        {categories.length === 0 ? (
          <li className="text-slate-500 py-8 text-center rounded-xl border-2 border-dashed border-slate-200">
            No categories yet. Add one above.
          </li>
        ) : (
          categories.map((c) => (
            <li
              key={c.id}
              className="flex items-center gap-3 rounded-xl border-2 border-slate-200 bg-white p-4"
            >
              {editingId === c.id ? (
                <form
                  onSubmit={handleUpdate}
                  className="flex-1 flex gap-2"
                  onKeyDown={(e) => e.key === "Escape" && setEditingId(null)}
                >
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className={inputClass + " flex-1 min-h-[44px] py-2"}
                    maxLength={100}
                    autoFocus
                  />
                  <Button
                    type="submit"
                    className="min-h-[44px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500"
                  >
                    Save
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="min-h-[44px] px-4 rounded-xl"
                    onClick={() => setEditingId(null)}
                  >
                    Cancel
                  </Button>
                </form>
              ) : (
                <>
                  <span className="flex-1 font-medium text-slate-800">{c.name}</span>
                  <span className="text-sm text-slate-500 tabular-nums">
                    {c.productCount} product{c.productCount !== 1 ? "s" : ""}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    className="min-h-[44px] min-w-[44px] rounded-xl p-0"
                    onClick={() => startEdit(c)}
                    aria-label="Edit category"
                  >
                    ✏️
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="min-h-[44px] min-w-[44px] rounded-xl p-0 text-red-600 border-red-200 hover:bg-red-50"
                    disabled={deletingId === c.id}
                    onClick={() => handleDelete(c.id)}
                    aria-label="Delete category"
                  >
                    {deletingId === c.id ? "…" : "🗑️"}
                  </Button>
                </>
              )}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
