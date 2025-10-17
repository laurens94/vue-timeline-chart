<script setup>
  // Add items to plot and groups to categorize them:
  const items = [
    { id: 'item1', group: 'group1', type: 'point', start: 1705878000000, cssVariables: { '--item-background': 'var(--color-2)' } },
    { id: 'item2', group: 'group1', type: 'range', start: 1707135072000, end: 1708431072000, cssVariables: { '--item-background': 'var(--color-4)' } },
    { id: 'item3', group: 'group2', type: 'range', start: 1706790600000, end: 1706877000000 },
  ];
  const groups = [
    { id: 'group1', label: 'Group 1' },
    { id: 'group2', label: 'Group 2' },
  ];
</script>


<template>
  <!-- Add the component to your template, passing the items and groups as props: -->
  <Timeline
    :items="items"
    :groups="groups"
    :viewportMin="1703112200000"
    :viewportMax="1714566600000"
  />
</template>
