'use client';

import { useEffect, useRef, type ReactNode } from 'react';

export function NavbarClient({ children }: { children: ReactNode }) {
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      navRef.current?.classList.toggle('scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className="navbar" id="navbar" ref={navRef}>
      {children}
    </nav>
  );
}
