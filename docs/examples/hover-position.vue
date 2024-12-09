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
    debug.firedEvents.push(`mousemoveTimeline (${time})`);
  }
  function onMouseleaveTimeline () {
    mouseHoverPosition.value = null;
    debug.firedEvents.push(`mouseleaveTimeline`);
  }
</script>


<template>
  <Timeline
    :items="items"
    :groups="groups"
    :viewportMin="1703112200000"
    :viewportMax="1714566600000"
    :markers="markers"
    @mousemoveTimeline="onMousemoveTimeline"
    @mouseleaveTimeline="onMouseleaveTimeline"
  />

  {{ mouseHoverPosition ? new Date(mouseHoverPosition).toLocaleString() : 'Hover over the timeline to see the hover time' }}
</template>
