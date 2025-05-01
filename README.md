# Pensine – Capture & Enregistrement de Marque-pages sur GitHub

Cette extension Chrome permet de capturer rapidement des informations sur la page web active (titre, description, URL, et capture d'écran) et de les enregistrer dans un dépôt GitHub personnel sous forme de **marque-pages enrichis**.

Elle est particulièrement utile pour créer une bibliothèque personnelle de sites web, articles ou ressources visuelles que vous souhaitez archiver, consulter plus tard ou partager.

---

## Fonctionnalités principales

- Connexion sécurisée avec un token GitHub personnel
- **Pré-remplissage automatique** du titre, de la description et de l'URL de la page active
- **Capture d’écran** de la page en un clic (sous forme de fichier PNG)
- **Enregistrement des données sur GitHub** :
  - Le screenshot est stocké dans un dossier `media/screenshot/`
  - Les métadonnées (URL, titre, description, etc.) sont ajoutées à un fichier JSON (`pensine.json`)
- Interface simple pour :
  - Tester, enregistrer ou supprimer le token GitHub
  - Voir les logs et messages liés aux actions

---

## Sécurité

- Le token GitHub est **stocké localement** dans le navigateur via `chrome.storage.local`.
- **Aucun accès externe** n’est effectué en dehors de l’API GitHub.
- Il est recommandé d’utiliser un **token GitHub restreint** aux permissions nécessaires (`repo:contents` uniquement).

---

## TODO

- Amélioré la sécurité
- Ajouter un champ libre de desciprion
- Ajouter une liste de tag
- Sur Edge l'icone de l'extention n'est pas prise en compte
- Design popup