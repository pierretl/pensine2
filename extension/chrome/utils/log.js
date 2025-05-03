import { dom } from './domElements.js';

export function log(msg) {
    const el = dom.log;
    if (el) el.textContent += msg + "\n";
}