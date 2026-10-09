# TODO

Issues noticed while working on something else. Each item should be fixable on its own.

## Floorplan card

### Editor: camera alignment

- [ ] **Fisheye lenses.** The division model (`distortion`) fits wide-angle lenses up to ~150°; a true fisheye (equidistant, `r = f·θ`) past 180° can't be shown by a pinhole-based model. Only if a real camera needs it.
