---
name: pilot-ha-plooum
description: Spécificités de HA-Plooum-Cards pour le pilote. À charger avec le skill global `pilot` (plooum/claude-pilot) quand tu es le pilote de ce dépôt.
---

# Pilote : spécificités de HA-Plooum-Cards

Le rôle, la boucle, la relecture et le passage de relais sont dans le skill global `pilot` (`~/.claude/skills/pilot`, de plooum/claude-pilot). Seul ce qui est propre à ce dépôt est ici.

## Premiers pas ici

- Passage de relais : [.claude/pilot/HANDOFF.md](../../pilot/HANDOFF.md).
- `dev/ha.sh status` : le HA du checkout principal sur 8123 peut rester allumé.
- Le tableau des agents vit dans `~/.local/opt/agent-board` (voir le skill `agent-board`).

## Environnement de dev des sous-agents

- Chaque worktree démarre son propre HA : `dev/ha.sh start`, puis `npm run build` dedans. Ports 8124+, ~270 Mo chacun, `dev/ha.sh list` les montre. Le prompt dit au sous-agent de faire `dev/ha.sh stop` à la fin.
- En parallèle : 3-4 sur le fixe, 1-2 sur le portable (7 Go de RAM).
- Les prompts disent : suites avec `dev/ui_test.py`, vérifications à la main avec `dev/shot.py --js`, jamais le panneau intégré.
- `dev/ha.sh start` enregistre le worktree sur le tableau.
- La carte floorplan tient en un fichier de 7 000 lignes : donne aux PR parallèles des travaux disjoints.

## Fusionner ici

- Arrête le HA du sous-agent **avant** `gh pr merge` : `--delete-branch` supprime son worktree et laisse son HA orphelin (trouve-le avec `ss -ltnp | grep 812`).
- Règle de rebase : CLAUDE.md, **Workflow Git**. CI = Build + Validate.
- Releases seulement sur ordre de l'utilisateur (CLAUDE.md, **Releases**).
- Le `/plooum-edit` du checkout principal devient périmé quand `plooum-test.yaml` change : `dev/ha.sh reset` puis `dev/ha.sh start`.

## Checklist de relecture : points du projet

- La carte hors de l'éditeur est inchangée ; les cartes du tableau de bord derrière la boîte de dialogue de l'éditeur ne sont pas affectées.
- Cas limites : entité manquante / indisponible, caméra sans image, un autre étage, un plan vide.
- `shot.py` sort avec 0.
- `docs/<card>.md` mis à jour ; README.md et README.fr.md ensemble.
- Aucun bundle commité, aucun changement de `CARD_VERSION` dans une PR de fonctionnalité.
- Branche sans `tags/` ; textes de l'interface en anglais ; PR, commits et prompts en français.

## Prémisses de test

- Vérifie les cas de test contre `dev/ha-config/dashboards/plooum-test.yaml` (les deux étages) ; le prompt 10 supposait un côté libre qui était l'aile propre du rez-de-chaussée.
- Une tâche d'accélération : mesure d'abord la répartition (`dev/ui_test.py --verbose`) ; le prompt 19 supposait que les chargements de page dominaient, ce qui était faux.

## Skills du projet

| Skill | Pour |
| :--- | :--- |
| `pilot-ha-plooum` | ce fichier |
| `pr-workflow` | tout sous-agent : spécificités de livraison de ce dépôt |
| `ha-dev-testing` | toute tâche qui teste dans le HA de dev |
| `floorplan-card` | toute modification de la carte floorplan |

Idées de skills : `vivarium-card`, `docs-readme`, `new-card`.

## Passage de relais ici

`.claude/pilot/` est commité directement sur `main` (exception de CLAUDE.md). Solution de repli quand un sous-agent travaille dans le checkout principal : un worktree détaché, `git worktree add --detach ../HA-Plooum-Cards-pilot origin/main`, puis `git -C ../HA-Plooum-Cards-pilot push origin HEAD:main`. Le push liste des « Bypassed rule violations » : c'est normal.
