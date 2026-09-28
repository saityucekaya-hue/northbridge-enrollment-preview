# Enrollment illustration assets

Generated with OpenAI ImageGen on 2026-09-27 for the approved Northbridge enrollment concept.

- `mountain.png`: flat sunny mountain background, no route, text, markers or character.
- `hiker.png`: flat backpacked student hiker on a transparent background.
- `eucalyptus.png`: transparent watercolor eucalyptus branch in sage and muted teal, used along the help card edge and below it. Generated for the user's botanical-artwork revision; replaces the outline Sprout icon.
- `pointed-corner-leaves.png`: current decoration, faithfully derived from the user's supplied help-card reference. One connected corner with elongated pointed leaves rises along the right and sweeps left below the card. Replaces the two separate eucalyptus sprigs.

The route, eight checkpoints, progress bar and hiker position are code-native overlays in `MyEnrollment.tsx`. The background stays stationary. Hiker movement follows completed-task count and respects `prefers-reduced-motion`. Asset generation used the approved flat mountain design as reference. The images contain no student data.
