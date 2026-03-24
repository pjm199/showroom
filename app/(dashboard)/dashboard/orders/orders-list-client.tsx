"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type OrderItem = {
  productId: string;
  productTitle: string;
  quantity: number;
  priceCents: number;
};

type Order = {
  id: string;
  customerName: string;
  customerPhone: string;
  pickupAt: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
  items: OrderItem[];
};

function formatPrice(cents: number): string {
  return (cents / 100).toFixed(2).replace(".", ",") + " €";
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function OrdersListClient() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setError("");
    try {
      const url = statusFilter
        ? `/api/shops/me/orders?status=${encodeURIComponent(statusFilter)}`
        : "/api/shops/me/orders";
      const res = await fetch(url);
      if (!res.ok) {
        setError("Could not load orders");
        return;
      }
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      setError("Could not load orders");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Poll for new orders every 30s and when tab/window gains focus
  useEffect(() => {
    const interval = setInterval(fetchOrders, 30_000);
    const onVisible = () => fetchOrders();
    window.addEventListener("focus", onVisible);
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") onVisible();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onVisible);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [fetchOrders]);

  async function updateStatus(orderId: string, status: string) {
    setUpdatingId(orderId);
    setError("");
    try {
      const res = await fetch(`/api/shops/me/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error?.status?.[0] ?? "Could not update order");
        return;
      }
      await fetchOrders();
      router.refresh();
    } catch {
      setError("Failed to update");
    } finally {
      setUpdatingId(null);
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
    <div className="space-y-4">
      {error && (
        <div className="text-sm text-red-600 bg-red-50 rounded-xl p-4 border border-red-200">
          {error}
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        {["", "PENDING", "ACCEPTED", "COMPLETED", "CANCELLED"].map((s) => (
          <button
            key={s || "all"}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={`min-h-[40px] px-4 rounded-xl text-sm font-medium border-2 ${
              statusFilter === s
                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {s || "All"}
          </button>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-slate-200 bg-white p-10 text-center text-slate-500">
          No orders yet. Reservations from your storefront will appear here.
        </div>
      ) : (
        <ul className="space-y-4">
          {orders.map((o) => (
            <li
              key={o.id}
              className="rounded-xl border-2 border-slate-200 bg-white p-4 space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium text-slate-800">{o.customerName}</p>
                  <p className="text-sm text-slate-600">{o.customerPhone}</p>
                  {o.pickupAt ? (
                    <p className="text-xs text-slate-500 mt-1">
                      Pickup: {formatDate(o.pickupAt)}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-500 mt-1">Pickup: ASAP</p>
                  )}
                </div>
                <span
                  className={`inline-block text-xs font-medium px-2 py-1 rounded ${
                    o.status === "PENDING"
                      ? "bg-amber-100 text-amber-700"
                      : o.status === "ACCEPTED"
                        ? "bg-sky-100 text-sky-700"
                        : o.status === "COMPLETED"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {o.status}
                </span>
              </div>
              <ul className="text-sm text-slate-600 border-t border-slate-100 pt-2">
                {o.items.map((i) => (
                  <li key={i.productId}>
                    {i.quantity}× {i.productTitle} — {formatPrice(i.priceCents * i.quantity)}
                  </li>
                ))}
              </ul>
              {o.notes && (
                <p className="text-xs text-slate-500 italic">Note: {o.notes}</p>
              )}
              {o.status !== "CANCELLED" && o.status !== "COMPLETED" && (
                <div className="flex gap-2 flex-wrap pt-2 border-t border-slate-100">
                  {o.status === "PENDING" && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={updatingId === o.id}
                      onClick={() => updateStatus(o.id, "ACCEPTED")}
                      className="rounded-lg"
                    >
                      {updatingId === o.id ? "…" : "Accept"}
                    </Button>
                  )}
                  {o.status === "ACCEPTED" && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={updatingId === o.id}
                      onClick={() => updateStatus(o.id, "COMPLETED")}
                      className="rounded-lg bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                    >
                      {updatingId === o.id ? "…" : "Complete"}
                    </Button>
                  )}
                  {o.status === "PENDING" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={updatingId === o.id}
                      onClick={() => updateStatus(o.id, "CANCELLED")}
                      className="rounded-lg text-slate-500 hover:text-red-600"
                    >
                      {updatingId === o.id ? "…" : "Cancel"}
                    </Button>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
