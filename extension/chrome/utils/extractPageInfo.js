// Récupérer les infos de l'onglet
export function extractPageInfo() {
    const title = document.title;
    const metaDesc = document.querySelector('meta[name="description"]');
    const description = metaDesc ? metaDesc.content : "";
    return { title, description };
}