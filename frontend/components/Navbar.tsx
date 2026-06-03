// components/Navbar.tsx
'use client';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-black text-white h-16 flex items-center justify-between px-6 md:px-10">
      <Link href="/" className="text-xl font-bold tracking-wider">
        Sync<span className="text-blue-500">Space</span>
      </Link>

      <nav className="hidden md:flex space-x-6 uppercase text-sm font-medium">
        {!user ? (
          <>
            <Link href="/login" className="hover:underline">Login</Link>
            <Link href="/register" className="hover:underline">Register</Link>
          </>
        ) : (
          <>
            <Link href="/dashboard" className="hover:underline">Dashboard</Link>
            <Link href="/#features" className="hover:underline">Features</Link>
            <Link href="/#about" className="hover:underline">About</Link>
            <Link href="/#support" className="hover:underline">Support</Link>
            <Link href="/#notifications" className="hover:underline">Notification</Link>
            <button onClick={logout} className="hover:underline">Logout</button>
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-semibold">
              {user.name?.charAt(0).toUpperCase()}
            </div>
          </>
        )}
      </nav>

      {/* Mobile menu button and overlay (same as before) */}
      <button
        className="md:hidden flex flex-col justify-center items-center w-8 h-8"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <span className={`block w-6 h-0.5 bg-white mb-1 transition-transform ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
        <span className={`block w-6 h-0.5 bg-white mb-1 ${menuOpen ? 'opacity-0' : ''}`} />
        <span className={`block w-6 h-0.5 bg-white transition-transform ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
      </button>

      <div className={`fixed top-0 right-0 h-full w-64 bg-black z-40 transform transition-transform duration-300 ${menuOpen ? 'translate-x-0' : 'translate-x-full'} md:hidden pt-20`}>
        <nav className="flex flex-col items-center space-y-6 uppercase text-sm">
          {!user ? (
            <>
              <Link href="/login" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link href="/register" onClick={() => setMenuOpen(false)}>Register</Link>
            </>
          ) : (
            <>
              <Link href="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <Link href="/#features" onClick={() => setMenuOpen(false)}>Features</Link>
              <Link href="/#about" onClick={() => setMenuOpen(false)}>About</Link>
              <Link href="/#support" onClick={() => setMenuOpen(false)}>Support</Link>
              <Link href="/#notifications" onClick={() => setMenuOpen(false)}>Notification</Link>
              <button onClick={() => { logout(); setMenuOpen(false); }}>Logout</button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}