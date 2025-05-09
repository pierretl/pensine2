import { getGithubToken, getGitHubFileUrl } from '../utils/githubUtils.js';
import { formatNanmeScreenshot } from '../utils/formatNanmeScreenshot.js';
import { log } from '../utils/log.js';
import { checkResponseOk } from '../utils/checkResponseOk.js';

export function utf8ToBase64(str) {
    return btoa(unescape(encodeURIComponent(str)));
}

export async function saveBookmark({ note, urlfavicon, urlSite, title, description, screenshotDataUrl, tags }) {
    const token = await getGithubToken();
    if (!token) throw new Error("Token GitHub introuvable");

    const imageFileName = formatNanmeScreenshot(urlSite);
    const imagePath = `media/screenshot/${imageFileName}`;
    const base64Image = screenshotDataUrl.replace(/^data:image\/png;base64,/, '');

    // Upload de la capture
    await uploadScreenshotToGitHub({ base64Image, imagePath, token });

    // ==== 1. `tags` est déjà une liste d'IDs propre, voir processTagsAndUpdate()
    const tagIds = tags;

    // ==== 2. Mise à jour de pensine.json ====
    const GITHUB_API_URL = await getGitHubFileUrl("pensine.json");

    log("Chargement du JSON GitHub...");
    const res = await fetch(GITHUB_API_URL, {
        method: 'GET',
        headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json'
        }
    });
    checkResponseOk(res, "Erreur récupération JSON");

    const data = await res.json();
    const jsonArray = JSON.parse(atob(data.content));
    const sha = data.sha;

    // Ajouter un nouveau marque-page
    jsonArray.push({
        urlfavicon,
        urlSite,
        title,
        description,
        screenshot: imageFileName,
        tags: tagIds.join(','),  // 💡 Clé tags avec IDs séparés par virgule
        note,
        date: new Date().toISOString()
    });

    // Encodage final
    const updatedContent = utf8ToBase64(JSON.stringify(jsonArray, null, 2));
    const updateRes = await fetch(GITHUB_API_URL, {
        method: 'PUT',
        headers: {
            'Authorization': `token ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: "Ajout d'un marque-page avec extension Chrome Pensine",
            content: updatedContent,
            sha: sha
        })
    });

    checkResponseOk(updateRes, "Erreur mise à jour JSON");
    log("Fichier JSON mis à jour !");
}


async function uploadScreenshotToGitHub({ base64Image, imagePath, token }) {
    let existingSha = null;

    // Vérifie si le fichier existe déjà
    const checkUrl = await getGitHubFileUrl(imagePath);
    const checkRes = await fetch(checkUrl, {
        method: 'GET',
        headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json'
        }
    });

    if (checkRes.ok) {
        const existing = await checkRes.json();
        existingSha = existing.sha;
        log("Le screenshot existe déjà, mise à jour...");
    } else if (checkRes.status !== 404) {
        checkResponseOk(checkRes, "Erreur vérification fichier existant");
    }
    
    // Envoi du fichier
    log("Envoi de l'image sur GitHub...");
    const uploadUrl = await getGitHubFileUrl(imagePath);
    const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
            "Authorization": `token ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            message: "Ajout ou mise à jour screenshot via extension Chrome",
            content: base64Image,
            ...(existingSha ? { sha: existingSha } : {})
        })
    });

    checkResponseOk(uploadRes, "Erreur upload image");
    log("Image uploadée avec succès.");
}
