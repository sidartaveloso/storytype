---
'@storytype/components': patch
---

The colors of `CounterPanel`, `ConnectionStatus` and `ErrorMessage` can be set from any ancestor: their CSS custom properties are no longer declared on each component's root, where they won over the ancestor's values. New `TrayBoardScreen` stories: `With logo` and `Custom colors`.
