# Pensine – Capture & Enregistrement de Marque-pages sur GitHub

Cette extension Chrome permet d’enregistrer rapidement des **marque-pages enrichis** à partir de la page web active, puis de les sauvegarder dans un dépôt GitHub personnel.

Elle est particulièrement utile pour créer une bibliothèque personnelle de sites web, articles ou ressources visuelles que vous souhaitez archiver, consulter plus tard ou partager.

---

## Fonctionnalités principales

- Connexion sécurisée avec un token GitHub personnel
- **Pré-remplissage automatique** du favicon, du titre, de la description et de l'URL de la page active
- **Capture d’écran** de la page automatiquement
- **Enregistrement des données sur GitHub** :
  - Le screenshot est stocké dans un dossier `media/screenshot/`
  - Les métadonnées (URL, titre, description, notes, tags, etc.) sont ajoutées à un fichier JSON (`pensine.json`)
  - Les tags sont ajoutés à un fichier JSON (`tags.json`)

---

## Installation et Utilisation

1.  **Cloner le dépôt** : Clonez ce dépôt sur votre machine locale.
2.  **Installer l'extension** :
    *   Ouvrez Chrome et allez dans `chrome://extensions/`.
    *   Activez le "Mode développeur" en haut à droite.
    *   Cliquez sur "Charger l'extension non emballée" et sélectionnez le dossier du dépôt cloné.
3.  **Configurer Pensine** :
    *   Cliquez sur l'icône de l'extension Pensine dans votre barre d'outils Chrome.
    *   Vous devrez configurer les informations suivantes :
        *   Votre **nom d'utilisateur GitHub**.
        *   Le **nom du dépôt GitHub** où les données seront stockées.
        *   Un **token GitHub** (avec la permission `repo:contents`).
    *   Cliquez sur "Enregistrer Configuration".
4.  **Capturer un marque-page** :
    *   Naviguez vers la page web que vous souhaitez enregistrer.
    *   Cliquez sur l'icône de l'extension Pensine.
    *   Vérifiez les informations pré-remplies, ajustez si nécessaire.
    *   Ajoutez des **notes** ou des **tags** si vous le souhaitez. Les tags sont stockés dans une liste et vous pouvez en ajouter de nouveaux ou utiliser ceux existants.
    *   Cliquez sur "Ajouter ce marque page". Le screenshot, les tags et les métadonnées seront ajoutés à votre dépôt GitHub configuré.

---

## Sécurité

- Les informations de configuration (token, utilisateur, dépôt) sont **stockées localement** dans le navigateur via `chrome.storage.local`.
- **Aucun accès externe** n’est effectué en dehors de l’API GitHub.
- Il est recommandé d’utiliser un **token GitHub restreint** aux permissions nécessaires (`repo:contents` uniquement).

---

## TODO

- Amélioré la sécurité
- Design popup
