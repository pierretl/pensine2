export function formatNanmeScreenshot(url, date = new Date().toISOString().split('T')[0]) {
    try {
        const parsedUrl = new URL(url);
        const domaine = parsedUrl.hostname.replace(/^www\./, '').replace(/\./g, '-');
        let chemin = parsedUrl.pathname.replace(/^\/|\/$/g, '').replace(/\//g, '-');
        if (!chemin) chemin = 'accueil';
    
        return `${domaine}__${chemin}__${date}.png`;
      } catch (e) {
        log("URL invalide :", e);
        return null;
      }
}