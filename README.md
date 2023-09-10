# Vue 3 Timeline Chart component

## Features

- Zooming
- Infinite scrolling
- Customizable
- Plotting ranges, points, and backgrounds

## Usage

```sh
npm add vue-timeline-chart
```

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
```

## Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `groups` | `TimelineGroup[]` | `[]` | Groups (rows)
| `items` | `TimelineItem[]` | `[]` | Items to display |
| `markers` | `Marker[]` | `[]` | Markers to display |
| `viewportMin` | `number` | `undefined` | Minimum timestamp of the viewport (prevents scrolling to before this point) |
| `viewportMax` | `number` | `undefined` | Maximum timestamp of the viewport (prevents scrolling past this point) |
| `minViewportDuration` | `number` | `60000` (1 min) | Minimum duration of the viewport in ms (for zooming) |
| `maxViewportDuration` | `number` | `7257600000` (3 months) | Maximum duration of the viewport in ms (for zooming) |

## Events

| Event | Arguments | Description |
| --- | --- | --- |
| `mousemoveTimeline` | `{time: number, event: MouseEvent}` | Mousemove event on the timeline |
| `mouseleaveTimeline` | `{event: MouseEvent}` | Mouseleave event on the timeline |

### TimelineGroup

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `id` | `string` | *(required)* | Unique ID |
| `content` | `string` | `''` | Group label |

### TimelineItem

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `id` | `string` | `undefined` | Unique ID |
| `start` | number | *(required)* | Timestamp |
| `className` | `string` | `''` | CSS class |
| `type` | `string` | 'point' \| 'range' \| 'background' | Type of item |

## Development

### Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

### Type Support For `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin) to make the TypeScript language service aware of `.vue` types.

If the standalone TypeScript plugin doesn't feel fast enough to you, Volar has also implemented a [Take Over Mode](https://github.com/johnsoncodehk/volar/discussions/471#discussioncomment-1361669) that is more performant. You can enable it by the following steps:

1. Disable the built-in TypeScript Extension
   1. Run `Extensions: Show Built-in Extensions` from VSCode's command palette
   2. Find `TypeScript and JavaScript Language Features`, right click and select `Disable (Workspace)`
2. Reload the VSCode window by running `Developer: Reload Window` from the command palette.
