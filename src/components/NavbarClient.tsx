'use client';

import { useEffect, useRef, useState, useCallback, type ReactNode } from 'react';
import { Link } from '@/i18n/routing';

interface NavLink {
  href: string;
  label: string;
  className?: string;
}

interface NavbarClientProps {
  locale: string;
  links: NavLink[];
  brand: ReactNode;
  auth: ReactNode;
  langSwitcher: ReactNode;
}

export function NavbarClient({ locale, links, brand, auth, langSwitcher }: NavbarClientProps) {
  const navRef = useRef<HTMLElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      navRef.current?.classList.toggle('scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close on ESC
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  // Body scroll-lock when mobile menu is open (iOS-safe)
  useEffect(() => {
    if (menuOpen) {
      const scrollY = window.scrollY;
      document.body.style.top = `-${scrollY}px`;
      document.body.classList.add('scroll-lock');
    } else {
      const scrollY = parseInt(document.body.style.top || '0', 10);
      document.body.classList.remove('scroll-lock');
      document.body.style.top = '';
      window.scrollTo(0, -scrollY);
    }
  }, [menuOpen]);

  const toggleMenu = useCallback(() => {
    setMenuOpen((prev) => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
  }, []);

  return (
    <>
      <nav className={`navbar${menuOpen ? ' menu-open' : ''}`} id="navbar" ref={navRef}>
        <div className="nav-ornament" />
        {brand}
        <ul className="nav-links">
          {links.map((link) => (
            <li key={link.href}>
              <Link href={link.href as '/'} locale={locale} className={link.className}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        {auth}
        {langSwitcher}
        <button
          className="nav-burger"
          aria-label="Menu"
          aria-expanded={menuOpen}
          onClick={toggleMenu}
        >
          {menuOpen ? '\u2715' : '\u2630'}
        </button>
      </nav>

      {/* Mobile menu — rendered OUTSIDE nav to avoid backdrop-filter containing block */}
      <div className={`mobile-menu${menuOpen ? ' open' : ''}`}>
        <div className="mobile-menu-overlay" onClick={closeMenu} />
        <div className="mobile-menu-content">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href as '/'}
              locale={locale}
              className={`mobile-menu-link${link.className ? ` ${link.className}` : ''}`}
              onClick={closeMenu}
            >
              {link.label}
            </Link>
          ))}
          <div className="mobile-menu-auth">
            {auth}
          </div>
        </div>
      </div>
    </>
  );
}
