import { dom } from './utils/domElements.js';

import { initThemeSwitcher } from './services/theme.js';
import { initTabs } from './utils/tabs.js';
import { saveSettings, resetGitHubSettings, prefillInputSettings} from './services/settingsStorage.js';
import { initPageData } from './handlers/initPageData.js';
import { loadTagsInDatalist } from './utils/tags.js';
import { initTagInput } from './handlers/tagInputHandler.js';
import { displayPensineEntries } from './utils/pensineDisplay.js';
import { displayRepoSizeProgress } from './services/displayRepoSize.js';
import { handleBookmarkSave } from './handlers/saveBookmarkHandler.js';


document.addEventListener("DOMContentLoaded", async () => {

    // theme
    initThemeSwitcher(dom.themeSelect);

    // menu tabs
    initTabs();

    // Configuration
    dom.saveSettings.addEventListener("click", saveSettings);
    dom.resetGitHubSettings.addEventListener("click", resetGitHubSettings);
    prefillInputSettings();

    // Récupère les données de la page
    await initPageData(dom);

    // Tags
    loadTagsInDatalist();
    initTagInput(dom);

    // Panel liste - Liste des bookmark
    displayPensineEntries();
    dom.reloadPensineContent.addEventListener("click", displayPensineEntries);

    // Panel liste - Espace libre
    displayRepoSizeProgress();

    // Ajout d'un nouveau bookmark
    dom.saveButton.addEventListener("click", async () => {
        await handleBookmarkSave(dom);
    });

}); 