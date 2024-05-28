<script setup>
  import { Timeline } from 'vue-timeline-chart';
  import 'vue-timeline-chart/style.css';

  const groups = [
    { id: 'group1', label: 'Group 1' },
    { id: 'group2', label: 'Group 2' },
  ];

  const items = [
    { group: 'group1', type: 'point', start: 1705878000000, cssVariables: { '--item-background': 'var(--color-2)' } },
    { group: 'group1', type: 'range', start: 1707135072000, end: 1708431072000, cssVariables: { '--item-background': 'var(--color-4)' } },
    { group: 'group2', type: 'range', start: 1706790600000, end: 1706877000000 },
  ];
</script>

<template>
  <Timeline
    :groups="groups"
    :items="items"
    :viewportMin="1703112200000"
    :viewportMax="1714566600000"
  />
</template>
