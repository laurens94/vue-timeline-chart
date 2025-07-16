<template>
  <div>
    <Timeline
      ref="timeline"
      class="timeline"
      :groups="groups"
      :items="items"
      :markers="markers"
      :viewportMin="maxRange[0]"
      :viewportMax="maxRange[1]"
      :initialViewportStart="initialViewportRange[0]"
      :initialViewportEnd="initialViewportRange[1]"
      :minViewportDuration="minViewportDuration"
      :maxViewportDuration="maxViewportDuration"
      :weekStartsOn="0"
      @mousemoveTimeline="onMousemoveTimeline"
      @mouseleaveTimeline="onMouseleaveTimeline"
      @changeScale="onChangeScale"
      @change-viewport="onChangeViewport"
      @pointermove="debugEvent"
      @pointerdown="debugEvent"
      @pointerup="debugEvent"
      @touchmove="debugEvent"
      @touchstart="debugEvent"
      @touchend="debugEvent"
      @click="debugEvent"
      @contextmenu="debugEvent"
    >
      <template #item="{item}">
        <div :title="'title' in item ? item.title : undefined" style="inset: 0; position: absolute;"></div>
      </template>
    </Timeline>
  </div>
  <details open>
    <summary>
      Controls
    </summary>
    <div class="flex">
      <button @click="timeline.setViewport(debug.viewport.start - viewportSize * 0.2, debug.viewport.end - viewportSize * 0.2)">
        Move left
      </button>
      <button @click="timeline.setViewport(debug.viewport.start + viewportSize * 0.2, debug.viewport.end + viewportSize * 0.2)">
        Move right
      </button>
      <button @click="timeline.setViewport(debug.viewport.start - viewportSize * 0.2, debug.viewport.end + viewportSize * 0.2)">
        Zoom out
      </button>
      <button @click="timeline.setViewport(debug.viewport.start + viewportSize * 0.2, debug.viewport.end - viewportSize * 0.2)">
        Zoom in
      </button>
      <button @click="timeline.setViewport(initialViewportRange[0], initialViewportRange[1])">
        Reset viewport
      </button>
      <button @click="timeline.setViewport(maxRange[0], maxRange[1])">
        Set viewport to max range
      </button>
    </div>
  </details>

  <details open>
    <summary>
      Props
    </summary>
    <div class="flex">
      <label>initialViewportStart</label>
      <input v-model="initialViewportRange[0]" type="number"/>
    </div>
    <div class="flex">
      <label>initialViewportEnd</label>
      <input v-model="initialViewportRange[1]" type="number"/>
    </div>
    <div class="flex">
      <label>viewportMin</label>
      <input v-model="maxRange[0]" type="number"/>
    </div>
    <div class="flex">
      <label>viewportMax</label>
      <input v-model="maxRange[1]" type="number"/>
    </div>
    <div class="flex">
      <label>minViewportDuration</label>
      <input v-model="minViewportDuration" type="number"/>
    </div>
    <div class="flex">
      <label>maxViewportDuration</label>
      <input v-model="maxViewportDuration" type="number"/>
    </div>
  </details>
  <details open>
    <summary>
      Debug
    </summary>

    <div
      v-for="debugItem in Object.keys(debug)"
      :key="debugItem"
      class="flex"
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
  import { computed, reactive, ref, watch } from 'vue';
  import Timeline from '../src/components/Timeline.vue';
  import type { TimelineGroup, TimelineItem, TimelineMarker } from '../src/index.js';
  import { type Scale } from '../src/composables/useScale';

  const debug = reactive({
    scale: undefined as Scale | undefined,
    viewport: {
      start: 0,
      end: 0,
    },
    firedEvents: [] as string[],
  });

  const viewportSize = computed(() => debug.viewport.end - debug.viewport.start);

  const timeline = ref();

  const maxRange = ref([-500000000000000, 100000000000000]);
  const initialViewportRange = ref([1691089357146, 1691101020000]);
  const minViewportDuration = ref(10000);
  const maxViewportDuration = ref(10000000000000);

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
    {
      group: 'group2',
      type: 'range',
      start: 1691091546000,
      end: 1691091615000,
      cssVariables: { '--height': '1rem', '--item-background': 'var(--color-2)' },
    },
    {
      group: 'group2',
      type: 'range',
      start: 1691091546000,
      end: 1691091895000,
      cssVariables: { '--height': '20%', '--item-background': 'var(--color-1)' },
    },
    { group: 'group2', type: 'range', start: 1691097441000, end: 1691097514000 },
    { group: 'group2', type: 'range', start: 1691090985000, end: 1691091085000 },
    { group: 'group2', type: 'range', start: 1691093875000, end: 1691094107000 },
    { group: 'group2', type: 'range', start: 1691091720000, end: 1691091805000, cssVariables: { '--height': '20px' } },
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

  function debugEvent ({ time, event, item } : {time?: number, event: MouseEvent | TouchEvent, item?: TimelineItem | null}) {
    debug.firedEvents.push(`${event.type} (${time ?? '-'}) ${item || ''}`);
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
  --font-family: system-ui, -apple-system, blinkmacsystemfont, "Segoe UI", roboto, oxygen, ubuntu, cantarell, "Open Sans", "Helvetica Neue", sans-serif;

  border: 1px solid color-mix(in srgb, currentcolor 10%, transparent);
  touch-action: none;

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

details {
  background-color: rgba(0, 0, 0, 50%);
  color: white;
  padding: 0.5rem;
  font-family: monospace;
  border-radius: 0.5rem;
  margin-top: 2rem;

  .flex {
    display: flex;
    gap: 1rem .5rem;
    margin: 1rem;
    flex-wrap: wrap;
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
