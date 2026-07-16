import { useEffect, useState, FormEvent } from "react";
import OrderTable from "../components/OrderTable";
import { api, Item, Order, OrderInput, OrderStatus } from "../api/client";

const STATUSES: OrderStatus[] = [
  "pending",
  "shipped",
  "delivered",
  "backordered",
];

const emptyForm: OrderInput = {
  item_id: 0,
  quantity: 1,
  status: "pending",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [editing, setEditing] = useState<Order | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<OrderInput>(emptyForm);

  const load = async () => {
    const [orderList, itemList] = await Promise.all([
      api.orders.list(),
      api.items.list(),
    ]);
    setOrders(orderList);
    setItems(itemList);
  };

  useEffect(() => {
    load();
  }, []);

  const startEdit = (order: Order) => {
    setEditing(order);
    setForm({
      item_id: order.item_id,
      quantity: order.quantity,
      status: order.status,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (editing) {
      await api.orders.update(editing.id, form);
    } else {
      await api.orders.create(form);
    }
    setShowForm(false);
    setEditing(null);
    setForm(emptyForm);
    await load();
  };

  const handleDelete = async (id: number) => {
    await api.orders.delete(id);
    await load();
  };

  return (
    <div>
      <h1>Orders</h1>
      <button
        className="primary"
        onClick={() => {
          setEditing(null);
          setForm(emptyForm);
          setShowForm(true);
        }}
      >
        New Order
      </button>
      {showForm && (
        <form className="entity-form" onSubmit={handleSubmit}>
          <label>
            Item
            <select
              value={form.item_id}
              onChange={(e) =>
                setForm({ ...form, item_id: Number(e.target.value) })
              }
            >
              <option value={0} disabled>
                Select item
              </option>
              {items.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name}
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
            Status
            <select
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value as OrderStatus })
              }
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
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
      <OrderTable
        orders={orders}
        items={items}
        onEdit={startEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
