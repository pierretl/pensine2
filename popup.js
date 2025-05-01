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
  
  // Bouton qui log dans la console de la page active
  document.getElementById("logButton").addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
    const title = document.getElementById("titleInput").value;
    const description = document.getElementById("descInput").value;
  
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (title, description) => {
        console.log("Titre de la page :", title);
        console.log("Description :", description);
      },
      args: [title, description],
    });
  });
  

  document.getElementById("downloadButton").addEventListener("click", async () => {
    const dataUrl = document.getElementById("screenshot").src;
  
    chrome.downloads.download({
      url: dataUrl,
      filename: "screenshot.png"
    });
  });