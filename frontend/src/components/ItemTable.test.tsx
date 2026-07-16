import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import ItemTable from "./ItemTable";
import type { Item, Supplier } from "../api/client";

const suppliers: Supplier[] = [
  { id: 1, name: "Acme Supply", contact_email: "a@acme.example", lead_time_days: 7 },
];

const items: Item[] = [
  {
    id: 1,
    sku: "SKU-1",
    name: "Widget",
    category: "sensor",
    quantity: 2,
    reorder_level: 10,
    unit_cost: 5,
    supplier_id: 1,
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: 2,
    sku: "SKU-2",
    name: "Gadget",
    category: "actuator",
    quantity: 50,
    reorder_level: 10,
    unit_cost: 8,
    supplier_id: 1,
    updated_at: "2026-01-02T00:00:00Z",
  },
];

describe("ItemTable", () => {
  it("renders item rows with supplier names", () => {
    render(
      <ItemTable items={items} suppliers={suppliers} onEdit={vi.fn()} onDelete={vi.fn()} />,
    );
    expect(screen.getByText("Widget")).toBeInTheDocument();
    expect(screen.getAllByText("Acme Supply")).toHaveLength(2);
  });

  it("marks rows at or below reorder level as low stock", () => {
    render(
      <ItemTable items={items} suppliers={suppliers} onEdit={vi.fn()} onDelete={vi.fn()} />,
    );
    const lowRow = screen.getByText("SKU-1").closest("tr");
    const okRow = screen.getByText("SKU-2").closest("tr");
    expect(lowRow).toHaveClass("low-stock");
    expect(okRow).not.toHaveClass("low-stock");
  });

  it("calls onDelete with the item id", async () => {
    const onDelete = vi.fn();
    render(
      <ItemTable items={items} suppliers={suppliers} onEdit={vi.fn()} onDelete={onDelete} />,
    );
    await userEvent.click(screen.getAllByText("Delete")[0]);
    expect(onDelete).toHaveBeenCalledWith(1);
  });
});
