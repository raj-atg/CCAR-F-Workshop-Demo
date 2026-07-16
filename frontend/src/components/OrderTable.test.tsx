import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import OrderTable from "./OrderTable";
import type { Item, Order } from "../api/client";

const items: Item[] = [
  {
    id: 1,
    sku: "SKU-1",
    name: "Widget",
    category: "sensor",
    quantity: 10,
    reorder_level: 5,
    unit_cost: 5,
    supplier_id: 1,
    updated_at: "2026-01-01T00:00:00Z",
  },
];

const orders: Order[] = [
  { id: 1, item_id: 1, quantity: 20, status: "pending", placed_at: "2026-01-01T00:00:00.000Z" },
];

describe("OrderTable", () => {
  it("renders the item name for each order", () => {
    render(<OrderTable orders={orders} items={items} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText("Widget")).toBeInTheDocument();
    expect(screen.getByText("pending")).toBeInTheDocument();
  });

  it("calls onDelete with the order id", async () => {
    const onDelete = vi.fn();
    render(<OrderTable orders={orders} items={items} onEdit={vi.fn()} onDelete={onDelete} />);
    await userEvent.click(screen.getByText("Delete"));
    expect(onDelete).toHaveBeenCalledWith(1);
  });
});
