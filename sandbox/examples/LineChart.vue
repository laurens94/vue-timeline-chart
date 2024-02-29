<template>
  <div id="chart" class="root"></div>
</template>

<script lang="ts" setup>
  import './d3.js';

  import { onMounted, watch } from 'vue';

  const props = defineProps<{
    viewportStart: number;
    viewportEnd: number;
    data: {
      start: number;
      value: number;
    }[];
  }>();

  function initChart (start, end, data) {
    if (!document.getElementById('chart')) {
      return;
    }

    d3.select('#chart').selectAll('svg').remove();

    // Set dimensions and margins
    const margin = { top: 2, right: 0, bottom: 2, left: 0 },
          width = document.getElementById('chart').clientWidth - margin.left - margin.right,
          height = 32 - margin.top - margin.bottom;

    // Append the svg object to the body of the page
    const svg = d3.select('#chart')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add X axis
    const x = d3.scaleLinear()
      .domain([start, end])
      .range([0, width]);

    // Add Y axis
    const y = d3.scaleLinear()
      .domain([0, 1])  // confidence is between 0 and 1
      .range([height, 0]);

    // Line generator
    const line = d3.line()
      .x(function (d) {
        return x(d.start);
      })
      .y(function (d) {
        return y(d.value);
      });

    // Add the line
    svg.append('path')
      .datum(props.data)
      .attr('class', 'line')
      .attr('d', line);
  }

  watch(() => [props.viewportStart, props.viewportEnd], () => {
    const { viewportStart, viewportEnd, data } = props;

    initChart(viewportStart, viewportEnd, data);
  });

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
    stroke: gray;
    stroke-width: 2px;
  }
</style>
