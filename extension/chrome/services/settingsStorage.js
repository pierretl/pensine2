import { dom } from '../utils/domElements.js';
import { logSettings } from '../utils/log.js';

// Sauvegarder les config
export const saveSettings = () => {
    const user = dom.userInput.value.trim();
    const repo = dom.repoInput.value.trim();
    const token = dom.tokenInput.value.trim();

    if (!user || !repo || !token) {
        logSettings("Veuillez remplir tous les champs");
        return;
    }

    const url = `https://api.github.com/repos/${user}/${repo}/contents/`;

    fetch(url, {
        headers: {
            Authorization: `token ${token}`,
            Accept: "application/vnd.github.v3+json"
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Erreur ${response.status}: dépôt introuvable ou accès refusé`);
        }
        return response.json();
    })
    .then(() => {
        chrome.storage.local.set({
            githubUsername: user,
            githubRepository: repo,
            githubToken: token
        }, () => {
            logSettings("Utilisateur, dépôt et token valides et enregistrés");
        });
    })
    .catch(error => {
        logSettings(`Erreur de validation\n${error.message}`);
    });
};

// Pré-remplir les settings si ils existent déjà
export const prefillInputSettings = () => {
    chrome.storage.local.get(["githubUsername", "githubRepository", "githubToken"], (result) => {
        const { githubUsername, githubRepository, githubToken } = result;
        if (githubUsername) {
            dom.userInput.value = githubUsername;
        }
        if (githubRepository) {
            dom.repoInput.value = githubRepository;
        }
        if (githubToken) {
            dom.tokenInput.value = githubToken;
        }
    });
};

// Supprimer la configuration GitHub resetGitHubSettings
export const resetGitHubSettings = () => {
    // Ouvre le <dialog>
    dom.resetGitHubSettingsDialog.showModal();

    // Supprime les anciens gestionnaires pour éviter les doublons
    dom.resetGitHubSettingsYes.onclick = (e) => {
        e.preventDefault();
        chrome.storage.local.remove(["githubUsername", "githubRepository","githubToken"], () => {
            dom.userInput.value = "";
            dom.repoInput.value = "";
            dom.tokenInput.value = "";
            logSettings("Configuration supprimée avec succès.");
        });
        dom.resetGitHubSettingsDialog.close();
    };

    dom.resetGitHubSettingsNo.onclick = (e) => {
        e.preventDefault();
        logSettings("Suppression annulée.");
        dom.resetGitHubSettingsDialog.close();
    };
};
