---
outline: deep
---

# Events

| Event | Arguments | Description |
| --- | --- | --- |
| `click` | `{time: number, event: MouseEvent, item: TimelineItem \| null}` | Click event on the timeline |
| `contextmenu` | `{time: number, event: MouseEvent, item: TimelineItem \| null}` | Right-click event on the timeline |
| `mousemoveTimeline` | `{time: number, event: MouseEvent}` | Mousemove event on the timeline |
| `mouseleaveTimeline` | `{event: MouseEvent}` | Mouseleave event on the timeline |
| `changeViewport` | `{ start: number, end: number }` | Visible range has changed |
| `changeScale` | `{ unit: string, step: number }` | Visible scale (minutes/hours/days/etc.) has changed |

> [!IMPORTANT]
> The `time` argument is the position (in ms) in the timeline where the mouse is hovering.
