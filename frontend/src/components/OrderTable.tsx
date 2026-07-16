import type { Item, Order } from "../api/client";

interface OrderTableProps {
  orders: Order[];
  items: Item[];
  onEdit: (order: Order) => void;
  onDelete: (id: number) => void;
}

export default function OrderTable({
  orders,
  items,
  onEdit,
  onDelete,
}: OrderTableProps) {
  const itemName = (id: number) =>
    items.find((i) => i.id === id)?.name ?? "Unknown";

  return (
    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th>Quantity</th>
          <th>Status</th>
          <th>Placed At</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {orders.map((order) => (
          <tr key={order.id}>
            <td>{itemName(order.item_id)}</td>
            <td>{order.quantity}</td>
            <td>{order.status}</td>
            <td>{new Date(order.placed_at).toLocaleDateString()}</td>
            <td>
              <button onClick={() => onEdit(order)}>Edit</button>
              <button className="danger" onClick={() => onDelete(order.id)}>
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
