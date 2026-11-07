# 37 — Carte galerie : fichiers à plat nommés en timestamps Unix

Dépôt : HA-Plooum-Cards, ton propre worktree. Charge les skills `pilot-subagent`, `pr-workflow` et `ha-dev-testing`. Branche : `feature/gallery-epoch-files`. Ouvre la PR, **ne la fusionne jamais**. Si tu as besoin d'une réponse, mets la question dans les Questions ouvertes de ton rapport et **arrête-toi** (n'attends jamais, ne scrute jamais). Chat, PR et commits en français ; code, chaînes de l'UI, commentaires et docs (README.md, docs/) en anglais, README.fr.md en français.

**Navigateur : celui intégré à Claude** (`mcp__Claude_Browser__*`), dans **ton propre onglet** (`tabs_create`, puis `navigate` avec son `tabId`) ; suites par `runner.html` et `window.uiResult` (skill `ha-dev-testing`, « Quel navigateur »).

## Le problème (constaté sur le HA de l'utilisateur)

La carte `ha-plooum-gallery-card` (`src/cards/gallery/ha-plooum-gallery-card.js`, ~505 lignes) affiche « No recordings ». Le `browse_media` de `media-source://media_source/rec_cam_entree/videos` renvoie, **à la racine, sans dossiers de jour**, des fichiers :

```
"1793437583-1793437673.mp4"  can_expand false, can_play true
"1794032417-1794032423.mp4"
"1794032417-1794032495.mp4"
```

C'est `<début>-<fin>` en **secondes Unix**. La carte ne connaît que `<YYYY-MM-DD>/<HH:MM:SS>-<HH:MM:SS>.ext`.

## Exigences (fixes)

- La carte accepte **les deux formats, et leur mélange** :
  1. dossiers de jour `YYYY-MM-DD` contenant des clips `HH:MM:SS-HH:MM:SS.ext` (comportement actuel, inchangé) ;
  2. clips `<epoch>-<epoch>.ext` (regex `^(\d{9,11})-(\d{9,11})(?:\.[A-Za-z0-9]+)?$`) **à la racine** ou dans un dossier de jour.
- Un clip epoch appartient au jour **local** de son début. Fuseau : celui de HA quand `hass.locale.time_zone === 'server'` (`hass.config.time_zone`), sinon celui du navigateur ; calcule date, HH:MM:SS et secondes depuis minuit avec `Intl.DateTimeFormat(..., { timeZone, hourCycle: 'h23', ... }).formatToParts`. Un clip epoch dans un dossier de jour reste dans ce jour.
- Un clip qui passe minuit : son segment de frise s'arrête à 24 h.
- Deux clips de même début (comme ci-dessus) restent deux clips distincts ; tri par début puis fin.
- Tout le reste (navigation qui saute les jours vides, Today, frise, vignettes, cache) marche pareil pour les jours issus des fichiers à plat.

## Conception (choix du pilote)

- Modèle : `_days` = jours triés `{ date, folderId?, flat: [clips epoch de la racine pour ce jour] }`, construit au browse de la racine (union des dossiers de jour et des dates des clips à plat). `_dayClips(idx)` = `flat` + clips du dossier (browse paresseux comme aujourd'hui), triés. Une seule fonction de parsing qui renvoie `{ id, start, end, label, time }` pour les deux formats (garde `parseClip` statique, ajoute le cas epoch avec un paramètre `timeZone`).
- `docs/gallery.md` : décrire les deux organisations acceptées (et que `path_datetime_format: X` de camera-gallery-card correspond aux noms epoch). README.md / README.fr.md seulement s'ils décrivent l'organisation des fichiers.
- `CARD_VERSION` inchangé (le pilote le passera dans sa propre PR).

## Environnement de dev

Dans `dev/make_videos.sh`, ajoute un dossier à plat `rec_cam_entree/epoch/` (même media_dir) avec des clips nommés en epoch, calculés à partir de l'heure locale (`date -d 'today 08:15:00' +%s`, etc.) :
- aujourd'hui : `08:15:00` + 90 s et `14:30:00` + 6 s ;
- J-3 : `22:50:00` + 1200 s.
Régénérés quand la date change (ménage des fichiers de plus de 6 jours, comme pour les dossiers). Ajoute une 2ᵉ carte dans la vue `gallery` de `dev/ha-config/dashboards/plooum-test.yaml` sur `media-source://media_source/rec_cam_entree/epoch`, et mets à jour la ligne « Vidéos de test » du CLAUDE.md.

## Tests (seulement ceux-là)

Ajoute à `dev/tests/gallery.json` un test sur la 2ᵉ carte : aujourd'hui, 2 vignettes dans l'ordre 14:30 puis 08:15 et 2 segments dans la frise ; ‹ → J-3 avec 1 vignette `22:50` ; ‹ désactivé. Vérifie que les 4 tests existants (1ʳᵉ carte) passent encore : ajuste leur sélecteur de carte si besoin, rien d'autre.

Lance seulement `runner.html?suite=gallery` dans ton onglet. Colle `window.uiResult.summary` et la liste des tests.

Pas de capture.

À la fin : **ne fais pas** `dev/ha.sh stop`.

## Rapport

Comme dans `pilot-subagent` : URL de la PR, ce qui a été fait, sortie de la suite, écarts, Questions ouvertes, Frictions.
