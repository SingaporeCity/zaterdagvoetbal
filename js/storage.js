/**
 * ZATERDAGVOETBAL - Storage Module
 * Handles save/load functionality with localStorage
 */

const SAVE_KEY = 'zaterdagvoetbal_save';
const AUTO_SAVE_INTERVAL = 30000; // 30 seconds

let autoSaveTimer = null;

/**
 * Save game state to localStorage
 */
export function saveGame(gameState) {
    try {
        const saveData = {
            version: '2.0',
            timestamp: Date.now(),
            state: gameState
        };
        localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
        console.log('💾 Game saved!');
        return true;
    } catch (error) {
        console.error('Failed to save game:', error);
        return false;
    }
}

/**
 * Load game state from localStorage
 */
export function loadGame() {
    try {
        const saveData = localStorage.getItem(SAVE_KEY);
        if (!saveData) {
            console.log('📂 No save file found');
            return null;
        }

        const parsed = JSON.parse(saveData);
        console.log('📂 Game loaded from', new Date(parsed.timestamp).toLocaleString('nl-NL'));
        return parsed.state;
    } catch (error) {
        console.error('Failed to load game:', error);
        return null;
    }
}

/**
 * Check if a save file exists
 */
export function hasSaveFile() {
    return localStorage.getItem(SAVE_KEY) !== null;
}

/**
 * Delete the save file
 */
export function deleteSave() {
    localStorage.removeItem(SAVE_KEY);
    console.log('🗑️ Save file deleted');
}

/**
 * Get save file info without loading full state
 */
export function getSaveInfo() {
    try {
        const saveData = localStorage.getItem(SAVE_KEY);
        if (!saveData) return null;

        const parsed = JSON.parse(saveData);
        return {
            version: parsed.version,
            timestamp: parsed.timestamp,
            clubName: parsed.state?.club?.name || 'Onbekend',
            division: parsed.state?.club?.division || 8,
            season: parsed.state?.season || 1,
            week: parsed.state?.week || 1
        };
    } catch (error) {
        return null;
    }
}

/**
 * Start auto-save timer
 */
export function startAutoSave(gameState) {
    if (autoSaveTimer) {
        clearInterval(autoSaveTimer);
    }

    autoSaveTimer = setInterval(() => {
        saveGame(gameState);
    }, AUTO_SAVE_INTERVAL);

    // Save on page close
    window.addEventListener('beforeunload', () => {
        saveGame(gameState);
    });

    console.log('🔄 Auto-save enabled (every 30 seconds)');
}

/**
 * Stop auto-save timer
 */
export function stopAutoSave() {
    if (autoSaveTimer) {
        clearInterval(autoSaveTimer);
        autoSaveTimer = null;
    }
}

/**
 * Calculate offline progress
 * Returns what happened while the player was away
 */
export function calculateOfflineProgress(gameState) {
    const lastSave = getSaveInfo();
    if (!lastSave) return null;

    const now = Date.now();
    const elapsed = now - lastSave.timestamp;
    const hoursAway = Math.floor(elapsed / (1000 * 60 * 60));

    if (hoursAway < 1) return null;

    const progress = {
        hoursAway,
        trainingSessions: 0,
        scoutMissionsCompleted: 0,
        injuriesHealed: [],
        energyRecovered: 0,
        matchesReady: false
    };

    // Check if training completed
    if (gameState.training.slots) {
        const trainingDuration = gameState.training.sessionDuration || (6 * 60 * 60 * 1000);
        for (const [slot, data] of Object.entries(gameState.training.slots)) {
            if (data.playerId && data.startTime) {
                const trainingElapsed = now - data.startTime;
                if (trainingElapsed >= trainingDuration) {
                    progress.trainingSessions++;
                }
            }
        }
    }

    // Check if scout mission completed
    if (gameState.scoutMission?.active && gameState.scoutMission?.startTime) {
        const scoutElapsed = now - gameState.scoutMission.startTime;
        if (scoutElapsed >= gameState.scoutMission.duration) {
            progress.scoutMissionsCompleted = 1;
        }
    }

    // Energy recovery (players recover energy while away)
    progress.energyRecovered = Math.min(hoursAway * 5, 30); // 5% per hour, max 30%

    // Check if match is ready
    if (gameState.nextMatch?.time && now >= gameState.nextMatch.time) {
        progress.matchesReady = true;
    }

    return progress;
}

/**
 * Apply offline progress to game state
 */
export function applyOfflineProgress(gameState, progress) {
    if (!progress) return;

    // Apply energy recovery to all players
    if (progress.energyRecovered > 0) {
        gameState.players.forEach(player => {
            player.energy = Math.min(100, (player.energy || 70) + progress.energyRecovered);
            player.fitness = Math.min(100, (player.fitness || 80) + Math.floor(progress.energyRecovered / 2));
        });
    }

    console.log('⏰ Offline progress applied:', progress);
}

/**
 * Export save as downloadable file
 */
export function exportSave(gameState) {
    const saveData = {
        version: '2.0',
        timestamp: Date.now(),
        state: gameState
    };

    const blob = new Blob([JSON.stringify(saveData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `zaterdagvoetbal_${gameState.club.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();

    URL.revokeObjectURL(url);
    console.log('📤 Save exported');
}

/**
 * Import save from file
 */
export function importSave(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const saveData = JSON.parse(e.target.result);
                if (saveData.state && saveData.version) {
                    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
                    resolve(saveData.state);
                } else {
                    reject(new Error('Invalid save file format'));
                }
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
    });
}
