import React, { useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Home, Calendar, MessageSquare, Settings, Star } from 'lucide-react';
import { Avatar } from './Avatar'; // reuse your Avatar component if present
// If Avatar import path differs, adjust accordingly

/**
 * Sidebar
 *
 * Props:
 *  - items: array of { id, label, icon: ReactComponent, badge (optional) }
 *  - activeId: currently active item id
 *  - onSelect(id): callback when an item is activated
 *  - collapsed: bool to render compact variant (icons + tooltips)
 *  - user: { name, role } optional to show small profile / upgrade card
 */
export function Sidebar({
  items,
  activeId,
  onSelect,
  collapsed = false,
  user = { name: 'Aditi' },
  className = '',
}) {
  const containerRef = useRef(null);
  const itemRefs = useRef([]);

  // ensure itemRefs length matches items
  itemRefs.current = items.map((_, i) => itemRefs.current[i] ?? React.createRef());

  // keyboard navigation: ArrowUp/Down to move, Enter to activate
  const handleKeyDown = useCallback(
    (e) => {
      const keys = ['ArrowDown', 'ArrowUp', 'Enter', ' '];
      if (!keys.includes(e.key)) return;

      const focusable = itemRefs.current.map((r) => r.current).filter(Boolean);
      if (!focusable.length) return;

      const idx = focusable.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const next = focusable[(idx + 1) % focusable.length];
        next?.focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = focusable[(idx - 1 + focusable.length) % focusable.length];
        prev?.focus();
      } else if (e.key === 'Enter' || e.key === ' ') {
        // trigger click on focused item
        e.preventDefault();
        const focused = document.activeElement;
        const found = focusable.indexOf(focused);
        if (found !== -1) {
          const id = items[found].id;
          onSelect?.(id);
        }
      }
    },
    [items, onSelect]
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('keydown', handleKeyDown);
    return () => el.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <aside
      ref={containerRef}
      role="navigation"
      aria-label="Primary"
      className={`hidden lg:flex flex-col ${collapsed ? 'w-20' : 'w-64'} p-4 gap-4 glass rounded-2xl border border-white/5 ${className}`}
    >
      {/* Top header */}
      <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
        <div className={collapsed ? '' : 'flex items-center gap-3'}>
          <div className={collapsed ? 'mx-auto' : ''}>
            <Avatar name={user?.name} size={collapsed ? 36 : 48} />
          </div>
          {!collapsed && (
            <div>
              <div className="text-slate-300 text-xs">Welcome back,</div>
              <div className="text-white font-medium">{user?.name}</div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation list */}
      <nav className="flex flex-col gap-2 mt-2" aria-label="Sidebar">
        {items.map((it, idx) => {
          const active = activeId === it.id;
          const Icon = it.icon ?? Home;
          return (
            <button
              key={it.id}
              ref={(el) => (itemRefs.current[idx].current = el)}
              onClick={() => onSelect?.(it.id)}
              role="link"
              aria-current={active ? 'page' : undefined}
              aria-label={collapsed ? it.label : undefined}
              className={`
                group flex items-center gap-3 p-2 rounded-lg transition
                focus-visible:ring-4 focus-visible:ring-primary/20
                ${active ? 'bg-gradient-to-r from-primary to-accent text-white shadow-soft-lg' : 'text-slate-300 hover:bg-white/3'}
                ${collapsed ? 'justify-center' : ''}
              `}
              title={collapsed ? it.label : undefined} // tooltip for collapsed
            >
              <div className={`
                w-10 h-10 rounded-lg flex items-center justify-center
                ${active ? 'bg-white/6' : 'bg-white/3'}
              `}>
                <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-slate-300'}`} />
              </div>

              {!collapsed && (
                <div className="flex-1 flex items-center justify-between">
                  <div className="text-sm font-medium">{it.label}</div>
                  {it.badge && (
                    <div className="text-xs label-soft">{it.badge}</div>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* spacer */}
      <div className="mt-auto">
        <div className="glass-divider" />

        {/* Promo / Premium card */}
        <div className={`mt-4 p-3 rounded-xl ${collapsed ? 'flex items-center justify-center' : 'bg-gradient-to-br from-primary to-accent text-white'}`}>
          {collapsed ? (
            <button
              onClick={() => onSelect?.('upgrade')}
              className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow hover:scale-105 transition"
              aria-label="Upgrade"
              title="Upgrade"
            >
              <Star className="w-5 h-5" />
            </button>
          ) : (
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-lg bg-white/6 flex items-center justify-center text-white shadow">
                <Star className="w-6 h-6" />
              </div>
              <div>
                <div className="font-semibold">Premium</div>
                <div className="text-xs text-white/90">Upgrade to unlock smart matching</div>
                <button
                  onClick={() => onSelect?.('upgrade')}
                  className="mt-3 btn-primary text-sm px-3 py-1.5 rounded-md"
                  aria-label="Upgrade to premium"
                >
                  Upgrade
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

/* Defaults + PropTypes */
Sidebar.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      icon: PropTypes.elementType,
      badge: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    })
  ),
  activeId: PropTypes.string,
  onSelect: PropTypes.func,
  collapsed: PropTypes.bool,
  user: PropTypes.object,
  className: PropTypes.string,
};

Sidebar.defaultProps = {
  items: [
    { id: 'discover', label: 'Discover', icon: Home },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings },
  ],
  activeId: 'discover',
  onSelect: () => {},
  collapsed: false,
  user: { name: 'Aditi' },
  className: '',
};

export default Sidebar;