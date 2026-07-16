import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import ItemsPage from "./pages/ItemsPage";
import SuppliersPage from "./pages/SuppliersPage";
import OrdersPage from "./pages/OrdersPage";

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <nav className="nav">
          <span className="nav-brand">Factory Inventory</span>
          <NavLink to="/" end>
            Items
          </NavLink>
          <NavLink to="/suppliers">Suppliers</NavLink>
          <NavLink to="/orders">Orders</NavLink>
        </nav>
        <main className="main">
          <Routes>
            <Route path="/" element={<ItemsPage />} />
            <Route path="/suppliers" element={<SuppliersPage />} />
            <Route path="/orders" element={<OrdersPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
