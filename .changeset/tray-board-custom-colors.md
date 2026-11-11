---
'@storytype/components': patch
---

The colors of `CounterPanel`, `ConnectionStatus` and `ErrorMessage` can be set from any ancestor: their CSS custom properties are no longer declared on each component's root, where they won over the ancestor's values. New `TrayBoardScreen` stories: `With logo` and `Custom colors`.

`CounterPanel` keeps its natural width when space is short: its counters no longer shrink and their labels no longer wrap, which pushed a wrapped counter's number out of line. New `Responsive: …` stories in `TrayBoardScreen`.
