import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <div className="pt-16">
        {/* Hero Section */}
        <section className="h-screen flex items-center justify-center bg-black text-white">
          <div className="text-center px-4">
            <h1 className="text-5xl md:text-7xl font-bold mb-4">SyncSpace</h1>
            <p className="text-xl md:text-2xl text-gray-400 mb-8">
              All‑in‑one collaboration – Notion + Trello + Slack
            </p>
            <Link
              href="/register"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg text-lg transition"
            >
              Get Started Free
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gray-900 text-white" id="about">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Everything you need, in one place</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-gray-800 p-6 rounded-lg text-center">
                <h3 className="text-xl font-semibold mb-2">📋 Kanban Boards</h3>
                <p className="text-gray-400">Drag‑and‑drop tasks, manage projects like Trello.</p>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg text-center">
                <h3 className="text-xl font-semibold mb-2">📝 Collaborative Docs</h3>
                <p className="text-gray-400">Real‑time editing with rich text and AI assistance.</p>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg text-center">
                <h3 className="text-xl font-semibold mb-2">💬 Team Chat</h3>
                <p className="text-gray-400">Instant messaging with channels and direct messages.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 bg-black text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to boost your team's productivity?</h2>
          <Link
            href="/register"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg text-lg transition"
          >
            Start Now – It's Free
          </Link>
        </section>

        {/* Footer */}
        <footer className="py-6 bg-gray-900 text-center text-gray-400 text-sm">
          © {new Date().getFullYear()} SyncSpace. Built with 💻 for CE final project.
        </footer>
      </div>
    </>
  );
}