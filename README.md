# Trustline — site vitrine

Site de présentation de Trustline, un outil de cartographie et de
surveillance du cycle de vie des certificats TLS (Certificate Transparency +
vérification active, score de maturité CLM, rapport complet).

Ce dépôt contient uniquement le **site de présentation** et un **rapport
d'exemple entièrement fictif** — pas le code source du pipeline, qui reste
dans un dépôt privé distinct. Ce dépôt-ci est public.

## Contenu

- `index.html` — le site, entièrement autonome et statique : aucune
  bibliothèque tierce, aucune police/CDN externe, **aucun appel réseau du
  tout** (le contact se fait par `mailto:`, pas de formulaire). Pensé pour
  un public technique et non technique, avec un hero animé (canvas en
  couches : réseau de noeuds, orbes de profondeur, balayage périodique,
  parallaxe scroll/pointeur) et des révélations en cascade au scroll
  (`prefers-reduced-motion` respecté partout).
- `demo/rapport-demo-cabinet-exemple.pdf` et
  `demo/rapport-demo-cabinet-exemple.html` — le même rapport d'exemple
  généré avec le vrai pipeline Trustline (`report.py`), sur un domaine
  **entièrement fictif** (`cabinet-exemple.fr`). Aucune donnée réelle n'y
  figure. Les deux fichiers viennent du même rapport d'analyse : ne pas les
  régénérer séparément si l'un des deux change.

## Contact

Volontairement pas de formulaire : un lien `mailto:contact@identity-ops.com`
(routé via Cloudflare Email Routing) et un bouton "copier l'adresse". Zéro
dépendance externe, zéro donnée collectée.

## Deploiement

Dépôt public, servi directement depuis sa racine — GitHub Pages ou
Cloudflare Pages conviennent tous les deux (Cloudflare Pages recommandé pour
le support natif d'un fichier `_headers`).

## Cadre

Projet indépendant, à usage portfolio et pédagogique. Aucune exploitation
commerciale actuellement — voir la note en pied de page du site.

---

© Trustline. Contenu de présentation, tous droits réservés (voir `LICENSE`).
