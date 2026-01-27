import React, { useState, useEffect } from 'react';
import { 
    BellIcon, 
    SpeakerWaveIcon, 
    SpeakerXMarkIcon,
    ClockIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

/**
 * Composant de préférences pour les notifications
 * Permet aux utilisateurs de personnaliser leur expérience de notifications
 */
export const NotificationPreferences = ({ isOpen, onClose }) => {
    const [preferences, setPreferences] = useState({
        enabled: true,
        soundEnabled: false,
        duration: 5000,
        position: 'top-right',
        maxVisible: 5,
    });

    useEffect(() => {
        // Charge les préférences depuis localStorage
        const saved = localStorage.getItem('notification_preferences');
        if (saved) {
            try {
                setPreferences(JSON.parse(saved));
            } catch (error) {
                console.error('Failed to load notification preferences:', error);
            }
        }
    }, []);

    const updatePreference = (key, value) => {
        const updated = { ...preferences, [key]: value };
        setPreferences(updated);
        localStorage.setItem('notification_preferences', JSON.stringify(updated));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden animate-fade-in">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <BellIcon className="h-6 w-6 text-white" />
                        <h2 className="text-xl font-bold text-white">
                            Préférences de notifications
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                    >
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Activer les notifications */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-gray-900">Notifications</h3>
                            <p className="text-sm text-gray-600">Afficher les notifications</p>
                        </div>
                        <button
                            onClick={() => updatePreference('enabled', !preferences.enabled)}
                            className={`
                                relative inline-flex h-6 w-11 items-center rounded-full
                                transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                                ${preferences.enabled ? 'bg-blue-600' : 'bg-gray-300'}
                            `}
                        >
                            <span
                                className={`
                                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                                    ${preferences.enabled ? 'translate-x-6' : 'translate-x-1'}
                                `}
                            />
                        </button>
                    </div>

                    {/* Sons */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            {preferences.soundEnabled ? (
                                <SpeakerWaveIcon className="h-5 w-5 text-gray-600" />
                            ) : (
                                <SpeakerXMarkIcon className="h-5 w-5 text-gray-400" />
                            )}
                            <div>
                                <h3 className="font-semibold text-gray-900">Sons</h3>
                                <p className="text-sm text-gray-600">Jouer un son lors des notifications</p>
                            </div>
                        </div>
                        <button
                            onClick={() => updatePreference('soundEnabled', !preferences.soundEnabled)}
                            disabled={!preferences.enabled}
                            className={`
                                relative inline-flex h-6 w-11 items-center rounded-full
                                transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                                ${preferences.soundEnabled && preferences.enabled ? 'bg-blue-600' : 'bg-gray-300'}
                                ${!preferences.enabled ? 'opacity-50 cursor-not-allowed' : ''}
                            `}
                        >
                            <span
                                className={`
                                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                                    ${preferences.soundEnabled ? 'translate-x-6' : 'translate-x-1'}
                                `}
                            />
                        </button>
                    </div>

                    {/* Durée d'affichage */}
                    <div>
                        <div className="flex items-center space-x-3 mb-3">
                            <ClockIcon className="h-5 w-5 text-gray-600" />
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900">Durée d'affichage</h3>
                                <p className="text-sm text-gray-600">{preferences.duration / 1000} secondes</p>
                            </div>
                        </div>
                        <input
                            type="range"
                            min="2000"
                            max="10000"
                            step="1000"
                            value={preferences.duration}
                            onChange={(e) => updatePreference('duration', parseInt(e.target.value))}
                            disabled={!preferences.enabled}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>2s</span>
                            <span>10s</span>
                        </div>
                    </div>

                    {/* Position */}
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-3">Position à l'écran</h3>
                        <div className="grid grid-cols-3 gap-2">
                            {['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'].map(pos => (
                                <button
                                    key={pos}
                                    onClick={() => updatePreference('position', pos)}
                                    disabled={!preferences.enabled}
                                    className={`
                                        px-3 py-2 text-sm rounded-lg border-2 transition-all
                                        ${preferences.position === pos
                                            ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                                            : 'border-gray-300 text-gray-700 hover:border-gray-400'
                                        }
                                        ${!preferences.enabled ? 'opacity-50 cursor-not-allowed' : ''}
                                    `}
                                >
                                    {pos.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Nombre max visible */}
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Notifications visibles</h3>
                        <select
                            value={preferences.maxVisible}
                            onChange={(e) => updatePreference('maxVisible', parseInt(e.target.value))}
                            disabled={!preferences.enabled}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            <option value={3}>3 notifications</option>
                            <option value={5}>5 notifications</option>
                            <option value={7}>7 notifications</option>
                            <option value={10}>10 notifications</option>
                        </select>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        Enregistrer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotificationPreferences;
