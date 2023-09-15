<template>
  <div>
    <Timeline
      class="timeline"
      :groups="groups"
      :items="items"
      :markers="markers"
      :viewportMin="757382400000"
      :viewportMax="maxDate"
      :maxViewportDuration="1000 * 60 * 60 * 24 * 365 * 200"
      @mousemoveTimeline="onMousemoveTimeline"
      @mouseleaveTimeline="onMouseleaveTimeline"
    >
      <template #group-label="{ group }">
        {{ group.content }}
      </template>

      <template #item="{item}">
        <div
          :title="item.title || null"
          style="inset: 0; position: absolute;"
        ></div>
      </template>
    </Timeline>
  </div>
</template>

<script lang="ts" setup>
  import { computed, ref } from 'vue';
  import Timeline from './components/Timeline.vue';

  const maxDate = new Date().valueOf() + 1000 * 60 * 60 * 24 * 365 * 10;

  const groups = computed((): TimelineGroup[] => {
    return [
      { content: 'Points', id: 'group1' },
      { content: 'Ranges', id: 'group2' },
      { content: 'Markers', id: 'group3' },
    ];
  });

  const items = computed((): TimelineItem[] => {
    return [
      { group: 'group1', type: 'point', className: 'teal', start: 1691090880000, title: '21:28:00', id: 'k802b26e-c037-4c94-b70a-187479ad90d9',
      },
      { group: 'group1', type: 'point', className: 'teal', start: (new Date().valueOf() - 200000), title: '21:28:00', id: 'k802b26e-c037-4c94-b70a-187479ad90d9',
      },
      { group: 'group1', type: 'point', className: 'teal', start: (new Date().valueOf() + 40000200000), title: '21:28:00', id: 'k802b26e-c037-4c94-b70a-187479ad90d9',
      },
      { group: 'group3', type: 'marker', className: 'teal', start: 1691090970000, title: '21:29:30', id: 'k80208db-54a7-4603-8850-5a6432431dcd',
      },
      { group: 'group1', type: 'point', className: 'teal', start: 1691099529000, title: '23:52:09', id: 'k802fabb-5dc7-486a-b205-ab27fdbf35a8',
      },
      { type: 'background', start: 1691089380000, end: 1691090280000, id: 'k802c277-de01-4366-8b45-2ff3aa11b75e',
      },
      { type: 'background', start: 1691100120000, end: 1691101020000, id: 'k802b917-3b2c-48e9-9e38-ff4df8a26c19',
      },
      { type: 'background', group: 'background', start: 1691100120000, end: 1691101020000,
      },
      { group: 'group2', type: 'range', className: 'teal', start: 1691095214000, end: 1691095428000,
      },
      { group: 'group2', type: 'range', className: 'teal', start: 1691091546000, end: 1691091615000,
      },
      { group: 'group2', type: 'range', className: 'teal', start: 1691097441000, end: 1691097514000,
      },
      { group: 'group2', type: 'range', className: 'teal', start: 1691090985000, end: 1691091085000,
      },
      { group: 'group2', type: 'range', className: 'teal', start: 1691093875000, end: 1691094107000,
      },
      { group: 'group2', type: 'range', className: 'teal', start: 1691091720000, end: 1691091805000,
      },
      { group: 'group2', type: 'range', className: 'teal', start: 1691094747000, end: 1691094873000,
      },
      { group: 'group2', type: 'range', className: 'teal', start: 1691096492000, end: 1691096604000,
      },
      { group: 'group2', type: 'range', className: 'teal', start: 1691093445000, end: 1691093515000,
      },
      { group: 'group2', type: 'range', className: 'teal', start: 1691092246000, end: 1691092430000,
      },
      { group: 'group2', type: 'range', className: 'blue', start: 1691096029000, end: 1691096293000,
      },
      { group: 'group2', type: 'range', className: 'teal', start: 1691097646000, end: 1691097805000,
      },
      { group: 'group2', type: 'range', className: 'blue', start: 1691096693000, end: 1691096779000,
      },
      { group: 'group2', type: 'range', className: 'blue', start: 1691092544000, end: 1691092671000,
      },
      { group: 'group2', type: 'range', className: 'teal', start: 1691090867000, end: 1691090970000,
      },
    ];
  });

  const currentTime = ref(new Date().valueOf());
  const markers = computed((): TimelineMarker[] => {
    return [{
      start: currentTime.value,
      type: 'marker',
      id: 'marker-1',
      className: 'red',
    }, mouseHoverPosition.value ? {
      start: mouseHoverPosition.value,
      type: 'marker',
      id: 'mousehover',
      className: 'gray',
    } : null].filter(Boolean) as TimelineMarker[];
  });

  setInterval(() => {
    currentTime.value = new Date().valueOf();
  }, 40);

  const mouseHoverPosition = ref<number | null>(null);
  function onMousemoveTimeline ({ time }: { time: number }) {
    mouseHoverPosition.value = time;
  }
  function onMouseleaveTimeline () {
    mouseHoverPosition.value = null;
  }
</script>

<style>
  body {
    background-color: #fff;
  }
</style>

<style lang="scss" scoped>
  .timeline {
    border: 1px solid gray;

    --font-family: system-ui, -apple-system, blinkmacsystemfont, "Segoe UI", roboto, oxygen, ubuntu, cantarell, "Open Sans", "Helvetica Neue", sans-serif;

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
      --item-marker-width: 2px;

      &.red {
        --item-marker-width: 1px;
      }

      &.gray {
        --item-background: rgba(150, 150, 150, 20%);
        --item-marker-width: 2px;
      }
    }
  }
</style>
