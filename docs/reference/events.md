---
outline: deep
---

# Events

<<< ../../src/components/Timeline.vue#Events{ts}

> [!IMPORTANT]
> The `time` argument is the position (in ms) in the timeline where the mouse is hovering.

> [!NOTE]
> The `group` argument is the group that contains the event target. It is `null` when the event target is not in a group (for example, the timestamps).

> [!TIP]
> The `onWheel` event handler is exposed as a method on the timeline component. This is useful when [syncing multiple timelines](/examples/synced-timelines.html).
