import { getGithubToken } from '../utils/getGithubToken.js';
import { formatNanmeScreenshot } from '../utils/formatNanmeScreenshot.js';
import { log } from '../utils/log.js';
import { checkResponseOk } from '../utils/checkResponseOk.js';

const GITHUB_API_URL = "https://api.github.com/repos/pierretl/pensine2/contents/pensine.json";

export async function saveBookmark({ urlfavicon, urlSite, title, description, screenshotDataUrl }) {
    const token = await getGithubToken();
    if (!token) throw new Error("Token GitHub introuvable");

    const imageFileName = formatNanmeScreenshot(urlSite);
    const imagePath = `media/screenshot/${imageFileName}`;
    const base64Image = screenshotDataUrl.replace(/^data:image\/png;base64,/, '');

    // Upload image (en création ou mise à jour)
    await uploadScreenshotToGitHub({ base64Image, imagePath, token });

    // Récupération et mise à jour du fichier JSON
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

    jsonArray.push({
        urlfavicon,
        urlSite,
        title,
        description,
        screenshot: imageFileName,
        date: new Date().toISOString()
    });

    const updatedContent = btoa(JSON.stringify(jsonArray, null, 2));

    const updateRes = await fetch(GITHUB_API_URL, {
        method: 'PUT',
        headers: {
            'Authorization': `token ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: "Ajout d'un marque-page via extension Chrome",
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
    const checkRes = await fetch(`https://api.github.com/repos/pierretl/pensine2/contents/${imagePath}`, {
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
    const uploadRes = await fetch(`https://api.github.com/repos/pierretl/pensine2/contents/${imagePath}`, {
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
