# 36 — Nouvelle carte : galerie de vidéos enregistrées (`ha-plooum-gallery-card`)

Dépôt : HA-Plooum-Cards, ton propre worktree. Charge les skills `pilot-subagent`, `pr-workflow` et `ha-dev-testing`. Branche : `feature/gallery-card`. Ouvre la PR, **ne la fusionne jamais**. Si tu as besoin d'une réponse, mets la question dans les Questions ouvertes de ton rapport et **arrête-toi** (n'attends jamais, ne scrute jamais). Chat, PR et commits en français ; code, chaînes de l'UI, commentaires et docs (README.md, docs/) en anglais, README.fr.md en français.

## Objectif (décisions de l'utilisateur, fixes)

Une carte qui lit et parcourt les vidéos d'une caméra enregistrées dans un dossier media_source, à la manière de `custom:camera-gallery-card` (même fonction, **ni son code ni son apparence copiés**).

- Organisation des fichiers : `<media_source>/<YYYY-MM-DD>/<HH:MM:SS>-<HH:MM:SS>.<ext>` (ex. `2026-07-11/10:32:20-10:35:20.mp4`). Le nom donne début et fin ; pas d'option de format.
- **Au plus ~10 vidéos par jour.** Pas de favoris, pas de regroupement, pas de lecture continue.
- La carte s'ouvre sur **le jour le plus récent qui a des vidéos**.
- Disposition, de haut en bas :
  1. un lecteur `<video controls>` (le clip sélectionné ; au départ le plus récent du jour, sans le lancer sauf `autoplay`) ;
  2. une barre : bouton « Today » (revient au jour le plus récent qui a des vidéos), ‹ / date du jour affiché (format local, ex. « 7 November ») / › : les flèches sautent **au jour précédent / suivant qui a des vidéos** (dossiers vides sautés), désactivées au bout ;
  3. **une frise de 24 h** : barre 00h–24h avec repères toutes les 6 h ; un segment coloré par vidéo (début→fin, **largeur minimale** ~4 px pour rester cliquable) ; le clip en lecture en couleur pleine, les autres atténués ; infobulle (`title`) « HH:MM:SS – HH:MM:SS » ; clic = sélectionne et lance ce clip ;
  4. une grille de vignettes, **le plus récent en premier**, largeur `thumb_size`, l'heure de début (HH:MM) en bas de chaque vignette, la vignette sélectionnée mise en évidence ; clic = sélectionne et lance.

## Conception (choix du pilote, ne les rouvre pas)

- Dossier `src/cards/gallery/ha-plooum-gallery-card.js`, éléments `ha-plooum-gallery-card` / `ha-plooum-gallery-card-editor`, schéma classe / éditeur / enregistrement du CLAUDE.md, `CARD_VERSION = '1.0.0'`, import dans `src/index.js`. Prends une petite carte récente comme modèle de structure (`src/cards/berlin-clock/`).
- Options :
  ```yaml
  type: custom:ha-plooum-gallery-card
  media_source: media-source://media_source/rec_cam_entree/videos   # required
  autoplay: false        # play the selected clip when the card opens
  muted: true
  thumb_size: 140        # px
  show_timeline: true
  timeline_color:        # default: var(--accent-color)
  ```
  `setConfig` lève une erreur si `media_source` manque.
- Navigation : `hass.callWS({ type: 'media_source/browse_media', media_content_id })`. Racine → `children` = dossiers ; garde ceux dont le titre est `YYYY-MM-DD`, triés. Un jour → ses `children` avec `can_play` dont le titre correspond à `HH:MM:SS-HH:MM:SS` (extension facultative) ; ignore le reste. Liste des jours chargée une fois (et au clic sur « Today ») ; contenu d'un jour mis en cache en mémoire. Pour trouver le jour le plus récent non vide, parcours du plus récent au plus ancien.
- Lecture : `hass.callWS({ type: 'media_source/resolve_media', media_content_id })` **au moment de la sélection** (l'URL signée expire), puis `hass.hassUrl(url)` dans le `src` du `<video>`. Si la lecture échoue (`error` sur le `<video>`), affiche un message « This video can't be played » à la place du lecteur, pas un lecteur noir.
- Vignettes : extraites dans le navigateur. Pour chaque vidéo visible : resolve, `<video muted preload="metadata">` hors DOM, `currentTime = min(1, duration/2)`, sur `seeked` dessine dans un `<canvas>` → `toDataURL('image/jpeg', 0.7)`. **2 extractions à la fois au plus**, cache en mémoire par `media_content_id`. En attente ou en échec : fond neutre avec l'heure seule.
- États : chargement (petit texte « Loading… »), aucun jour avec vidéo (« No recordings »), erreur de browse (message avec l'erreur, carte toujours affichée).
- Éditeur : `ha-form` avec `media_source` (texte), `autoplay`, `muted`, `show_timeline` (booléens), `thumb_size` (nombre) ; `timeline_color` en `<input type="color">` comme les autres cartes du dépôt. Libellés par `.computeLabel`.
- `getStubConfig` : `{ media_source: 'media-source://media_source/local' }`.

## Environnement de dev

- `dev/ha-config/configuration.yaml` : ajoute `media_source:` et `homeassistant: media_dirs: { rec_cam_entree: <dossier> }`. **Prémisse vérifiée** : la validation est `probatio.IsDir()`, le dossier doit exister au démarrage. Mets les vidéos dans `dev/ha-config/media/rec_cam_entree/` (**gitignoré**, jamais commité) et trouve un chemin qui marche dans chaque checkout / worktree (relatif au répertoire courant de HA si `dev/ha.sh` le permet, sinon `!env_var` exporté par `dev/ha.sh`). Ajouter `media_dirs` retire le `local` par défaut : sans importance.
- Un script `dev/make_videos.sh` (ffmpeg est dans `/usr/bin/ffmpeg`), appelé par `dev/ha.sh start` s'il manque des vidéos, qui génère dans `rec_cam_entree/videos/` des clips H.264 de **5 s**, petits (320×180, `testsrc` + l'heure du nom en `drawtext`), avec des dates **relatives à aujourd'hui** :
  - aujourd'hui : 3 clips (`07:20:00-07:23:00`, `12:05:10-12:08:10`, `18:40:00-18:43:00`) ;
  - J-1 : dossier **vide** ;
  - J-2 : 2 clips (`09:00:00-09:03:00`, `21:15:30-21:18:30`) + un fichier `notes.txt` (doit être ignoré) ;
  - J-5 : 1 clip (`03:10:00-03:13:00`).
  Les dossiers des jours passés sont recréés si la date a changé (supprime les dossiers générés de plus de 6 jours).
- Vue `gallery` dans `dev/ha-config/dashboards/plooum-test.yaml` (et une carte dans la vue `all`) sur `media-source://media_source/rec_cam_entree/videos`. Ajoute une ligne dans la section **Testing** du CLAUDE.md (et du skill `ha-dev-testing` si pertinent) pour ces vidéos de test.
- `docs/gallery.md` (options), une ligne + aperçu dans README.md et README.fr.md.

## Tests (seulement ceux-là)

Nouvelle suite `dev/tests/gallery.json` (vue `/plooum-test/gallery`) :
1. La carte affiche le jour d'aujourd'hui, 3 vignettes dans l'ordre 18:40, 12:05, 07:20, 3 segments dans la frise, et le `<video>` a un `src`.
2. ‹ saute le J-1 vide et affiche J-2 avec 2 vignettes (`notes.txt` ignoré) ; ‹ encore → J-5 ; ‹ désactivé ; « Today » revient à aujourd'hui.
3. Clic sur la 3ᵉ vignette → elle est sélectionnée et le `src` du `<video>` change ; clic sur un segment de la frise → le clip correspondant est sélectionné.
4. Au moins une vignette a une image extraite (`data:image/jpeg`) en moins de 10 s.

Ajoute un test `gallery:` à `dev/tests/cards-smoke.json` (rendu + éditeur, comme les autres cartes).

Lance seulement `dev/.venv/bin/python dev/ui_test.py dev/tests/gallery.json` et `dev/.venv/bin/python dev/ui_test.py dev/tests/cards-smoke.json --only gallery:`. Colle les sorties.

**Captures (2)**, headless (jamais le pane intégré), dans `dev/shots/`, non commitées : `gallery-card.png` (la carte sur `/plooum-test/gallery`, vignettes chargées) et `gallery-editor.png` (l'éditeur ouvert dans `/plooum-edit/gallery?edit=1`).

À la fin : **ne fais pas** `dev/ha.sh stop` : garde ta HA, le pilote la regardera.

## Rapport

Comme dans `pilot-subagent` : URL de la PR, ce qui a été fait, sorties des tests, chemins des captures, écarts, Questions ouvertes, Frictions.
