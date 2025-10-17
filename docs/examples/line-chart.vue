// @noErrors
<script setup lang="ts">
  import { ref } from 'vue';
  import LineChart from './components/LineChart.vue';
  import type { TimelineItem } from 'vue-timeline-chart';

  const items = ref<TimelineItem[]>([
    { id: '1', group: '1', type: 'range', cssVariables: { '--item-background': 'var(--color-2)' }, start: 1000000, end: 4500000 },
    { id: '3', group: '1', type: 'range', start: 6000000, end: 8000000 },
  ]);

  const linechartData = [
    { group: 'linechart', value: 1, type: 'point', start: 1000000 },
    { group: 'linechart', value: 1, type: 'point', start: 1500000 },
    { group: 'linechart', value: 0.7, type: 'point', start: 2000000 },
    { group: 'linechart', value: 0, type: 'point', start: 2500000 },
    { group: 'linechart', value: 1, type: 'point', start: 3000000 },
    { group: 'linechart', value: 0, type: 'point', start: 3500000 },
    { group: 'linechart', value: 0, type: 'point', start: 4000000 },
    { group: 'linechart', value: 0, type: 'point', start: 4500000 },
    { group: 'linechart', value: 1, type: 'point', start: 5000000 },
    { group: 'linechart', value: 0.5, type: 'point', start: 5500000 },
    { group: 'linechart', value: 1, type: 'point', start: 6000000 },
    { group: 'linechart', value: 1, type: 'point', start: 6500000 },
    { group: 'linechart', value: 0.6, type: 'point', start: 7000000 },
  ];

</script>

<template>
  <Timeline
    :items="items"
    :groups="[{id: '1'},{id: 'linechart'}]"
    :viewportMin="0"
    :viewportMax="8000000"
  >
    <template #items-linechart="{ viewportStart, viewportEnd, group }">
      <LineChart
        :viewportStart="viewportStart"
        :viewportEnd="viewportEnd"
        :data="linechartData"
      />
    </template>
  </Timeline>
</template>
