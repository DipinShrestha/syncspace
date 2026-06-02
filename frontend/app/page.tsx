// app/page.tsx
'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function LandingPage() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <style jsx global>{`
        .nav-link::after {
          content: '';
          position: absolute;
          width: 100%;
          height: 1px;
          left: 0;
          bottom: -4px;
          background: white;
          transform: scaleX(0);
          transition: transform 0.3s ease;
        }
        .nav-link:hover::after {
          transform: scaleX(1);
        }
        .hero-title {
          font-size: clamp(50px, 5vw, 62px);
          font-weight: 200;
          line-height: 1.05;
        }
        .feature-card {
          transition: 0.35s ease;
        }
        .feature-card:hover {
          transform: translateY(-6px);
        }
      `}</style>

      {/* NAVBAR */}
      <nav className="glass-nav fixed top-0 left-0 w-full z-50">
        <div className="w-full px-8">
          <div className="flex justify-between items-center h-16">
            <div className="logo">
              <Link href="/">
                <img src="/Gemini_Generated_Image_wf220zwf220zwf22.png" alt="SyncSpace Logo" />
              </Link>
            </div>

            {/* Desktop Menu – different based on auth */}
            <div className="desktop-main-menu hidden md:flex gap-6 items-center">
              {!user ? (
                // Public menu
                <>
                  <Link href="#features" className="nav-link text-white text-sm font-medium">FEATURES</Link>
                  <Link href="#about" className="nav-link text-white text-sm font-medium">ABOUT US</Link>
                  <Link href="#support" className="nav-link text-white text-sm font-medium">SUPPORT</Link>
                  <Link href="/login" className="text-blue-400 text-sm font-medium">LOGIN</Link>
                  <Link href="/register" className="glass-btn px-5 py-2 rounded-xl text-white text-sm font-medium">
                    SIGN UP
                  </Link>
                </>
              ) : (
                // Authenticated menu
                <>
                  <Link href="/dashboard" className="nav-link text-white text-sm font-medium">DASHBOARD</Link>
                  <Link href="#features" className="nav-link text-white text-sm font-medium">FEATURES</Link>
                  <Link href="#about" className="nav-link text-white text-sm font-medium">ABOUT</Link>
                  <Link href="#support" className="nav-link text-white text-sm font-medium">SUPPORT</Link>
                  <Link href="#notifications" className="nav-link text-white text-sm font-medium">NOTIFICATION</Link>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={logout}
                      className="text-sm text-gray-300 hover:text-white"
                    >
                      Logout
                    </button>
                    <button className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-semibold">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden text-white text-2xl focus:outline-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              ☰
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden glass m-4 rounded-2xl p-4 space-y-4 ${mobileMenuOpen ? 'block' : 'hidden'}`}>
          {!user ? (
            <>
              <Link href="#features" className="block text-white" onClick={() => setMobileMenuOpen(false)}>Features</Link>
              <Link href="#about" className="block text-white" onClick={() => setMobileMenuOpen(false)}>About</Link>
              <Link href="#support" className="block text-white" onClick={() => setMobileMenuOpen(false)}>Support</Link>
              <Link href="/login" className="block text-blue-400" onClick={() => setMobileMenuOpen(false)}>Login</Link>
              <Link href="/register" className="block glass-btn text-center px-4 py-2 rounded-xl" onClick={() => setMobileMenuOpen(false)}>Sign Up</Link>
            </>
          ) : (
            <>
              <Link href="/dashboard" className="block text-white" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
              <Link href="#features" className="block text-white" onClick={() => setMobileMenuOpen(false)}>Features</Link>
              <Link href="#about" className="block text-white" onClick={() => setMobileMenuOpen(false)}>About</Link>
              <Link href="#support" className="block text-white" onClick={() => setMobileMenuOpen(false)}>Support</Link>
              <Link href="#notifications" className="block text-white" onClick={() => setMobileMenuOpen(false)}>Notification</Link>
              <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="block text-gray-300">Logout</button>
              <div className="flex justify-center">
                <button className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-semibold">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </button>
              </div>
            </>
          )}
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="min-h-screen flex items-center justify-center px-6 text-center">
        <div className="max-w-5xl mx-auto">
          <h1 className="hero-title mb-8">All-in-one collaboration platform</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10">
            Chat, boards, docs, AI tools and teamwork — all beautifully connected in one workspace.
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-4">
            {!user ? (
              // Public CTA buttons
              <>
                <Link href="/register" className="glass-btn px-8 py-4 rounded-2xl text-lg font-medium">
                  Get Started Free
                </Link>
                <button
                  onClick={() => window.open('#', '_blank')}
                  className="glass-outline px-8 py-4 rounded-2xl text-lg font-medium"
                >
                  Watch Demo
                </button>
              </>
            ) : (
              // Logged‑in CTA
              <Link href="/dashboard" className="glass-btn px-8 py-4 rounded-2xl text-lg font-medium">
                MY DASHBOARD
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* FEATURES SECTION (unchanged) */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Everything you need in one place</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass feature-card rounded-3xl p-8 text-center">
              <div className="text-5xl mb-4">📋</div>
              <h3 className="text-2xl font-semibold mb-3">Kanban Boards</h3>
              <p className="text-gray-300">Plan projects with drag-and-drop task boards.</p>
            </div>
            <div className="glass feature-card rounded-3xl p-8 text-center">
              <div className="text-5xl mb-4">📝</div>
              <h3 className="text-2xl font-semibold mb-3">Collaborative Docs</h3>
              <p className="text-gray-300">Create documents together in real-time.</p>
            </div>
            <div className="glass feature-card rounded-3xl p-8 text-center">
              <div className="text-5xl mb-4">💬</div>
              <h3 className="text-2xl font-semibold mb-3">Team Chat</h3>
              <p className="text-gray-300">Fast messaging with channels and direct chat.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="text-center py-8 text-gray-400 border-t border-white/5">
        © 2025 SyncSpace
      </footer>
    </>
  );
}