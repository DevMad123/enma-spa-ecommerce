import React, { useState } from 'react';
import FrontendLayout from '@/Layouts/FrontendLayout';
import { useForm } from '@inertiajs/react';
import { useAppSettings } from '@/Hooks/useAppSettings';
import { 
    MapPinIcon,
    PhoneIcon,
    EnvelopeIcon,
    ClockIcon,
    ChatBubbleLeftRightIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

const ContactCard = ({ icon: Icon, title, content, description, gradient }) => {
    return (
        <div className="group relative bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${gradient} mb-6`}>
                <Icon className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
            <p className="text-lg font-medium text-amber-600 mb-2">{content}</p>
            <p className="text-gray-600 text-sm">{description}</p>
        </div>
    );
};

const InputField = ({ label, name, type = "text", value, onChange, error, placeholder, rows = null, required = false }) => {
    const InputComponent = rows ? 'textarea' : 'input';
    
    return (
        <div className="space-y-2">
            <label htmlFor={name} className="block text-sm font-medium text-gray-700">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <InputComponent
                type={rows ? undefined : type}
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                rows={rows}
                required={required}
                className={`
                    w-full px-4 py-3 border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent
                    ${error 
                        ? 'border-red-300 bg-red-50 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-amber-500'
                    }
                `}
            />
            {error && (
                <div className="flex items-center space-x-1 text-red-600 text-sm">
                    <ExclamationCircleIcon className="h-4 w-4" />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
};

const AlertMessage = ({ type, message, onClose }) => {
    const isSuccess = type === 'success';
    const bgColor = isSuccess ? 'bg-green-50' : 'bg-red-50';
    const borderColor = isSuccess ? 'border-green-200' : 'border-red-200';
    const textColor = isSuccess ? 'text-green-800' : 'text-red-800';
    const Icon = isSuccess ? CheckCircleIcon : ExclamationCircleIcon;
    const iconColor = isSuccess ? 'text-green-400' : 'text-red-400';

    return (
        <div className={`rounded-xl border ${bgColor} ${borderColor} p-4 mb-6`}>
            <div className="flex">
                <div className="flex-shrink-0">
                    <Icon className={`h-5 w-5 ${iconColor}`} />
                </div>
                <div className="ml-3 flex-1">
                    <p className={`text-sm font-medium ${textColor}`}>
                        {message}
                    </p>
                </div>
                <div className="ml-auto pl-3">
                    <div className="-mx-1.5 -my-1.5">
                        <button
                            type="button"
                            onClick={onClose}
                            className={`inline-flex rounded-md p-1.5 ${textColor} hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-offset-2`}
                        >
                            <span className="sr-only">Fermer</span>
                            <XMarkIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function Contact({ flash }) {
    const [alertMessage, setAlertMessage] = useState(null);
    const { appSettings, formatDate } = useAppSettings();

    const { data, setData, processing, errors, post, clearErrors } = useForm({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });
    if (import.meta.env.DEV) console.log('App Settings:', appSettings);
    // Informations de contact depuis les settings
    const contactInfo = {
        email: appSettings?.contact_email || 'contact@enmaspa.com',
        phone: appSettings?.phone || '+225 0505050505',
        address: appSettings?.contact_address || 'Abidjan, Côte d\'Ivoire',
        hours: appSettings?.business_hours || 'Lun - Ven : 8h00 - 18h00'
    };
    
    // const { data, setData, post, processing, errors, reset } = useForm({
    //     name: '',
    //     email: '',
    //     phone: '',
    //     subject: '',
    //     message: '',
    // });

    const subjects = [
        'Question sur un produit',
        'Problème de commande',
        'Demande de remboursement',
        'Support technique',
        'Partenariat',
        'Autre'
    ];

    const contactCards = [
        {
            icon: MapPinIcon,
            title: "Adresse",
            content: contactInfo.address,
            description: "Visitez notre magasin",
            gradient: "from-blue-500 to-indigo-600"
        },
        {
            icon: PhoneIcon,
            title: "Téléphone",
            content: contactInfo.phone,
            description: contactInfo.hours,
            gradient: "from-green-500 to-teal-600"
        },
        {
            icon: EnvelopeIcon,
            title: "Email",
            content: contactInfo.email,
            description: "Réponse sous 24h",
            gradient: "from-amber-500 to-orange-600"
        },
        {
            icon: ClockIcon,
            title: "Horaires",
            content: contactInfo.hours,
            description: "Fermé dimanche",
            gradient: "from-purple-500 to-pink-600"
        }
    ];

    React.useEffect(() => {
        if (flash?.success) {
            setAlertMessage({ type: 'success', message: flash.success });
            reset();
        }
        if (flash?.error) {
            setAlertMessage({ type: 'error', message: flash.error });
        }
    }, [flash]);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('contact.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setAlertMessage({ 
                    type: 'success', 
                    message: 'Votre message a été envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.' 
                });
                reset();
            },
            onError: () => {
                setAlertMessage({ 
                    type: 'error', 
                    message: 'Une erreur est survenue lors de l\'envoi de votre message. Veuillez réessayer.' 
                });
            }
        });
    };

    return (
        <FrontendLayout title={`Contact`}>
            {/* Hero Section */}
            <section className="relative py-20 overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500 via-orange-500 to-red-600">
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="absolute inset-0 bg-[url('/images/hero-pattern.svg')] opacity-10" />
                </div>

                {/* Content */}
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
                    <div className="max-w-4xl mx-auto">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-3xl mb-8 backdrop-blur-sm">
                            <ChatBubbleLeftRightIcon className="h-10 w-10" />
                        </div>
                        
                        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                            Contactez-Nous
                        </h1>
                        
                        <p className="text-xl md:text-2xl mb-8 text-gray-100 max-w-3xl mx-auto">
                            Une question ? Un besoin spécifique ? Notre équipe est là pour vous accompagner 
                            et répondre à toutes vos demandes.
                        </p>
                    </div>
                </div>
            </section>

            {/* Contact Info Section */}
            <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Nos Coordonnées
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Plusieurs moyens de nous joindre pour une réponse adaptée à vos besoins
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                        {contactCards.map((info, index) => (
                            <ContactCard 
                                key={index}
                                icon={info.icon}
                                title={info.title}
                                content={info.content}
                                description={info.description}
                                gradient={info.gradient}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Form Section */}
            <section className="py-20 bg-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Envoyez-nous un Message
                        </h2>
                        <p className="text-xl text-gray-600">
                            Remplissez le formulaire ci-dessous et nous vous répondrons rapidement
                        </p>
                    </div>

                    <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100">
                        {/* Alert Messages */}
                        {alertMessage && (
                            <AlertMessage 
                                type={alertMessage.type}
                                message={alertMessage.message}
                                onClose={() => setAlertMessage(null)}
                            />
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Nom et Email */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputField
                                    label="Nom complet"
                                    name="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    error={errors.name}
                                    placeholder="Votre nom et prénom"
                                    required
                                />

                                <InputField
                                    label="Adresse email"
                                    name="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    error={errors.email}
                                    placeholder="votre@email.com"
                                    required
                                />
                            </div>

                            {/* Téléphone et Sujet */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputField
                                    label="Téléphone"
                                    name="phone"
                                    type="tel"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    error={errors.phone}
                                    placeholder="+2250505022402"
                                />

                                <div className="space-y-2">
                                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                                        Sujet <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="subject"
                                        name="subject"
                                        value={data.subject}
                                        onChange={(e) => setData('subject', e.target.value)}
                                        required
                                        className={`
                                            w-full px-4 py-3 border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent
                                            ${errors.subject 
                                                ? 'border-red-300 bg-red-50 focus:ring-red-500' 
                                                : 'border-gray-300'
                                            }
                                        `}
                                    >
                                        <option value="">Sélectionnez un sujet</option>
                                        {subjects.map((subject, index) => (
                                            <option key={index} value={subject}>{subject}</option>
                                        ))}
                                    </select>
                                    {errors.subject && (
                                        <div className="flex items-center space-x-1 text-red-600 text-sm">
                                            <ExclamationCircleIcon className="h-4 w-4" />
                                            <span>{errors.subject}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Message */}
                            <InputField
                                label="Message"
                                name="message"
                                value={data.message}
                                onChange={(e) => setData('message', e.target.value)}
                                error={errors.message}
                                placeholder="Décrivez votre demande en détail..."
                                rows={6}
                                required
                            />

                            {/* Submit Button */}
                            <div className="pt-6">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white py-4 px-8 rounded-xl font-bold text-lg hover:from-amber-600 hover:to-orange-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                                >
                                    {processing ? (
                                        <>
                                            <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
                                            <span>Envoi en cours...</span>
                                        </>
                                    ) : (
                                        <>
                                            <EnvelopeIcon className="h-6 w-6" />
                                            <span>Envoyer le message</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            <p className="text-sm text-gray-600 text-center">
                                En envoyant ce formulaire, vous acceptez que vos données soient utilisées pour traiter votre demande. 
                                <br />
                                Nous nous engageons à protéger votre vie privée.
                            </p>
                        </form>
                    </div>
                </div>
            </section>

            {/* Map Section (Optional - can be replaced with image) */}
            <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Où Nous Trouver
                        </h2>
                        <p className="text-xl text-gray-600">
                            Notre siège social est situé au cœur de Paris
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                        {/* Placeholder for map - replace with actual map integration */}
                        <div className="h-96 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                            <div className="text-center text-gray-500">
                                <MapPinIcon className="h-16 w-16 mx-auto mb-4" />
                                <p className="text-lg font-medium">Carte interactive</p>
                                <p className="text-sm">123 Rue de la Paix, 75001 Paris</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Quick Links */}
            <section className="py-20 bg-gradient-to-r from-amber-600 to-orange-600">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl font-bold text-white mb-6">
                        Questions Fréquentes
                    </h2>
                    <p className="text-xl text-orange-100 mb-8">
                        Consultez notre FAQ pour trouver rapidement des réponses à vos questions
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
                            <h3 className="text-lg font-semibold mb-2">Livraison</h3>
                            <p className="text-sm text-orange-100">Délais, tarifs et zones de livraison</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
                            <h3 className="text-lg font-semibold mb-2">Retours</h3>
                            <p className="text-sm text-orange-100">Politique de retour et remboursement</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
                            <h3 className="text-lg font-semibold mb-2">Paiement</h3>
                            <p className="text-sm text-orange-100">Moyens de paiement acceptés</p>
                        </div>
                    </div>
                </div>
            </section>
        </FrontendLayout>
    );
}
