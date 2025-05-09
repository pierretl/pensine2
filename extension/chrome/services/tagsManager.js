import { getGithubToken, getGitHubFileUrl } from '../utils/githubUtils.js';
import { checkResponseOk } from '../utils/checkResponseOk.js';
import { utf8ToBase64 } from './github.js';
import { log } from '../utils/log.js';
/**
 * Prend une liste mixte d'IDs et de labels, met à jour tags.json si nécessaire,
 * et retourne une liste d'IDs correspondant à tous les tags.
 * @param {string[]} rawTags - Liste mixte ["1", "react", "css"]
 * @returns {Promise<string[]>} Liste propre d'IDs ["1", "2", "3"]
 */
export async function processTagsAndUpdate(rawTags) {
    const tagValues = rawTags.filter(Boolean);
    let existingTags = [];
    let shaTags = '';
    const updatedTagIds = [];

    try {
        const TAGS_API_URL = await getGitHubFileUrl("tags.json");
        const resTags = await fetch(TAGS_API_URL);
        const dataTags = await resTags.json();
        existingTags = JSON.parse(atob(dataTags.content));
        shaTags = dataTags.sha;
    } catch (err) {
        log("Erreur lors du chargement de tags.json");
        throw err;
    }

    let lastId = existingTags.reduce((max, tag) => Math.max(max, parseInt(tag.id, 10)), 0);
    const newTagsToAdd = [];

    for (const tag of tagValues) {
        if (/^\d+$/.test(tag)) {
            updatedTagIds.push(tag);
        } else {
            const found = existingTags.find(t => t.label.toLowerCase() === tag.toLowerCase());
            if (found) {
                updatedTagIds.push(found.id.toString());
            } else {
                const newId = ++lastId;
                newTagsToAdd.push({ id: newId, label: tag });
                updatedTagIds.push(newId.toString());
            }
        }
    }

    if (newTagsToAdd.length > 0) {
        const updatedTagsJson = [...existingTags, ...newTagsToAdd];
        const encoded = utf8ToBase64(JSON.stringify(updatedTagsJson, null, 2));

        const TAGS_API_URL = await getGitHubFileUrl("tags.json");
        const updateRes = await fetch(TAGS_API_URL, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${await getGithubToken()}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: "Ajout de nouveaux tags avec extension Chrome Pensine",
                content: encoded,
                sha: shaTags
            })
        });

        checkResponseOk(updateRes, "Erreur mise à jour tags.json");
    }

    return updatedTagIds;
}