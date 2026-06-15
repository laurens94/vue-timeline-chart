// @noErrors
<script setup lang="ts">
  import { computed, shallowRef } from 'vue';

  const hour = 3_600_000;

  // The same overlapping shape in two groups, so the two height behaviours can
  // be compared directly.
  function rowItems (group: string) {
    return [
      { id: `${group}-a`, group, type: 'range', start: 0, end: hour * 3, cssVariables: { '--item-background': 'var(--color-2)' } },
      { id: `${group}-b`, group, type: 'range', start: hour, end: hour * 4, cssVariables: { '--item-background': 'var(--color-4)' } },
      { id: `${group}-c`, group, type: 'range', start: hour * 2, end: hour * 5, cssVariables: { '--item-background': 'var(--color-1)' } },
      { id: `${group}-d`, group, type: 'range', start: hour * 7, end: hour * 9 },
      { id: `${group}-p1`, group, type: 'point', start: hour * 6 },
      { id: `${group}-p2`, group, type: 'point', start: hour * 6 + hour / 5 },
      { id: `${group}-p3`, group, type: 'point', start: hour * 6 + hour / 2 },
    ];
  }

  const items = [...rowItems('disabled'), ...rowItems('custom'), ...rowItems('default')];

  const groups = [
    { id: 'disabled', label: 'Stacking disabled', stacking: { enabled: false } },
    {
      id: 'custom',
      label: 'Custom, dynamic item-stack-height (fixed group height)',
      className: 'dynamic-stacking-height',
    },
    { id: 'default', label: 'Default (inherits stacking options from component)' },
  ];

  const stackingEnabled = shallowRef(true);
  const stackingStrategy = shallowRef('dataset');
  const collisionWidth = shallowRef(16);
  const maxLanes = shallowRef(5);
  const stackGapRem = shallowRef(0.25);

  const stacking = computed(() => {
    if (!stackingEnabled.value) return undefined;
    return {
      enabled: true,
      strategy: stackingStrategy.value,
      collisionWidth: collisionWidth.value,
      maxLanes: maxLanes.value,
    };
  });

  const timelineStyle = computed(() => ({
    '--item-stack-gap': `${stackGapRem.value}rem`,
  }));
</script>

<template>
  <div class="controls">
    <label class="control">
      <input v-model="stackingEnabled" type="checkbox" />
      Stacking enabled
    </label>

    <label class="control">
      <span>Strategy</span>
      <select v-model="stackingStrategy" :disabled="!stackingEnabled">
        <option value="dataset">dataset</option>
        <option value="viewport">viewport</option>
      </select>
    </label>

    <label class="control">
      <span>Collision width ({{ collisionWidth }}px)</span>
      <input
        v-model.number="collisionWidth"
        type="range"
        min="0"
        max="48"
        step="4"
        :disabled="!stackingEnabled"
      />
    </label>

    <label class="control">
      <span>Max lanes ({{ maxLanes }})</span>
      <input
        v-model.number="maxLanes"
        type="range"
        min="1"
        max="6"
        step="1"
        :disabled="!stackingEnabled"
      />
    </label>

    <label class="control">
      <span>Lane gap ({{ stackGapRem }}rem)</span>
      <input
        v-model.number="stackGapRem"
        type="range"
        min="0"
        max="1"
        step="0.05"
        :disabled="!stackingEnabled"
      />
    </label>
  </div>

  <Timeline
    :items="items"
    :groups="groups"
    :viewportMin="0"
    :viewportMax="hour * 12"
    :stacking="stacking"
    :style="timelineStyle"
  />
</template>

<style scoped>
:deep(.dynamic-stacking-height) {
  /* Set the item-stack-height on the group, so that all item heights are based on the maximum lane count. */
  --item-stack-height: calc((var(--group-items-height, 2em) - (var(--_lane-count, 1) - 1) * var(--item-stack-gap, 0.125em)) / var(--_lane-count, 1));

  .item.stacked {
    /* Set the item-stack-height on the item-level, so that it is calculated based on the number of lanes in the stack. */
    --item-stack-height: calc((var(--group-items-height, 2em) - (var(--_stack-count, 1) - 1) * var(--item-stack-gap, 0.125em)) / var(--_stack-count, 1));
  }
}
</style>
