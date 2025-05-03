import { dom } from './utils/domElements.js';

import { saveToken, testToken, clearToken, clearLogToken, prefillTokenInput } from './services/tokenManager.js';

import { getPageInfo, getCurrentTab, getScreenshot } from './services/dataTab.js';
import { saveBookmark } from './services/github.js';
import { log } from './utils/log.js';

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

document.addEventListener("DOMContentLoaded", async () => {
    const tab = await getCurrentTab();
    const { title, description } = await getPageInfo(tab.id);
    const url = tab.url;

    dom.titleInput.value = title;
    dom.descInput.value = description;
    dom.urlInput.value = url;

    cachedScreenshotDataUrl = await getScreenshot();
    dom.screenshotImg.src = cachedScreenshotDataUrl;
    dom.screenshotCode.value = cachedScreenshotDataUrl.replace(/^data:image\/png;base64,/, '');
});

dom.saveButton.addEventListener("click", async () => {
    const urlSite = dom.urlInput.value;
    const title = dom.titleInput.value;
    const description = dom.descInput.value;
  
    if (!cachedScreenshotDataUrl) {
        log("Erreur : aucune capture disponible.");
        return;
    }
  
    try {
        await saveBookmark({ urlSite, title, description, screenshotDataUrl: cachedScreenshotDataUrl });
        log("Marque-page enregistré avec succès !");
    } catch (err) {
        console.error(err);
        log("ERREUR : " + err.message);
    }
});