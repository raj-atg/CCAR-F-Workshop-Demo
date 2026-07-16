import { useEffect, useState } from "react";
import ItemTable from "../components/ItemTable";
import ItemForm from "../components/ItemForm";
import { api, Item, ItemInput, Supplier } from "../api/client";

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [editing, setEditing] = useState<Item | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    const [itemList, supplierList] = await Promise.all([
      api.items.list(),
      api.suppliers.list(),
    ]);
    setItems(itemList);
    setSuppliers(supplierList);
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (data: ItemInput) => {
    if (editing) {
      await api.items.update(editing.id, data);
    } else {
      await api.items.create(data);
    }
    setShowForm(false);
    setEditing(null);
    await load();
  };

  const handleDelete = async (id: number) => {
    await api.items.delete(id);
    await load();
  };

  return (
    <div>
      <h1>Items</h1>
      <button
        className="primary"
        onClick={() => {
          setEditing(null);
          setShowForm(true);
        }}
      >
        New Item
      </button>
      {showForm && (
        <ItemForm
          suppliers={suppliers}
          initial={editing}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditing(null);
          }}
        />
      )}
      <ItemTable
        items={items}
        suppliers={suppliers}
        onEdit={(item) => {
          setEditing(item);
          setShowForm(true);
        }}
        onDelete={handleDelete}
      />
    </div>
  );
}
