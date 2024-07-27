<script setup lang="ts">
  import { ref } from 'vue';

  const items = ref([
    { id: 1, group: 1, type: 'range', cssVariables: { '--item-background': 'var(--color-2)' }, start: 1000000, end: 4500000 },
    { id: 2, group: 2, type: 'range', cssVariables: { '--item-background': 'var(--color-4)' }, start: 4500000, end: 6000000 },
    { id: 3, group: 3, type: 'range', start: 6000000, end: 8000000 },
  ]);

  let previousDragTimePos = 0;
  let currentDragAction: 'resize-start' | 'resize-both' | 'resize-end' | undefined;
  let currentDragItemId = null;

  function handleItemDrag ({ time, event, item }) {
    if (event.type === 'pointerdown') {
      if (!event.target.dataset.action) {
        return;
      }

      currentDragAction = event.target.dataset.action as typeof currentDragAction;
      currentDragItemId = item.id;
      previousDragTimePos = time;
    }
    else if (event.type === 'pointermove') {
      if (!currentDragAction) {
        return;
      }

      const foundItem = items.value.find(i => i.id === currentDragItemId)!;
      const delta = time - previousDragTimePos;

      if (currentDragAction === 'resize-start' || currentDragAction === 'resize-both') {
        foundItem.start += delta;
      }
      if (currentDragAction === 'resize-end' || currentDragAction === 'resize-both') {
        foundItem.end += delta;
      }

      previousDragTimePos = time;
    }
  }

  window.addEventListener('pointerup', () => {
    currentDragAction = undefined;
  }, { capture: true });

</script>

<template>
  <Timeline
    :items="items"
    :groups="[{id: 1}, {id: 2}, {id: 3}]"
    :viewportMin="0"
    :viewportMax="8000000"
    :initialViewportStart="0"
    :initialViewportEnd="8000000"
    @changeViewport="viewport = $event"
    @pointermove="handleItemDrag"
    @pointerdown="handleItemDrag"
  >
    <template #item>
      <div class="draggable" data-action="resize-both">
        <div class="draggable-handle" data-action="resize-start"></div>
        <div class="draggable-handle" data-action="resize-end"></div>
      </div>
    </template>
  </Timeline>
</template>

<style lang="scss" scoped>
  .draggable {
    position: absolute;
    inset: 0;
    display: flex;
    justify-content: space-between;
    cursor: move;

    .draggable-handle {
      position: relative;
      width: 1.2rem;
      height: 100%;
      cursor: ew-resize;
      opacity: .6;

      &::before {
        content: '';
        border-inline: 1px solid white;
        width: 4px;
        height: 40%;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        position: absolute;
      }

      &:hover {
        opacity: 1;
      }
    }
  }
</style>
