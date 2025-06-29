import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useCart } from './CartContext';
import { useUser } from '@clerk/clerk-react';
import AddProductForm from './AddProductForm';
import { Link } from 'react-router-dom';

export default function ProductPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { addToCart, updateQty } = useCart();
  const [quantities, setQuantities] = useState({});
  const { user } = useUser();
  const isAdmin = user?.publicMetadata?.role === 'admin';
  const pollingRef = useRef();

  // Fetch products function
  const fetchProducts = async () => {
    try {
      const res = await axios.get('/api/products');
      setProducts(res.data);
      setError('');
    } catch (err) {
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    pollingRef.current = setInterval(fetchProducts, 3000); // Poll every 3 seconds
    return () => clearInterval(pollingRef.current);
  }, []);

  if (loading) return <div className="p-8 text-center">Loading products...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#7E102C] to-[#4A234A] p-8 flex flex-col items-center">
      <h1 className="text-3xl font-extrabold mb-6 text-white tracking-wide animate-slidein">Products</h1>
      {isAdmin && (
        <div className="w-full max-w-md mb-8">
          <AddProductForm onProductAdded={fetchProducts} />
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-5xl">
        {products.map((product, idx) => {
          const isOutOfStock = (product.quantity ?? 0) === 0;
          return (
            <div
              key={product._id}
              className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center relative overflow-hidden animate-fadein2"
              style={{ animationDelay: `${0.1 * idx}s` }}
            >
              <img
                src={product.image || `https://source.unsplash.com/400x300/?product,${idx}`}
                alt={product.name}
                className="w-48 h-36 object-cover rounded-lg mb-4 shadow-md transition-transform duration-300 hover:scale-105"
              />
              <h2 className="text-xl font-bold mb-2 text-[#7E102C]">{product.name}</h2>
              <p className="mb-2 text-gray-700 text-center">{product.description}</p>
              <p className="mb-4 font-bold text-green-700 text-lg">${product.price}</p>
              <p className="mb-2 text-gray-700">Stock: {product.quantity ?? 0}</p>
              {/* Only show quantity controls and Add to Cart for non-admins */}
              {!isAdmin && (
                isOutOfStock ? (
                  <div className="text-red-600 font-bold mt-2">Out of Stock</div>
                ) : (
                  <React.Fragment>
                    <div className="flex items-center gap-2 mb-2">
                      <button
                        className="px-2 py-1 bg-gray-200 rounded"
                        onClick={() => setQuantities(q => ({ ...q, [product._id]: Math.max(1, (q[product._id] || 1) - 1) }))}
                        disabled={quantities[product._id] <= 1}
                      >-</button>
                      <input
                        type="number"
                        min="1"
                        max={product.quantity}
                        value={quantities[product._id] || 1}
                        onChange={e => setQuantities(q => ({ ...q, [product._id]: Math.max(1, Math.min(Number(e.target.value), product.quantity)) }))}
                        className="w-12 text-center border rounded"
                      />
                      <button
                        className="px-2 py-1 bg-gray-200 rounded"
                        onClick={() => setQuantities(q => ({ ...q, [product._id]: Math.min(product.quantity, (q[product._id] || 1) + 1) }))}
                        disabled={(quantities[product._id] || 1) >= product.quantity}
                      >+</button>
                    </div>
                    <button
                      className="bg-[#7E102C] text-white px-4 py-2 rounded hover:bg-[#4A234A] transition-colors duration-200"
                      onClick={() => {
                        addToCart({ ...product, qty: quantities[product._id] || 1 });
                        setQuantities(q => ({ ...q, [product._id]: 1 }));
                      }}
                      disabled={isOutOfStock || (quantities[product._id] || 1) > product.quantity}
                    >
                      Add to Cart
                    </button>
                  </React.Fragment>
                )
              )}
            </div>
          );
        })}
      </div>
      <Link to="/cart" className="fixed bottom-20 right-8 bg-[#7E102C] text-white px-6 py-3 rounded-full shadow-lg text-lg font-bold hover:bg-[#4A234A] transition-colors duration-200 animate-bounce">
        View Cart
      </Link>
    </div>
  );
}
