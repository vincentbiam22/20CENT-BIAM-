# Architecture de 20Code

## Stack (MVP 0.1)

| Couche | Choix |
| --- | --- |
| Application desktop | Electron + TypeScript strict |
| Build / dev | electron-vite (Vite) |
| Interface | React 18 |
| Éditeur (MVP-03) | Monaco Editor |
| Tests | Vitest |
| Packaging (MVP-21/22) | electron-builder |

### Pourquoi Electron plutôt que Tauri

- Monaco, le terminal (xterm.js + node-pty) et le preview web s'appuient sur un moteur Chromium identique sur toutes les plateformes.
- Tout le code (main, preload, renderer) est en TypeScript : un seul langage pour tout le MVP.
- Le processus principal Node.js permet de lancer des processus (runtimes, compilateurs), de télécharger et vérifier des archives, et de gérer le système de fichiers sans passer par une couche Rust supplémentaire.
- Contrepartie assumée : installeur plus lourd que Tauri. Acceptable pour le MVP.

## Processus et modules

```
src/
├── main/       processus principal (fenêtre, fichiers, runtimes, exécution, IA)
├── preload/    pont sécurisé (contextBridge) — seule surface vue par le renderer
├── shared/     contrat IPC et types partagés
└── renderer/   interface React (éditeur, explorateur, terminal, preview, panneau IA)
```

Les modules prévus (`editor`, `languages`, `runtimes`, `execution`, `terminal`, `preview`, `ai`, `filesystem`, `settings`) seront créés au fil des étapes MVP-02 à MVP-19, pas avant : aucun module vide ni factice.

## Sécurité (dès MVP-01)

- `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`.
- Le renderer n'accède qu'à `window.api` (fonctions explicites et typées, définies dans `src/shared/ipc.ts`).
- CSP stricte dans `index.html` (assouplie uniquement par le serveur de dev pour le rechargement à chaud).
- Navigation externe bloquée ; seuls les liens `https://` s'ouvrent dans le navigateur système.
- Instance unique de l'application.

## Stratégie runtimes (MVP-10 et suite)

- Runtime Manager dans le processus principal, interface `RuntimeProvider` (`detect`, `install`, `run`…).
- JavaScript : exécuté avec l'environnement Node d'Electron (`ELECTRON_RUN_AS_NODE`), donc prêt sans téléchargement.
- SQL : moteur embarqué.
- Python, C/C++, Java : téléchargés à la demande dans un dossier géré par 20Code (`userData/runtimes`), avec vérification SHA-256, sans modification du PATH système.

## Stratégie Claude (MVP-16 et suite)

- API officielle Anthropic, appelée depuis le processus principal uniquement.
- Clé API saisie dans Settings → AI → Claude, stockée via `safeStorage` d'Electron (chiffrement du système).
- Le renderer n'envoie que le contexte choisi par l'utilisateur (sélection, fichier actuel, fichiers choisis) ; rien d'automatique.
- Internet est nécessaire pour Claude ; le reste du MVP fonctionne hors ligne une fois les runtimes installés.

## Multiplateforme

MVP 0.1 : Windows 10/11 64-bit. Le code évite les chemins et commandes spécifiques à une plateforme (usage de `node:path`, abstraction dans les futurs providers) pour ajouter Linux et macOS ensuite.

## Première interface du produit

Le renderer présente maintenant l’accueil 20Code, un explorateur, un éditeur à onglets, les réglages, un guide et des panneaux de démonstration pour Claude et le terminal. Les exemples et réponses sont centralisés dans `src/renderer/src/fixtures.ts`. L’édition, l’import de texte et l’export sont fonctionnels dans une session ; aucune sauvegarde de projet native ni exécution de code n’est encore connectée.

La configuration Electron est conservée. `vite.web.config.ts` compile séparément le même renderer pour un aperçu statique sur Netlify. `window.api` est optionnel dans cet aperçu et aucune fausse couche IPC ne le remplace. Les scripts distinguent `build` (web) et `build:desktop` (Electron). La CSP et les garanties du preload restent actives. Les prochaines intégrations sont détaillées dans `PLAN.md`.
