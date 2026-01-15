import React from 'react';
import { Link } from '@inertiajs/react';

const Footer_old = ({ appName, firstLetter }) => {
    return (
        <footer className="bg-gray-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Logo & Description */}
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center mb-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                                {firstLetter}
                            </div>
                            <span className="ml-2 text-2xl font-bold">{appName}</span>
                        </div>
                        <p className="text-gray-300 mb-4">
                            Votre destination e-commerce pour des produits de qualité.
                            Découvrez notre sélection unique et profitez d'une expérience d'achat exceptionnelle.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                                Facebook
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                                Instagram
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                                Twitter
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Liens Rapides</h3>
                        <ul className="space-y-2">
                            <li><Link href={route('home')} className="text-gray-300 hover:text-white transition-colors duration-200">Accueil</Link></li>
                            <li><Link href={route('frontend.shop.index')} className="text-gray-300 hover:text-white transition-colors duration-200">Boutique</Link></li>
                            <li><Link href={route('a-propos-de-nous')} className="text-gray-300 hover:text-white transition-colors duration-200">À propos</Link></li>
                            <li><Link href={route('contact')} className="text-gray-300 hover:text-white transition-colors duration-200">Contact</Link></li>
                        </ul>
                    </div>

                    {/* Customer Service */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Service Client</h3>
                        <ul className="space-y-2">
                            <li><Link href={route('faq')} className="text-gray-300 hover:text-white transition-colors duration-200">Aide & FAQ</Link></li>
                            {/* <li><Link href={route('livraison')} className="text-gray-300 hover:text-white transition-colors duration-200">Livraison</Link></li> */}
                            <li><Link href={route('conditions-generales')} className="text-gray-300 hover:text-white transition-colors duration-200">Conditions générales</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-8 pt-8 text-center">
                    <p className="text-gray-400">
                        © {new Date().getFullYear()} {appName}. Tous droits réservés.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer_old;