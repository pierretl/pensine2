import { log } from '../utils/log.js';
import { validateBookmarkFields, sanitizeText } from '../utils/validateFields.js';
import { processTagsAndUpdate } from '../services/tagsManager.js';
import { saveBookmark } from '../services/github.js';
import { getCachedScreenshotDataUrl } from '../state/cache.js';
import { displayPensineEntries } from '../utils/pensineDisplay.js';

export async function handleBookmarkSave(dom) {
    const rawNote = dom.noteInput.value;
    const rawFaviconUrl = dom.faviconUrl.value;
    const rawUrl = dom.urlInput.value;
    const rawTitle = dom.titleInput.value;
    const rawDesc = dom.descInput.value;
    const screenshotDataUrl = getCachedScreenshotDataUrl();

    //validation
    const errors = validateBookmarkFields({
        note: rawNote,
        title: rawTitle,
        description: rawDesc,
        urlSite: rawUrl,
        urlfavicon: rawFaviconUrl
    });
    if (errors.length > 0) {
        errors.forEach(log);
        return;
    }

    // Nettoyage des données
    const note = sanitizeText(rawNote, 500);
    const title = sanitizeText(rawTitle, 150);
    const description = sanitizeText(rawDesc, 500);
    const urlSite = rawUrl.trim(); // L'URL est déjà validée, pas besoin de sanitize
    const urlfavicon = rawFaviconUrl.trim();

    // Tag
    let updatedTagIds;
    try {
        updatedTagIds = await processTagsAndUpdate(dom.tagIds.value.split(','));
        dom.tagIds.value = updatedTagIds.join(','); // Pour le mettre à jour dans le DOM
    } catch (err) {
        log("Erreur lors du traitement des tags.");
        return;
    }

    // Save
    try {
        await saveBookmark({
            note,
            urlfavicon,
            urlSite,
            title,
            description,
            screenshotDataUrl: screenshotDataUrl,
            tags: updatedTagIds
        });
        log("Marque-page enregistré avec succès !");

        displayPensineEntries();
        log("Liste des marque-page mis à jour !");
    } catch (err) {
        console.error(err);
        log("ERREUR : " + err.message);
    }
}
