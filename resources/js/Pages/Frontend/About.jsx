import React from 'react';
import FrontendLayout from '@/Layouts/FrontendLayout';
import { useAppSettings } from '@/Hooks/useAppSettings';
import { 
    HeartIcon,
    ShieldCheckIcon,
    SparklesIcon,
    UserGroupIcon,
    TruckIcon,
    CurrencyEuroIcon,
    ClockIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

const ValueCard = ({ icon: Icon, title, description, gradient }) => {
    return (
        <div className="group relative bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${gradient} mb-6`}>
                <Icon className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">{title}</h3>
            <p className="text-gray-600 leading-relaxed">{description}</p>
        </div>
    );
};

const StatCard = ({ number, label, description }) => {
    return (
        <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">{number}</div>
            <div className="text-xl font-semibold text-orange-100 mb-1">{label}</div>
            <div className="text-sm text-orange-200">{description}</div>
        </div>
    );
};

const TeamMember = ({ name, position, image, description }) => {
    return (
        <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-all duration-300">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden bg-gradient-to-r from-amber-400 to-orange-500 p-1">
                <img
                    src={image || '/images/team-placeholder.jpg'}
                    alt={name}
                    className="w-full h-full object-cover rounded-full bg-white"
                />
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-1">{name}</h4>
            <p className="text-amber-600 font-medium mb-3">{position}</p>
            <p className="text-gray-600 text-sm">{description}</p>
        </div>
    );
};

export default function About() {
    const { appSettings } = useAppSettings();
    const appName = appSettings?.app_name || 'ENMA SPA';
    const companyDescription = appSettings?.company_description || 'Votre destination e-commerce de confiance';
    
    const values = [
        {
            icon: HeartIcon,
            title: "Passion & Qualité",
            description: "Nous sélectionnons avec soin chaque produit pour vous offrir une expérience exceptionnelle. Notre engagement envers la qualité guide chacune de nos décisions.",
            gradient: "from-red-500 to-pink-600"
        },
        {
            icon: ShieldCheckIcon,
            title: "Confiance & Sécurité",
            description: "Votre confiance est notre priorité. Nous garantissons des transactions sécurisées et un service client réactif pour répondre à tous vos besoins.",
            gradient: "from-blue-500 to-indigo-600"
        },
        {
            icon: SparklesIcon,
            title: "Innovation & Tendances",
            description: "Toujours à l'avant-garde des dernières tendances, nous renouvelons constamment notre catalogue pour vous proposer les produits les plus innovants.",
            gradient: "from-purple-500 to-pink-600"
        },
        {
            icon: UserGroupIcon,
            title: "Service Client",
            description: "Notre équipe dédiée est là pour vous accompagner dans votre expérience d'achat. Satisfaction client et support personnalisé sont nos maîtres-mots.",
            gradient: "from-green-500 to-teal-600"
        }
    ];

    const teamMembers = [
        {
            name: "Équipe Direction",
            position: "Fondateurs",
            image: "/images/team/team.jpg",
            description: `L'équipe dirigeante de ${appName} est passionnée par l'innovation et le service client d'excellence.`
        },
        {
            name: "Équipe Technique",
            position: "Développement",
            image: "/images/team/tech.jpg",
            description: `Notre équipe technique s'assure que ${appName} reste à la pointe de la technologie e-commerce.`
        },
        {
            name: "Équipe Produits",
            position: "Curation",
            image: "/images/team/products.jpg",
            description: `Nos experts produits veillent à la qualité et à la diversité du catalogue ${appName}.`
        }
    ];

    const advantages = [
        {
            icon: TruckIcon,
            title: "Livraison Rapide",
            description: "Livraison express en 24-48h"
        },
        {
            icon: CurrencyEuroIcon,
            title: "Meilleurs Prix",
            description: "Garantie du meilleur prix"
        },
        {
            icon: ClockIcon,
            title: "Support 24/7",
            description: "Service client disponible"
        },
        {
            icon: CheckCircleIcon,
            title: "Satisfaction Garantie",
            description: "30 jours pour changer d'avis"
        }
    ];

    return (
        <FrontendLayout title={`À Propos`}>
            {/* Hero Section */}
            <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500 via-orange-500 to-red-600">
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="absolute inset-0 bg-[url('/images/hero-pattern.svg')] opacity-10" />
                </div>

                {/* Content */}
                <div className="relative z-10 EecDefaultWidth px-4 sm:px-6 lg:px-8 text-center text-white">
                    <div className="max-w-4xl mx-auto">
                        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                            À Propos de
                            <span className="block bg-gradient-to-r from-yellow-300 to-white bg-clip-text text-transparent">
                                {appName}
                            </span>
                        </h1>
                        
                        <p className="text-xl md:text-2xl mb-8 text-gray-100 max-w-3xl mx-auto">
                            {companyDescription}. Nous nous engageons à vous offrir une expérience d'achat exceptionnelle 
                            avec des produits de qualité supérieure et un service client irréprochable.
                        </p>

                        {/* Stats */}
                        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
                            <StatCard 
                                number="3+" 
                                label="Années d'expérience" 
                                description="Au service de nos clients"
                            />
                            <StatCard 
                                number="5k+" 
                                label="Clients satisfaits" 
                                description="En Côte d'Ivoire"
                            />
                            <StatCard 
                                number="500+" 
                                label="Produits" 
                                description="Soigneusement sélectionnés"
                            />
                            <StatCard 
                                number="4.9/5" 
                                label="Note moyenne" 
                                description="Basée sur 2500+ avis"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-20 bg-white">
                <div className="EecDefaultWidth px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-4xl font-bold text-gray-900 mb-6">Notre Mission</h2>
                        <p className="text-xl text-gray-600 leading-relaxed mb-8">
                            Chez ENMA SPA, notre mission est de démocratiser l'accès aux produits de qualité supérieure. 
                            Nous croyons que chacun mérite le meilleur, c'est pourquoi nous sélectionnons avec soin 
                            chaque article de notre catalogue pour vous garantir une satisfaction totale.
                        </p>
                        <p className="text-lg text-gray-700 leading-relaxed">
                            Notre équipe passionnée travaille sans relâche pour vous offrir une expérience d'achat 
                            fluide, sécurisée et agréable. De la sélection des produits à la livraison, 
                            en passant par notre service client, nous mettons tout en œuvre pour dépasser vos attentes.
                        </p>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
                <div className="EecDefaultWidth px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Nos Valeurs
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Les principes qui guident notre action au quotidien et font de nous un partenaire de confiance
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {values.map((value, index) => (
                            <ValueCard 
                                key={index}
                                icon={value.icon}
                                title={value.title}
                                description={value.description}
                                gradient={value.gradient}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-20 bg-white">
                <div className="EecDefaultWidth px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Notre Équipe
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Rencontrez les personnes passionnées qui donnent vie à ENMA SPA
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {teamMembers.map((member, index) => (
                            <TeamMember 
                                key={index}
                                name={member.name}
                                position={member.position}
                                image={member.image}
                                description={member.description}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* Advantages Section */}
            <section className="py-20 bg-gradient-to-r from-amber-600 to-orange-600">
                <div className="EecDefaultWidth px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-white mb-4">
                            Pourquoi Choisir ENMA SPA ?
                        </h2>
                        <p className="text-xl text-orange-100 max-w-3xl mx-auto">
                            Découvrez les avantages qui font de nous votre partenaire e-commerce de référence
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {advantages.map((advantage, index) => (
                            <div key={index} className="text-center text-white">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-4 backdrop-blur-sm">
                                    <advantage.icon className="h-8 w-8" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">{advantage.title}</h3>
                                <p className="text-orange-100">{advantage.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
                <div className="EecDefaultWidth px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl font-bold text-gray-900 mb-6">
                        Prêt à Découvrir ENMA SPA ?
                    </h2>
                    <p className="text-xl text-gray-600 mb-8">
                        Rejoignez des milliers de clients satisfaits et découvrez notre catalogue exceptionnel
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href={route('frontend.shop.index')}
                            className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:from-amber-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                            Découvrir la Boutique
                        </a>
                        <a
                            href={route('contact')}
                            className="border-2 border-amber-500 text-amber-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-amber-500 hover:text-white transition-all duration-200"
                        >
                            Nous Contacter
                        </a>
                    </div>
                </div>
            </section>
        </FrontendLayout>
    );
}