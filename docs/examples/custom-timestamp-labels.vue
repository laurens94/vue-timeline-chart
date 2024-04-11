<script setup>
  // Add items to plot and groups to categorize them:
  const items = [
    { group: '1', type: 'range', start: 1000, end: 4500 },
    { group: '1', type: 'range', start: 4500, end: 6000 },
    { group: '2', type: 'range', start: 6000, end: 8000 },
  ];
</script>

<template>
  <Timeline
    :items="items"
    :groups="[{id: '1'}, {id: '2'}]"
    :viewportMin="0"
    :viewportMax="8000"
    :renderTimestampLabel="(timestamp) => timestamp"
  />
</template>
