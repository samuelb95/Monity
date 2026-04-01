import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart3,
  CalendarRange,
  LineChart,
  LogOut,
  Menu,
  User,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../config/supabase';
import { useState } from 'react';

const navigationItems = [
  {
    label: 'Vue d’ensemble',
    to: '/dashboard',
    icon: BarChart3,
  },
  {
    label: 'Plan',
    to: '/planner',
    icon: CalendarRange,
  },
  {
    label: 'Projection',
    to: '/forecast',
    icon: LineChart,
  },
  {
    label: 'Groupes',
    to: '/groups',
    icon: Users,
  },
];

function navLinkClass({ isActive }) {
  return [
    'inline-flex items-center gap-2 rounded-2xl px-4 py-1 text-sm font-semibold transition',
    isActive
      ? 'bg-slate-950 bg-[linear-gradient(135deg,#0f172a,#0ea5e9)] text-white shadow-sm'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 ',
  ].join(' ');
}

export const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } catch (error) {
      console.error('Erreur logout global:', error);
    }

    logout();
    navigate('/login');
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 border-b border-slate-300/80 bg-white/88 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-7 w-8 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0f172a,#0ea5e9)] text-white shadow-sm">
            <Wallet className="h-4 w-4" />
          </div>
          <div>
            <p className="text-lg font-semibold tracking-tight text-slate-950">Monity</p>
          </div>
        </Link>

        {isAuthenticated && (
          <div className="hidden items-center gap-2 lg:flex">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink key={item.to} to={item.to} className={navLinkClass}>
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </div>
        )}

        <div className="hidden items-center gap-1 md:flex">
          {isAuthenticated ? (
            <>
              <NavLink
                to="/account"
                className={({ isActive }) =>
                  [
                    'inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-slate-50 px-1 py-1 text-sm font-semibold transition',
                    isActive ? 'text-slate-950' : 'text-slate-600 hover:bg-white hover:text-slate-950',
                  ].join(' ')
                }
              >
                <User className="h-4 w-4" />
              </NavLink>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-2xl px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Se connecter
              </Link>
              <Link
                to="/register"
                className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                S’inscrire
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setMobileMenuOpen((open) => !open)}
          className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-2 text-slate-700 md:hidden"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-slate-200/80 bg-white/96 px-4 py-4 md:hidden">
          <div className="flex flex-col gap-2">
            {isAuthenticated &&
              navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      [
                        'inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition',
                        isActive
                          ? 'bg-slate-950 text-white bg-[linear-gradient(135deg,#0f172a,#0ea5e9)]'
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100',
                      ].join(' ')
                    }
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </NavLink>
                );
              })}

            {isAuthenticated ? (
              <>
                <NavLink
                  to="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  <User className="h-4 w-4" />
                  Mon compte
                </NavLink>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="inline-flex items-center gap-2 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-100"
                >
                  <LogOut className="h-4 w-4" />
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Se connecter
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  S’inscrire
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </motion.nav>
  );
};
