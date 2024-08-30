<script setup>
import Example from './line-chart.vue'
</script>

# Custom Charts or Canvas Rendering
This example shows how to render a line chart with [D3.js](https://d3js.org/) and sync it with the timeline.

The same approach can be used to render a canvas-based component to display large amounts of data without performance issues, as the timeline items are rendered as individual DOM elements (see [Performance](/guide/performance)).

<Example/>

## Code

<<< ./line-chart.vue{vue}

### LineChart.vue (custom component utilizing D3.js)

<<< ./components/LineChart.vue{vue}
