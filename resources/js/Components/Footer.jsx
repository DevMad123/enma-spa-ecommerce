import React from 'react';
import { Link } from '@inertiajs/react';

const Footer = ({ appName, firstLetter }) => {
    return (
        <footer className="bg-black text-white" style={{ fontFamily: 'Barlow' }}>
            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 lg:gap-8">
                    {/* Logo & Description */}
                    <div className="lg:col-span-1">
                        <div className="flex items-center mb-6">
                            <div className="w-12 h-12 bg-white text-black rounded-lg flex items-center justify-center font-bold text-xl">
                                {firstLetter}
                            </div>
                            <span className="ml-3 text-2xl font-bold text-white">{appName}</span>
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed mb-6 max-w-sm">
                            L'authenticité streetwear rencontre la performance premium. 
                            Découvrez les dernières sneakers et pièces exclusives.
                        </p>
                        
                        {/* Newsletter */}
                        <div className="mb-6">
                            <h4 className="text-sm font-bold text-white mb-3 tracking-wide">NEWSLETTER</h4>
                            <div className="flex">
                                <input
                                    type="email"
                                    placeholder="Votre email"
                                    className="flex-1 bg-gray-900 border border-gray-800 rounded-l-md px-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-white"
                                />
                                <button className="bg-white text-black px-4 py-2 text-sm font-medium rounded-r-md hover:bg-gray-100 transition-colors">
                                    OK
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div>
                        <h4 className="text-sm font-bold text-white mb-4 tracking-wide" style={{ fontSize: '14px' }}>
                            NAVIGATION
                        </h4>
                        <ul className="space-y-3">
                            <li>
                                <Link 
                                    href="/shop" 
                                    className="text-gray-300 hover:text-white transition-colors text-sm"
                                    style={{ fontSize: '13px' }}
                                >
                                    Nouveautés
                                </Link>
                            </li>
                            <li>
                                <Link 
                                    href="/shop" 
                                    className="text-gray-300 hover:text-white transition-colors text-sm"
                                    style={{ fontSize: '13px' }}
                                >
                                    Sneakers
                                </Link>
                            </li>
                            <li>
                                <Link 
                                    href="/shop" 
                                    className="text-gray-300 hover:text-white transition-colors text-sm"
                                    style={{ fontSize: '13px' }}
                                >
                                    Streetwear
                                </Link>
                            </li>
                            <li>
                                <Link 
                                    href="/shop" 
                                    className="text-gray-300 hover:text-white transition-colors text-sm"
                                    style={{ fontSize: '13px' }}
                                >
                                    Accessoires
                                </Link>
                            </li>
                            <li>
                                <Link 
                                    href="/shop" 
                                    className="text-gray-300 hover:text-white transition-colors text-sm"
                                    style={{ fontSize: '13px' }}
                                >
                                    Marques
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Aide */}
                    <div>
                        <h4 className="text-sm font-bold text-white mb-4 tracking-wide" style={{ fontSize: '14px' }}>
                            AIDE
                        </h4>
                        <ul className="space-y-3">
                            <li>
                                <Link 
                                    href="/faq" 
                                    className="text-gray-300 hover:text-white transition-colors text-sm"
                                    style={{ fontSize: '13px' }}
                                >
                                    FAQ
                                </Link>
                            </li>
                            <li>
                                <Link 
                                    href="/contact" 
                                    className="text-gray-300 hover:text-white transition-colors text-sm"
                                    style={{ fontSize: '13px' }}
                                >
                                    Contact
                                </Link>
                            </li>
                            <li>
                                <Link 
                                    href="#" 
                                    className="text-gray-300 hover:text-white transition-colors text-sm"
                                    style={{ fontSize: '13px' }}
                                >
                                    Livraison
                                </Link>
                            </li>
                            <li>
                                <Link 
                                    href="#" 
                                    className="text-gray-300 hover:text-white transition-colors text-sm"
                                    style={{ fontSize: '13px' }}
                                >
                                    Retours
                                </Link>
                            </li>
                            <li>
                                <Link 
                                    href="#" 
                                    className="text-gray-300 hover:text-white transition-colors text-sm"
                                    style={{ fontSize: '13px' }}
                                >
                                    Guide des tailles
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Réseaux Sociaux & Infos Légales */}
                    <div>
                        <h4 className="text-sm font-bold text-white mb-4 tracking-wide" style={{ fontSize: '14px' }}>
                            SUIVEZ-NOUS
                        </h4>
                        <div className="space-y-3 mb-8">
                            <a 
                                href="#" 
                                className="flex items-center text-gray-300 hover:text-white transition-colors text-sm"
                                style={{ fontSize: '13px' }}
                            >
                                Instagram
                            </a>
                            <a 
                                href="#" 
                                className="flex items-center text-gray-300 hover:text-white transition-colors text-sm"
                                style={{ fontSize: '13px' }}
                            >
                                Facebook
                            </a>
                            <a 
                                href="#" 
                                className="flex items-center text-gray-300 hover:text-white transition-colors text-sm"
                                style={{ fontSize: '13px' }}
                            >
                                TikTok
                            </a>
                            <a 
                                href="#" 
                                className="flex items-center text-gray-300 hover:text-white transition-colors text-sm"
                                style={{ fontSize: '13px' }}
                            >
                                Twitter
                            </a>
                        </div>

                        {/* Infos Légales */}
                        <div className="space-y-2">
                            <Link 
                                href="/conditions-generales" 
                                className="block text-gray-400 hover:text-gray-300 transition-colors text-xs"
                                style={{ fontSize: '12px' }}
                            >
                                Conditions générales
                            </Link>
                            <Link 
                                href="#" 
                                className="block text-gray-400 hover:text-gray-300 transition-colors text-xs"
                                style={{ fontSize: '12px' }}
                            >
                                Politique de confidentialité
                            </Link>
                            <Link 
                                href="#" 
                                className="block text-gray-400 hover:text-gray-300 transition-colors text-xs"
                                style={{ fontSize: '12px' }}
                            >
                                Mentions légales
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="border-t border-gray-800 mt-12 pt-8 text-center">
                    <p className="text-gray-400 text-xs">
                        © {new Date().getFullYear()} {appName}. Tous droits réservés. Made with ❤️ for sneakers lovers.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;