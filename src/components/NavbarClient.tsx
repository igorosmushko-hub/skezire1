'use client';

import { useEffect, useRef, useState, useCallback, type ReactNode } from 'react';

export function NavbarClient({ children }: { children: ReactNode }) {
  const navRef = useRef<HTMLElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      navRef.current?.classList.toggle('scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on route change (anchor click)
  const handleNavClick = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('.nav-links a')) {
      setMenuOpen(false);
    }
  }, []);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    nav.addEventListener('click', handleNavClick);
    return () => nav.removeEventListener('click', handleNavClick);
  }, [handleNavClick]);

  // Close on ESC
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  const toggleMenu = useCallback(() => {
    setMenuOpen((prev) => !prev);
  }, []);

  return (
    <nav className={`navbar${menuOpen ? ' menu-open' : ''}`} id="navbar" ref={navRef}>
      {children}
      <button
        className="nav-burger"
        aria-label="Menu"
        aria-expanded={menuOpen}
        onClick={toggleMenu}
        style={{ display: undefined }}
      >
        {menuOpen ? '\u2715' : '\u2630'}
      </button>
    </nav>
  );
}
