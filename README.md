# Trustline — site vitrine

Site de présentation de Trustline, un outil de cartographie et de
surveillance du cycle de vie des certificats TLS (Certificate Transparency +
vérification active, score de maturité CLM, rapport complet).

Ce dépôt contient uniquement le **site de présentation** et un **rapport
d'exemple entièrement fictif** — pas le code source du pipeline, qui reste
dans un dépôt privé distinct. Ce dépôt-ci est public.

## Contexte

Trustline est né d'une observation de terrain : la gestion du cycle de vie
des certificats TLS reste presque toujours implicite et éclatée dans les
organisations, jusqu'au jour où l'un d'eux expire un dimanche. Le projet est
porté par un expert en gestion des identités et des accès (IAM), spécialisé
PKI et cycle de vie des certificats (comparatifs de solutions IAM/CLM en
environnement réel).

Objectifs, dans l'ordre :
1. Un portfolio technique crédible, à destination de recruteurs et de
   décideurs IT/sécurité.
2. Un support de formation (PKI, OIDC, mTLS), réutilisable dans un cadre professionnel.
3. Une future offre d'audit — différée : le statut permettant de facturer
   légalement n'est pas encore en place (voir section "L'offre" ci-dessous).

Ce dépôt est la vitrine de ce travail, pensée pour amorcer un échange autour
d'un poste salarié ou d'une mission (portage, ESN, agence) — voir "Contact".
Il ne publie ni le code du pipeline ni de détail d'implémentation permettant
de le reconstituer : uniquement une démonstration figée (rapport d'exemple
sur un domaine fictif) et le site qui en présente les principes.

## Contenu

- `index.html` — le site, entièrement autonome et statique : aucune
  bibliothèque tierce, aucune police/CDN externe, **aucun appel réseau du
  tout** (voir section Contact ci-dessous : le formulaire compose un email
  côté client, il ne l'envoie jamais lui-même). Pensé pour un public
  technique et non technique, avec un hero animé (canvas en couches :
  réseau de noeuds, orbes de profondeur, balayage périodique, parallaxe
  scroll/pointeur), une pause éditoriale en pleine largeur, et des
  révélations en cascade au scroll (`prefers-reduced-motion` respecté
  partout).
- `demo/rapport-demo-cabinet-exemple.pdf` et
  `demo/rapport-demo-cabinet-exemple.html` — le même rapport d'exemple
  généré avec le vrai pipeline Trustline (`report.py`), sur un domaine
  **entièrement fictif** (`cabinet-exemple.fr`). Aucune donnée réelle n'y
  figure. Les deux fichiers viennent du même rapport d'analyse : ne pas les
  régénérer séparément si l'un des deux change.
- `robots.txt`, `sitemap.xml` — indexation basique (une seule page).
- Une **FAQ** (section `#faq`) répond aux objections courantes avant contact
  (gratuité, portée réelle de l'outil, stockage des données, continuité si
  le projet s'arrête, compatibilité CDN/Cloudflare).
- `_headers` — en-têtes de sécurité (CSP, X-Frame-Options,
  Cross-Origin-Opener-Policy...), pris en compte par Cloudflare Pages
  **et** Workers static assets.
- `.assetsignore` — exclut `.git`, `node_modules`, `.DS_Store`,
  `wrangler.jsonc` de ce qui est effectivement servi. **Important** :
  Cloudflare Workers (contrairement à Pages) ne fait pas cette exclusion
  automatiquement ; ce fichier a été ajouté après avoir constaté que
  `.git/config` et `.git/HEAD` étaient servis publiquement suite au passage
  du dépôt en mode Workers (voir `docs/deploiement-site.md` du dépôt
  principal pour le détail de l'incident).
- `.well-known/security.txt` — contact pour signalement de vulnérabilité
  (RFC 9116).

## L'offre

Section dédiée sur le site : ce qui est déjà public aujourd'hui (ce site,
le rapport d'exemple), et une offre packagée (hébergement, suivi
multi-domaines, alertes) annoncée comme "à venir", **sans prix ni tunnel de
paiement** — volontairement, tant que le statut permettant de facturer
légalement n'est pas en place (pas de SIRET actuellement). Le pipeline
Python (dépôt `Trustline` principal) reste privé pour l'instant : la
section ne prétend pas le contraire. Le lien "être informé au lancement"
renvoie vers le formulaire de contact, avec l'option correspondante
pré-cochée.

## Contact

Un formulaire structuré (profil, nature du contact, message) compose un
email côté client (JS pur, `mailto:`) que l'utilisateur relit et envoie
lui-même depuis son propre client mail — aucun backend, aucune donnée
transmise ailleurs qu'à `contact@identity-ops.com` (Cloudflare Email
Routing). Un bouton "copier le message" pallie les navigateurs sans client
mail par défaut configuré. Un lien `mailto:` simple reste disponible en
dessous pour un contact rapide sans passer par le formulaire.

Volontairement pas de vocabulaire de "devis"/tarif : le projet est portfolio
et pédagogique, sans exploitation commerciale (pas de SIRET actuellement) —
voir `CLAUDE.md` du dépôt principal. Les choix "Nature du contact" couvrent
poste salarié, mission via une structure tierce (portage/ESN/agence),
question technique, ou collaboration open source — jamais une prestation
facturée en direct.

## Deploiement

Dépôt public, servi directement depuis sa racine. Actuellement en
production sur **Cloudflare Workers (static assets)** — GitHub Pages et
Cloudflare Pages restent des alternatives viables si besoin.

Pour mesurer la fréquentation (optionnel) : activer Cloudflare Web Analytics
en mode "Automatic setup" depuis le dashboard Cloudflare — aucune ligne de
code à ajouter ici, voir `docs/deploiement-site.md` du dépôt principal pour
le détail.

## Cadre

Projet indépendant, à usage portfolio et pédagogique. Aucune exploitation
commerciale actuellement — voir la note en pied de page du site.

---

© Trustline. Contenu de présentation, tous droits réservés (voir `LICENSE`).
