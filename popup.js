// Fonction à exécuter dans la page pour récupérer titre/description
function extractPageInfo() {
  const title = document.title;
  const metaDesc = document.querySelector('meta[name="description"]');
  const description = metaDesc ? metaDesc.content : "";
  return { title, description };
}
  
// Remplit les inputs avec les infos de la page
document.addEventListener("DOMContentLoaded", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Injecte le script pour obtenir titre + description
  const results = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: extractPageInfo,
  });

  const { title, description } = results[0].result;
  document.getElementById("titleInput").value = title;
  document.getElementById("descInput").value = description;

  // Capture du screenshot de l’onglet visible
  chrome.tabs.captureVisibleTab(null, { format: "png" }, (dataUrl) => {
    document.getElementById("screenshot").src = dataUrl;
  });
});

// Enregistrer sur GitHub
const GITHUB_API_URL = "https://api.github.com/repos/pierretl/pensine2/contents/pensine.json";
const GITHUB_TOKEN = "";

const log = (msg) => {
  document.getElementById("log").textContent += msg + "\n";
};

document.getElementById("saveButton").addEventListener("click", async () => {
  const title = document.getElementById("titleInput").value;
  const description = document.getElementById("descInput").value;
  const screenshot = document.getElementById("screenshot").src;

  try {
    log("Chargement du JSON GitHub...");

    const res = await fetch(GITHUB_API_URL, {
      method: 'GET',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!res.ok) throw new Error("Erreur récupération fichier");

    const data = await res.json();
    const contentDecoded = atob(data.content);
    const sha = data.sha;
    const jsonArray = JSON.parse(contentDecoded);

    log("JSON chargé");

    jsonArray.push({
      title,
      description,
      screenshot,
      date: new Date().toISOString()
    });

    const updatedContent = btoa(JSON.stringify(jsonArray, null, 2));

    const updateRes = await fetch(GITHUB_API_URL, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: "Ajout via extension Chrome",
        content: updatedContent,
        sha: sha
      })
    });

    if (!updateRes.ok) throw new Error("Erreur envoi PUT");

    log("Fichier mis à jour sur GitHub !");
  } catch (err) {
    console.error(err);
    log("ERROR " + err.message);
  }
});
