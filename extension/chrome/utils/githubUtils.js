export async function getGithubToken() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get("githubToken", (result) => {
            if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
            resolve(result.githubToken);
        });
    });
}


/**
 * Fonction pour obtenir l'URL de l'API GitHub pour récupérer un fichier JSON spécifique depuis le dépôt.
 * 
 * @param {string} jsonFilePath - Le chemin relatif du fichier JSON dans le dépôt (ex: 'pensine.json').
 * @returns {string} L'URL pour accéder au fichier JSON dans le dépôt GitHub.
 */
export const getGitHubJsonUrl = (jsonFilePath = "pensine.json") => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(["githubUsername", "githubRepository"], (result) => {
            const user = result.githubUsername;
            const repo = result.githubRepository;

            if (user && repo) {
                const url = `https://api.github.com/repos/${user}/${repo}/contents/${jsonFilePath}`;
                resolve(url);
            } else {
                reject("Nom d'utilisateur ou dépôt manquant pour générer l'URL.");
            }
        });
    });
};


/**
 * Fonction pour obtenir l'URL de l'API GitHub pour uploader ou mettre à jour un fichier dans le dépôt.
 * 
 * @param {string} filePath - Le chemin relatif du fichier dans le dépôt (ex: 'media/screenshot/image.png').
 * @returns {string} L'URL pour envoyer un fichier ou mettre à jour un fichier dans le dépôt GitHub.
 */
export const getGitHubUploadUrl = (filePath = "media/screenshot/image.png") => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(["githubUsername", "githubRepository"], (result) => {
            const user = result.githubUsername;
            const repo = result.githubRepository;

            if (user && repo) {
                const url = `https://api.github.com/repos/${user}/${repo}/contents/${filePath}`;
                resolve(url);
            } else {
                reject("Nom d'utilisateur ou dépôt manquant pour générer l'URL.");
            }
        });
    });
};