import React from 'react';
import { Link } from '@inertiajs/react';
import logo from '../../../../assets/logo.png';

export default function FrontFooter() {
  return (
    <footer className="bg-gray-900 text-gray-200 py-8">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-8">
        {/* Logo & Intro */}
        <div className="space-y-4">
          <Link href={route('home')}>
            <img src={logo} alt="Enma Labs" className="h-8 sm:h-10 grayscale" />
          </Link>
          <p className="text-sm">
            Enma Labs — Transformant des idées en innovations concrètes. Votre vitrine tech haut de gamme.
          </p>
        </div>

        {/* Liens de navigation */}
        <div>
          <h4 className="text-md font-semibold mb-3 text-gray-100">Naviguer</h4>
          <ul className="space-y-2 text-sm">
            {[
              { name: 'Accueil', href: '#' },
              { name: 'À propos', href: '#about' },
              { name: 'Réalisations', href: '#projects' },
              { name: 'Contact', href: '#contact' },
            ].map((link) => (
              <li key={link.name}>
                <Link href={link.href} className="hover:text-blue-400 transition-colors">
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Mentions & Réseaux */}
        <div className="space-y-3 text-sm">
          <h4 className="font-semibold text-gray-100">Légal & Suivre</h4>
          <ul className="space-y-2">
            <li>
              <Link href='#' className="hover:text-blue-400 transition-colors">
              {/* <Link href={route('privacy')} className="hover:text-blue-400 transition-colors"> */}
                Politique de confidentialité
              </Link>
            </li>
            <li>
              <Link href='#' className="hover:text-blue-400 transition-colors">
              {/* <Link href={route('terms')} className="hover:text-blue-400 transition-colors"> */}
                Conditions d'utilisation
              </Link>
            </li>
          </ul>
          <div className="flex space-x-4 mt-4">
            {/* Remplacer avec vos icônes réelles */}
            <a href="#" aria-label="Twitter" className="hover:text-blue-400">
              <svg className="w-5 h-5" /* ... */ />
            </a>
            <a href="#" aria-label="LinkedIn" className="hover:text-blue-400">
              <svg className="w-5 h-5" /* ... */ />
            </a>
            <a href="#" aria-label="Instagram" className="hover:text-blue-400">
              <svg className="w-5 h-5" /* ... */ />
            </a>
          </div>
        </div>
      </div>

      {/* Bas de page */}
      <div className="mt-8 border-t border-gray-700 pt-4 text-center text-xs text-gray-500">
        &copy; {new Date().getFullYear()} EnmalaBS. Tous droits réservés.
      </div>
    </footer>
  );
}
