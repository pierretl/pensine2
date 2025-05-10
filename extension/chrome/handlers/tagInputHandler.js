import { handleTagInput, addTagToList } from '../utils/tags.js';

export function initTagInput(dom) {
    // Gère l'ajout de tags à la liste dès qu'une virgule est tapée ou Entrée est pressée
    dom.tagInput.addEventListener('input', handleTagInput);

    // Écoute l'événement 'keydown' pour détecter la touche Entrée
    dom.tagInput.addEventListener('keydown', (event) => {
        handleTagInput(event);  // Passe l'événement à `handleTagInput`
    });

    // Gestion de la sélection du tag depuis le datalist
    dom.tagInput.addEventListener('change', function () {
        const selectedLabel = this.value.trim();
        if (!selectedLabel) return;
    
        // Recherche dans les options du datalist
        const matchingOption = Array.from(dom.tagSuggestions.options).find(
            option => option.value === selectedLabel
        );
    
        if (matchingOption) {
            const tagId = matchingOption.getAttribute('data-id');
            const tagLabel = matchingOption.value;
    
            addTagToList(tagLabel, tagId);
            this.value = ''; // Vider le champ
        }
    });
}
