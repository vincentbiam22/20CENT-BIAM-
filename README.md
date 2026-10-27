# 20Code

20Code est un atelier de développement desktop multilangage, construit à partir du socle Electron fourni. Cette première étape donne une identité et une interface interactive au produit : accueil, explorateur, éditeur à onglets, paramètres et aperçu de l’assistant Claude.

## Ce qui fonctionne

- Accueil en français avec l’icône originale et trois projets exemples.
- Création de projets de session Python, JavaScript, TypeScript, HTML et SQL.
- Import de fichiers texte (500 Ko maximum par fichier), recherche par nom et contenu, édition, indentation avec Tab et export du fichier actif.
- Navigation entre fichiers, indicateurs de modification et protection du changement de projet tant que les fichiers modifiés ne sont pas exportés.
- Réglages de taille du texte, retour à la ligne et visibilité de l’assistant.
- Conversation de démonstration avec réponses locales, guide et aperçu du terminal.

Les projets et réglages sont temporaires. L’export télécharge une copie : il ne remplace pas le fichier d’origine. Claude, les runtimes et Git ne sont pas connectés ; les interfaces l’indiquent explicitement. Les réponses de démonstration parlent de l’exemple Python, sans analyser le fichier actif. Aucun code utilisateur n’est exécuté ou transmis à un service externe.

## Technologies

Electron, React 18, TypeScript, electron-vite et Vite. L’application conserve la séparation main/preload/renderer et le contrat IPC sécurisé de l’archive d’origine. La police Manrope est incluse localement sous licence OFL ; l’icône fournie est conservée dans `assets/brand`, avec une version optimisée pour l’interface.

## Lancer localement

Prérequis : Node.js 20 ou supérieur, npm et un environnement graphique. Windows 10/11 64 bits reste la cible desktop initiale.

```bash
npm install
npm run dev
```

Pour compiler et lancer le desktop :

```bash
npm run build:desktop
npm start
```

Ces commandes produisent une application locale, pas un installateur Windows. Le packaging fait partie de la feuille de route.

## Aperçu Netlify

Netlify publie uniquement le renderer, pour explorer l’interface dans un navigateur. Il ne transforme pas Electron en service web et ne donne aucun accès au système de fichiers desktop. `npm run dev:web` lance cet aperçu localement. La commande `npm run build` compile l’aperçu dans `dist`, tandis que `npm run build:desktop` compile les processus Electron dans `out`.

Le déploiement Netlify installe explicitement les dépendances avec `npm ci --include=dev` avant de compiler, en utilisant `package-lock.json`. Vite et son plugin React sont ainsi disponibles même lorsque le déploiement démarre sans installation préalable. Le téléchargement du binaire Electron est désactivé uniquement dans l’environnement Netlify, où seul l’aperçu web est compilé ; l’installation desktop locale reste inchangée.

## Suite du produit

Voir `PLAN.md` : Monaco, ouverture et sauvegarde natives sécurisées, runtimes et terminal, connexion Claude, puis Git et installateur Windows. L’architecture d’origine reste documentée dans `docs/ARCHITECTURE.md`, complétée par les décisions d’interface de cette étape.

Les tests unitaires d’origine sont disponibles avec `npm test`, et les types desktop avec `npm run typecheck`. Aucune compilation, aucun test et aucun lancement n’ont été effectués pendant cette livraison ; la validation de l’aperçu est confiée au pipeline de déploiement.
