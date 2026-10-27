import { NavLink } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Leaf, LogOut } from 'lucide-react';

export default function Sidebar({ items, onLogout }) {
  const { state } = useApp();
  const isTamil = state.language === 'Tamil';

  return (
    <aside className="hidden w-64 shrink-0 flex-col bg-husk-100 border-r border-husk-200 text-soil-800 md:flex">
      <div className="flex items-center gap-3 px-6 py-6 border-b border-husk-200 mb-2">
        <Leaf className="w-6 h-6 text-field-700" />
        <span className="font-display text-xl font-bold text-field-800 tracking-tight">
          {isTamil ? 'அக்ரிப்ரோக்யூர்' : 'AgriProcure'}
        </span>
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-3 mt-2">
        {items.map(({ label, labelTa, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to.endsWith('dashboard')}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition-all ${
                isActive ? 'bg-field-800 text-husk-50 shadow-sm' : 'text-soil-600 hover:bg-husk-50 hover:text-soil-800'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {Icon && <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-field-100' : 'text-soil-400 group-hover:text-field-700'}`} />}
                {isTamil ? (labelTa || label) : label}
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-husk-200 mt-auto">
         <button
           onClick={onLogout}
           className="w-full flex items-center justify-center gap-2 rounded-lg bg-husk-50 px-3 py-2.5 text-sm font-semibold text-soil-700 transition hover:bg-husk-200 hover:text-soil-900 border border-husk-200 shadow-sm group"
         >
           <LogOut className="w-4 h-4 text-soil-500 group-hover:text-danger-600 transition-colors" />
           {isTamil ? 'வெளியேறு' : 'Log out'}
         </button>
      </div>
    </aside>
  );
}
