import { dom } from './utils/domElements.js';

import { initTabs } from './utils/tabs.js';

import { saveToken, testToken, clearToken, clearLogToken, prefillTokenInput } from './services/tokenManager.js';

import { getPageInfo, getCurrentTab, getScreenshot } from './services/dataTab.js';
import { log } from './utils/log.js';
import { validateBookmarkFields, sanitizeText } from './utils/validateFields.js';
import { saveBookmark } from './services/github.js';


//////////////////////////////////////////////////////////
// INITIALISATION DES TABS
//////////////////////////////////////////////////////////
initTabs();
  

//////////////////////////////////////////////////////////
// GESTION DU TOKEN
//////////////////////////////////////////////////////////

dom.saveToken.addEventListener("click", saveToken);
dom.testToken.addEventListener("click", testToken);
dom.clearToken.addEventListener("click", clearToken);
dom.clearLogToken.addEventListener("click", clearLogToken);
prefillTokenInput();


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
  
    if (!cachedScreenshotDataUrl) {
        log("Erreur : aucune capture disponible.");
        return;
    }
  
    try {
        await saveBookmark({ note, urlfavicon, urlSite, title, description, screenshotDataUrl: cachedScreenshotDataUrl });
        log("Marque-page enregistré avec succès !");
    } catch (err) {
        console.error(err);
        log("ERREUR : " + err.message);
    }
});