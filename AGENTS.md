# Architecture de 20Code

20Code est un IDE desktop Electron issu de l’archive fournie. Le site Netlify est un aperçu du même renderer, pas une application desktop distante. Continuer le produit en suivant les jalons de `PLAN.md` ; la première étape visible est livrée.

## Répertoires

- `src/main` : fenêtre Electron, gestion d’instance et IPC existant.
- `src/preload` : capacités explicitement exposées au renderer.
- `src/shared` : contrat IPC et informations d’application.
- `src/renderer/src/App.tsx` : accueil, espace d’édition, panneaux et dialogues.
- `src/renderer/src/fixtures.ts` : unique source des projets de départ et réponses de démonstration.
- `src/renderer/src/Icon.tsx` : système d’icônes SVG locales.
- `src/renderer/src/styles.css` : thème sombre, dispositions responsive et états interactifs.
- `src/renderer/public` : icône optimisée.
- `src/renderer/src/assets/fonts` : polices Manrope et licence, intégrées aux assets compilés.
- `assets/brand` : icône originale fournie par le propriétaire.
- `tests` : tests unitaires du socle d’origine.
- `docs/ARCHITECTURE.md` : décisions desktop initiales et complément sur l’interface.

## Conventions

TypeScript strict, React et CSS natif. Interface et documentation produit en français. Noms de code explicites, pas d’accès Node depuis le renderer. Conserver `contextIsolation`, `sandbox` et le preload limité ; ajouter chaque nouvelle capacité au contrat IPC partagé avant son implémentation. Ne pas exécuter le code utilisateur via `eval`, `Function` ou des scripts injectés.

L’état actuel est volontairement limité à la session et provient de fixtures. Ne pas présenter les projets exemples, le terminal, Git ou Claude comme des services réels. L’export utilise un téléchargement explicite, pas une sauvegarde native. Protéger les fichiers modifiés avant de remplacer le projet actif. Pour une future persistance hébergée, employer les primitives Netlify et lire les skills correspondants ; ne pas ajouter localStorage ou un fichier JSON comme base de données.

La CSP reste stricte en production. Les adaptations pour React Fast Refresh sont limitées au développement dans les configurations Vite. Les polices sont locales pour fonctionner sans accès externe.

## Commandes

- `npm run dev` : développement desktop Electron.
- `npm run build:desktop` puis `npm start` : compiler et lancer le desktop.
- `npm run dev:web` : aperçu navigateur.
- `npm run build` : compiler le renderer pour Netlify ; sortie `dist`.
- `npm run typecheck` et `npm test` : types et tests du socle.

Ne pas confondre `dist` (web) et `out` (desktop). Aucun installateur n’est livré à cette étape. Le pipeline de déploiement valide l’aperçu ; ne pas lancer de build, serveur ou test lorsqu’une session l’interdit.

La commande Netlify commence par `npm ci --include=dev`, avec le verrou `package-lock.json`, afin de rendre les outils de compilation disponibles même sans installation préalable. `ELECTRON_SKIP_BINARY_DOWNLOAD` est défini uniquement pour Netlify : le déploiement web n’a pas besoin du binaire desktop. Conserver les dépendances de développement dans cette installation, car Vite et le plugin React y sont déclarés.
