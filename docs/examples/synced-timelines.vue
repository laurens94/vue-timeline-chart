<script setup lang="ts">
  import { ref } from 'vue';

  const timeline = ref(null);

  const items = [
    { group: '1', type: 'range', cssVariables: { '--item-background': 'var(--color-2)' }, start: 1000, end: 4500 },
    { group: '2', type: 'range', cssVariables: { '--item-background': 'var(--color-4)' }, start: 4500, end: 6000 },
    { group: '3', type: 'range', start: 6000, end: 8000 },
  ];

  const viewport = ref({ start: 4000, end: 7000 });
  const totalRange = ref({ start: 0, end: 8000 });

  let isDraggingMapViewport = false;
  let previousDragTimePos = 0;

  function handleViewportDrag ({ time, event, item }) {
    switch (event.type) {
      case 'pointerdown':

        if (item?.id !== 'selection') {
          return;
        }

        isDraggingMapViewport = true;
        previousDragTimePos = time;
        break;
      case 'pointermove': {
        if (!isDraggingMapViewport) {
          return;
        }

        const delta = time - previousDragTimePos;
        const length = viewport.value.end - viewport.value.start;
        if (delta < 0) {
          viewport.value.start = Math.max(viewport.value.start + delta, totalRange.value.start);
          viewport.value.end = viewport.value.start + length;
        }
        else {
          viewport.value.end = Math.min(viewport.value.end + delta, totalRange.value.end);
          viewport.value.start = viewport.value.end - length;
        }
        previousDragTimePos = time;

        break;
      }
    }
  }

  window.addEventListener('pointerup', () => {
    isDraggingMapViewport = false;
  }, { capture: true });

  function onMapWheel (event: WheelEvent) {
    timeline.value?.onWheel(event);
  }
</script>

<template>
  <Timeline
    :items="[...items, { id: 'selection', type: 'background', start: viewport.start, end: viewport.end }]"
    :groups="[{id: '1'}, {id: '2'}, {id: '3'}]"
    :viewportMin="totalRange.start"
    :viewportMax="totalRange.end"
    :minViewportDuration="totalRange.end"
    class="map"
    @pointermove="handleViewportDrag"
    @pointerdown="handleViewportDrag"
    @wheel="onMapWheel"
  />

  <Timeline
    ref="timeline"
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

      cursor: pointer;
      z-index: 1;
    }

    :deep(.item)  {
      pointer-events: none;
    }
  }
</style>
