import { useState, useEffect, FormEvent } from "react";
import type { Category, Item, ItemInput, Supplier } from "../api/client";

interface ItemFormProps {
  suppliers: Supplier[];
  initial?: Item | null;
  onSubmit: (data: ItemInput) => void;
  onCancel: () => void;
}

const CATEGORIES: Category[] = [
  "circuit_board",
  "sensor",
  "actuator",
  "controller",
];

const emptyForm: ItemInput = {
  sku: "",
  name: "",
  category: "circuit_board",
  quantity: 0,
  reorder_level: 0,
  unit_cost: 0,
  supplier_id: 0,
};

export default function ItemForm({
  suppliers,
  initial,
  onSubmit,
  onCancel,
}: ItemFormProps) {
  const [form, setForm] = useState<ItemInput>(emptyForm);

  useEffect(() => {
    if (initial) {
      const { id: _id, updated_at: _updatedAt, ...rest } = initial;
      setForm(rest);
    } else {
      setForm(emptyForm);
    }
  }, [initial]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form className="entity-form" onSubmit={handleSubmit}>
      <label>
        SKU
        <input
          value={form.sku}
          onChange={(e) => setForm({ ...form, sku: e.target.value })}
          required
        />
      </label>
      <label>
        Name
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
      </label>
      <label>
        Category
        <select
          value={form.category}
          onChange={(e) =>
            setForm({ ...form, category: e.target.value as Category })
          }
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>
      <label>
        Quantity
        <input
          type="number"
          value={form.quantity}
          onChange={(e) =>
            setForm({ ...form, quantity: Number(e.target.value) })
          }
        />
      </label>
      <label>
        Reorder Level
        <input
          type="number"
          value={form.reorder_level ?? ""}
          onChange={(e) =>
            setForm({
              ...form,
              reorder_level:
                e.target.value === "" ? null : Number(e.target.value),
            })
          }
        />
      </label>
      <label>
        Unit Cost
        <input
          type="number"
          step="0.01"
          value={form.unit_cost}
          onChange={(e) =>
            setForm({ ...form, unit_cost: Number(e.target.value) })
          }
        />
      </label>
      <label>
        Supplier
        <select
          value={form.supplier_id}
          onChange={(e) =>
            setForm({ ...form, supplier_id: Number(e.target.value) })
          }
        >
          <option value={0} disabled>
            Select supplier
          </option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </label>
      <div className="form-actions">
        <button type="submit" className="primary">
          {initial ? "Save" : "Create"}
        </button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
