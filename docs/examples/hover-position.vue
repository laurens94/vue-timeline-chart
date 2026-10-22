// @noErrors
<script setup>
  import { computed, shallowRef } from 'vue';

  const groups = [
    { id: 'group1', label: 'Group 1' },
    { id: 'group2', label: 'Group 2' },
  ];
  const markers = computed(() => {
    return [mouseHoverPosition.value ? {
      start: mouseHoverPosition.value,
      type: 'marker',
      id: 'mousehover',
    } : null].filter(Boolean);
  });

  const mouseHoverPosition = shallowRef(null);
  const mouseHoverGroup = shallowRef(null);
  function onMousemoveTimeline ({ time, group }) {
    mouseHoverPosition.value = time;
    mouseHoverGroup.value = group;
  }
  function onMouseleaveTimeline () {
    mouseHoverPosition.value = null;
    mouseHoverGroup.value = null;
  }
</script>

<template>
  <Timeline
    class="timeline"
    :groups="groups"
    :viewportMin="1703112200000"
    :viewportMax="1714566600000"
    :markers="markers"
    @mousemoveTimeline="onMousemoveTimeline"
    @mouseleaveTimeline="onMouseleaveTimeline"
    @touchmove="onMousemoveTimeline"
  >
    <template #marker="{item}">
      <div class="marker-content">
        {{ new Date(item.start).toLocaleString() }}
      </div>
    </template>
  </Timeline>

  {{ mouseHoverPosition ? new Date(mouseHoverPosition).toLocaleString() : 'Hover over the timeline to see the hover time' }}
  {{ mouseHoverGroup ? `(${mouseHoverGroup.label})` : '' }}
</template>

<style scoped>
  .timeline:deep(.marker) {
    contain: unset;
    display: flex;
  }

  .marker-content {
    font-size: small;
    align-self: end;
    text-wrap: nowrap;
    padding: 0 4px;
    opacity: 0.5;
  }
</style>
