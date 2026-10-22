// @noErrors
<script setup lang="ts">
  import { computed, ref } from 'vue';

  const items = ref([
    { id: 'a', group: 'g', type: 'range', cssVariables: { '--item-background': 'var(--color-2)' }, start: 2000000, end: 5000000 },
    { id: 'b', group: 'g', type: 'range', cssVariables: { '--item-background': 'var(--color-4)' }, start: 3000000, end: 6000000 },
  ]);

  let previousDragTimePos = 0;
  let currentDragAction: 'resize-start' | 'resize-both' | 'resize-end' | undefined;
  const draggingId = ref<string | null>(null);
  // Pointers currently down, so a drag only runs with a single finger (a second
  // finger is a pinch-zoom, not a resize).
  const activePointers = new Set<number>();
  // Item starts captured at grab time, used to freeze the lane order while dragging.
  let frozenStartById = new Map<string, number>();

  // While dragging, sort by the grab-time order so the dragged item keeps its lane
  // instead of swapping when it crosses the other item.
  const stacking = computed(() => ({
    enabled: true,
    compare: draggingId.value
      ? (a, b) => frozenStartById.get(a.id) - frozenStartById.get(b.id)
      : undefined,
  }));

  function handleItemDrag ({ time, event, item }) {
    if (event.type === 'pointerdown') {
      activePointers.add(event.pointerId);
      // A second finger means a pinch — cancel any drag and don't start one.
      if (activePointers.size > 1) {
        draggingId.value = null;
        return;
      }
      if (!event.target.dataset.action) {
        return;
      }
      currentDragAction = event.target.dataset.action;
      previousDragTimePos = time;
      frozenStartById = new Map(items.value.map(i => [i.id, i.start]));
      draggingId.value = item.id;
    }
    else if (event.type === 'pointermove' && draggingId.value) {
      const draggedItem = items.value.find(i => i.id === draggingId.value)!;
      const delta = time - previousDragTimePos;

      if (currentDragAction === 'resize-start' || currentDragAction === 'resize-both') {
        draggedItem.start += delta;
      }
      if (currentDragAction === 'resize-end' || currentDragAction === 'resize-both') {
        draggedItem.end += delta;
      }

      previousDragTimePos = time;
    }
  }

  function endPointer (event: PointerEvent) {
    activePointers.delete(event.pointerId);
    draggingId.value = null;
  }
  window.addEventListener('pointerup', endPointer, { capture: true });
  window.addEventListener('pointercancel', endPointer, { capture: true });

  // Suppress viewport panning for a single-finger drag, but let multi-touch
  // through so pinch-zoom still works.
  function onItemTouch (event: TouchEvent) {
    if (event.touches.length === 1) {
      event.stopPropagation();
    }
  }
</script>

<template>
  <Timeline
    :items="items"
    :groups="[{ id: 'g' }]"
    :viewportMin="0"
    :viewportMax="8000000"
    :stacking="stacking"
    @pointermove="handleItemDrag"
    @pointerdown="handleItemDrag"
  >
    <template #item>
      <div
        class="draggable"
        data-action="resize-both"
        @touchmove="onItemTouch"
      >
        <div class="draggable-handle" data-action="resize-start"></div>
        <div class="draggable-handle" data-action="resize-end"></div>
      </div>
    </template>
  </Timeline>
</template>

<style scoped>
  .draggable {
    position: absolute;
    inset: 0;
    display: flex;
    justify-content: space-between;
    cursor: move;
    touch-action: none;

    .draggable-handle {
      width: 1rem;
      cursor: ew-resize;
      touch-action: none;
      background: rgba(255, 255, 255, 0.4);

      &:hover {
        background: rgba(255, 255, 255, 0.7);
      }
    }
  }
</style>
