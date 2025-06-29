import React, { useEffect, useState } from 'react';
import { useCart } from './CartContext';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import axios from 'axios';

export default function CartPage() {
  const { cart, removeFromCart, clearCart, updateQty } = useCart();
  const navigate = useNavigate();
  const { user } = useUser();
  const isAdmin = user?.publicMetadata?.role === 'admin';
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const [stockMap, setStockMap] = useState({});
  const [checkingStock, setCheckingStock] = useState(true);
  const [outOfStockItems, setOutOfStockItems] = useState([]);

  useEffect(() => {
    // Fetch latest product stock
    const fetchStock = async () => {
      try {
        const res = await axios.get('/api/products');
        const map = {};
        res.data.forEach(p => { map[p._id] = p.quantity ?? 0; });
        setStockMap(map);
        // Find out-of-stock items in cart
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

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#7E102C] to-[#4A234A] p-8">
        <h1 className="text-3xl font-extrabold mb-4 text-white animate-slidein">Your Cart</h1>
        <p className="text-white text-lg animate-fadein2">Your cart is empty.</p>
        <button
          className="mt-8 bg-white text-[#7E102C] px-6 py-3 rounded-full shadow-lg text-lg font-bold hover:bg-[#4A234A] hover:text-white transition-colors duration-200 animate-bounce"
          onClick={() => navigate('/products')}
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  if (isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-8">
        <h1 className="text-2xl font-bold mb-4">Your Cart</h1>
        <p>Admins cannot purchase products.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-[#7E102C] to-[#4A234A] p-8">
      <h1 className="text-3xl font-extrabold mb-6 text-white animate-slidein">Your Cart</h1>
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-8 mb-8 animate-fadein2">
        {cart.map((item, idx) => (
          <div key={item._id} className="flex justify-between items-center border-b py-4 animate-fadein2" style={{ animationDelay: `${0.1 * idx}s` }}>
            <div className="flex items-center gap-4">
              <img
                src={item.image || `https://source.unsplash.com/80x60/?product,${idx}`}
                alt={item.name}
                className="w-20 h-16 object-cover rounded-lg shadow-md"
              />
              <div className="flex flex-col">
                <span className="font-bold text-[#7E102C] text-lg">{item.name}</span>
                <span className="text-gray-600 text-sm">${item.price} each</span>
                <span className="text-gray-500 text-xs">Stock: {stockMap[item._id] ?? '-'}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="px-2 py-1 bg-gray-200 rounded"
                onClick={() => updateQty(item._id, item.qty - 1)}
                disabled={item.qty <= 1}
              >-</button>
              <input
                type="number"
                min="1"
                value={item.qty}
                onChange={e => updateQty(item._id, Math.max(1, Number(e.target.value)))}
                className="w-12 text-center border rounded"
              />
              <button
                className="px-2 py-1 bg-gray-200 rounded"
                onClick={() => updateQty(item._id, item.qty + 1)}
              >+</button>
              <span className="ml-2 text-green-700 font-bold">${item.price * item.qty}</span>
              <button
                className="ml-4 text-red-600 hover:underline font-semibold"
                onClick={() => removeFromCart(item._id)}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
        {checkingStock ? (
          <div className="text-blue-600 mt-2">Checking stock...</div>
        ) : outOfStockItems.length > 0 && (
          <div className="text-red-600 font-bold mt-2">
            Out of stock: {outOfStockItems.join(', ')}. Please adjust quantity or remove these items.
          </div>
        )}
        <div className="flex justify-between items-center mt-8 border-t pt-6">
          <span className="font-bold text-xl text-[#4A234A]">Total:</span>
          <span className="font-bold text-2xl text-[#7E102C]">${total.toFixed(2)}</span>
        </div>
        <div className="flex gap-4 mt-8">
          <button
            className="bg-gray-200 text-[#4A234A] px-6 py-2 rounded-full font-semibold hover:bg-gray-300 transition-colors duration-200"
            onClick={clearCart}
          >
            Clear Cart
          </button>
          <button
            className="bg-[#7E102C] text-white px-8 py-2 rounded-full text-lg font-bold shadow-lg hover:bg-[#4A234A] transition-colors duration-200 animate-bounce"
            onClick={() => navigate('/checkout')}
            disabled={outOfStockItems.length > 0 || checkingStock}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
      <button
        className="fixed bottom-20 left-8 bg-white text-[#7E102C] px-6 py-3 rounded-full shadow-lg text-lg font-bold hover:bg-[#4A234A] hover:text-white transition-colors duration-200 animate-bounce"
        onClick={() => navigate('/products')}
      >
        Continue Shopping
      </button>
    </div>
  );
}
