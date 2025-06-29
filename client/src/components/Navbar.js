import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';

const userNavLinks = [
  { to: '/', label: 'Home' },
  { to: '/products', label: 'Products' },
  { to: '/cart', label: 'View Cart' },
];
const adminNavLinks = [
  { to: '/admin', label: 'Admin Home' },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/trigger-call', label: 'Trigger Call' },
];

export default function Navbar() {
  const location = useLocation();
  const { user } = useUser();
  const isAdmin = user?.publicMetadata?.role === 'admin';
  const navLinks = isAdmin ? adminNavLinks : userNavLinks;
  return (
    <nav style={{ background: 'linear-gradient(90deg, #7E102C 60%, #4A234A 100%)' }} className="fixed top-0 left-0 w-full z-50 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
        <div className="text-white text-2xl font-bold tracking-wider">AI Sales Agent</div>
        <div className="flex gap-6">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-lg font-semibold px-3 py-1 rounded transition-colors duration-200 ${location.pathname === link.to ? 'bg-white text-[#7E102C]' : 'text-white hover:bg-[#4A234A] hover:text-white'}`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
