import { setCachedScreenshotDataUrl } from '../state/cache.js';
import { getPageInfo, getCurrentTab, getScreenshot } from '../services/dataTab.js';

export async function initPageData(dom) {
    try {
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

        const screenshotDataUrl = await getScreenshot();
        setCachedScreenshotDataUrl(screenshotDataUrl);
        dom.screenshotImg.src = screenshotDataUrl;
        dom.screenshotCode.value = screenshotDataUrl.replace(/^data:image\/png;base64,/, '');


    } catch (error) {
        log("Erreur lors de l'initialisation des données de la page :", error);
    }
}
