import React, { useState, useEffect } from 'react';
import { useCart } from './CartContext';
import axios from 'axios';

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const [status, setStatus] = useState('');
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const [stockMap, setStockMap] = useState({});
  const [outOfStockItems, setOutOfStockItems] = useState([]);
  const [checkingStock, setCheckingStock] = useState(true);

  useEffect(() => {
    const fetchStock = async () => {
      try {
        const res = await axios.get('/api/products');
        const map = {};
        res.data.forEach(p => { map[p._id] = p.quantity ?? 0; });
        setStockMap(map);
        const oos = cart.filter(item => (map[item._id] ?? 0) < item.qty);
        setOutOfStockItems(oos.map(i => i.name));
      } catch {
        setStockMap({});
        setOutOfStockItems([]);
      } finally {
        setCheckingStock(false);
      }
    };
    fetchStock();
  }, [cart]);

  const handleCheckout = (e) => {
    e.preventDefault();
    if (outOfStockItems.length > 0) {
      setStatus('Some items are out of stock. Please adjust your cart.');
      return;
    }
    setStatus('Processing payment...');
    setTimeout(() => {
      setStatus('✅ Payment successful! Thank you for your purchase.');
      clearCart();
    }, 1500);
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-8">
        <h1 className="text-2xl font-bold mb-4">Checkout</h1>
        <p>Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      <form onSubmit={handleCheckout} className="w-full max-w-md bg-white rounded shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
        {cart.map(item => (
          <div key={item._id} className="flex justify-between mb-2">
            <span>{item.name} x {item.qty}</span>
            <span>${(item.price * item.qty).toFixed(2)}</span>
          </div>
        ))}
        {checkingStock ? (
          <div className="text-blue-600 mt-2">Checking stock...</div>
        ) : outOfStockItems.length > 0 && (
          <div className="text-red-600 font-bold mt-2">
            Out of stock: {outOfStockItems.join(', ')}. Please adjust quantity or remove these items.
          </div>
        )}
        <div className="flex justify-between font-bold mt-4 mb-6">
          <span>Total:</span>
          <span>${total.toFixed(2)}</span>
        </div>
        <input className="border p-2 mb-2 w-full" placeholder="Card Number (dummy)" required />
        <input className="border p-2 mb-2 w-full" placeholder="Expiry (MM/YY)" required />
        <input className="border p-2 mb-4 w-full" placeholder="CVC" required />
        <button className="bg-blue-600 text-white px-4 py-2 rounded w-full" type="submit" disabled={outOfStockItems.length > 0 || checkingStock}>Pay Now</button>
        {status && <p className={status.startsWith('✅') ? 'mt-4 text-green-700 font-semibold' : 'mt-4 text-red-600 font-semibold'}>{status}</p>}
      </form>
    </div>
  );
}
