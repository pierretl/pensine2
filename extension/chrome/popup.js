import { dom } from './utils/domElements.js';
import { saveToken, testToken, clearToken, clearLogToken, prefillTokenInput } from './services/tokenManager.js';
import { extractPageInfo } from './utils/extractPageInfo.js';
import { formatNanmeScreenshot } from './utils/formatNanmeScreenshot.js';
import { checkResponseOk } from './utils/checkResponseOk.js';

//////////////////////////////////////////////////////////
// GESTION DU TOKEN
//////////////////////////////////////////////////////////

dom.saveToken.addEventListener("click", saveToken);
dom.testToken.addEventListener("click", testToken);
dom.clearToken.addEventListener("click", clearToken);
dom.clearLogToken.addEventListener("click", clearLogToken);
prefillTokenInput();


//////////////////////////////////////////////////////////
// MARQUE LA PAGE
//////////////////////////////////////////////////////////

// Pré-remplis le formulaire d'enregistrement du marque page
document.addEventListener("DOMContentLoaded", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Injecte le script pour obtenir titre + description
  const results = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: extractPageInfo,
  });

  // Affiche les data de la page dans la popup
  const { title, description } = results[0].result;
  document.getElementById("titleInput").value = title;
  document.getElementById("descInput").value = description;

  //recupére l'url
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    const url = tabs[0]?.url || "Aucune URL trouvée";
    document.getElementById("urlInput").value = url;
  });

  // Capture du screenshot de l’onglet visible
  chrome.tabs.captureVisibleTab(null, { format: "png" }, (dataUrl) => {
    //affiche le visuel
    document.getElementById("screenshot").src = dataUrl;
    //set le champ input
    document.getElementById("screenshotCode").value = dataUrl.replace(/^data:image\/png;base64,/, '');
  });
});

// Log de l'enregistrer sur GitHub
const log = (msg) => {
  document.getElementById("log").textContent += msg + "\n";
};


// Sauvegarde vers GitHub + Upload screenshot
const GITHUB_API_URL = "https://api.github.com/repos/pierretl/pensine2/contents/pensine.json";

document.getElementById("saveButton").addEventListener("click", async () => {
  const urlSite = document.getElementById("urlInput").value;
  const title = document.getElementById("titleInput").value;
  const description = document.getElementById("descInput").value;

  chrome.storage.local.get("githubToken", async (result) => {
    const token = result.githubToken;

    if (!token) {
      log("Aucun token trouvé");
      return;
    }

    // Nom du screenshot
    const imageFileName = formatNanmeScreenshot(urlSite);
    const imagePath = `media/screenshot/${imageFileName}`;

    // Capture de l'onglet actif
    chrome.tabs.captureVisibleTab(null, { format: "png" }, async (dataUrl) => {
      try {
        const base64Image = dataUrl.replace(/^data:image\/png;base64,/, '');

        // Upload de l'image
        log("Envoi de l'image sur GitHub...");
        const imageUploadRes = await fetch(`https://api.github.com/repos/pierretl/pensine2/contents/${imagePath}`, {
          method: "PUT",
          headers: {
            "Authorization": `token ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            message: "Ajout d'un screenshot du marque page via une extension Chrome",
            content: base64Image
          })
        });

        checkResponseOk(imageUploadRes, "Erreur upload image");

        log("Image uploadée avec succès");

        // Mise à jour du fichier JSON
        log("Chargement du JSON GitHub...");
        const res = await fetch(GITHUB_API_URL, {
          method: 'GET',
          headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });

        checkResponseOk(res, "Erreur récupération fichier");

        const data = await res.json();
        const contentDecoded = atob(data.content);
        const sha = data.sha;
        const jsonArray = JSON.parse(contentDecoded);

        log("JSON chargé");

        jsonArray.push({
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
            message: "Ajout d'un marque page via une extension Chrome",
            content: updatedContent,
            sha: sha
          })
        });

        checkResponseOk(updateRes, "Erreur envoi PUT");

        log("Fichier JSON mis à jour !");
      } catch (err) {
        console.error(err);
        log("ERREUR " + err.message);
      }
    });
  });
});