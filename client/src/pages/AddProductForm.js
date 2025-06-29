import React, { useState } from 'react';
import axios from 'axios';

export default function AddProductForm({ onProductAdded }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('');
  const [quantity, setQuantity] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Adding product...');
    try {
      await axios.post('/api/products', { name, price, description, quantity: Number(quantity) });
      setStatus('✅ Product added!');
      setName('');
      setPrice('');
      setDescription('');
      setQuantity('');
      if (onProductAdded) onProductAdded();
    } catch (err) {
      setStatus('❌ Failed to add product');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-4">
      <h3 className="text-lg font-semibold mb-2">Add New Product</h3>
      <input
        className="border p-2 mb-2 w-full"
        placeholder="Product Name"
        value={name}
        onChange={e => setName(e.target.value)}
        required
      />
      <input
        className="border p-2 mb-2 w-full"
        placeholder="Price"
        type="number"
        value={price}
        onChange={e => setPrice(e.target.value)}
        required
      />
      <textarea
        className="border p-2 mb-2 w-full"
        placeholder="Description"
        value={description}
        onChange={e => setDescription(e.target.value)}
        required
      />
      <input
        className="border p-2 mb-2 w-full"
        placeholder="Quantity"
        type="number"
        value={quantity}
        onChange={e => setQuantity(e.target.value)}
        required
      />
      <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">Add Product</button>
      {status && <p className="mt-2 text-sm">{status}</p>}
    </form>
  );
}
