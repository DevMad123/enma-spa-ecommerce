import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { EnvelopeIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

export default function NewsletterForm({ className = '' }) {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [messageType, setMessageType] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email.trim()) {
            setMessage('Veuillez saisir votre adresse email.');
            setMessageType('error');
            return;
        }

        setIsLoading(true);
        setMessage(null);

        try {
            const response = await fetch(route('newsletter.subscribe'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (data.success) {
                setMessage(data.message);
                setMessageType('success');
                setEmail('');
            } else {
                setMessage(data.message);
                setMessageType('error');
            }
        } catch (error) {
            console.error('Erreur lors de l\'inscription:', error);
            setMessage('Une erreur est survenue. Veuillez réessayer.');
            setMessageType('error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`${className}`}>
            <div className="flex items-center mb-4">
                <EnvelopeIcon className="h-6 w-6 text-indigo-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">
                    Inscrivez-vous à notre newsletter
                </h3>
            </div>

            <p className="text-gray-200 mb-4">
                Recevez nos dernières offres et nouveautés directement dans votre boîte email.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Votre adresse email"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                            disabled={isLoading}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? (
                            <div className="flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                Inscription...
                            </div>
                        ) : (
                            'S\'inscrire'
                        )}
                    </button>
                </div>

                {message && (
                    <div className={`flex items-center p-3 rounded-lg ${
                        messageType === 'success'
                            ? 'bg-green-50 text-green-800 border border-green-200'
                            : 'bg-red-50 text-red-800 border border-red-200'
                    }`}>
                        {messageType === 'success' ? (
                            <CheckCircleIcon className="h-5 w-5 mr-2" />
                        ) : (
                            <ExclamationCircleIcon className="h-5 w-5 mr-2" />
                        )}
                        <span className="text-sm">{message}</span>
                    </div>
                )}
            </form>

            <p className="text-xs text-gray-200 mt-3">
                En vous inscrivant, vous acceptez de recevoir nos emails promotionnels.
                Vous pouvez vous désinscrire à tout moment.
            </p>
        </div>
    );
}
