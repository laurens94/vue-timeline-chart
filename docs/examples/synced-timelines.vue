<script setup lang="ts">
  import { ref, watch } from 'vue';

  const timeline = ref(null);

  const items = [
    { group: '1', type: 'range', cssVariables: { '--item-background': 'var(--color-2)' }, start: 100000, end: 450000 },
    { group: '2', type: 'range', cssVariables: { '--item-background': 'var(--color-4)' }, start: 450000, end: 600000 },
    { group: '3', type: 'range', start: 600000, end: 800000 },
  ];

  const viewport = ref({ start: 400000, end: 700000 });
  const totalRange = ref({ start: 0, end: 800000 });

  let isDraggingMapViewport = false;
  let previousDragTimePos = 0;

  function handleViewportDrag ({ time, event, item }) {
    if (event.type === 'pointerdown') {
      if (item?.id !== 'selection') {
        return;
      }

      isDraggingMapViewport = true;
      previousDragTimePos = time;
    }
    else if (event.type === 'pointermove') {
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
    }
  }

  watch(viewport, (val) => {
    timeline.value?.setViewport(val.start, val.end);
  }, { deep: true });

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
