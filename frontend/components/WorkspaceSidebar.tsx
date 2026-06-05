'use client';

interface WorkspaceSidebarProps {
  activeTab: 'boards' | 'documents' | 'chat' | 'analytics';
  setActiveTab: (tab: 'boards' | 'documents' | 'chat' | 'analytics') => void;
}

export default function WorkspaceSidebar({ activeTab, setActiveTab }: WorkspaceSidebarProps) {
  const navItems = [
    { id: 'boards' as const, label: 'Boards', icon: '📋' },
    { id: 'documents' as const, label: 'Documents', icon: '📝' },
    { id: 'chat' as const, label: 'Chat', icon: '💬' },
    { id: 'analytics' as const, label: 'Analytics', icon: '📊' },
  ];

  return (
    <aside className="w-64 bg-black/40 backdrop-blur-sm border-r border-white/10 p-4 h-full flex flex-col">
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-white">Workspace</h2>
      </div>
      <nav className="space-y-2">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
              activeTab === item.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-white/10'
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}