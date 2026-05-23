export default function WorkspacePage() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>✅ Workspace page is working!</h1>
      <p>If you see this, the route works.</p>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button>Boards</button>
        <button>Documents</button>
        <button>Chat</button>
      </div>
    </div>
  );
}