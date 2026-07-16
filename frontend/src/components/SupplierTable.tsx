import type { Supplier } from "../api/client";

interface SupplierTableProps {
  suppliers: Supplier[];
  onEdit: (supplier: Supplier) => void;
  onDeleted: () => void;
}

export default function SupplierTable({
  suppliers,
  onEdit,
  onDeleted,
}: SupplierTableProps) {
  // Bypasses api/client.ts and calls fetch directly — violates the
  // "no direct fetch" convention in components/CLAUDE.md and the
  // react-components.md path rule. Left as-is; see EXERCISES.md.
  const handleDelete = async (id: number) => {
    await fetch(`/api/suppliers/${id}`, { method: "DELETE" });
    onDeleted();
  };

  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Contact Email</th>
          <th>Lead Time (days)</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {suppliers.map((supplier) => (
          <tr key={supplier.id}>
            <td>{supplier.name}</td>
            <td>{supplier.contact_email}</td>
            <td>{supplier.lead_time_days}</td>
            <td>
              <button onClick={() => onEdit(supplier)}>Edit</button>
              <button className="danger" onClick={() => handleDelete(supplier.id)}>
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
