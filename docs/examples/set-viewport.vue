// @noErrors
<script setup lang="ts">
  import { computed, ref } from 'vue';

  const timeline = ref(null);

  const items = [
    { id: 'item-1', group: '1', type: 'range', cssVariables: { '--item-background': 'var(--color-2)' }, start: 100000, end: 450000 },
    { id: 'item-2', group: '2', type: 'range', cssVariables: { '--item-background': 'var(--color-4)' }, start: 450000, end: 600000 },
    { id: 'item-3', group: '3', type: 'range', start: 600000, end: 800000 },
  ];

  const initialViewportRange = ref({ start: 400000, end: 700000 });
  const viewport = ref({ start: 400000, end: 700000 });
  const maxRange = ref({ start: 0, end: 800000 });

  const viewportSize = computed(() => viewport.value.end - viewport.value.start);

</script>

<template>
  <Timeline
    ref="timeline"
    :items="items"
    :groups="[{id: '1'}, {id: '2'}, {id: '3'}]"
    :viewportMin="maxRange.start"
    :viewportMax="maxRange.end"
    :initialViewportStart="initialViewportRange.start"
    :initialViewportEnd="initialViewportRange.end"
    @changeViewport="viewport = $event"
  />

  <div class="controls">
    <button @click="viewport.start > maxRange.start && timeline.setViewport(viewport.start - viewportSize * 0.2, viewport.end - viewportSize * 0.2)">
      Move left
    </button>
    <button @click="viewport.end < maxRange.end && timeline.setViewport(viewport.start + viewportSize * 0.2, viewport.end + viewportSize * 0.2)">
      Move right
    </button>
    <button @click="timeline.setViewport(viewport.start - viewportSize * 0.2, viewport.end + viewportSize * 0.2)">
      Zoom out
    </button>
    <button @click="timeline.setViewport(viewport.start + viewportSize * 0.2, viewport.end - viewportSize * 0.2)">
      Zoom in
    </button>
    <button @click="timeline.setViewport(initialViewportRange.start, initialViewportRange.end)">
      Reset viewport
    </button>
    <button @click="timeline.setViewport(maxRange.start, maxRange.end)">
      Set viewport to max range
    </button>
  </div>
</template>

<style lang="scss" scoped>
  .controls {
    display: flex;
    gap: .5rem;
    flex-wrap: wrap;
  }

  button {
    border: 1px solid color-mix(in srgb, currentcolor, transparent 80%);
    border-radius: 4px;
    cursor: pointer;
    padding: 0.1rem 0.4rem;

    &:hover {
      background-color: color-mix(in srgb, currentcolor, transparent 95%);
    }
  }
</style>
