import { dom } from './domElements.js';

// Log ajout
export const log = (msg) => {
    const el = dom.log;
    if (el) el.textContent += msg + "\n";
}

// Log settings
export const logSettings = (msg) => {
    dom.logSettings.textContent = msg;
};