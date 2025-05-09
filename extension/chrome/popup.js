import { dom } from './utils/domElements.js';

import { initTabs } from './utils/tabs.js';

import { initThemeSwitcher } from './services/theme.js';

import { saveSettings, prefillInputSettings, resetGitHubSettings} from './services/settingsStorage.js';

import { loadTagsInDatalist, handleTagInput, addTagToList } from './utils/tags.js';

import { getPageInfo, getCurrentTab, getScreenshot } from './services/dataTab.js';
import { log } from './utils/log.js';
import { validateBookmarkFields, sanitizeText } from './utils/validateFields.js';
import { processTagsAndUpdate } from './services/tagsManager.js';
import { saveBookmark } from './services/github.js';

import { displayPensineEntries } from './utils/pensineDisplay.js';

import { displayRepoSizeProgress } from './services/displayRepoSize.js';

//////////////////////////////////////////////////////////
// GESTION DU THEME
//////////////////////////////////////////////////////////
initThemeSwitcher(dom.themeSelect);


//////////////////////////////////////////////////////////
// INITIALISATION DES TABS
//////////////////////////////////////////////////////////
initTabs();
  

//////////////////////////////////////////////////////////
// GESTION DE LA CONFIGURATION
//////////////////////////////////////////////////////////

dom.saveSettings.addEventListener("click", saveSettings);
dom.resetGitHubSettings.addEventListener("click", resetGitHubSettings);
prefillInputSettings();


//////////////////////////////////////////////////////////
//  GESTION DES TAGS
//////////////////////////////////////////////////////////
document.addEventListener('DOMContentLoaded', () => {
    loadTagsInDatalist();

    // Gère l'ajout de tags à la liste dès qu'une virgule est tapée ou Entrée est pressée
    dom.tagInput.addEventListener('input', handleTagInput);

    // Écoute l'événement 'keydown' pour détecter la touche Entrée
    dom.tagInput.addEventListener('keydown', (event) => {
        handleTagInput(event);  // Passe l'événement à `handleTagInput`
    });

    // Gestion de la sélection du tag depuis le datalist
    dom.tagInput.addEventListener('change', function () {
        const selectedLabel = this.value.trim();
        if (!selectedLabel) return;
    
        // Recherche dans les options du datalist
        const matchingOption = Array.from(dom.tagSuggestions.options).find(
            option => option.value === selectedLabel
        );
    
        if (matchingOption) {
            const tagId = matchingOption.getAttribute('data-id');
            const tagLabel = matchingOption.value;
    
            addTagToList(tagLabel, tagId);
            this.value = ''; // Vider le champ
        }
    });
});

//////////////////////////////////////////////////////////
// GESTION DU MARQUE LA PAGE
//////////////////////////////////////////////////////////

let cachedScreenshotDataUrl = null;

// Affichage
document.addEventListener("DOMContentLoaded", async () => {
    const tab = await getCurrentTab();
    const { title, description } = await getPageInfo(tab.id);
    const url = tab.url;

    dom.titleInput.value = title;
    dom.descInput.value = description;
    dom.urlInput.value = url;

    if (tab.favIconUrl) {
        dom.faviconUrl.value = tab.favIconUrl;
        dom.faviconImg.src = tab.favIconUrl;
    } else {
        dom.faviconNotFound.classList.remove('hide');
    }

    cachedScreenshotDataUrl = await getScreenshot();
    dom.screenshotImg.src = cachedScreenshotDataUrl;
    dom.screenshotCode.value = cachedScreenshotDataUrl.replace(/^data:image\/png;base64,/, '');
});


// Ajout
dom.saveButton.addEventListener("click", async () => {
    const rawNote = dom.noteInput.value;
    const rawFaviconUrl = dom.faviconUrl.value;
    const rawUrl = dom.urlInput.value;
    const rawTitle = dom.titleInput.value;
    const rawDesc = dom.descInput.value;

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
            screenshotDataUrl: cachedScreenshotDataUrl,
            tags: updatedTagIds
        });
        log("Marque-page enregistré avec succès !");

        displayPensineEntries();
        log("Liste des marque-page mis à jour !");
    } catch (err) {
        console.error(err);
        log("ERREUR : " + err.message);
    }
});

//////////////////////////////////////////////////////////
// ESPACE DISPONIBLE
//////////////////////////////////////////////////////////
document.addEventListener("DOMContentLoaded", displayRepoSizeProgress);

//////////////////////////////////////////////////////////
// AFFICHE LES BOOKMARKS
//////////////////////////////////////////////////////////
document.addEventListener("DOMContentLoaded", async () => {
    displayPensineEntries();
});
dom.reloadPensineContent.addEventListener("click", displayPensineEntries);