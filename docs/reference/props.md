---
outline: deep
---

# Props

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `groups` | [TimelineGroup[]](/reference/types#timelinegroup) | `[]` | Define (rows)
| `items` | [TimelineItem[]](/reference/types#timelineitem) | `[]` | Items to display |
| `markers` | [TimelineMarker[]](/reference/types#timelinemarker) | `[]` | Markers to display |
| `viewportMin` | `number` | `undefined` | Minimum timestamp of the viewport (prevents scrolling to before this point) |
| `viewportMax` | `number` | `undefined` | Maximum timestamp of the viewport (prevents scrolling past this point) |
| `minViewportDuration` | `number` | `60000` (1 min) | Minimum duration of the viewport in ms (limits zooming in) |
| `maxViewportDuration` | `number` | `undefined` | Maximum duration of the viewport in ms (limits zooming out) |
| `initialViewportStart` | `number` | `undefined` | Initial start timestamp of the viewport (must be greater than or equal to viewportMin) |
| `initialViewportEnd` | `number` | `undefined` | Initial end timestamp of the viewport (must be smaller than or equal to viewportMax) |
| `renderTimestampLabel` | `function(timestamp: number, scale: { unit: string, step: number})` | `undefined` | Custom function to render timestamp labels |
| `fixedLabels` | `boolean` | `false` | Whether to display group labels on top of the timeline |
| `minTimestampWidth` | `number` | `100` | Minimum width a timestamp label should have in px (determines how many timestamps should be displayed) |
| `maxZoomSpeed` | `number` | `60` | Limits the wheel event's deltaY value to prevent zooming too fast |
| `activeItems` | `TimelineItem['id'][]` | `[]` | IDs of items that should have an `active` class |
| `maxOffsetOutsideViewport` | `number` | `50` (px) | Items are clamped 50px outside the viewport, [so that they cannot become too large](https://github.com/laurens94/vue-timeline-chart/issues/8) |
