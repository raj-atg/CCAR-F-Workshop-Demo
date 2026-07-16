import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import ItemForm from "./ItemForm";
import type { Supplier } from "../api/client";

const suppliers: Supplier[] = [
  { id: 1, name: "Acme Supply", contact_email: "a@acme.example", lead_time_days: 7 },
];

describe("ItemForm", () => {
  it("submits entered values for a new item", async () => {
    const onSubmit = vi.fn();
    render(
      <ItemForm suppliers={suppliers} initial={null} onSubmit={onSubmit} onCancel={vi.fn()} />,
    );

    await userEvent.type(screen.getByLabelText("SKU"), "NEW-1");
    await userEvent.type(screen.getByLabelText("Name"), "New Widget");
    await userEvent.selectOptions(screen.getByLabelText("Supplier"), "1");
    await userEvent.click(screen.getByText("Create"));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ sku: "NEW-1", name: "New Widget", supplier_id: 1 }),
    );
  });

  it("calls onCancel when cancel is clicked", async () => {
    const onCancel = vi.fn();
    render(
      <ItemForm suppliers={suppliers} initial={null} onSubmit={vi.fn()} onCancel={onCancel} />,
    );
    await userEvent.click(screen.getByText("Cancel"));
    expect(onCancel).toHaveBeenCalled();
  });
});
