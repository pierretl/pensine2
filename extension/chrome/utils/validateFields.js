export function validateBookmarkFields({ note, title, description, urlSite, urlfavicon }) {
    const errors = [];

    // Validation du titre
    if (!title || title.trim().length === 0) {
        errors.push("Le titre est obligatoire.");
    } else if (title.length > 150) {
        errors.push("Le titre est trop long (150 caractères max).");
    }

    // Validation des champs texte facultatifs (note, description)
    const validateTextField = (value, label) => {
        if (value && value.length > 500) {
            errors.push(`${label} est trop longue (500 caractères max).`);
        }
    };
    validateTextField(description, "La description");
    validateTextField(note, "La note");

    // Validation stricte d'URL (obligatoire)
    const validateRequiredUrl = (value, label) => {
        try {
            const url = new URL(value);
            if (!/^https?:/.test(url.protocol)) {
                errors.push(`L'URL ${label} doit commencer par http ou https.`);
            }
        } catch {
            errors.push(`L'URL ${label} est invalide.`);
        }
    };
    validateRequiredUrl(urlSite, "du site");

    // Aucun traitement de urlfavicon, osef

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
