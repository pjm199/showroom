import { OrdersListClient } from "./orders-list-client";

export default function OrdersPage() {
  return (
    <div className="max-w-lg mx-auto space-y-5">
      <h1 className="text-xl font-semibold text-slate-800">Orders</h1>
      <p className="text-sm text-slate-500">
        Reservations from your storefront. Accept or complete orders here.
      </p>
      <OrdersListClient />
    </div>
  );
}
