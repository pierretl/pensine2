import { getGithubToken, getGitHubFileUrl } from './githubUtils.js';
import { checkResponseOk } from './checkResponseOk.js';
import { log } from './log.js'; // Importer la fonction log
import { dom } from './domElements.js'; // Importer l'objet dom

function getImageUrlFromGitHub(filename) {
    const imagePath = "media/screenshot/"; // Chemin de base dans le dépôt

    return new Promise((resolve, reject) => {
        chrome.storage.local.get(["githubUsername", "githubRepository"], (result) => {
            const user = result.githubUsername;
            const repo = result.githubRepository;

            if (!user || !repo) {
                return reject("Nom d’utilisateur ou dépôt GitHub manquant dans le stockage.");
            }

            const urlImage = `https://raw.githubusercontent.com/${user}/${repo}/main/${imagePath}${filename}`;
            resolve(urlImage);
        });
    });
}


export async function displayPensineEntries() {
    try {
        const token = await getGithubToken();
        if (!token) {
            log("Token GitHub introuvable. Impossible de charger les entrées de pensine.");
            // Afficher un message à l'utilisateur dans l'interface ?
            return;
        }

        const headers = {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json'
        };

        // Charger les données de pensine.json depuis GitHub
        const pensineUrl = await getGitHubFileUrl("pensine.json");
        const pensineResponse = await fetch(pensineUrl, { headers });
        checkResponseOk(pensineResponse, "Erreur récupération pensine.json depuis GitHub");
        const pensineData = await pensineResponse.json();
        // Décoder le contenu
        const pensineJsonUtf8 = new TextDecoder("utf-8").decode(Uint8Array.from(atob(pensineData.content), c => c.charCodeAt(0)));
        const pensineEntries = JSON.parse(pensineJsonUtf8);



        // Charger les données de tags.json depuis GitHub
        const tagsUrl = await getGitHubFileUrl("tags.json");
        const tagsResponse = await fetch(tagsUrl, { headers });
        checkResponseOk(tagsResponse, "Erreur récupération tags.json depuis GitHub");
        const tagsData = await tagsResponse.json();
        // Décoder le contenu
        const tagsJsonUtf8 = new TextDecoder("utf-8").decode(Uint8Array.from(atob(tagsData.content), c => c.charCodeAt(0)));
        const tags = JSON.parse(tagsJsonUtf8);



        // Créer une map pour associer les IDs de tags à leurs labels
        const tagMap = tags.reduce((map, tag) => {
            map[tag.id] = tag.label;
            return map;
        }, {});

        // Générer le HTML pour la liste
        const pensineListItemsHTMLArray = await Promise.all(
            pensineEntries.map(async (entry) => {
                let imageHTML = '';

                // Si screenshot est défini et non vide
                if (entry.screenshot) {
                    const urlImage = await getImageUrlFromGitHub(entry.screenshot);
                    imageHTML = `<img src="${urlImage}" alt="" />`;
                } else if (entry.ogImage) {
                    imageHTML = `<img src="${entry.ogImage}" alt="" />`;
                } else {
                    imageHTML = `<p><em>Pas d’image disponible</em></p>`;
                }

                // Tags
                let tagsHTML = '';
                if (entry.tags) {
                    const entryTagIds = entry.tags.split(',').map(id => parseInt(id.trim(), 10));
                    const entryTagLabels = entryTagIds
                        .map(tagId => tagMap[tagId])
                        .filter(label => label);
                    if (entryTagLabels.length > 0) {
                        tagsHTML = `<p>Tags: ${entryTagLabels.join(', ')}</p>`;
                    }
                }

                return `
                    <li>
                        <div class="flex ai-c gap">
                            <img src="${entry.urlfavicon}" alt="" width="16" height="16" />
                            <p><a href="${entry.urlSite}" target="_blank">${entry.title}</a></p>
                        </div>
                        ${tagsHTML}
                        ${imageHTML}
                        <p>${entry.urlSite}</p>
                        <p>${entry.description}</p>
                        <p>${entry.note}</p>
                        <p>${entry.date}</p>
                    </li>
                `;
            })
        );


        const pensineListHTML = `<ul>${pensineListItemsHTMLArray.join('')}</ul>`;


        // Insérer le HTML dans l'élément dom.pensineContent
        if (dom.pensineContent) {
            dom.pensineContent.innerHTML = pensineListHTML;
        } else {
            log("Element dom.pensineContent not found.");
        }

    } catch (error) {
        log("Error loading or displaying pensine entries:", error);
    }
}
