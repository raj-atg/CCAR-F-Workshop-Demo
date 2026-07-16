export type Category = "circuit_board" | "sensor" | "actuator" | "controller";
export type OrderStatus = "pending" | "shipped" | "delivered" | "backordered";

export interface Supplier {
  id: number;
  name: string;
  contact_email: string;
  lead_time_days: number;
}

export type SupplierInput = Omit<Supplier, "id">;

export interface Item {
  id: number;
  sku: string;
  name: string;
  category: Category;
  quantity: number;
  reorder_level: number | null;
  unit_cost: number;
  supplier_id: number;
  updated_at: string;
}

export type ItemInput = Omit<Item, "id" | "updated_at">;

export interface Order {
  id: number;
  item_id: number;
  quantity: number;
  status: OrderStatus;
  placed_at: string;
}

export type OrderInput = Omit<Order, "id" | "placed_at">;

const BASE_URL = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${body}`);
  }
  if (res.status === 204) {
    return undefined as T;
  }
  return res.json();
}

// The backend returns Order.placed_at as a Unix timestamp (seconds) but
// Item.updated_at as an ISO-8601 string — an inconsistency flagged by
// api-conventions.md. This normalizes both to ISO-8601 strings so
// components never need to know which shape the endpoint used.
function normalizeOrder(raw: Order & { placed_at: string | number }): Order {
  const placedAt =
    typeof raw.placed_at === "number"
      ? new Date(raw.placed_at * 1000).toISOString()
      : raw.placed_at;
  return { ...raw, placed_at: placedAt };
}

export const api = {
  items: {
    list: () => request<Item[]>("/items"),
    lowStock: () => request<Item[]>("/items/low-stock"),
    get: (id: number) => request<Item>(`/items/${id}`),
    create: (data: ItemInput) =>
      request<Item>("/items", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: Partial<ItemInput>) =>
      request<Item>(`/items/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    delete: (id: number) => request<void>(`/items/${id}`, { method: "DELETE" }),
  },
  suppliers: {
    list: () => request<Supplier[]>("/suppliers"),
    get: (id: number) => request<Supplier>(`/suppliers/${id}`),
    create: (data: SupplierInput) =>
      request<Supplier>("/suppliers", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Partial<SupplierInput>) =>
      request<Supplier>(`/suppliers/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      request<void>(`/suppliers/${id}`, { method: "DELETE" }),
  },
  orders: {
    list: async () => (await request<Order[]>("/orders")).map(normalizeOrder),
    get: async (id: number) => normalizeOrder(await request<Order>(`/orders/${id}`)),
    create: async (data: OrderInput) =>
      normalizeOrder(
        await request<Order>("/orders", {
          method: "POST",
          body: JSON.stringify(data),
        }),
      ),
    update: async (id: number, data: Partial<OrderInput>) =>
      normalizeOrder(
        await request<Order>(`/orders/${id}`, {
          method: "PATCH",
          body: JSON.stringify(data),
        }),
      ),
    delete: (id: number) => request<void>(`/orders/${id}`, { method: "DELETE" }),
  },
};
