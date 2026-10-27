import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import ThemeToggle from './ThemeToggle';
import { Leaf } from 'lucide-react';

export default function AuthShell({ title, subtitle, children, wide }) {
  const { state, update } = useApp();
  const isTamil = state.language === 'Tamil';

  return (
    <div className="flex min-h-screen items-center justify-center bg-husk-50 px-4 py-10">
      <div className={`w-full ${wide ? 'max-w-xl' : 'max-w-md'}`}>
        <div className="mb-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 text-field-800 group">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-field-100 border border-field-200 shadow-xs group-hover:bg-field-200 transition-colors">
              <Leaf className="w-4 h-4 text-field-700" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight text-field-900">
              {isTamil ? 'அக்ரிப்ரோக்யூர்' : 'AgriProcure'}
            </span>
          </Link>
          <div className="flex items-center gap-2">
          <ThemeToggle className="hidden sm:flex" />
          <div
            className="flex items-center rounded-lg border border-husk-200 bg-husk-100 p-1 text-xs font-medium shadow-xs"
            role="group"
            aria-label="Select language"
          >
            <button
              type="button"
              onClick={() => update({ language: 'English' })}
              className={`rounded px-2.5 py-1 font-medium transition ${
                state.language === 'English'
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
                state.language === 'Tamil'
                  ? 'bg-field-800 text-white shadow-xs'
                  : 'text-soil-600 hover:bg-husk-100 hover:text-field-900'
              }`}
            >
              தமிழ்
            </button>
          </div>
          </div>
        </div>
        <div className="rounded-lg border border-husk-200 bg-husk-100 p-6 shadow-sm sm:p-8">
          <h1 className="font-display text-2xl font-semibold text-field-900">{title}</h1>
          {subtitle && <p className="mt-1.5 text-sm text-soil-600/80">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
