import React, { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { 
    StarIcon as StarIconSolid,
    PaperAirplaneIcon 
} from '@heroicons/react/24/solid';
import { StarIcon } from '@heroicons/react/24/outline';

const ReviewForm = ({ product, existingReview = null, onCancel = null, onSuccess = null }) => {
    const { auth, errors } = usePage().props;
    const [formData, setFormData] = useState({
        rating: existingReview?.rating || 0,
        comment: existingReview?.comment || ''
    });
    const [hoveredRating, setHoveredRating] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    const handleRatingClick = (rating) => {
        setFormData({ ...formData, rating });
        setFormErrors({ ...formErrors, rating: null });
    };

    const handleCommentChange = (e) => {
        setFormData({ ...formData, comment: e.target.value });
        setFormErrors({ ...formErrors, comment: null });
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.rating || formData.rating < 1 || formData.rating > 5) {
            newErrors.rating = 'Veuillez sélectionner une note entre 1 et 5 étoiles';
        }
        
        if (!formData.comment.trim()) {
            newErrors.comment = 'Veuillez saisir un commentaire';
        } else if (formData.comment.trim().length < 10) {
            newErrors.comment = 'Le commentaire doit contenir au moins 10 caractères';
        } else if (formData.comment.trim().length > 1000) {
            newErrors.comment = 'Le commentaire ne peut pas dépasser 1000 caractères';
        }

        setFormErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!auth.user) {
            alert('Vous devez être connecté pour laisser un avis');
            return;
        }

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        const data = {
            product_id: product.id,
            rating: formData.rating,
            comment: formData.comment.trim()
        };

        const options = {
            preserveScroll: true,
            onSuccess: (page) => {
                // Réinitialiser le formulaire seulement si c'est un nouvel avis
                if (!existingReview) {
                    setFormData({ rating: 0, comment: '' });
                    setHoveredRating(0);
                }
                setFormErrors({});
                // Informer le parent du type d'action
                if (onSuccess) {
                    onSuccess(existingReview ? 'updated' : 'created');
                }
            },
            onError: (errors) => {
                setFormErrors(errors);
            },
            onFinish: () => {
                setIsSubmitting(false);
            }
        };

        if (existingReview) {
            // Mise à jour d'un avis existant
            router.put(route('frontend.reviews.update', existingReview.id), data, options);
        } else {
            // Création d'un nouvel avis
            router.post(route('frontend.reviews.store'), data, options);
        }
    };

    if (!auth.user) {
        return (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
                <p className="text-gray-700 mb-4">
                    Vous devez être connecté pour laisser un avis sur ce produit.
                </p>
                <button
                    onClick={() => router.visit(route('login'))}
                    className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                    Se connecter
                </button>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
                {existingReview ? 'Modifier votre avis' : 'Laisser un avis'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Sélection de la note */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Votre note <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => {
                            const isActive = star <= (hoveredRating || formData.rating);
                            return (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => handleRatingClick(star)}
                                    onMouseEnter={() => setHoveredRating(star)}
                                    onMouseLeave={() => setHoveredRating(0)}
                                    className="p-1 focus:outline-none focus:ring-2 focus:ring-amber-500 rounded"
                                >
                                    {isActive ? (
                                        <StarIconSolid className="h-8 w-8 text-yellow-400" />
                                    ) : (
                                        <StarIcon className="h-8 w-8 text-gray-300 hover:text-yellow-400" />
                                    )}
                                </button>
                            );
                        })}
                        {formData.rating > 0 && (
                            <span className="ml-3 text-sm text-gray-600">
                                {formData.rating === 1 && "Très décevant"}
                                {formData.rating === 2 && "Décevant"}
                                {formData.rating === 3 && "Correct"}
                                {formData.rating === 4 && "Très bien"}
                                {formData.rating === 5 && "Excellent"}
                            </span>
                        )}
                    </div>
                    {formErrors.rating && (
                        <p className="mt-2 text-sm text-red-600">{formErrors.rating}</p>
                    )}
                </div>

                {/* Commentaire */}
                <div>
                    <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-3">
                        Votre commentaire <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        id="comment"
                        rows={4}
                        value={formData.comment}
                        onChange={handleCommentChange}
                        placeholder="Partagez votre expérience avec ce produit..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none"
                        maxLength={1000}
                    />
                    <div className="flex justify-between mt-2">
                        <div>
                            {formErrors.comment && (
                                <p className="text-sm text-red-600">{formErrors.comment}</p>
                            )}
                        </div>
                        <p className="text-xs text-gray-500">
                            {formData.comment.length}/1000 caractères
                        </p>
                    </div>
                </div>

                {/* Boutons */}
                <div className="flex items-center justify-end space-x-3">
                    {existingReview && onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Annuler
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={isSubmitting || !formData.rating || !formData.comment.trim()}
                        className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-2 rounded-lg font-medium hover:from-amber-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        <PaperAirplaneIcon className="h-4 w-4" />
                        <span>
                            {isSubmitting 
                                ? 'Publication...' 
                                : existingReview 
                                    ? 'Mettre à jour' 
                                    : 'Publier l\'avis'
                            }
                        </span>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ReviewForm;