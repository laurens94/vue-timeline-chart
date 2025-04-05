<h1 align="center">
  Vue 3 Timeline Chart component
</h1>
<p align="center">
  <a href="https://github.com/laurens94/vue-timeline-chart" target="_blank">
    <img src="https://img.shields.io/github/v/release/laurens94/vue-timeline-chart">
  </a>
  <a href="https://www.npmjs.com/package/vue-timeline-chart">
    <img src="https://img.shields.io/npm/v/vue-timeline-chart">
  </a>
  <a href="https://www.npmjs.com/package/vue-timeline-chart">
    <img src="https://img.shields.io/bundlephobia/min/vue-timeline-chart">
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
  <img src="https://github.com/user-attachments/assets/0164911c-2178-4f92-acca-a92df1371448" alt="timeline with customized styling">
</p>

## Features

- Zooming
- Infinite scrolling _(using native horizontal scroll events, use shift+scroll to convert vertical to horizontal mouse scrolling)_
- Plotting ranges, points, markers and backgrounds
- Adjustable timestamp labels per scale
- Customizable

## [Live demo](https://laurens94.github.io/vue-timeline-chart/examples/basic-example.html)

## [API documentation and examples](https://laurens94.github.io/vue-timeline-chart/reference/props.html)

## Usage

```sh
npm add vue-timeline-chart
```

```ts
import { Timeline } from 'vue-timeline-chart'
import 'vue-timeline-chart/style.css'
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
    {{ group.label }}
  </template>

  <template #item="{item}">
    <div
      :title="item.title || null"
      style="inset: 0; position: absolute;"
    ></div>
  </template>
</Timeline>
```

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

- [VS Code](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar)
