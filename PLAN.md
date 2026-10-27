# Feuille de route 20Code

20Code se construit comme une application desktop : un espace de travail d’abord, puis les outils natifs qui lui donnent toute sa puissance. Le renderer est également consultable sur Netlify pour montrer le produit sans installer Electron.

## 1. Interface du produit — réalisée

Accueil 20Code avec l’icône fournie, projets exemples regroupés dans `fixtures.ts`, explorateur, éditeur à onglets modifiable, recherche, import et export de fichiers, paramètres et guide. Le panneau Claude et le terminal présentent clairement leur statut de démonstration. Les fichiers restent temporaires dans cette étape.

## 2. Éditeur de code complet

Remplacer la zone de texte par Monaco : coloration syntaxique, recherche/remplacement, raccourcis, autocomplétion, diagnostics et alignement des numéros de ligne avec le retour à la ligne. Conserver les interactions et la direction visuelle existantes.

## 3. Projets et fichiers natifs

Ouvrir de vrais dossiers et sauvegarder les fichiers via des capacités IPC explicites et limitées. Ajouter les confirmations de fermeture, les projets récents, le suivi des changements externes et les préférences durables. Les données structurées éventuellement synchronisées sur le web utiliseront Netlify Database ; les actifs binaires utiliseront Netlify Blobs. Cette étape ne doit pas donner d’accès Node au renderer.

## 4. Exécution JavaScript et terminal

Connecter le moteur d’exécution local et un terminal interactif. Séparer les commandes, les sorties et les erreurs ; permettre l’arrêt d’un processus ; demander l’accord avant toute exécution proposée par l’assistant. Remplacer l’aperçu du terminal par les résultats réels.

## 5. Runtimes multilangages

Intégrer SQL puis Python, C/C++ et Java à la demande, avec installation contrôlée, validation des téléchargements, états de progression, annulation et gestion des erreurs. Ne pas modifier le PATH système et vérifier le fonctionnement hors ligne après installation.

## 6. Assistant Claude connecté

Remplacer les réponses locales par une intégration réelle. Sélectionner explicitement le contexte envoyé, afficher les réponses progressivement et présenter les modifications sous forme de différences avant application. Lire le skill Netlify AI Gateway avant de choisir un modèle ou une API pour une éventuelle passerelle hébergée. Protéger les secrets côté serveur ou processus principal ; aucun secret dans le renderer. Prévoir les erreurs réseau et un état hors ligne.

## 7. Git et aperçu web

Connecter le contrôle de version aux vrais projets et ajouter un aperçu web isolé. Rendre visibles les modifications et les erreurs sans exécuter automatiquement le contenu importé. Ajouter les tests d’intégration des flux de fichiers, de terminal et d’assistant.

## 8. Distribution Windows

Préparer le packaging et l’installateur Windows avec l’icône fournie, la signature et une stratégie de mises à jour. Tester les permissions, le lancement sans outils de développement, l’accessibilité et les parcours de sauvegarde sur Windows 10/11. Les autres plateformes pourront suivre après validation de cette version.
