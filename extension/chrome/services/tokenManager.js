import { dom } from '../utils/domElements.js';

// Afficher les logs
const logToken = (msg) => {
    dom.logToken.textContent = msg;
    dom.clearLogToken.classList.remove("hide");
};

// Effacer les logs
export const clearLogToken = () => {
    logToken("");
    dom.clearLogToken.classList.add("hide");
};

// Pré-remplir le champ token si existe déjà
export const prefillTokenInput = () => {
    chrome.storage.local.get("githubToken", (result) => {
        const token = result.githubToken;
        if (token) {
            dom.tokenInput.value = token;
        }
    });
};

// Sauvegarder le token
export const saveToken = () => {
    const token = dom.tokenInput.value;

    if (token) {
        chrome.storage.local.set({ githubToken: token }, () => {
            logToken("Token enregistré");
        });
    }
};

// Tester le token
export const testToken = () => {
    chrome.storage.local.get("githubToken", (result) => {
        const token = result.githubToken;

        if (!token) {
            logToken("Erreur : Aucun token trouvé");
            return;
        }

        fetch("https://api.github.com/user", {
            headers: {
                Authorization: `token ${token}`
            }
        })
        .then(res => res.json())
        .then(data => {
            logToken(JSON.stringify(data, null, 2));
        })
        .catch(err => {
            logToken("Erreur : " + err);
        });
    });
};

// Effacer le token
export const clearToken = () => {
    chrome.storage.local.remove("githubToken", () => {
        logToken("Token supprimé");
        dom.tokenInput.value = "";
    });
};
