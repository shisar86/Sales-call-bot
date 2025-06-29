import React from 'react';
import './HomePage.css';

export default function HomePage() {
  return (
    <div className="homepage-hero flex flex-col items-center justify-center min-h-[70vh] text-white animate-fadein">
      <h1 className="text-5xl font-extrabold mb-4 drop-shadow-lg animate-slidein">Welcome to AI Sales Agent</h1>
      <p className="text-xl mb-8 animate-fadein2">Empowering your shopping experience with AI-driven sales!</p>
      <img
        src="https://images.unsplash.com/photo-1515168833906-d2a3b82b1a48?auto=format&fit=crop&w=600&q=80"
        alt="AI Sales Agent Hero"
        className="rounded-lg shadow-2xl w-full max-w-xl animate-zoomin"
      />
    </div>
  );
}
