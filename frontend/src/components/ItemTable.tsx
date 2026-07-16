import type { Item, Supplier } from "../api/client";

interface ItemTableProps {
  items: Item[];
  suppliers: Supplier[];
  onEdit: (item: Item) => void;
  onDelete: (id: number) => void;
}

export default function ItemTable({
  items,
  suppliers,
  onEdit,
  onDelete,
}: ItemTableProps) {
  const supplierName = (id: number) =>
    suppliers.find((s) => s.id === id)?.name ?? "Unknown";

  return (
    <table>
      <thead>
        <tr>
          <th>SKU</th>
          <th>Name</th>
          <th>Category</th>
          <th>Quantity</th>
          <th>Reorder Level</th>
          <th>Unit Cost</th>
          <th>Supplier</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => {
          const isLow =
            item.reorder_level !== null && item.quantity <= item.reorder_level;
          return (
            <tr key={item.id} className={isLow ? "low-stock" : undefined}>
              <td>{item.sku}</td>
              <td>{item.name}</td>
              <td>{item.category}</td>
              <td>{item.quantity}</td>
              <td>{item.reorder_level ?? "—"}</td>
              <td>${item.unit_cost.toFixed(2)}</td>
              <td>{supplierName(item.supplier_id)}</td>
              <td>
                <button onClick={() => onEdit(item)}>Edit</button>
                <button className="danger" onClick={() => onDelete(item.id)}>
                  Delete
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
