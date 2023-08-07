<template>
  <div>
    <Timeline
      :groups="groups"
      :items="items"
      :viewportMin="1691089380"
      :viewportMax="1691101020"
      :minViewportDuration="60"
      :maxViewportDuration="60 * 60 * 24 * 7"
    />
  </div>
</template>

<script lang="ts" setup>
  import { computed } from 'vue';
  import Timeline from './components/Timeline.vue';

  const groups = computed((): TimelineGroup[] => {
    return [
    ];
  });

  const items = computed((): TimelineItem[] => {
    return [
    ];
  });

</script>
