// @noErrors
<script setup>
  import { nextTick, onMounted } from 'vue';
  // import tippy from 'tippy.js'; (disabled for vitepress, but should be enabled)

  let tippyInstances = [];

  async function resetTooltips () {
    // Wait for the Timeline to render its items into the DOM
    await nextTick();

    if (!window.tippy) {
      // ensure tippy is loaded (due to import within vitepress)
      setTimeout(() => resetTooltips(), 100);
      return;
    }

    tippyInstances.forEach((instance) => instance.destroy());
    tippyInstances = [];
    tippy('[data-tippy-content]', {
      followCursor: 'horizontal',
      onCreate: (instance) => {
        tippyInstances.push(instance);
      },
    });
  }

  onMounted(() => {
    resetTooltips();
  });

  const items = [
    { id: 'item-1', tooltip: 'Tooltip 1', name: 'Hover me!', group: 'group1', type: 'range', start: 1707135072000, end: 1708431072000, cssVariables: { '--item-background': 'var(--color-4)' } },
    { id: 'item-2', tooltip: 'Tooltip 2', name: 'Hover me!', group: 'group1', type: 'range', start: 1708517472000, end: 1709813472000, cssVariables: { '--item-background': 'var(--color-2)' } },
    { id: 'item-3', tooltip: 'Tooltip 3', name: 'Hover me!', group: 'group1', type: 'range', start: 1709903872000, end: 1711199872000, cssVariables: { '--item-background': 'var(--color-3)' } },
  ];
</script>

<template>
  <Timeline
    :items="items"
    :groups="[ { id: 'group1' } ]"
    :viewportMin="1705587257600"
    :viewportMax="1711639872000"
    @changeViewport="resetTooltips"
  >
    <template #item="{ item }">
      <div
        style="inset: 0; position: absolute; padding: 0.2em 1em; color: white; font-weight: bold;"
        :data-tippy-content="item.tooltip"
      >
        ⚑ {{ item.name }}
      </div>
    </template>
  </Timeline>
</template>
