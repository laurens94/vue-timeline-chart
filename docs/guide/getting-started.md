<script setup>
import BasicExample from '/examples/basic-example.vue'
</script>

# Getting Started

`vue-timeline-chart` is a simple yet versatile Vue 3 component that allows you to plot points or ranges on a timeline.
You can zoom in/out, scroll horizontally and update content dynamically. 

Feel free to report [issues](https://github.com/laurens94/vue-timeline-chart/issues/new), make PR's and start [discussions](https://github.com/laurens94/vue-timeline-chart/discussions/new/choose). 


## Installation

::: code-group

```bash [pnpm]
pnpm add vue-timeline-chart
```

```bash [npm]
npm add vue-timeline-chart
```

```bash [yarn]
yarn add vue-timeline-chart
```

:::

## Usage

<<< @/examples/basic-example-with-imports.vue{vue twoslash}

::: tip
Setting the `viewportMin` and `viewportMax` is useful for determining the initial zoom level.  
It also prevents scrolling outside of the given range.
:::

### Result

<BasicExample/>
