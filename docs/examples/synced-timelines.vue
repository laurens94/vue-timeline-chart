<script setup>
  import { ref } from 'vue';
  const items = [
    { group: '1', type: 'range', cssVariables: { '--item-background': 'teal' }, start: 1000, end: 4500 },
    { group: '2', type: 'range', cssVariables: { '--item-background': 'hotpink' }, start: 4500, end: 6000 },
    { group: '3', type: 'range', start: 6000, end: 8000 },
  ];

  const viewport = ref({ start: 4000, end: 7000 });
  const totalRange = ref({ start: 0, end: 8000 });
</script>

<template>
  <Timeline
    :items="[...items, { type: 'background', start: viewport.start, end: viewport.end }]"
    :groups="[{id: '1'}, {id: '2'}, {id: '3'}]"
    :viewportMin="totalRange.start"
    :viewportMax="totalRange.end"
    :minViewportDuration="totalRange.end"
    inert
    class="map"
  />

  <Timeline
    :items="items"
    :groups="[{id: '1'}, {id: '2'}, {id: '3'}]"
    :viewportMin="totalRange.start"
    :viewportMax="totalRange.end"
    :initialViewportStart="viewport.start"
    :initialViewportEnd="viewport.end"
    @changeViewport="viewport = $event"
  />
</template>

<style lang="scss" scoped>
  .map {
    --group-items-height: .5em;
    --group-border-top: 0;
    --label-padding: 0;
    --group-padding-top: .1em;
    --group-padding-bottom: .1em;

    :deep(.group:first-of-type) {
      padding-top: 1rem;
    }

    :deep(.group:nth-of-type(3)) {
      padding-bottom: 1rem;
    }

    :deep(.background)  {
      --item-background: color-mix(in srgb, currentcolor, transparent 90%);
    }
  }
</style>
