# Trustline — site vitrine

Site de présentation du projet [Trustline](https://github.com/Aissame372/Trustline),
un outil de cartographie et de surveillance du cycle de vie des certificats
TLS (Certificate Transparency + vérification active, score de maturité CLM,
rapport complet).

Ce dépôt contient uniquement le **site de présentation** et un **rapport
d'exemple entièrement fictif** — pas le code source du pipeline, qui reste
dans le dépôt principal (privé pour l'instant, le temps de clarifier le cadre
d'usage commercial futur). Ce dépôt-ci est public.

## Contenu

- `index.html` — le site, autonome (aucune dépendance externe, aucun appel
  réseau, aucun script tiers). Pensé pour un public technique et non
  technique.
- `demo/rapport-demo-cabinet-exemple.pdf` — un rapport d'exemple généré avec
  le vrai pipeline Trustline, sur un domaine **entièrement fictif**
  (`cabinet-exemple.fr`). Aucune donnée réelle n'y figure.

## Deploiement

Dépôt public, servi directement depuis sa racine — GitHub Pages ou
Cloudflare Pages conviennent tous les deux (Cloudflare Pages recommandé pour
le support natif d'un fichier `_headers`). Voir le guide de sécurisation
dans le dépôt principal (`docs/deploiement-site.md`) pour la configuration
DNS et les réglages recommandés.

## Cadre

Projet personnel, portfolio et pédagogique. Aucune exploitation commerciale
actuellement — voir la note en pied de page du site.

---

© Aissame Boudaoudi. Contenu de présentation, tous droits réservés (voir
`LICENSE`).
