<script setup>
  import { computed, ref } from 'vue';

  const groups = [
    { id: 'group1' },
    { id: 'group2' },
  ];
  const markers = computed(() => {
    return [mouseHoverPosition.value ? {
      start: mouseHoverPosition.value,
      type: 'marker',
      id: 'mousehover',
    } : null].filter(Boolean);
  });

  const mouseHoverPosition = ref(null);
  function onMousemoveTimeline ({ time }) {
    mouseHoverPosition.value = time;
  }
  function onMouseleaveTimeline () {
    mouseHoverPosition.value = null;
  }
</script>

<template>
  <Timeline
    class="timeline"
    :items="items"
    :groups="groups"
    :viewportMin="1703112200000"
    :viewportMax="1714566600000"
    :markers="markers"
    @mousemoveTimeline="onMousemoveTimeline"
    @mouseleaveTimeline="onMouseleaveTimeline"
  >
    <template #marker="{item}">
      <div class="marker-content">
        {{ new Date(item.start).toLocaleString() }}
      </div>
    </template>
  </Timeline>

  {{ mouseHoverPosition ? new Date(mouseHoverPosition).toLocaleString() : 'Hover over the timeline to see the hover time' }}
</template>

<style scoped>
  :deep(.marker) {
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
