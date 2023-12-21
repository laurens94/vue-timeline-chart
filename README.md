<h1 align="center">
  Vue 3 Timeline Chart component
</h1>
<p align="center">
  <a href="https://github.com/laurens94/vue-timeline-chart" target="_blank">
    <img src="https://img.shields.io/github/package-json/v/laurens94/vue-timeline-chart">
  </a>
  <a href="https://www.npmjs.com/package/vue-timeline-chart">
    <img src="https://img.shields.io/npm/v/vue-timeline-chart">
  </a>
<p>

<p align="center">
  A simple yet versatile vue3 component that allows you to plot points or ranges on a timeline.<br>
  You can zoom in/out, scroll horizontally and update content dynamically.
<p>

<p align="center">
  Feel free to report <a href="https://github.com/laurens94/vue-timeline-chart/issues/new">issues</a>, make PR's and start <a href="https://github.com/laurens94/vue-timeline-chart/discussions/new/choose">discussions</a>.
<p>

<p align="center">
  <img src="https://github.com/laurens94/vue-timeline-chart/assets/5780704/5ab32f01-0034-4538-a2f3-15f03956420a" alt="timeline with customized styling">
</p>

## Features

- Zooming
- Infinite scrolling
- Plotting ranges, points, markers and backgrounds
- Adjustable timestamp labels per scale
- Customizable

## Usage

```sh
npm add vue-timeline-chart
```

### Example
```html
<Timeline
  :groups="groups"
  :items="items"
  :markers="markers"
  :viewportMin="1691089380000"
  :viewportMax="1691101020000"
  :minViewportDuration="1000 * 60"
  :maxViewportDuration="1000 * 60 * 60 * 24 * 7"
  @mousemoveTimeline="onMousemoveTimeline"
  @mouseleaveTimeline="onMouseleaveTimeline"
>
  <template #group-label="{ group }">
    {{ group.content }}
  </template>

  <template #item="{item}">
    <div
      :title="item.title || null"
      style="inset: 0; position: absolute;"
    ></div>
  </template>
</Timeline>
```

## Props

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `groups` | [TimelineGroup[]](#timelinegroup) | `[]` | Define (rows)
| `items` | [TimelineItem[]](#timelineitem) | `[]` | Items to display |
| `markers` | [TimelineMarker[]](#timelinemarker) | `[]` | Markers to display |
| `viewportMin` | `number` | `undefined` | Minimum timestamp of the viewport (prevents scrolling to before this point) |
| `viewportMax` | `number` | `undefined` | Maximum timestamp of the viewport (prevents scrolling past this point) |
| `minViewportDuration` | `number` | `60000` (1 min) | Minimum duration of the viewport in ms (limits zooming in) |
| `maxViewportDuration` | `number` | `undefined` | Maximum duration of the viewport in ms (limits zooming out) |
| `initialViewportStart` | `number` | `undefined` | Initial start timestamp of the viewport |
| `initialViewportEnd` | `number` | `undefined` | Initial end timestamp of the viewport |
| `renderTimestampLabel` | `function(timestamp: number, scale: { unit: string, step: number})` | `undefined` | Custom function to render timestamp labels |
| `fixedLabels` | `boolean` | `false` | Whether to display group labels on top of the timeline |
| `minTimestampWidth` | `number` | `100` | Minimum width a timestamp label should have in px (determines how many timestamps should be displayed) |
| `activeItems` | `TimelineItem['id'][]` | `[]` | IDs of items that should have an `active` class |

### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `timestamp` | `{ timestamp: number, scale: { unit: string, step: number } }` | Timestamp label |
| `group-label` | `{ group: TimelineGroup }` | Group label |
| `items-GROUPID` | `{ group: TimelineGroup, itemsInViewport: TimelineItem[], viewportStart: number, viewportEnd: number }` | Slot for all items within a group, useful when rendering the items manually (e.g. when using a chart or canvas) |
| `item` | `{ item: TimelineItem }` | Item content |

## Events


| Event | Arguments | Description |
| --- | --- | --- |
| `click` | `{time: number, event: MouseEvent, item: TimelineItem \| null}` | Click event on the timeline |
| `contextmenu` | `{time: number, event: MouseEvent, item: TimelineItem \| null}` | Right-click event on the timeline |
| `mousemoveTimeline` | `{time: number, event: MouseEvent}` | Mousemove event on the timeline |
| `mouseleaveTimeline` | `{event: MouseEvent}` | Mouseleave event on the timeline |
| `changeViewport` | `{ start: number, end: number }` | Visible range has changed |
| `changeScale` | `{ unit: string, step: number }` | Visible scale (minutes/hours/days/etc.) has changed |

The `time` argument is the position (in ms) in the timeline where the mouse is hovering.

### TimelineGroup

TimelineGroups are the rows in the timeline with items.

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `id` | `string` | *(required)* | Unique ID, to bind items to |
| `content` | `string` | *(required)* | Group label |
| `className` | `string` | `''` | CSS class(es) |

### TimelineItem

TimelineItems can be points, ranges, backgrounds or markers. They are assigned to a group by their `group` property.

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `id` | `string` | `undefined` | Unique ID, to match with `activeItems` prop |
| `start` | number | *(required)* | Timestamp |
| `end` | number | *(required for range and background)* | Timestamp, only used for type `range` and `background` |
| `className` | `string` | `''` | CSS class(es) |
| `type` | `string` | *(required)* | Type of item, one of: `point`, `range`, `background` or `marker` |
| `cssVariables` | `Record<string, string>` | `{}` | CSS variables to apply to the item (e.g. `{ '--height': '20%' }`) |

### TimelineMarker

To improve performance, you can add markers as an individual prop, instead of together with `items`. This allows you to update the position of a marker (e.g. to show the current time) while keeping the rest of the items cached.

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `id` | `string` | `undefined` | Unique ID, to match with `activeItems` prop |
| `start` | number | *(required)* | Timestamp |
| `className` | `string` | `''` | CSS class(es) |
| `type` | `string` | *(required)* | `marker` |


## Development

### Install dependencies:
```
pnpm install
```

### Dev server with live reloading
```
pnpm start
```

### Building the application and watching for changes
```
pnpm dev
```

### Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

1. Disable the built-in TypeScript Extension
   1. Run `Extensions: Show Built-in Extensions` from VSCode's command palette
   2. Find `TypeScript and JavaScript Language Features`, right click and select `Disable (Workspace)`
2. Reload the VSCode window by running `Developer: Reload Window` from the command palette.
