function getFormattedDateForFilename() {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');

    return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_` +
           `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
}


export function formatNanmeScreenshot(url) {
    try {
        const parsedUrl = new URL(url);
        const domaine = parsedUrl.hostname.replace(/^www\./, '').replace(/\./g, '-');
        let chemin = parsedUrl.pathname.replace(/^\/|\/$/g, '').replace(/\//g, '-');
        if (!chemin) chemin = 'accueil';
    
        return `${domaine}__${chemin}__${getFormattedDateForFilename()}.png`;
      } catch (e) {
        log("URL invalide :", e);
        return null;
      }
}