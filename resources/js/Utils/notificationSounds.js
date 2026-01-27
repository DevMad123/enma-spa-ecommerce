/**
 * Gestionnaire de sons pour les notifications
 * Permet d'ajouter un retour audio aux notifications
 */

// Configuration des sons
const soundConfig = {
    enabled: false, // Désactivé par défaut, peut être activé via les settings utilisateur
    volume: 0.3,
};

// Sons prédéfinis (utilise Web Audio API)
const sounds = {
    success: {
        frequency: 800,
        duration: 100,
        type: 'sine',
    },
    error: {
        frequency: 200,
        duration: 150,
        type: 'sawtooth',
    },
    warning: {
        frequency: 600,
        duration: 120,
        type: 'square',
    },
    info: {
        frequency: 500,
        duration: 80,
        type: 'sine',
    },
};

/**
 * Joue un son de notification
 * @param {string} type - Type de notification (success, error, warning, info)
 */
export const playNotificationSound = (type) => {
    if (!soundConfig.enabled) return;
    
    try {
        const soundData = sounds[type] || sounds.info;
        
        // Utilise Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = soundData.type;
        oscillator.frequency.value = soundData.frequency;
        
        gainNode.gain.setValueAtTime(soundConfig.volume, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
            0.01,
            audioContext.currentTime + soundData.duration / 1000
        );
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + soundData.duration / 1000);
        
    } catch (error) {
        console.warn('Notification sound playback failed:', error);
    }
};

/**
 * Active ou désactive les sons
 * @param {boolean} enabled
 */
export const setNotificationSoundsEnabled = (enabled) => {
    soundConfig.enabled = enabled;
    localStorage.setItem('notification_sounds_enabled', enabled ? '1' : '0');
};

/**
 * Ajuste le volume des sons
 * @param {number} volume - Volume entre 0 et 1
 */
export const setNotificationVolume = (volume) => {
    soundConfig.volume = Math.max(0, Math.min(1, volume));
    localStorage.setItem('notification_volume', soundConfig.volume.toString());
};

/**
 * Initialise les préférences depuis localStorage
 */
export const initNotificationSounds = () => {
    const enabled = localStorage.getItem('notification_sounds_enabled');
    const volume = localStorage.getItem('notification_volume');
    
    if (enabled !== null) {
        soundConfig.enabled = enabled === '1';
    }
    
    if (volume !== null) {
        soundConfig.volume = parseFloat(volume);
    }
};

// Auto-initialisation
if (typeof window !== 'undefined') {
    initNotificationSounds();
}

export default {
    play: playNotificationSound,
    setEnabled: setNotificationSoundsEnabled,
    setVolume: setNotificationVolume,
    init: initNotificationSounds,
};
