# Trustline — site vitrine

Site de présentation de Trustline, un outil de cartographie et de
surveillance du cycle de vie des certificats TLS (Certificate Transparency +
vérification active, score de maturité CLM, rapport complet).

Ce dépôt contient uniquement le **site de présentation** et un **rapport
d'exemple entièrement fictif** — pas le code source du pipeline, qui reste
dans un dépôt privé distinct. Ce dépôt-ci est public.

## Contenu

- `index.html` — le site, autonome (aucune bibliothèque tierce, aucune
  police/CDN externe). Un seul appel réseau externe : la soumission du
  formulaire de contact vers `api.web3forms.com` (voir plus bas). Pensé
  pour un public technique et non technique, avec animations légères
  (`prefers-reduced-motion` respecté).
- `demo/rapport-demo-cabinet-exemple.pdf` — un rapport d'exemple généré avec
  le vrai pipeline Trustline, sur un domaine **entièrement fictif**
  (`cabinet-exemple.fr`). Aucune donnée réelle n'y figure.

## Formulaire de contact

Le formulaire (section Contact) poste vers
[Web3Forms](https://web3forms.com) (gratuit). À faire une fois :

1. Aller sur web3forms.com, entrer l'email de destination — une clé
   d'accès est envoyée immédiatement (aucun compte à créer).
2. Dans `index.html`, remplacer `COLLE_TA_CLE_WEB3FORMS_ICI` (attribut
   `value` du champ caché `access_key`) par cette clé.
3. `git commit` + `git push` — c'est tout, pas de redéploiement manuel si
   Cloudflare/GitHub Pages est déjà branché sur le dépôt.

Tant que la clé n'est pas renseignée, le formulaire affiche un message
invitant à écrire directement à `contact@identity-ops.com` au lieu
d'essayer d'envoyer.

## Deploiement

Dépôt public, servi directement depuis sa racine — GitHub Pages ou
Cloudflare Pages conviennent tous les deux (Cloudflare Pages recommandé pour
le support natif d'un fichier `_headers`).

## Cadre

Projet indépendant, à usage portfolio et pédagogique. Aucune exploitation
commerciale actuellement — voir la note en pied de page du site.

---

© Trustline. Contenu de présentation, tous droits réservés (voir `LICENSE`).
