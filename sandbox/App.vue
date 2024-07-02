<template>
  <div>
    <Timeline
      class="timeline"
      :groups="groups"
      :items="items"
      :markers="markers"
      :viewportMin="757382400000"
      :viewportMax="maxDate"
      :initialViewportStart="1691089357146"
      :initialViewportEnd="1691101020000"
      @mousemoveTimeline="onMousemoveTimeline"
      @mouseleaveTimeline="onMouseleaveTimeline"
      @changeScale="onChangeScale"
      @change-viewport="onChangeViewport"
      @pointermove="debugEvent"
      @pointerdown="debugEvent"
      @pointerup="debugEvent"
      @click="debugEvent"
      @contextmenu="debugEvent"
    >
      <template #items-linechart="{ viewportStart, viewportEnd, group }">
        <LineChart
          :viewportStart="viewportStart"
          :viewportEnd="viewportEnd"
          :data="items.filter((item) => item.group === group.id)"
        />
      </template>

      <template #item="{item}">
        <div :title="'title' in item ? item.title : undefined" style="inset: 0; position: absolute;"></div>
      </template>
    </Timeline>
  </div>
  <details class="debug">
    <summary>
      Debug
    </summary>

    <div
      v-for="debugItem in Object.keys(debug)"
      :key="debugItem"
      class="pair"
    >
      <label>{{ debugItem }}</label>
      <div class="data">
        <template v-if="debugItem === 'firedEvents'">
          <div v-for="(subitem, index) in debug[debugItem].toReversed()" :key="index">
            {{ subitem }}
          </div>
        </template>
        <template v-else>
          {{ debug[debugItem] }}
        </template>
      </div>
    </div>
  </details>
</template>

<script lang="ts" setup>
  import { watch, computed, ref, reactive } from 'vue';
  import Timeline, { TimelineGroup, TimelineItem, TimelineMarker } from '../src/components/Timeline.vue';
  import LineChart from './examples/LineChart.vue';
  import { type Scale } from '../src/composables/useScale.ts';

  const debug = reactive({
    scale: undefined as Scale | undefined,
    firedEvents: [] as string[],
    viewport: {
      start: 0,
      end: 0,
    },
  });

  const maxDate = new Date().valueOf() + 1000 * 60 * 60 * 24 * 365 * 10;

  const groups = computed((): TimelineGroup[] => {
    return [
      { label: 'Points', id: 'group1' },
      { label: 'Ranges', id: 'group2' },
      { label: 'Linechart', id: 'linechart' },
      { label: 'Markers', id: 'group3' },
    ];
  });

  type customTimelineItem = TimelineItem & { value?: number };

  const items = computed((): customTimelineItem[] => {
    return [
      { group: 'group1', type: 'point', className: 'teal', start: 1691090880000, title: '21:28:00', id: 'k802b26e-c037-4c94-b70a-187479ad90d9',
      },
      { group: 'group1', type: 'point', className: 'teal', start: (new Date().valueOf() - 200000), title: '21:28:00', id: 'k802b26e-c037-4c94-b70a-187479ad90d9',
      },
      { group: 'group1', type: 'point', className: 'teal', start: (new Date().valueOf() + 40000200000), title: '21:28:00', id: 'k802b26e-c037-4c94-b70a-187479ad90d9',
      },
      { group: 'group3', type: 'marker', className: 'teal', start: 1691090970000, id: 'k80208db-54a7-4603-8850-5a6432431dcd',
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
      { group: 'group2', type: 'range', className: 'pink', start: 1691091546000, end: 1691091615000,
        cssVariables: {
          '--height': '20%',
        },
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
      {
        group: 'linechart',
        value: 1,
        type: 'point',
        start: 1691090867000,
      },
      {
        group: 'linechart',
        value: 1,
        type: 'point',
        start: 1691090985000,
      },
      {
        group: 'linechart',
        value: 0.7,
        type: 'point',
        start: 1691091720000,
      },
      {
        group: 'linechart',
        value: 0,
        type: 'point',
        start: 1691092246000,
      },
      {
        group: 'linechart',
        value: 1,
        type: 'point',
        start: 1691092544000,
      },
      {
        group: 'linechart',
        value: 0,
        type: 'point',
        start: 1691093445000,
      },
      {
        group: 'linechart',
        value: 0,
        type: 'point',
        start: 1691093875000,
      },
      {
        group: 'linechart',
        value: 0,
        type: 'point',
        start: 1691094747000,
      },
      {
        group: 'linechart',
        value: 1,
        type: 'point',
        start: 1691096029000,
      },
      {
        group: 'linechart',
        value: 0.5,
        type: 'point',
        start: 1691096492000,
      },
      {
        group: 'linechart',
        value: 1,
        type: 'point',
        start: 1691096693000,
      },
      {
        group: 'linechart',
        value: 1,
        type: 'point',
        start: 1691097441000,
      },
      {
        group: 'linechart',
        value: 0.6,
        type: 'point',
        start: 1691097646000,
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

  function debugEvent ({ time, event, item } : {time: number, event: MouseEvent, item: TimelineItem | null}) {
    debug.firedEvents.push(`${event.type} (${time}) ${item || ''}`);
  }

  const mouseHoverPosition = ref<number | null>(null);
  function onMousemoveTimeline ({ time }: { time: number }) {
    mouseHoverPosition.value = time;
    debug.firedEvents.push(`mousemoveTimeline (${time})`);
  }
  function onMouseleaveTimeline () {
    mouseHoverPosition.value = null;
    debug.firedEvents.push(`mouseleaveTimeline`);
  }
  function onChangeScale (scale: Scale) {
    debug.scale = scale;
    debug.firedEvents.push('changeScale');
  }
  function onChangeViewport (viewport: {start: number, end: number}) {
    debug.viewport = viewport;
    debug.firedEvents.push('changeViewport');
  }

  watch(() => debug.firedEvents.length, () => {
    if (debug.firedEvents.length > 100) {
      debug.firedEvents = debug.firedEvents.slice(-30);
    }
  });
</script>

<style lang="scss" scoped>
  .timeline {
    border: 1px solid color-mix(in srgb, currentcolor 10%, transparent);

    --font-family: system-ui, -apple-system, blinkmacsystemfont, "Segoe UI", roboto, oxygen, ubuntu, cantarell, "Open Sans", "Helvetica Neue", sans-serif;

    // --gridline-border-left: 1px dashed rgba(255, 255, 255, 10%);
    // --group-border-top: 1px solid rgba(255, 255, 255, 10%);
    --group-height: 1.5rem;

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
    --timestamps-background:  color-mix(in srgb, white 50%, transparent);

    // --timestamps-color: rgb(255, 112, 255);
    // --timestamp-line-height: 1.5em;
    // --timestamp-padding-block: 0.2em;
    // --timestamp-padding-inline: 0.4em;

    background-color: color-mix(in srgb, currentcolor 10%, transparent);
    border-radius: 0.5rem;

    :deep(.group-label) {
      opacity: 0.5;
    }

    :deep(.group) {
      &:hover {
        background-color:  color-mix(in srgb, white 15%, transparent);

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

      &.range {
        height: var(--height, 100%);
        bottom: 0;
        top: auto;
      }

      &:hover {
        opacity: 1;
      }
    }

    :deep(.background) {
      --item-background: color-mix(in srgb, black 10%, transparent);
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

  .debug {
    background-color: rgba(0, 0, 0, 50%);
    color: white;
    padding: 0.5rem;
    font-family: monospace;
    border-radius: 0.5rem;
    margin-top: 2rem;

    .pair {
      display: flex;
      gap: 2rem;
      margin: 1rem;
    }

    label {
      font-weight: bold;
      flex: 0 0 10rem;
      text-align: right;
    }

    .data {
      max-height: 20rem;
      overflow: auto;
      flex: 1;
    }
  }
</style>
