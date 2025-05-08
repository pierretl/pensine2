import { getRepoInfoField } from '../utils/githubUtils.js';
import { log } from '../utils/log.js';
import { dom } from '../utils/domElements.js';

export async function displayRepoSizeProgress() {
    try {
        const sizeInKb = await getRepoInfoField('size'); // Taille en Ko
        const sizeInMb = sizeInKb / 1024; // Convertir la taille en Mo
        const percent = Math.min((sizeInMb / 1024) * 100, 100); // Calculer le pourcentage (1 Go = 1024 Mo)

        // Mise à jour de la barre de progression
        dom.repoSizeProgress.value = percent;

        // Affichage de la taille en MB et de la taille maximale 1024 Mo (1 Go)
        dom.repoSizeLabel.textContent = `${sizeInMb.toFixed(2)} Mo / 1024 Mo`; // Affichage au format "X MB / 1024 Mo"
    } catch (err) {
        log("Erreur lors de la récupération de la taille du dépôt : " + err);
    }
}
