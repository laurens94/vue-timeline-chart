<template>
  <div>
    <Timeline
      class="timeline"
      :groups="groups"
      :items="items"
      :markers="markers"
      :viewportMin="minDate"
      :viewportMax="maxDate"
      :initialViewportStart="1691089357146"
      :initialViewportEnd="1691101020000"
      :weekStartsOn="0"
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
      <template #item="{item}">
        <div :title="'title' in item ? item.title : undefined" style="inset: 0; position: absolute;"></div>
      </template>
      <template #marker="{item}">
        <div class="marker-content">
          {{ item }}
        </div>
      </template>
    </Timeline>
  </div>
  <details class="debug" open>
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
          {{ debug[debugItem as keyof typeof debug] }}
        </template>
      </div>
    </div>
  </details>
</template>

<script lang="ts" setup>
  import { watch, computed, ref, reactive } from 'vue';
  import Timeline from '../src/components/Timeline.vue';
  import type { TimelineGroup, TimelineItem, TimelineMarker } from '../src/types/timeline';
  import { type Scale } from '../src/composables/useScale';

  const debug = reactive({
    scale: undefined as Scale | undefined,
    firedEvents: [] as string[],
    viewport: {
      start: 0,
      end: 0,
    },
  });

  const minDate = -500000000000000;
  const maxDate = 100000000000000;

  const groups = computed((): TimelineGroup[] => {
    return [
      { label: 'Points', id: 'group1' },
      { label: 'Ranges', id: 'group2', cssVariables: { '--height': '50%' } },
      { label: 'Markers', id: 'group3' },
    ];
  });

  type customTimelineItem = TimelineItem & { value?: number };

  // TEST PERFORMANCE:
  // const items = computed((): customTimelineItem[] => {
  //   const items = [];
  //   for (let i = 0; i < 4000; i++) {
  //     items.push({
  //       group: 'group1',
  //       type: 'point',
  //       start: 1691089357146 + Math.floor(Math.random() * (1691101020000 - 1691089357146)),
  //     });
  //   }
  //   return items;
  // });

  const items = computed((): customTimelineItem[] => ([
    { group: 'group1', type: 'point', start: 1691090880000, title: '21:28:00' },
    { group: 'group1', type: 'point', start: (new Date().valueOf() - 200000), title: '21:28:00' },
    { group: 'group1', type: 'point', start: (new Date().valueOf() + 40000200000), title: '21:28:00' },
    { group: 'group3', type: 'marker', start: 1691090970000 },
    { group: 'group1', type: 'point', start: 1691099529000, title: '23:52:09' },
    { type: 'background', start: 1691095000000, end: 1691096000000 },
    { type: 'background', group: 'background', start: 1691100120000, end: 1691101020000 },
    { group: 'group2', type: 'range', start: 1691095214000, end: 1691095428000 },
    { group: 'group2', type: 'range', start: 1691091546000, end: 1691091615000, cssVariables: { '--height': '50%', '--item-background': 'var(--color-2)' } },
    { group: 'group2', type: 'range', start: 1691097441000, end: 1691097514000 },
    { group: 'group2', type: 'range', start: 1691090985000, end: 1691091085000 },
    { group: 'group2', type: 'range', start: 1691093875000, end: 1691094107000 },
    { group: 'group2', type: 'range', start: 1691091720000, end: 1691091805000 },
    { group: 'group2', type: 'range', start: 1691094747000, end: 1691094873000 },
    { group: 'group2', type: 'range', start: 1691096492000, end: 1691096604000 },
    { group: 'group2', type: 'range', start: 1691093445000, end: 1691093515000 },
    { group: 'group2', type: 'range', start: 1691092246000, end: 1691092430000 },
    { group: 'group2', type: 'range', cssVariables: { '--item-background': 'var(--color-1)' }, start: 1691096029000, end: 1691096293000 },
    { group: 'group2', type: 'range', start: 1691097646000, end: 1691097805000 },
    { group: 'group2', type: 'range', cssVariables: { '--item-background': 'var(--color-1)' }, start: 1691096693000, end: 1691096779000 },
    { group: 'group2', type: 'range', cssVariables: { '--item-background': 'var(--color-1)' }, start: 1691092544000, end: 1691092671000 },
    { group: 'group2', type: 'range', start: 1691090867000, end: 1691090970000 },
  ]));

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

<style>
  :root {
    --color-1: #8338ec;
    --color-2: #ffbe0b;
    --color-3: #3a86ff;
    --color-4: #ff006e;
    --item-background: var(--color-3);
  }
</style>

<style lang="scss" scoped>
  .timeline {
    border: 1px solid color-mix(in srgb, currentcolor 10%, transparent);

    --font-family: system-ui, -apple-system, blinkmacsystemfont, "Segoe UI", roboto, oxygen, ubuntu, cantarell, "Open Sans", "Helvetica Neue", sans-serif;

    // --gridline-border-left: 1px dashed rgba(255, 255, 255, 10%);
    // --group-border-top: 1px solid rgba(255, 255, 255, 10%);
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
    // --timestamps-background:  color-mix(in srgb, white 50%, transparent);

    // --timestamps-color: rgb(255, 112, 255);
    // --timestamp-line-height: 1.5em;
    // --timestamp-padding-block: 0.2em;
    // --timestamp-padding-inline: 0.4em;

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
      opacity: 0.7;

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
        --item-background: var(--color-4);
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
