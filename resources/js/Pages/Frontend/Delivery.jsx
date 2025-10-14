import React from 'react';
import FrontendLayout from '@/Layouts/FrontendLayout';
import { useAppSettings } from '@/Hooks/useAppSettings';
import { 
    TruckIcon,
    ClockIcon,
    MapPinIcon,
    CurrencyEuroIcon,
    ShieldCheckIcon,
    CheckCircleIcon,
    GlobeAltIcon,
    InformationCircleIcon
} from '@heroicons/react/24/outline';

const DeliveryOption = ({ icon: Icon, title, description, price, duration, features, gradient, popular = false }) => {
    return (
        <div className={`relative bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 ${popular ? 'ring-2 ring-amber-500 scale-105' : ''}`}>
            {popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                        Populaire
                    </span>
                </div>
            )}
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${gradient} mb-6`}>
                <Icon className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">{title}</h3>
            <p className="text-gray-600 mb-4">{description}</p>
            
            <div className="flex items-center justify-between mb-4">
                <span className="text-3xl font-bold text-amber-600">{price}</span>
                <span className="text-lg font-medium text-gray-500">{duration}</span>
            </div>
            
            <ul className="space-y-2">
                {features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                        <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                    </li>
                ))}
            </ul>
        </div>
    );
};

const InfoCard = ({ icon: Icon, title, description, gradient }) => {
    return (
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r ${gradient} mb-4`}>
                <Icon className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
        </div>
    );
};

const ZoneCard = ({ zone, countries, price, duration }) => {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h4 className="text-lg font-bold text-gray-900 mb-2">{zone}</h4>
            <p className="text-sm text-gray-600 mb-4">{countries}</p>
            <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-amber-600">{price}</span>
                <span className="text-sm font-medium text-gray-500">{duration}</span>
            </div>
        </div>
    );
};

export default function Delivery() {
    const { appSettings, formatCurrency } = useAppSettings();
    const appName = appSettings?.app_name || 'ENMA SPA';
    const freeShippingThreshold = appSettings?.free_shipping_threshold || 50000;
    
    const deliveryOptions = [
        {
            icon: TruckIcon,
            title: "Livraison Standard",
            description: "Parfait pour vos achats quotidiens avec un excellent rapport qualité-prix.",
            price: formatCurrency(5000),
            duration: "2-3 jours",
            features: [
                "Suivi de colis inclus",
                "Livraison à domicile ou bureau",
                "Assurance incluse",
                "Service client dédié"
            ],
            gradient: "from-blue-500 to-blue-600"
        },
        {
            icon: ClockIcon,
            title: "Livraison Express",
            description: "Pour recevoir vos commandes rapidement, idéal pour les achats urgents.",
            price: formatCurrency(10000),
            duration: "24h",
            features: [
                "Livraison ultra-rapide",
                "Suivi en temps réel",
                "Livraison à domicile",
                "Créneau de livraison",
                "Priorité maximum"
            ],
            gradient: "from-orange-500 to-red-500",
            popular: true
        },
        {
            icon: MapPinIcon,
            title: "Livraison Premium",
            description: "Le nec plus ultra avec livraison le jour même dans Abidjan.",
            price: formatCurrency(15000),
            duration: "Même jour",
            features: [
                "Livraison même jour",
                "Créneau au choix",
                "Livraison soignée",
                "Service VIP",
                "Abidjan uniquement"
            ],
            gradient: "from-purple-500 to-pink-500"
        }
    ];

    const deliveryZones = [
        {
            zone: "Abidjan - Centre",
            countries: "Plateau, Cocody, Yopougon, Adjamé, Treichville",
            price: formatCurrency(3000),
            duration: "24h"
        },
        {
            zone: "Abidjan - Périphérie",
            countries: "Abobo, Anyama, Bingerville, Port-Bouët, Koumassi",
            price: formatCurrency(5000),
            duration: "1-2 jours"
        },
        {
            zone: "Villes secondaires",
            countries: "Bouaké, San Pedro, Yamoussoukro, Korhogo, Daloa",
            price: formatCurrency(8000),
            duration: "2-4 jours"
        },
        {
            zone: "Reste du pays",
            countries: "Autres villes et villages de Côte d'Ivoire",
            price: formatCurrency(12000),
            duration: "3-7 jours"
        }
    ];

    return (
        <FrontendLayout title={`Livraison - ${appName}`}>
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 mb-8">
                            <TruckIcon className="h-10 w-10 text-white" />
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                            Livraison
                        </h1>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                            Découvrez nos options de livraison flexibles et fiables. 
                            Nous nous engageons à livrer vos commandes dans les meilleurs délais.
                        </p>
                    </div>
                </div>
            </div>

            {/* Delivery Options */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Nos Options de Livraison</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Choisissez l'option de livraison qui correspond le mieux à vos besoins et à votre budget.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    {deliveryOptions.map((option, index) => (
                        <DeliveryOption key={index} {...option} />
                    ))}
                </div>

                {/* Free Shipping Banner */}
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-8 md:p-12 text-center text-white mb-16">
                    <div className="flex items-center justify-center mb-4">
                        <TruckIcon className="h-12 w-12 mr-4" />
                        <h2 className="text-3xl font-bold">Livraison Gratuite</h2>
                    </div>
                    <p className="text-xl text-green-100 mb-6">
                        Profitez de la livraison gratuite pour toute commande supérieure à {formatCurrency(freeShippingThreshold)} !
                    </p>
                    <div className="inline-flex items-center bg-white bg-opacity-20 rounded-xl px-6 py-3">
                        <span className="text-lg font-semibold">Offre valable en Côte d'Ivoire</span>
                    </div>
                </div>

                {/* Information Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    <InfoCard 
                        icon={ShieldCheckIcon}
                        title="Livraison Sécurisée"
                        description="Tous nos colis sont assurés et suivis pour garantir leur bonne réception."
                        gradient="from-green-500 to-green-600"
                    />
                    <InfoCard 
                        icon={ClockIcon}
                        title="Délais Respectés"
                        description="Nous nous engageons à respecter les délais annoncés ou nous vous remboursons."
                        gradient="from-blue-500 to-blue-600"
                    />
                    <InfoCard 
                        icon={MapPinIcon}
                        title="Suivi en Temps Réel"
                        description="Suivez votre colis en temps réel grâce à notre système de tracking avancé."
                        gradient="from-purple-500 to-purple-600"
                    />
                    <InfoCard 
                        icon={InformationCircleIcon}
                        title="Support Dédié"
                        description="Notre équipe est disponible pour répondre à toutes vos questions sur la livraison."
                        gradient="from-amber-500 to-orange-600"
                    />
                </div>

                {/* Delivery Zones */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 mb-4">
                            <MapPinIcon className="h-8 w-8 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Zones de Livraison</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Nous livrons dans toute la Côte d'Ivoire avec des tarifs préférentiels selon les zones géographiques.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {deliveryZones.map((zone, index) => (
                            <ZoneCard key={index} {...zone} />
                        ))}
                    </div>

                    <div className="mt-8 p-6 bg-amber-50 rounded-xl border border-amber-200">
                        <div className="flex items-start">
                            <InformationCircleIcon className="h-6 w-6 text-amber-600 mt-1 mr-3 flex-shrink-0" />
                            <div>
                                <h4 className="font-semibold text-amber-800 mb-1">Informations importantes</h4>
                                <p className="text-amber-700 text-sm">
                                    Les délais peuvent varier selon la zone géographique et les conditions météorologiques. 
                                    Nous nous engageons à respecter au mieux les délais annoncés.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Shipping Process */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 md:p-12">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Comment ça marche ?</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Découvrez les étapes de traitement et de livraison de votre commande.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                                1
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Commande</h3>
                            <p className="text-gray-600 text-sm">Passez votre commande avant 14h pour un traitement le jour même</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                                2
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Préparation</h3>
                            <p className="text-gray-600 text-sm">Nos équipes préparent soigneusement votre colis dans nos entrepôts</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                                3
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Expédition</h3>
                            <p className="text-gray-600 text-sm">Votre colis est confié à nos partenaires transporteurs de confiance</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                                4
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Réception</h3>
                            <p className="text-gray-600 text-sm">Recevez votre commande à l'adresse de votre choix</p>
                        </div>
                    </div>
                </div>
            </div>
        </FrontendLayout>
    );
}