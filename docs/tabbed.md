# Ha Plooum Tabs Card

`type: custom:ha-plooum-tabs-card`

Une carte personnalisée pour Home Assistant permettant d'organiser vos autres cartes sous forme d'onglets.

**Particularité :** Contrairement à d'autres cartes d'onglets, celle-ci garde les cartes en mémoire lors des changements d'onglets au lieu de les détruire et de les recréer. **C'est la solution idéale pour les flux de caméras** : changer d'onglet ne provoque pas de coupure ni de temps de latence de rechargement.

## Fonctionnalités
- Onglets fluides sans rechargement du DOM (idéal pour la vidéo).
- Style inspiré des interfaces modernes d'alarmes/caméras.
- Couleur d'arrière-plan de l'onglet actif personnalisable (défaut : `rgba(255, 255, 255, 0.2)`).
- Éditeur visuel (GUI) complet intégré dans Home Assistant.

## Exemple de configuration YAML

Bien que la carte dispose d'un éditeur visuel, vous pouvez utiliser le mode Code pour configurer rapidement des cartes complexes :

```yaml
type: custom:ha-plooum-tabs-card
active_tab_bg: rgba(255, 255, 255, 0.2)
tabs:
  - name: ENTRÉE
    cards:
      - type: custom:webrtc-camera
        url: rtsp://...
  - name: JARDIN
    cards:
      - type: picture-entity
        entity: camera.jardin
```
