import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Menu,
  X,
  User,
  LogOut,
  Calendar,
  LayoutDashboard,
  Sun,
  Moon,
} from 'lucide-react';
import { MdSpaceDashboard } from 'react-icons/md';

/* ThemeToggle: toggles 'theme-dark' on <html> and persists preference */
function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    try {
      const saved = localStorage.getItem('ss_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark', 'theme-dark');
    } else {
      root.classList.remove('dark', 'theme-dark');
    }
    try { localStorage.setItem('ss_theme', isDark ? 'dark' : 'light'); } catch {}
  }, [isDark]);

  return (
    <button
      aria-pressed={isDark}
      title={isDark ? 'Switch to light' : 'Switch to dark'}
      className="w-10 h-10 rounded-lg flex items-center justify-center focus-visible:ring-4 focus-visible:ring-primary/20 transition-all hover:scale-105"
      onClick={() => setIsDark(s => !s)}
      aria-label="Toggle color theme"
    >
      {isDark ? <Sun size={18} className="text-yellow-300" /> : <Moon size={18} className="text-slate-700" />}
    </button>
  );
}

/* Avatar: simple initials bubble */
const Avatar = ({ name, size = 40 }) => {
  const initial = name ? String(name).charAt(0).toUpperCase() : '?';
  return (
    <div
      className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold shadow-soft-lg"
      style={{ width: size, height: size }}
      aria-hidden
    >
      {initial}
    </div>
  );
};

/* focusable selector + helper */
const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function getFocusable(el) {
  if (!el) return [];
  return Array.from(el.querySelectorAll(FOCUSABLE)).filter((node) => !!(node.offsetWidth || node.offsetHeight || node.getClientRects().length));
}

/* AvatarWithMenu: keyboard-accessible avatar menu with focus management */
function AvatarWithMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    function onDoc(e) {
      if (!open) return;
      if (menuRef.current && !menuRef.current.contains(e.target) && !triggerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      try { triggerRef.current?.focus(); } catch {}
      return;
    }
    const focusables = getFocusable(menuRef.current);
    if (focusables.length) focusables[0].focus();
  }, [open]);

  const handleKeyDown = (e) => {
    if (e.key !== 'Tab') return;
    const focusables = getFocusable(menuRef.current);
    if (focusables.length === 0) { e.preventDefault(); return; }
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  };

  return (
    <div className="relative" onKeyDown={handleKeyDown}>
      <button
        ref={triggerRef}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls="avatar-menu"
        onClick={() => setOpen(s => !s)}
        className="flex items-center gap-3 rounded-lg p-1 hover:bg-white/4 transition focus-visible:ring-4 focus-visible:ring-primary/20"
        aria-label="Open user menu"
      >
        <Avatar name={user?.name || 'U'} />
        <span className="hidden sm:block text-sm font-medium text-white">{user?.name ?? 'User'}</span>
      </button>

      {open && (
        <div
          id="avatar-menu"
          ref={menuRef}
          role="menu"
          aria-label="User menu"
          className="absolute right-0 mt-3 w-56 card-glass p-2 rounded-xl shadow-lg z-40 animate-slide-in-up"
        >
          <div className="py-1">
            <Link
              to="/profile"
              role="menuitem"
              className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/5 transition text-sm"
              onClick={() => setOpen(false)}
            >
              <User size={16} /> Profile
            </Link>

            {(user?.role === 'provider' || user?.role === 'PROVIDER' || user?.role === 'SERVICE_PROVIDER') && (
              <Link
                to="/provider/dashboard"
                role="menuitem"
                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/5 transition text-sm"
                onClick={() => setOpen(false)}
              >
                <LayoutDashboard size={16} /> Dashboard
              </Link>
            )}

            {(user?.role === 'customer' || user?.role === 'CUSTOMER') && (
              <Link
                to="/my-bookings"
                role="menuitem"
                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/5 transition text-sm"
                onClick={() => setOpen(false)}
              >
                <Calendar size={16} /> My Bookings
              </Link>
            )}

            <button
              onClick={() => { setOpen(false); onLogout(); }}
              role="menuitem"
              className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-md hover:bg-red-50 hover:text-red-600 transition text-sm"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* Navbar (main component)
   - mobile panel has role=dialog & aria-modal when open
   - focus trap and scroll lock when mobile menu open
*/
const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const mobileMenuRef = useRef(null);
  const menuButtonRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    function onDoc(e) {
      if (isOpen && mobileMenuRef.current && !mobileMenuRef.current.contains(e.target) && !menuButtonRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDoc);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onDoc);
    };
  }, [isOpen]);

  /* body scroll lock while mobile menu open */
  useEffect(() => {
    const prev = document.body.style.overflow;
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = prev || '';
    return () => { document.body.style.overflow = prev || ''; };
  }, [isOpen]);

  /* when mobile menu opens, focus first focusable, trap Tab wrap */
  useEffect(() => {
    if (!isOpen) return;
    const menu = mobileMenuRef.current;
    if (!menu) return;
    // focus first focusable
    const focusables = getFocusable(menu);
    if (focusables.length) focusables[0].focus();
  }, [isOpen]);

  const handleMobileKeyDown = useCallback((e) => {
    if (!isOpen) return;
    if (e.key !== 'Tab') return;
    const menu = mobileMenuRef.current;
    if (!menu) return;
    const focusables = getFocusable(menu);
    if (focusables.length === 0) { e.preventDefault(); return; }
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  }, [isOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsOpen(false);
  };

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'glass blur-md shadow-strong backdrop-blur-lg' : 'glass shadow-soft-lg'}`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group" aria-label="Service Spot home">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-accent text-white shadow-glow transform transition-all group-hover:scale-105">
              <MdSpaceDashboard size={22} />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-lg font-display font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">ServiceSpot</span>
              <span className="text-xs text-slate-700 dark:text-slate-400 -mt-0.5 hidden sm:block">Local services, booked fast</span>
            </div>
          </Link>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/services" className="relative text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-primary transition-colors">
              <span className="group">Browse Services</span>
              <span className="absolute left-0 -bottom-1 h-0.5 w-0 bg-gradient-to-r from-primary to-accent group-hover:w-full transition-all"></span>
            </Link>

            {user ? (
              <>
                {user.role === 'customer' && (
                  <>
                    <Link to="/my-bookings" className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200 hover:text-primary transition-colors" aria-label="My Bookings">
                      <Calendar size={16} /><span>My Bookings</span>
                    </Link>
                    <Link to="/profile" className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200 hover:text-primary transition-colors" aria-label="Profile">
                      <User size={16} /><span>Profile</span>
                    </Link>
                  </>
                )}

                {user.role === 'provider' && (
                  <Link to="/provider/dashboard" className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200 hover:text-primary transition-colors" aria-label="Provider dashboard">
                    <LayoutDashboard size={16} /><span>Dashboard</span>
                  </Link>
                )}

                <div className="flex items-center gap-4 pl-4 border-l border-white/6">
                  <AvatarWithMenu user={user} onLogout={handleLogout} />
                  <div className="hidden sm:flex items-center gap-2">
                    <ThemeToggle />
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-primary transition">Login</Link>
                <Link to="/signup" className="btn-primary text-sm">Sign Up</Link>
                <ThemeToggle />
              </div>
            )}
          </div>

          {/* Mobile controls */}
          <div className="flex items-center gap-2 md:hidden">
            <div className="mr-1"><ThemeToggle /></div>
            <button
              ref={menuButtonRef}
              className="p-2 rounded-lg focus-visible:ring-4 focus-visible:ring-primary/20 hover:bg-white/6 transition"
              onClick={() => setIsOpen(s => !s)}
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
            >
              {isOpen ? <X size={22} className="text-white" /> : <Menu size={22} className="text-white" />}
            </button>
          </div>
        </div>

        {/* Mobile menu panel */}
        <div
          id="mobile-menu"
          ref={mobileMenuRef}
          role={isOpen ? 'dialog' : undefined}
          aria-modal={isOpen ? 'true' : undefined}
          className={`md:hidden mt-3 rounded-xl overflow-hidden transform transition-all duration-300 ${isOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'}`}
          aria-hidden={!isOpen}
          onKeyDown={handleMobileKeyDown}
        >
          <div className="card-glass p-4 space-y-3 animate-slide-in-up">
            <Link to="/services" className="block py-3 px-3 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-white/5" onClick={() => setIsOpen(false)}>Browse Services</Link>

            {user ? (
              <>
                {user.role === 'customer' && (
                  <>
                    <Link to="/my-bookings" className="flex items-center gap-2 py-3 px-3 rounded-lg text-sm text-slate-700 dark:text-slate-200 hover:bg-white/5" onClick={() => setIsOpen(false)}><Calendar size={16} /> My Bookings</Link>
                    <Link to="/profile" className="flex items-center gap-2 py-3 px-3 rounded-lg text-sm text-slate-700 dark:text-slate-200 hover:bg-white/5" onClick={() => setIsOpen(false)}><User size={16} /> Profile</Link>
                  </>
                )}

                {user.role === 'provider' && (
                  <Link to="/provider/dashboard" className="flex items-center gap-2 py-3 px-3 rounded-lg text-sm text-slate-700 dark:text-slate-200 hover:bg-white/5" onClick={() => setIsOpen(false)}><LayoutDashboard size={16} /> Dashboard</Link>
                )}

                <div className="pt-2 border-t border-white/6">
                  <div className="flex items-center gap-3 py-3 px-3 bg-gradient-to-r from-white/3 to-white/5 rounded-lg">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold shadow-md">
                      {String(user?.name ?? 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{user?.name ?? 'User'}</p>
                      <p className="text-xs text-slate-300 capitalize">{user?.role ?? ''}</p>
                    </div>
                  </div>
                  <button onClick={handleLogout} className="mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold text-red-500 hover:bg-red-50 transition">
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="block py-3 px-3 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-white/5" onClick={() => setIsOpen(false)}>Login</Link>
                <Link to="/signup" className="block py-3 px-3 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-primary to-accent text-center" onClick={() => setIsOpen(false)}>Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
