import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import logo from '../../../../assets/logo.png'; // ton logo

export default function FrontHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-colors duration-300 ${
        scrolled ? 'bg-white shadow-md' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href={route('home')}>
          <img src={logo} alt="Enma Labs" className="h-10 transition-all duration-300" />
        </Link>
        <nav className="flex space-x-8">
          {[
            {'label': 'Accueil', 'link': 'home'},
            {'label': 'À propos', 'link': 'a-propos-de-nous'},
            {'label': 'Réalisations', 'link': 'realisations'},
            {'label': 'Contact', 'link': 'contact'},
          ].map((item) => (
            <Link
              key={item.label}
              href={route(item.link)}
              className={`font-medium text-lg transition-colors duration-300 ${
                scrolled ? 'text-gray-800 hover:text-blue-600' : 'text-white hover:text-blue-300'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
