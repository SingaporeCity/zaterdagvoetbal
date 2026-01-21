/**
 * ZATERDAGVOETBAL - Utility Functions Module
 * Basic helper functions used throughout the game
 */

import { DIVISIONS } from './constants.js';

export function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomFromArray(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

export function formatCurrency(amount) {
    return '€' + amount.toLocaleString('nl-NL');
}

export function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

export function getDivision(id) {
    return DIVISIONS.find(d => d.id === id);
}

export function calculatePotential(overall, age) {
    // Younger players have much higher potential, older players less
    if (age <= 19) {
        return Math.min(99, overall + random(15, 35));
    } else if (age <= 23) {
        return Math.min(99, overall + random(10, 25));
    } else if (age <= 27) {
        return Math.min(99, overall + random(5, 15));
    } else if (age <= 30) {
        return Math.min(99, overall + random(2, 8));
    } else {
        return Math.min(99, overall + random(0, 3));
    }
}

export function getNextMidnight() {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    return midnight.getTime();
}

export function formatTimeRemaining(ms) {
    if (ms <= 0) return 'Nu!';
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
