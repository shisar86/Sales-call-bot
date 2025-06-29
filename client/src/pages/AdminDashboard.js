import React from 'react';
import { useUser } from '@clerk/clerk-react';
import AddProductForm from './AddProductForm';

export default function AdminDashboard() {
  const { user } = useUser();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-4 text-blue-800">Admin Dashboard</h1>
      <p className="mb-2">Welcome, <span className="font-semibold">{user?.fullName || user?.username}</span>!</p>
      <p className="mb-6 text-gray-600">You have admin privileges.</p>
      {/* Add admin features here: trigger call, add products, view analytics, etc. */}
      <div className="bg-white p-6 rounded shadow w-full max-w-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Admin Actions</h2>
        <ul className="list-disc pl-5 space-y-2 mb-4">
          <li>Trigger a call to a user</li>
          <li>Add products to the catalog</li>
          <li>View sales analytics (coming soon)</li>
        </ul>
        <AddProductForm />
      </div>
    </div>
  );
}
