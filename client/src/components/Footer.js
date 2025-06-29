import React from 'react';

export default function Footer() {
  return (
    <footer style={{ background: 'linear-gradient(90deg, #4A234A 60%, #7E102C 100%)' }} className="fixed bottom-0 left-0 w-full z-40 shadow-inner">
      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center text-white">
        <span className="font-semibold">&copy; {new Date().getFullYear()} AI Sales Agent</span>
        <span className="text-sm">Empowering your sales with AI</span>
      </div>
    </footer>
  );
}
