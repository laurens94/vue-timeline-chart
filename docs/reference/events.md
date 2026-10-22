---
outline: deep
---

# Events

<<< ../../src/components/Timeline.vue#Events{ts}

> [!IMPORTANT]
> The `time` argument is the position (in ms) in the timeline where the mouse is hovering.

> [!NOTE]
> The `group` argument is the group at the position of the mouse, pointer or touch point. It is `null` when there is no group at that position (e.g. at the timestamp labels).
> Because `group` comes from the position, it is also correct while you drag an item to a different group, with mouse and touch input. Touch events only give a `group` when there is one touch point.

> [!TIP]
> The `onWheel` event handler is exposed as a method on the timeline component. This is useful when [syncing multiple timelines](/examples/synced-timelines.html).

> [!TIP]
> Groups have a `data-group-id` attribute, and items and markers carry a `data-item-id` attribute.
