---
outline: deep
---

# Slots

| Slot | Props | Description |
| --- | --- | --- |
| `timestamp` | `{ timestamp: number, scale: { unit: string, step: number } }` | Timestamp label |
| `timestamps-before` | `{ scale: { unit: string, step: number } }` | Injected before the timestamps |
| `timestamps-after` | `{ scale: { unit: string, step: number } }` | Injected after the timestamps |
| `group-label` | `{ group: TimelineGroup }` | Group label |
| `items-GROUPID` | `{ group: TimelineGroup, itemsInViewport: TimelineItem[], viewportStart: number, viewportEnd: number, stacking?: { lanes: Map<string, { lane: number, stackSize: number, isStacked: boolean }>, laneCount: number } }` | Slot for all items within a group, useful when rendering the items manually (e.g. when [using a chart or canvas](/examples/custom-charts-or-canvas-rendering)). `stacking` is present when the group has stacking enabled. |
| `item` | `{ item: TimelineItem, lane: number, stackSize: number, isStacked: boolean }` | Item content. `lane`, `stackSize` and `isStacked` describe the item's position when [stacking](/examples/stacking-items) is enabled. |
| `marker` | `{ item: TimelineMarker }` | Marker content. Set `contain: unset` css to allow overflow or adjust the size accordingly. |
