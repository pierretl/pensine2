export function validateBookmarkFields({ title, description, urlSite }) {
    const errors = [];

    if (!title || title.trim().length === 0) {
        errors.push("Le titre est obligatoire.");
    } else if (title.length > 150) {
        errors.push("Le titre est trop long (150 caractères max).");
    }

    if (description && description.length > 500) {
        errors.push("La description est trop longue (500 caractères max).");
    }

    try {
        const url = new URL(urlSite);
        if (!/^https?:/.test(url.protocol)) {
            errors.push("L'URL doit commencer par http ou https.");
        }
    } catch {
        errors.push("L'URL est invalide.");
    }

    return errors;
}

export function sanitizeText(input, maxLength = 500) {
    if (typeof input !== 'string') return '';
    const trimmed = input.trim().substring(0, maxLength);
    return trimmed
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
        .replace(/\\/g, "\\\\");
}
