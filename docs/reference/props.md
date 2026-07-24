---
outline: deep
---

# Props

Everything you can pass to `<Timeline>`:

- [Content](#content) — `groups`, `items`, `markers`
- [Viewport](#viewport) — visible range and zoom limits
- [Timestamps](#timestamps) — labels and scales
- [Interaction](#interaction) — zoom speed and momentum
- [Layout](#layout) — fixed labels, stacking, clamping

## Content

### `groups`

- **Type:** [`TimelineGroup[]`](/reference/types#timelinegroup)
- **Default:** `[]`

Rows that will contain the items.

### `items`

- **Type:** [`TimelineItem[]`](/reference/types#timelineitem)
- **Default:** `[]`

Items to display.

### `markers`

- **Type:** [`TimelineMarker[]`](/reference/types#timelinemarker)
- **Default:** `[]`

Markers to display. Prefer this over putting markers in `items` when you need to update them often (e.g. a current-time marker) without invalidating the items cache.

### `activeItems`

- **Type:** `TimelineItem['id'][]`
- **Default:** `[]`

IDs of items that should have an `active` class.

## Viewport

### `viewportMin`

- **Type:** `number`
- **Default:** `undefined`

Minimum timestamp (whole number) of the viewport. Prevents scrolling to before this point.

### `viewportMax`

- **Type:** `number`
- **Default:** `undefined`

Maximum timestamp (whole number) of the viewport. Prevents scrolling past this point.

### `minViewportDuration`

- **Type:** `number`
- **Default:** `1000` (1 second)

Minimum duration of the viewport in ms. Limits how far you can zoom in.

### `maxViewportDuration`

- **Type:** `number`
- **Default:** `undefined`

Maximum duration of the viewport in ms. Limits how far you can zoom out.

### `initialViewportStart`

- **Type:** `number`
- **Default:** `undefined`

Initial start timestamp of the viewport.

### `initialViewportEnd`

- **Type:** `number`
- **Default:** `undefined`

Initial end timestamp of the viewport.

## Timestamps

### `renderTimestampLabel`

- **Type:** `function(timestamp: number, scale: { unit: string, step: number })`
- **Default:** `undefined`

Custom function to render timestamp labels.

### `minTimestampWidth`

- **Type:** `number`
- **Default:** `100`

Minimum width a timestamp label should have in px. Determines how many timestamps are displayed.

### `scales`

- **Type:** `Scale[]`
- **Default:** `[]`

Overwrite the default time unit snapping options. See [Timestamps and scale](/guide/timestamps-and-scale).

### `weekStartsOn`

- **Type:** `0 | 1 | 2 | 3 | 4 | 5 | 6`
- **Default:** `0`

The day of the week to start the week on (`0` = Sunday, `1` = Monday, etc.).

## Interaction

### `maxZoomSpeed`

- **Type:** `number`
- **Default:** `60`

Limits the wheel event's `deltaY` value to prevent zooming too fast.

### `momentum`

- **Type:** [`TimelineMomentumOptions`](/reference/types#timelinemomentumoptions)
- **Default:** `{}`

Momentum (fling) for released single-finger pans. Enabled by default; pass `{ enabled: false }` to turn it off, or `{ timeConstant: 200 }` with a custom value to tune the glide.

## Layout

### `fixedLabels`

- **Type:** `boolean`
- **Default:** `false`

Whether to display group labels on top of the timeline.

### `stacking`

- **Type:** [`TimelineStackingOptions`](/reference/types#timelinestackingoptions)
- **Default:** `undefined`

Enable and configure vertical stacking of time-overlapping items. Overridable per group via `group.stacking`.

### `maxOffsetOutsideViewport`

- **Type:** `number`
- **Default:** `50` (px)

Items are clamped this many pixels outside the viewport, [so that they cannot become too large](https://github.com/laurens94/vue-timeline-chart/issues/8).
