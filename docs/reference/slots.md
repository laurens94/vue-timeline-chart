---
outline: deep
---

# Slots

| Slot | Props | Description |
| --- | --- | --- |
| `timestamp` | `{ timestamp: number, scale: { unit: string, step: number } }` | Timestamp label |
| `group-label` | `{ group: TimelineGroup }` | Group label |
| `items-GROUPID` | `{ group: TimelineGroup, itemsInViewport: TimelineItem[], viewportStart: number, viewportEnd: number }` | Slot for all items within a group, useful when rendering the items manually (e.g. when using a chart or canvas) |
| `item` | `{ item: TimelineItem }` | Item content |
