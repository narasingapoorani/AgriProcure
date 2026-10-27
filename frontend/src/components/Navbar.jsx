import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import ThemeToggle from './ThemeToggle';
import { Menu, X, LogOut } from 'lucide-react';

export default function Navbar({ title, userLabel, items, onLogout }) {
  const [open, setOpen] = useState(false);
  const { state, update } = useApp();
  const isTamil = state.language === 'Tamil';

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-husk-200 bg-husk-100/80 backdrop-blur-md px-4 py-4 md:px-8">
      <div className="flex items-center gap-3">
        <button
          className="rounded-md p-1 text-field-800 hover:bg-field-100 transition md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        <h1 className="font-display text-xl font-semibold text-field-900">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle className="hidden sm:flex" />
        {/* English & Tamil alone */}
        <div
          className="flex items-center rounded-lg border border-husk-200 bg-husk-100 p-1 text-xs font-medium shadow-xs"
          role="group"
          aria-label="Select language"
        >
          <button
            type="button"
            onClick={() => update({ language: 'English' })}
            className={`rounded px-2.5 py-1 font-medium transition ${
              !isTamil
                ? 'bg-field-800 text-white shadow-xs'
                : 'text-soil-600 hover:bg-husk-100 hover:text-field-900'
            }`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => update({ language: 'Tamil' })}
            className={`rounded px-2.5 py-1 font-medium transition ${
              isTamil
                ? 'bg-field-800 text-white shadow-xs'
                : 'text-soil-600 hover:bg-husk-100 hover:text-field-900'
            }`}
          >
            தமிழ்
          </button>
        </div>

        {(() => {
          let displayName = (userLabel || '').trim();
          const isPhone = !displayName || /^\+?\d[\d\s-]{7,15}$/.test(displayName) || displayName === 'farmer1';
          if (isPhone) {
            displayName = isTamil ? 'ரமேஷ் கிசான் பாட்டீல்' : 'Ramesh Kisan Patil';
          }
          const avatarChar = displayName.charAt(0).toUpperCase();

          return displayName ? (
            <div className="flex items-center gap-2 text-sm text-soil-600/80">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-field-100 text-field-800 font-bold shadow-xs">
                {avatarChar}
              </span>
              <span className="hidden sm:inline font-semibold text-soil-800">{displayName}</span>
            </div>
          ) : null;
        })()}
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-[64px] z-20 border-b border-husk-200 bg-husk-100 p-3 shadow-lg md:hidden">
          <nav className="flex flex-col gap-1">
            {items.map(({ label, labelTa, to, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setOpen(false)}
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
            <button
              onClick={onLogout}
              className="mt-2 w-full flex items-center justify-center gap-2 rounded-lg bg-husk-50 px-3 py-2.5 text-sm font-semibold text-soil-700 transition hover:bg-husk-200 hover:text-soil-900 border border-husk-200 shadow-sm group"
            >
              <LogOut className="w-4 h-4 text-soil-500 group-hover:text-danger-600 transition-colors" />
              {isTamil ? 'வெளியேறு' : 'Log out'}
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
