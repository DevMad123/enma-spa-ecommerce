import React, { useState } from 'react';
import FrontendLayout from '@/Layouts/FrontendLayout';
import { useAppSettings } from '@/Hooks/useAppSettings';
import { 
    QuestionMarkCircleIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    MagnifyingGlassIcon,
    ShoppingCartIcon,
    TruckIcon,
    CreditCardIcon,
    UserIcon,
    ShieldCheckIcon,
    ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

const FAQItem = ({ question, answer, isOpen, onToggle }) => {
    return (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
            <button
                onClick={onToggle}
                className="w-full px-6 py-4 text-left bg-white hover:bg-gray-50 transition-colors duration-200 flex items-center justify-between"
            >
                <h3 className="text-lg font-semibold text-gray-900">{question}</h3>
                {isOpen ? (
                    <ChevronUpIcon className="h-5 w-5 text-amber-600 flex-shrink-0" />
                ) : (
                    <ChevronDownIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />
                )}
            </button>
            {isOpen && (
                <div className="px-6 pb-4 bg-gray-50">
                    <div className="pt-2 text-gray-700 leading-relaxed">{answer}</div>
                </div>
            )}
        </div>
    );
};

const CategoryCard = ({ icon: Icon, title, description, count, gradient, onClick }) => {
    return (
        <div 
            onClick={onClick}
            className="group relative bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer"
        >
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r ${gradient} mb-4`}>
                <Icon className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600 text-sm mb-3">{description}</p>
            {count > 1 ? <div className="text-amber-600 font-medium text-sm">{count} questions</div> : <div className="text-amber-600 font-medium text-sm">{count} question</div>}
        </div>
    );
};

export default function FAQ() {
    const { appSettings, formatCurrency } = useAppSettings();
    const appName = appSettings?.app_name || 'ENMA SPA';
    const currencySymbol = appSettings?.currency_symbol || 'F CFA';
    const freeShippingThreshold = appSettings?.free_shipping_threshold || 50000;
    const shippingCost = appSettings?.shipping_cost || 5000;
    
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [openFAQ, setOpenFAQ] = useState(null);

    const categories = [
        {
            id: 'commandes',
            icon: ShoppingCartIcon,
            title: 'Commandes',
            description: 'Passer commande, suivi, modifications',
            count: 2,
            gradient: 'from-blue-500 to-indigo-600'
        },
        {
            icon: TruckIcon,
            title: 'Livraison',
            description: 'Délais, tarifs, zones de livraison',
            count: 2,
            gradient: 'from-green-500 to-teal-600'
        },
        {
            icon: CreditCardIcon,
            title: 'Paiement',
            description: 'Moyens de paiement, sécurité',
            count: 1,
            gradient: 'from-purple-500 to-pink-600'
        },
        {
            icon: UserIcon,
            title: 'Compte',
            description: 'Création, gestion, mot de passe',
            count: 1,
            gradient: 'from-amber-500 to-orange-600'
        },
        {
            icon: ShieldCheckIcon,
            title: 'Retours',
            description: 'Politique de retour, remboursements',
            count: 1,
            gradient: 'from-red-500 to-pink-600'
        },
        {
            icon: ChatBubbleLeftRightIcon,
            title: 'Support',
            description: 'Contact, assistance technique',
            count: 1,
            gradient: 'from-gray-500 to-gray-600'
        }
    ];

    const faqs = [
        {
            id: 1,
            category: 'commandes',
            question: 'Comment passer une commande ?',
            answer: 'Pour passer une commande, ajoutez les produits souhaités à votre panier, puis cliquez sur "Passer commande". Suivez ensuite les étapes de checkout en renseignant vos informations de livraison et de paiement.'
        },
        {
            id: 2,
            category: 'commandes',
            question: 'Puis-je modifier ma commande après validation ?',
            answer: 'Vous pouvez modifier votre commande dans un délai de 2 heures après validation, sous réserve que celle-ci ne soit pas encore en préparation. Contactez notre service client pour toute modification.'
        },
        {
            id: 3,
            category: 'livraison',
            question: 'Quels sont les délais de livraison ?',
            answer: 'Nos délais de livraison sont de 1-3 jours ouvrés pour Abidjan et la région d\'Abidjan, et 3-7 jours pour l\'intérieur de la Côte d\'Ivoire. La livraison express le jour même est disponible pour Abidjan.'
        },
        {
            id: 4,
            category: 'livraison',
            question: 'La livraison est-elle gratuite ?',
            answer: `La livraison est gratuite pour toute commande supérieure à ${formatCurrency(freeShippingThreshold)}. En dessous de ce montant, les frais de livraison sont de ${formatCurrency(shippingCost)} pour la Côte d'Ivoire.`
        },
        {
            id: 5,
            category: 'paiement',
            question: 'Quels moyens de paiement acceptez-vous ?',
            answer: 'Nous acceptons les cartes bancaires (Visa, Mastercard), PayPal, virements bancaires et paiement en 3 fois sans frais. Tous les paiements sont sécurisés par cryptage SSL.'
        },
        {
            id: 6,
            category: 'compte',
            question: 'Comment créer un compte ?',
            answer: 'Cliquez sur "Inscription" en haut de la page, remplissez le formulaire avec vos informations personnelles et validez votre email. Vous pourrez ensuite vous connecter et passer commande.'
        },
        {
            id: 7,
            category: 'retours',
            question: 'Quelle est votre politique de retour ?',
            answer: 'Vous disposez de 30 jours pour retourner un article. Les produits doivent être dans leur état d\'origine avec l\'emballage. Les frais de retour sont gratuits, le remboursement s\'effectue sous 7-10 jours.'
        },
        {
            id: 8,
            category: 'support',
            question: 'Comment contacter le service client ?',
            answer: 'Notre service client est disponible par email à contact@enma-spa.com, par téléphone au +33 1 23 45 67 89 (Lun-Ven 9h-18h) ou via le formulaire de contact sur notre site.'
        }
    ];

    const filteredFAQs = faqs.filter(faq => {
        const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
        const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const toggleFAQ = (id) => {
        setOpenFAQ(openFAQ === id ? null : id);
    };

    return (
        <FrontendLayout title={`Aide & FAQ`}>
            {/* Hero Section */}
            <section className="relative py-20 overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600">
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="absolute inset-0 bg-[url('/images/hero-pattern.svg')] opacity-10" />
                </div>

                {/* Content */}
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
                    <div className="max-w-4xl mx-auto">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-3xl mb-8 backdrop-blur-sm">
                            <QuestionMarkCircleIcon className="h-10 w-10" />
                        </div>
                        
                        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                            Aide & FAQ
                        </h1>
                        
                        <p className="text-xl md:text-2xl mb-8 text-gray-100 max-w-3xl mx-auto">
                            Trouvez rapidement les réponses à toutes vos questions sur nos produits, 
                            commandes, livraisons et services.
                        </p>

                        {/* Search Bar */}
                        <div className="max-w-2xl mx-auto">
                            <div className="relative">
                                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Rechercher dans la FAQ..."
                                    className="w-full pl-12 pr-6 py-4 bg-white/90 backdrop-blur-sm border-0 rounded-2xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-white focus:outline-none text-lg"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Catégories d'Aide
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Choisissez une catégorie pour trouver rapidement les informations que vous cherchez
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                        {categories.map((category, index) => (
                            <CategoryCard 
                                key={index}
                                icon={category.icon}
                                title={category.title}
                                description={category.description}
                                count={category.count}
                                gradient={category.gradient}
                                onClick={() => setSelectedCategory(category.id || category.title.toLowerCase())}
                            />
                        ))}
                    </div>

                    {/* Filter Buttons */}
                    <div className="flex flex-wrap justify-center gap-4">
                        <button
                            onClick={() => setSelectedCategory('all')}
                            className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                                selectedCategory === 'all'
                                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg'
                                    : 'bg-white text-gray-600 border border-gray-300 hover:border-amber-400'
                            }`}
                        >
                            Toutes les questions
                        </button>
                        {categories.map((category, index) => (
                            <button
                                key={index}
                                onClick={() => setSelectedCategory(category.id || category.title.toLowerCase())}
                                className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                                    selectedCategory === (category.id || category.title.toLowerCase())
                                        ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg'
                                        : 'bg-white text-gray-600 border border-gray-300 hover:border-amber-400'
                                }`}
                            >
                                {category.title}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20 bg-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Questions Fréquentes
                        </h2>
                        <p className="text-xl text-gray-600">
                            {filteredFAQs.length} question{filteredFAQs.length > 1 ? 's' : ''} trouvée{filteredFAQs.length > 1 ? 's' : ''}
                        </p>
                    </div>

                    <div className="space-y-4">
                        {filteredFAQs.length > 0 ? (
                            filteredFAQs.map((faq) => (
                                <FAQItem
                                    key={faq.id}
                                    question={faq.question}
                                    answer={faq.answer}
                                    isOpen={openFAQ === faq.id}
                                    onToggle={() => toggleFAQ(faq.id)}
                                />
                            ))
                        ) : (
                            <div className="text-center py-12">
                                <QuestionMarkCircleIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    Aucune question trouvée
                                </h3>
                                <p className="text-gray-600">
                                    Essayez de modifier votre recherche ou contactez notre équipe
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Contact CTA */}
            <section className="py-20 bg-gradient-to-r from-amber-600 to-orange-600">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl font-bold text-white mb-6">
                        Vous ne trouvez pas votre réponse ?
                    </h2>
                    <p className="text-xl text-orange-100 mb-8">
                        Notre équipe de support est là pour vous aider personnellement
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href={route('contact')}
                            className="bg-white text-amber-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                            Nous Contacter
                        </a>
                        {if (import.meta.env.DEV) console.log('App Settings:', appSettings)}
                        <a
                            href={`tel:${appSettings?.phone || '+225XXXXXXXXXX'}`}
                            className="border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-amber-600 transition-all duration-200"
                        >
                            {appSettings?.phone || '+225 XX XX XX XX XX'}
                        </a>
                    </div>
                </div>
            </section>
        </FrontendLayout>
    );
}
