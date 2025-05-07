// /utils/tags.js

import { dom } from './domElements.js';  // Importation des éléments DOM
import { getGitHubJsonUrl } from '../utils/githubUtils.js';  // Importation de la méthode pour obtenir l'URL GitHub

/**
 * Ajoute un tag à la liste non ordonnée
 * @param {string} tagLabel - Le label du tag sélectionné
 * @param {string} tagId - L'ID du tag
 */
export const addTagToList = (tagLabel, tagId) => {
    if (!tagLabel || !tagId) return;

    const safeLabel = tagLabel.trim();
    const safeId = tagId.trim().toLowerCase();

    const invalidPattern = /[<>\/"'\\]/;
    if (
        safeLabel.length === 0 ||
        safeLabel.length > 50 ||
        invalidPattern.test(safeLabel)
    ) {
        console.warn(`Tag rejeté : "${safeLabel}"`);
        return;
    }

    const existingIds = dom.tagIds.value.split(',').filter(Boolean);
    if (existingIds.includes(safeId)) return;

    // Création du <li>
    const listItem = document.createElement('li');

    // Création du <span> avec le nom du tag
    const span = document.createElement('span');
    span.textContent = safeLabel;
    span.setAttribute('data-id', safeId);
    span.classList.add('tag');

    // Création du bouton ✕
    const removeBtn = document.createElement('button');
    removeBtn.innerHTML = '✕';
    removeBtn.classList.add('remove-tag-btn');
    removeBtn.setAttribute('type', 'button');
    removeBtn.setAttribute('aria-label', `Supprimer le tag ${safeLabel}`);

    // Gestion du clic sur le bouton
    removeBtn.addEventListener('click', () => removeTag(safeId));

    listItem.appendChild(span);
    listItem.appendChild(removeBtn);
    dom.tagList.appendChild(listItem);

    // Mise à jour du champ hidden
    existingIds.push(safeId);
    dom.tagIds.value = existingIds.join(',');
};




/**
 * Charge les tags depuis un fichier `tags.json` sur GitHub et les insère dans le datalist
 * @async
 */
export const loadTagsInDatalist = () => {
    getGitHubJsonUrl("tags.json")
        .then(url => fetch(url))
        .then(response => {
            if (!response.ok) throw new Error("Erreur lors du chargement depuis l'API GitHub");
            return response.json();
        })
        .then(data => {
            const decodedContent = atob(data.content);
            const tags = JSON.parse(decodedContent);

            tags.forEach(tag => {
                const option = document.createElement('option');
                option.value = tag.label;
                option.setAttribute('data-id', tag.id);
                dom.tagSuggestions.appendChild(option);
            });
        })
        .catch(error => {
            console.error("Erreur :", error);
        });
};

/**
 * Gère l'ajout de tags lorsque l'utilisateur tape une virgule ou appuie sur Entrée
 * @param {KeyboardEvent} event
 */
export const handleTagInput = (event) => {
    const selectedOption = dom.tagInput.value.trim();

    if ((event.key === 'Enter' || selectedOption.includes(',')) && selectedOption) {
        const tagLabel = selectedOption.replace(',', '').trim();
        const tagId = tagLabel.toLowerCase();
        addTagToList(tagLabel, tagId);
        dom.tagInput.value = '';
    }
};

/**
 * Supprime un tag de la liste visuelle et met à jour le champ hidden des IDs.
 *
 * @param {string} tagIdToRemove - L'identifiant unique du tag à supprimer.
 */
export const removeTag = (tagIdToRemove) => {
    // Supprimer le LI du DOM
    const tagElements = dom.tagList.querySelectorAll('li span[data-id]');
    tagElements.forEach(span => {
        if (span.getAttribute('data-id') === tagIdToRemove) {
            span.parentElement.remove(); // supprime le <li>
        }
    });

    // Mettre à jour le champ hidden
    const updatedIds = dom.tagIds.value
        .split(',')
        .filter(id => id && id !== tagIdToRemove);

    dom.tagIds.value = updatedIds.join(',');
};
