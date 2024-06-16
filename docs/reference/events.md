---
outline: deep
---

# Events

| Event | Arguments | Description |
| --- | --- | --- |
| `pointermove` | `{time: number, event: PointerEvent, item: TimelineItem \| null}` | Pointermove event on the timeline |
| `pointerdown` | `{time: number, event: PointerEvent, item: TimelineItem \| null}` | Pointerdown event on the timeline |
| `pointerup` | `{time: number, event: PointerEvent, item: TimelineItem \| null}` | Pointerup event on the timeline |
| `wheel` | `WheelEvent` | Wheel event on the timeline |
| `click` | `{time: number, event: MouseEvent, item: TimelineItem \| null}` | Click event on the timeline |
| `contextmenu` | `{time: number, event: MouseEvent, item: TimelineItem \| null}` | Right-click event on the timeline |
| `mousemoveTimeline` | `{time: number, event: MouseEvent}` | Mousemove event on the timeline |
| `mouseleaveTimeline` | `{event: MouseEvent}` | Mouseleave event on the timeline |
| `changeViewport` | `{ start: number, end: number }` | Visible range has changed |
| `changeScale` | `{ unit: string, step: number }` | Visible scale (minutes/hours/days/etc.) has changed |

> [!IMPORTANT]
> The `time` argument is the position (in ms) in the timeline where the mouse is hovering.

> [!TIP]
> The `onWheel` event is exposed. This is useful when [syncing multiple timelines](/examples/synced-timelines.html).
