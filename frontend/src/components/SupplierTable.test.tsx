import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import SupplierTable from "./SupplierTable";
import type { Supplier } from "../api/client";

const suppliers: Supplier[] = [
  { id: 1, name: "Acme Supply", contact_email: "a@acme.example", lead_time_days: 7 },
];

describe("SupplierTable", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, status: 204 }),
    );
  });

  it("renders supplier rows", () => {
    render(<SupplierTable suppliers={suppliers} onEdit={vi.fn()} onDeleted={vi.fn()} />);
    expect(screen.getByText("Acme Supply")).toBeInTheDocument();
    expect(screen.getByText("a@acme.example")).toBeInTheDocument();
  });

  it("calls onDeleted after a delete completes", async () => {
    const onDeleted = vi.fn();
    render(<SupplierTable suppliers={suppliers} onEdit={vi.fn()} onDeleted={onDeleted} />);
    await userEvent.click(screen.getByText("Delete"));
    expect(onDeleted).toHaveBeenCalled();
  });
});
