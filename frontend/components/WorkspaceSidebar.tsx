'use client';

interface WorkspaceSidebarProps {
  activeTab: 'boards' | 'documents' | 'chat' | 'analytics' | 'code';
  setActiveTab: (tab: 'boards' | 'documents' | 'chat' | 'analytics' | 'code') => void;
}

export default function WorkspaceSidebar({ activeTab, setActiveTab }: WorkspaceSidebarProps) {
  const navItems = [
    { id: 'boards' as const, label: 'Boards', icon: '📋' },
    { id: 'documents' as const, label: 'Documents', icon: '📝' },
    { id: 'chat' as const, label: 'Chat', icon: '💬' },
    { id: 'analytics' as const, label: 'Analytics', icon: '📊' },
    { id: 'code' as const, label: 'Code', icon: '</>' },
  ];

  return (
    <aside className="w-64 glass h-full flex flex-col">
      <div className="mb-8 p-4">
        <h2 className="text-lg font-semibold text-white">Workspace</h2>
      </div>
      <nav className="space-y-2 px-2">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
              activeTab === item.id
                ? 'bg-blue-600/40 text-white backdrop-blur-sm'
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