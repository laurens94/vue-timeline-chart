---
outline: deep
---

# Props

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `groups` | [TimelineGroup[]](/reference/types#timelinegroup) | `[]` | Define (rows)
| `items` | [TimelineItem[]](/reference/types#timelineitem) | `[]` | Items to display |
| `markers` | [TimelineMarker[]](/reference/types#timelinemarker) | `[]` | Markers to display |
| `viewportMin` | `number` | `undefined` | Minimum timestamp (whole number) of the viewport (prevents scrolling to before this point) |
| `viewportMax` | `number` | `undefined` | Maximum timestamp (whole number) of the viewport (prevents scrolling past this point) |
| `minViewportDuration` | `number` | `1000` (1 second) | Minimum duration of the viewport in ms (limits zooming in) |
| `maxViewportDuration` | `number` | `undefined` | Maximum duration of the viewport in ms (limits zooming out) |
| `initialViewportStart` | `number` | `undefined` | Initial start timestamp of the viewport |
| `initialViewportEnd` | `number` | `undefined` | Initial end timestamp of the viewport |
| `renderTimestampLabel` | `function(timestamp: number, scale: { unit: string, step: number})` | `undefined` | Custom function to render timestamp labels |
| `fixedLabels` | `boolean` | `false` | Whether to display group labels on top of the timeline |
| `minTimestampWidth` | `number` | `100` | Minimum width a timestamp label should have in px (determines how many timestamps should be displayed) |
| `maxZoomSpeed` | `number` | `60` | Limits the wheel event's deltaY value to prevent zooming too fast |
| `activeItems` | `TimelineItem['id'][]` | `[]` | IDs of items that should have an `active` class |
| `maxOffsetOutsideViewport` | `number` | `50` (px) | Items are clamped 50px outside the viewport, [so that they cannot become too large](https://github.com/laurens94/vue-timeline-chart/issues/8) |
| `scales` | `Scale[]` | `[]` | Overwrite the default time unit snapping options (see [Timestamps and scale](/guide/timestamps-and-scale)) |
| `weekStartsOn` | `0 \| 1 \| 2 \| 3 \| 4 \| 5 \| 6` | `0` | The day of the week to start the week on (0 = Sunday, 1 = Monday, etc.) |
