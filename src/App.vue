<template>
  <div>
    <Timeline
      class="timeline"
      :groups="groups"
      :items="items"
      :markers="markers"
      :viewportMin="1691089380000"
      :viewportMax="1691101020000"
      :minViewportDuration="1000 * 60"
      :maxViewportDuration="1000 * 60 * 60 * 24 * 7"
      @mousemoveTimeline="onMousemoveTimeline"
      @mouseleaveTimeline="onMouseleaveTimeline"
    >
      <template #group-label="{ group }">
        {{ group.content }}
      </template>
    </Timeline>
  </div>
</template>

<script lang="ts" setup>
  import { computed, ref } from 'vue';
  import Timeline from './components/Timeline.vue';

  const groups = computed((): TimelineGroup[] => {
    return [
    ];
  });

  const items = computed((): TimelineItem[] => {
    return [
    ];
  });

  const elapsedTime = ref(0);
  const markers = computed((): TimelineMarker[] => {
    return [{
      start: 1691094533392 + elapsedTime.value,
      type: 'marker',
      id: 'marker-1',
      className: 'blue',
    }, mouseHoverPosition.value ? {
      start: mouseHoverPosition.value,
      type: 'marker',
      id: 'mousehover',
      className: 'gray',
    } : null].filter(Boolean) as TimelineMarker[];
  });

  setInterval(() => {
    elapsedTime.value += 10;
  }, 10);

  const mouseHoverPosition = ref<number | null>(null);
  function onMousemoveTimeline ({ position }: { position: number }) {
    mouseHoverPosition.value = position;
  }
  function onMouseleaveTimeline () {
    mouseHoverPosition.value = null;
  }
</script>

<style lang="scss" scoped>
  .timeline {
    // --font-family: system-ui, -apple-system, blinkmacsystemfont, "Segoe UI", roboto, oxygen, ubuntu, cantarell, "Open Sans", "Helvetica Neue", sans-serif;
    // --gridline-border-left: 1px dashed rgba(255, 255, 255, 10%);
    // --group-border-top: 1px solid rgba(255, 255, 255, 10%);
    --group-height: 1.5em;

    // --group-padding-top: 0.5em;
    // --group-padding-bottom: 0.5em;

    // --item-marker-width: 2px;
    // --item-point-size: 1rem;
    // --item-range-border-radius: 0.5em;
    // --label-background: rgba(0, 0, 0, 100%);
    // --label-color: rgb(50, 50, 50);

    // --label-width: 5.5em;

    // --label-padding: 0.2em 0.5em;
    // --label-line-height: 1em;
    // --timestamps-background: rgba(0, 0, 0, 50%);
    // --timestamps-color: rgb(255, 112, 255);
    // --timestamp-line-height: 1.5em;
    // --timestamp-padding-block: 0.2em;
    // --timestamp-padding-inline: 0.4em;

    background-color: rgb(235, 235, 235);
    border: 1px solid rgb(180, 180, 180);
    border-radius: 0.5em;

    :deep(.group-label) {
      opacity: 0.5;
    }

    :deep(.group) {
      &:hover {
        background-color: rgba(255, 255, 255, 10%);

        .group-label {
          opacity: 1;
        }
      }
    }

    :deep(.item) {
      $colors: "blue", "red", "green", "indigo", "yellow", "orange", "teal", "purple", "pink", "gray";

      opacity: 0.7;

      @each $color in $colors {
        &.#{$color} {
          --item-background: linear-gradient(180deg, #{$color}, color-mix(in hsl, #{$color} 80%, white));
        }
      }

      &:hover {
        opacity: 1;
      }
    }

    :deep(.background) {
      --item-background: rgba(0, 0, 0, 5%);
    }

    :deep(.marker) {
      &.gray {
        --item-background: rgba(150, 150, 150, 20%);
        --item-marker-width: 2px;
      }
    }
  }
</style>
