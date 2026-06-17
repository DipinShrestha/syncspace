'use client';

// Sidebar now includes a Members tab and accepts workspaceId + workspaceName
// so the MembersPanel can be self-contained inside it.

type Tab = 'boards' | 'documents' | 'chat' | 'analytics' | 'code' | 'members';

interface WorkspaceSidebarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  workspaceId: string;
  workspaceName: string;
}

export default function WorkspaceSidebar({
  activeTab,
  setActiveTab,
  workspaceId,
  workspaceName,
}: WorkspaceSidebarProps) {
  const navItems = [
    { id: 'boards'    as const, label: 'Boards',    icon: '📋' },
    { id: 'documents' as const, label: 'Documents', icon: '📝' },
    { id: 'chat'      as const, label: 'Chat',       icon: '💬' },
    { id: 'analytics' as const, label: 'Analytics', icon: '📊' },
    { id: 'code'      as const, label: 'Code',       icon: '</>' },
    { id: 'members'   as const, label: 'Members',   icon: '👥' },
  ];

  return (
    <aside className="w-64 bg-black/40 backdrop-blur-sm border-r border-white/10 p-4 h-full flex flex-col">
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-white truncate">{workspaceName}</h2>
      </div>
      <nav className="space-y-2">
        {navItems.map((item) => (
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
