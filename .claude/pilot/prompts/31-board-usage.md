# 31 — agent-board : limites du forfait et fenêtre de contexte du pilote

Dépôt : `~/git/agent-board` (plooum/agent-board). Travaille dans ce clone, **sans worktree**. Charge le skill `pilot-subagent`. Branche : `feature/usage` à partir d'un `origin/main` à jour. Ouvre la PR, **ne la fusionne jamais**. Si tu as besoin d'une réponse, mets la question dans tes Questions ouvertes et **arrête-toi**. Dans ce dépôt, le code, l'interface, le README et le skill `skill/SKILL.md` restent en anglais ; la PR, le commit et ton rapport sont en français.

## Objectif (décision de l'utilisateur, fixe)

L'utilisateur veut voir **en haut du board** :
1. sa **limite de 5 h** et sa **limite hebdomadaire** (le % utilisé, le temps avant la réinitialisation) ;
2. la **fenêtre de contexte du pilote** (tokens utilisés / taille, %, seuil de compactage automatique).

La status line de Claude Code ne tourne pas dans l'app de bureau (testé par le pilote) : ces chiffres viennent de l'outil `get_usage` de l'app, que **le pilote** relève et **envoie au board** à chaque étape. Le board affiche le dernier relevé et son âge.

Exemple de ce que le pilote enverra (la sortie brute de l'outil, telle quelle) :

```json
{"plan": {"status": "ok", "plan": "Pro", "windows": [
   {"label": "5-hour limit", "percentUsed": 30, "resetsAt": "2026-10-14T23:20:00.022Z", "resetsIn": "1h 59m"},
   {"label": "Weekly · all models", "percentUsed": 97, "resetsAt": "2026-10-15T07:00:00.022Z", "resetsIn": "9h 39m"}],
  "extraUsage": {"enabled": false, "currency": "USD"}},
 "context": {"session": "self", "status": "ok", "tokensUsed": 245612, "contextWindow": 1000000, "percentUsed": 25,
  "autoCompactsAtPercent": 97, "categories": [{"name": "Messages", "tokens": 178189, "percent": 18}]}}
```

`plan.status` peut valoir `not_applicable` ou `unavailable` (avec une `note`), `context.status` `unavailable` : le bandeau l'affiche sobrement, sans erreur. Il peut y avoir d'autres fenêtres (par modèle) : affiche toutes celles de `windows`, dans l'ordre.

## Conception (choix du pilote, à ne pas rouvrir)

- **CLI** (`board.py`, `main()` ~ligne 390) : une sous-commande `usage` qui lit ce JSON depuis `--file <chemin>` ou depuis l'entrée standard (`-`), ajoute `ts` (maintenant) et `project` (`project_of('.')`, comme `archive`), et le poste sur `/api/usage`. Silencieuse si le board est arrêté, comme les autres commandes.
- **Serveur** (`do_POST` ~ligne 340, `do_GET` ~ligne 286, la classe `Store`) : `POST /api/usage` garde **le dernier relevé** (un seul, le forfait est celui du compte), le persiste dans le dossier de données (`usage.json`, relu au démarrage), le diffuse sur le flux SSE (un événement `kind: usage`) ; `/api/state` le renvoie dans un champ `usage`.
- **Page** (`index.html`, `<header>` ~ligne 88, `connect()` / `EventSource` ~ligne 355) : un bandeau compact sous l'en-tête, une jauge par fenêtre (libellé raccourci : `5h`, `Week`, ou le libellé brut pour les autres) avec le % et le temps restant **recalculé à partir de `resetsAt`** (rafraîchi chaque minute) ; une jauge `Context` avec `246k / 1M · 25 %` et un repère au seuil `autoCompactsAtPercent` ; à droite, l'âge du relevé (`updated 3 min ago`). Couleurs des jauges : normale < 80 %, orange ≥ 80 %, rouge ≥ 95 % (pour le contexte : par rapport à `autoCompactsAtPercent`). Mis à jour en direct par l'événement SSE, sans recharger. Rien d'affiché tant qu'aucun relevé n'existe. Lisible en thème sombre et clair, et sur une fenêtre étroite (les jauges passent à la ligne).
- **Skill** `skill/SKILL.md` : une courte section « Usage » : le pilote, à chaque étape (début de session, lancement, relecture, fusion), appelle l'outil `get_usage` de l'app, écrit sa sortie dans un fichier de son dossier temporaire, puis `python3 $B usage --file <fichier>`.
- **README** : une ligne dans la liste des fonctionnalités et la commande dans l'usage de la CLI.

## Test (seulement celui-ci)

Lance `python3 board.py serve --port 8121 --data <un dossier temporaire à toi>` en arrière-plan et **laisse-le tourner** (le pilote le regardera). Envoie l'exemple ci-dessus avec `python3 board.py --url http://127.0.0.1:8121 usage --file <fichier>`, puis vérifie que `curl -s 127.0.0.1:8121/api/state` contient `"usage"` avec `percentUsed` 97. Colle les deux sorties. Pas de capture d'écran.

## Rapport

Comme dans `pilot-subagent` : URL de la PR, ce qui a été fait, la sortie du test, le port du serveur laissé en marche, les écarts, les Questions ouvertes, les Frictions.
