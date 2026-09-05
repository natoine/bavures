# Mes standards de développement

## Internationalisation (i18n)
- Tout projet doit être internationalisé dès le départ en se basant sur la configuration du navigateur
- Ne jamais mettre de chaînes de caractères en dur dans le code
- Utiliser un système i18n adapté au stack (i18next pour JS/TS, gettext pour Python, etc.)
- Créer d'emblée les fichiers de traduction (au minimum fr + en)

## Web — Design responsive
- Tout composant web doit être responsive par défaut
- Approche mobile-first : concevoir d'abord pour petits écrans
- Utiliser des breakpoints standards et éviter les largeurs fixes en px

## Changelog et versioning sémantique
- Chaque projet doit avoir un fichier CHANGELOG.md à la racine
- Format : Keep a Changelog (https://keepachangelog.com)
- Mettre à jour le changelog après chaque modification significative
- Rendre public ce changelog dans le projet sur la route /changelog

### Gestion des versions (SemVer)
- La version courante est définie dans `package.json` et dans le dernier bloc `[x.y.z]` du CHANGELOG.md
- **À chaque nouvelle feature** : incrémenter le numéro mineur → `1.Y.0` et créer un nouveau bloc de version dans CHANGELOG.md
- **À chaque bug fix** : incrémenter le numéro de patch → `1.y.Z`
- **Changement majeur / rupture de compatibilité** : incrémenter le majeur → `X.0.0`
- Toujours déplacer le contenu de `[Unreleased]` dans la nouvelle section versionnée `[x.y.z] — AAAA-MM-JJ — Titre`
- Toujours mettre à jour `package.json` en même temps que CHANGELOG.md
- La section `[Unreleased]` reste présente mais vide `*(aucun changement en attente)*` entre les features

## README
- Mise à jour régulière du README sur le spectre fonctionnel de l'application
- Mise à jour régulière du README sur les changements d'architecture
- Mise à jour régulière du README sur les commandes de build et de test

## Archivage des prompts
- Chaque prompt utilisateur doit être ajouté dans CHANGELOG.md
- Format d'entrée : date ISO + résumé du prompt + fichiers modifiés
- Exemple : `2026-04-12 | Ajout auth JWT | src/auth.ts, routes/user.ts`
- Chaque prompt doit aussi faire l'objet d'une reformulation si nécessaire en User Story de la forme En tant que [type d'utilisateur], je veux [description de la fonctionnalité] 

## Tests unitaires
- Toute modification ou ajout de code doit être accompagné de tests unitaires
- Couvrir au minimum : cas nominal, cas limites, cas d'erreur
- Utiliser le framework de test adapté au stack (Jest, Vitest, pytest, etc.)
- Ne jamais considérer une tâche comme terminée sans que les tests passent

## Parité web / mobile
- Toute feature développée côté web doit être portée sur mobile (et vice-versa) dans la même session
- Ne pas considérer une tâche comme terminée tant que les deux surfaces (web + mobile) ne sont pas couvertes
- Inclure systématiquement les clés i18n dans les fichiers de traduction mobile (`mobile/lib/i18n/fr.json`, `en.json`) et web (`src/lib/i18n/fr.json`, `en.json`)
- Documenter les deux implémentations dans le CHANGELOG

## Tests d'interface (E2E)
- Tout projet web doit être équipé de tests d'interface automatisés
- Stack recommandée : **Playwright** (intégration native avec Vitest, multi-navigateurs, auto-wait)
- Couvrir au minimum : parcours nominal (golden path), navigation principale, formulaires critiques
- Ne jamais considérer une feature UI comme terminée sans au moins un test E2E associé
- Commande d'installation : `npm init playwright@latest`

## Mises à jour de sécurité
- au démarrage de chaque session, lister les dernières évolutions de mon projet template setupserviceweb
- proposer une solution d'intégration dans le projet en cours des dernières évolutions de setupserviceweb
