import { useEffect, useState, FormEvent } from "react";
import SupplierTable from "../components/SupplierTable";
import { api, Supplier, SupplierInput } from "../api/client";

const emptyForm: SupplierInput = {
  name: "",
  contact_email: "",
  lead_time_days: 7,
};

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<SupplierInput>(emptyForm);

  const load = async () => {
    setSuppliers(await api.suppliers.list());
  };

  useEffect(() => {
    load();
  }, []);

  const startEdit = (supplier: Supplier) => {
    setEditing(supplier);
    setForm({
      name: supplier.name,
      contact_email: supplier.contact_email,
      lead_time_days: supplier.lead_time_days,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (editing) {
      await api.suppliers.update(editing.id, form);
    } else {
      await api.suppliers.create(form);
    }
    setShowForm(false);
    setEditing(null);
    setForm(emptyForm);
    await load();
  };

  return (
    <div>
      <h1>Suppliers</h1>
      <button
        className="primary"
        onClick={() => {
          setEditing(null);
          setForm(emptyForm);
          setShowForm(true);
        }}
      >
        New Supplier
      </button>
      {showForm && (
        <form className="entity-form" onSubmit={handleSubmit}>
          <label>
            Name
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </label>
          <label>
            Contact Email
            <input
              type="email"
              value={form.contact_email}
              onChange={(e) =>
                setForm({ ...form, contact_email: e.target.value })
              }
              required
            />
          </label>
          <label>
            Lead Time (days)
            <input
              type="number"
              value={form.lead_time_days}
              onChange={(e) =>
                setForm({ ...form, lead_time_days: Number(e.target.value) })
              }
            />
          </label>
          <div className="form-actions">
            <button type="submit" className="primary">
              {editing ? "Save" : "Create"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditing(null);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
      <SupplierTable suppliers={suppliers} onEdit={startEdit} onDeleted={load} />
    </div>
  );
}
