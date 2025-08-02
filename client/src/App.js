import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import TriggerCallPage from "./pages/TriggerCallPage";
import AdminDashboard from "./pages/AdminDashboard";
import { UserButton, useUser } from "@clerk/clerk-react";

export default function App() {
  const { user } = useUser();
  const isAdmin = user?.publicMetadata?.role === 'admin';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50" style={{ paddingTop: 64, paddingBottom: 56 }}>
      <Navbar />
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-8">
        <Routes>
          {isAdmin ? (
            <>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/products" element={<ProductPage />} />
              <Route path="/admin/trigger-call" element={<TriggerCallPage />} />
            </>
          ) : (
            <>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
            </>
          )}
        </Routes>
      </div>
      <Footer />
    </div>
  );
}
