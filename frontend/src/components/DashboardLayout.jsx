import Sidebar from './Sidebar';
import Navbar from './Navbar';
import GeminiAiAssistant from './GeminiAiAssistant';

export default function DashboardLayout({ title, userLabel, items, onLogout, children }) {
  return (
    <div className="relative flex min-h-screen bg-husk-50">
      <Sidebar items={items} onLogout={onLogout} />
      <div className="flex min-h-screen flex-1 flex-col">
        <Navbar title={title} userLabel={userLabel} items={items} onLogout={onLogout} />
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
      {/* Floating Google Gemini-Powered Agri AI Assistant */}
      <GeminiAiAssistant />
    </div>
  );
}
