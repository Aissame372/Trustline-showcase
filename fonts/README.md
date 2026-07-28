# Polices auto-hébergées

Sous-ensemble **latin** uniquement (`U+0000-00FF` + `U+0152-0153`, qui
couvre déjà tous les diacritiques français et le "œ" soudé) — suffisant
pour le contenu du site, pas de cyrillique/vietnamien inutiles.

| Fichier | Famille | Graisse | Source |
|---|---|---|---|
| `cormorant-300-latin.woff2` | Cormorant | 300 | Google Fonts, v24 |
| `jost-300-latin.woff2` | Jost | 300 | Google Fonts, v20 |

Licence : SIL Open Font License 1.1 pour les deux familles (voir
`LICENSE-OFL-Cormorant.txt` et `LICENSE-OFL-Jost.txt`).

Pour mettre à jour ou élargir le sous-ensemble (ex : ajouter `latin-ext`) :
récupérer les fichiers `.woff2` correspondants depuis
`https://fonts.googleapis.com/css2?family=Cormorant:wght@300&family=Jost:wght@300&display=swap`
(avec un user-agent de navigateur récent pour obtenir du woff2), puis
ajuster les règles `unicode-range` dans `index.html`.
