export async function getGithubToken() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get("githubToken", (result) => {
            if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
            resolve(result.githubToken);
        });
    });
}


/**
 * Fonction pour obtenir l\'URL de l\'API GitHub pour accéder à un fichier spécifique dans le dépôt.
 *
 * @param {string} filePath - Le chemin relatif du fichier dans le dépôt (ex: \'pensine.json\', \'media/screenshot/image.png\').
 * @returns {string} L\'URL pour accéder au fichier dans le dépôt GitHub.
 */
export const getGitHubFileUrl = (filePath) => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(["githubUsername", "githubRepository"], (result) => {
            const user = result.githubUsername;
            const repo = result.githubRepository;

            if (user && repo) {
                const url = `https://api.github.com/repos/${user}/${repo}/contents/${filePath}`;
                resolve(url);
            } else {
                reject("Nom d\'utilisateur ou dépôt manquant pour générer l\'URL.");
            }
        });
    });
};


/**
 * Récupère une propriété spécifique d’un dépôt GitHub
 * @param {string} field - Le champ à récupérer (ex: \"size\", \"description\", \"stargazers_count\")
 * @returns {Promise<*>} La valeur du champ demandé
 */
export async function getRepoInfoField(field) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(["githubUsername", "githubRepository"], async (result) => {
            const user = result.githubUsername;
            const repo = result.githubRepository;

            if (!user || !repo) return reject("Nom d\'utilisateur ou dépôt GitHub manquant.");

            try {
                const token = await getGithubToken();

                const res = await fetch(`https://api.github.com/repos/${user}/${repo}`, {
                    headers: {
                        Authorization: `token ${token}`,
                        Accept: 'application/vnd.github.v3+json'
                    }
                });

                if (!res.ok) return reject(`Erreur API GitHub : ${res.statusText}`);

                const data = await res.json();

                if (!(field in data)) {
                    return reject(`Champ \"${field}\" non trouvé dans la réponse de l’API.`);
                }

                resolve(data[field]);
            } catch (err) {
                reject(`Erreur lors de la récupération du champ \"${field}\" : ${err.message}`);
            }
        });
    });
}
