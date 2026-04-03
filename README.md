<h1 align="center">
  Vue 3 Timeline Chart
</h1>

<p align="center">
  <a href="https://github.com/laurens94/vue-timeline-chart">
    <img src="https://img.shields.io/github/v/release/laurens94/vue-timeline-chart" alt="GitHub release">
  </a>
  <a href="https://www.npmjs.com/package/vue-timeline-chart">
    <img src="https://img.shields.io/npm/v/vue-timeline-chart" alt="npm version">
  </a>
  <a href="https://www.npmjs.com/package/vue-timeline-chart">
    <img src="https://img.shields.io/bundlephobia/min/vue-timeline-chart" alt="bundle size">
  </a>
  <a href="https://github.com/laurens94/vue-timeline-chart/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/laurens94/vue-timeline-chart" alt="license">
  </a>
</p>
<p align="center">
  A simple yet versatile Vue 3 component that allows you to plot points or ranges on a timeline.<br>
  Zoom in/out, scroll horizontally and update content dynamically.
</p>
<p align="center">
  <a href="https://laurens94.github.io/vue-timeline-chart/examples/basic-example.html"><strong>Live Demo</strong></a> · <a href="https://laurens94.github.io/vue-timeline-chart/reference/props.html"><strong>Documentation</strong></a> · <a href="https://github.com/laurens94/vue-timeline-chart/issues/new">Report Issue</a> · <a href="https://github.com/laurens94/vue-timeline-chart/discussions/new/choose">Discussions</a>
</p>

---

<p align="center">
  <img src="https://github.com/user-attachments/assets/0164911c-2178-4f92-acca-a92df1371448" alt="timeline with customized styling">
</p>

---

## Features

- **Zooming** — zoom in and out with scroll or pinch gestures
- **Infinite scrolling** — native horizontal scroll events *(shift+scroll to convert vertical to horizontal)*
- **Flexible data** — plot ranges, points, markers and backgrounds
- **Touch support** — smooth pinch-to-zoom and up to 2-finger panning
- **Adjustable labels** — timestamp labels adapt per scale
- **Minimal styling** — easy to customize to your needs

## Getting started

### Installation

```sh
pnpm add vue-timeline-chart
```

### Setup

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

  <template #item="{ item }">
    <div
      :title="item.title || null"
      style="inset: 0; position: absolute;"
    ></div>
  </template>
</Timeline>
```

## Development

```sh
# Install dependencies
pnpm install

# Dev server with live reloading
pnpm start

# Build and watch for changes
pnpm dev
```

### Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar)

<p align="center">
  <a href='https://ko-fi.com/L3L0BR8QG' target='_blank'><img height='36' style='border:0px;height:36px;' src='https://storage.ko-fi.com/cdn/kofi1.png?v=6' border='0' alt='Buy Me a Coffee at ko-fi.com' /></a>
</p>
