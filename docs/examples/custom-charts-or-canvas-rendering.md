<script setup>
import Example from './line-chart.vue'
</script>

# Custom Charts or Canvas Rendering
This example shows how to render a line chart with [D3.js](https://d3js.org/) and sync it with the timeline.

The same approach can be used to render a canvas-based component to display large amounts of data without performance issues, as the timeline items are rendered as individual DOM elements (see [Performance](/guide/performance)).

:::info
The basic principle is to render a custom component in a group (using the [`items-GROUPID` slot](/reference/slots)) and pass the viewport range to the custom component. That component is then responsible for rendering the data points within this range.

Position the custom component over a timeline row with CSS.
:::
<Example/>

## Code

::: code-group
<<< ./line-chart.vue{vue} [Main code]
<<< ./components/LineChart.vue{vue} [LineChart.vue (custom component utilizing D3.js)]
:::
