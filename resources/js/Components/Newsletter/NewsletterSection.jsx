import React from 'react';
import NewsletterForm from './NewsletterForm';
import { EnvelopeIcon, GiftIcon, BellIcon } from '@heroicons/react/24/outline';

export default function NewsletterSection({
    title = "Restez informé de nos nouveautés",
    subtitle = "Inscrivez-vous à notre newsletter et bénéficiez d'offres exclusives",
    showFeatures = true,
    variant = "light", // light, dark, colored
    className = ""
}) {
    const features = [
        {
            icon: GiftIcon,
            title: "Offres exclusives",
            description: "Recevez des promotions réservées aux abonnés"
        },
        {
            icon: BellIcon,
            title: "Nouveautés",
            description: "Soyez le premier informé de nos nouveaux produits"
        },
        {
            icon: EnvelopeIcon,
            title: "Conseils",
            description: "Tips et conseils d'experts directement par email"
        }
    ];

    const variants = {
        light: "bg-gray-50 text-white",
        dark: "bg-gray-800 text-white",
        colored: "bg-gradient-to-r from-indigo-500 to-purple-600 !text-white"
    };

    return (
        <section className={`py-12 ${variants[variant]} ${className}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8">
                    <h2 className={`text-3xl font-bold ${variant === 'light' ? 'text-gray-300' : 'text-white'} mb-4`}>
                        {title}
                    </h2>
                    <p className={`text-lg ${variant === 'light' ? 'text-gray-300' : 'text-gray-200'} max-w-2xl mx-auto`}>
                        {subtitle}
                    </p>
                </div>

                {showFeatures && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {features.map((feature, index) => (
                            <div key={index} className="text-center">
                                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 ${
                                    variant === 'light'
                                        ? 'bg-indigo-100 text-indigo-600'
                                        : 'bg-white bg-opacity-20 text-white'
                                }`}>
                                    <feature.icon className="h-6 w-6" />
                                </div>
                                <h3 className={`text-lg font-semibold mb-2 ${
                                    variant === 'light' ? 'text-gray-300' : 'text-white'
                                }`}>
                                    {feature.title}
                                </h3>
                                <p className={`text-sm ${
                                    variant === 'light' ? 'text-gray-300' : 'text-gray-200'
                                }`}>
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                )}

                <div className="max-w-md mx-auto">
                    <div className={`p-6 rounded-xl ${
                        variant === 'light'
                            ? 'bg-white shadow-lg border border-gray-200'
                            : variant === 'dark'
                            ? 'bg-gray-700 border border-gray-600'
                            : 'bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20'
                    }`}>
                        <NewsletterForm />
                    </div>
                </div>

                <div className="text-center mt-8">
                    <div className="flex items-center justify-center space-x-4 text-sm">
                        <span className={`flex items-center ${variant === 'light' ? 'text-gray-300' : 'text-gray-300'}`}>
                            <EnvelopeIcon className="h-4 w-4 mr-1" />
                            Envoi hebdomadaire
                        </span>
                        <span className={`${variant === 'light' ? 'text-gray-300' : 'text-gray-300'}`}>•</span>
                        <span className={`flex items-center ${variant === 'light' ? 'text-gray-300' : 'text-gray-300'}`}>
                            <GiftIcon className="h-4 w-4 mr-1" />
                            Offres exclusives
                        </span>
                        <span className={`${variant === 'light' ? 'text-gray-300' : 'text-gray-300'}`}>•</span>
                        <span className={`${variant === 'light' ? 'text-gray-300' : 'text-gray-300'}`}>
                            Désinscription facile
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
}
