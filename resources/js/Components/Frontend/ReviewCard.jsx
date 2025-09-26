import React, { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { 
    StarIcon as StarIconSolid,
    PencilIcon,
    TrashIcon,
    HandThumbUpIcon,
    ExclamationTriangleIcon 
} from '@heroicons/react/24/solid';
import { 
    StarIcon,
    HandThumbUpIcon as HandThumbUpIconOutline,
    ExclamationTriangleIcon as ExclamationTriangleIconOutline 
} from '@heroicons/react/24/outline';

const ReviewCard = ({ review, canEdit = false, onEdit, onSuccess, product }) => {
    const { auth } = usePage().props;
    const [isHelpful, setIsHelpful] = useState(review.is_helpful || false);
    const [helpfulCount, setHelpfulCount] = useState(review.helpful_count || 0);
    const [isProcessing, setIsProcessing] = useState(false);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleHelpful = async () => {
        if (!auth.user || isProcessing) return;
        
        setIsProcessing(true);
        
        try {
            await router.post(route('frontend.reviews.helpful', review.id), {}, {
                preserveScroll: true,
                onSuccess: () => {
                    setIsHelpful(!isHelpful);
                    setHelpfulCount(prev => isHelpful ? prev - 1 : prev + 1);
                },
                onFinish: () => setIsProcessing(false)
            });
        } catch (error) {
            setIsProcessing(false);
            console.error('Erreur lors du vote utile:', error);
        }
    };

    const handleReport = () => {
        if (!auth.user || isProcessing) return;

        setIsProcessing(true);

        router.post(route('frontend.reviews.report', review.id), {}, {
            preserveScroll: true,
            onSuccess: () => {
                alert('Avis signalé avec succès');
            },
            onError: () => {
                alert('Erreur lors du signalement');
            },
            onFinish: () => setIsProcessing(false)
        });
    };

    const handleDelete = () => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet avis ?')) return;

        setIsProcessing(true);

        router.delete(route('frontend.reviews.destroy', review.id), {
            preserveState: false, // Permet de recharger complètement les données
            onSuccess: () => {
                // Notifier le parent de la suppression
                if (onSuccess) {
                    onSuccess('deleted');
                }
            },
            onError: (errors) => {
                console.error('Erreur lors de la suppression:', errors);
            },
            onFinish: () => setIsProcessing(false)
        });
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-lg">
                                {review.user?.name?.charAt(0).toUpperCase() || 'U'}
                            </span>
                        </div>
                    </div>

                    <div className="flex-1 min-w-0">
                        {/* Nom et étoiles */}
                        <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-semibold text-gray-900 truncate">
                                {review.user?.name || 'Utilisateur anonyme'}
                            </h4>
                            <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                    <StarIconSolid
                                        key={i}
                                        className={`h-4 w-4 ${
                                            i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Date */}
                        <p className="text-sm text-gray-500 mb-3">
                            {formatDate(review.created_at)}
                            {review.updated_at !== review.created_at && (
                                <span className="ml-2 text-xs text-gray-400">(modifié)</span>
                            )}
                        </p>

                        {/* Commentaire */}
                        <p className="text-gray-700 leading-relaxed">
                            {review.comment}
                        </p>

                        {/* Actions */}
                        <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center space-x-4">
                                {/* Bouton Utile */}
                                {auth.user && auth.user.id !== review.user_id && (
                                    <button
                                        onClick={handleHelpful}
                                        disabled={isProcessing}
                                        className={`
                                            flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm transition-colors
                                            ${isHelpful 
                                                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }
                                            ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
                                        `}
                                    >
                                        {isHelpful ? (
                                            <HandThumbUpIcon className="h-4 w-4" />
                                        ) : (
                                            <HandThumbUpIconOutline className="h-4 w-4" />
                                        )}
                                        <span>Utile</span>
                                        {helpfulCount > 0 && (
                                            <span className="bg-white/80 px-1.5 py-0.5 rounded text-xs">
                                                {helpfulCount}
                                            </span>
                                        )}
                                    </button>
                                )}

                                {/* Bouton Signaler */}
                                {auth.user && auth.user.id !== review.user_id && (
                                    <button
                                        onClick={handleReport}
                                        disabled={isProcessing}
                                        className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600 transition-colors"
                                    >
                                        <ExclamationTriangleIconOutline className="h-4 w-4" />
                                        <span>Signaler</span>
                                    </button>
                                )}
                            </div>

                            {/* Actions du propriétaire */}
                            {canEdit && auth.user?.id === review.user_id && (
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => onEdit(review)}
                                        className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                                    >
                                        <PencilIcon className="h-4 w-4" />
                                        <span>Modifier</span>
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        disabled={isProcessing}
                                        className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                        <span>Supprimer</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReviewCard;