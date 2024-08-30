<template>
  <div id="chart" class="root"></div>
</template>

<script lang="ts" setup>
import { onMounted, watch } from 'vue';

const props = defineProps<{
  viewportStart: number;
  viewportEnd: number;
  data: { start: number; value: number; }[];
}>();

function initChart(start: number, end: number, data: typeof props.data) {
  if (!window.d3) {
      // ensure d3 is loaded (due to import within vitepress)
      setTimeout(() => initChart(start, end, data), 100);
      return;
    };

  const chart = document.getElementById('chart');
  if (!chart) return;

  d3.select('#chart').selectAll('svg').remove();

  const margin = { top: 2, right: 0, bottom: 2, left: 0 };
  const width = chart.clientWidth - margin.left - margin.right;
  const height = 32 - margin.top - margin.bottom;

  const svg = d3.select('#chart')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear().domain([start, end]).range([0, width]);
  const y = d3.scaleLinear().domain([0, 1]).range([height, 0]);

  const line = d3.line()
    .x(d => x(d.start))
    .y(d => y(d.value));

  svg.append('path')
    .datum(data)
    .attr('class', 'line')
    .attr('d', line);
}

// Re-render chart when viewport changes:
watch(() => [props.viewportStart, props.viewportEnd],
  () => initChart(props.viewportStart, props.viewportEnd, props.data)
);

onMounted(() => {
  initChart(props.viewportStart, props.viewportEnd, props.data);
});
</script>

<style lang="scss" scoped>
  .root {
    width: 100%;
    height: 100%;
    position: absolute;
    inset: 0;
  }

  :deep(.line) {
    fill: none;
    stroke: var(--color-1);
    stroke-width: 2px;
  }
</style>
