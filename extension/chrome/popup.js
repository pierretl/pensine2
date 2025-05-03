import { checkResponseOk } from './utils/checkResponseOk.js';
import { formatNanmeScreenshot } from './utils/formatNanmeScreenshot.js';

// Log de la gestion du Token
const logToken = (msg) => {
  document.getElementById("logToken").textContent = msg;
  document.getElementById("clearLogToken").classList.remove("hide");
};

// Effacer les logToken
document.getElementById("clearLogToken").addEventListener("click", () => {
  logToken("");
  document.getElementById("clearLogToken").classList.add("hide");
});

// Pré-remplir le champ token si existe déjà
chrome.storage.local.get("githubToken", (result) => {
  const token = result.githubToken;
  if (token) {
    document.getElementById("tokenInput").value = token;
  }
});

//Stocker le token
document.getElementById("saveToken").addEventListener("click", () => {
  const token = document.getElementById("tokenInput").value;

  if (token) {
    chrome.storage.local.set({ githubToken: token }, () => {
      logToken("Token enregistré");
    });
  }
});

//Tester le token
document.getElementById("testToken").addEventListener("click", () => {
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
});


//Effacer le token
document.getElementById("clearToken").addEventListener("click", () => {
  chrome.storage.local.remove("githubToken", () => {
    logToken("Token supprimé");
    document.getElementById("tokenInput").value = "";
  });
});

// Récupérer les infos de l'onglet
function extractPageInfo() {
  const title = document.title;
  const metaDesc = document.querySelector('meta[name="description"]');
  const description = metaDesc ? metaDesc.content : "";
  return { title, description };
}

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