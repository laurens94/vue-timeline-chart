<template>
  <div class="sandbox">
    <header class="sandbox-header">
      <div>
        <h1 class="sandbox-title">Timeline sandbox</h1>
        <p class="sandbox-subtitle">
          Interactive playground for props, stacking, and viewport controls.
        </p>
      </div>
      <div class="viewport-readout" aria-live="polite">
        <span class="readout-label">Viewport</span>
        <code>{{ formatTs(debug.viewport.start) }}</code>
        <span class="readout-sep">→</span>
        <code>{{ formatTs(debug.viewport.end) }}</code>
        <span v-if="debug.scale" class="readout-scale">
          · {{ debug.scale.unit }} / {{ debug.scale.step }}
        </span>
      </div>
    </header>

    <main class="sandbox-main">
      <div class="timeline-column">
        <section class="timeline-panel">
          <Timeline
            ref="timeline"
            class="timeline"
            :groups="groups"
            :items="displayItems"
            :markers="displayMarkers"
            :viewportMin="maxRange[0]"
            :viewportMax="maxRange[1]"
            :initialViewportStart="initialViewportRange[0]"
            :initialViewportEnd="initialViewportRange[1]"
            :minViewportDuration="minViewportDuration"
            :maxViewportDuration="maxViewportDuration"
            :weekStartsOn="weekStartsOn"
            :fixedLabels="fixedLabels"
            :activeItems="activeItemIds"
            :stacking="stackingOptions"
            @mousemoveTimeline="onMousemoveTimeline"
            @mouseleaveTimeline="onMouseleaveTimeline"
            @changeScale="onChangeScale"
            @change-viewport="onChangeViewport"
            @changeStacking="onChangeStacking"
            @pointermove="onTimelineEvent"
            @pointerdown="onTimelineEvent"
            @pointerup="onTimelineEvent"
            @touchmove="onTimelineEvent"
            @touchstart="onTimelineEvent"
            @touchend="onTimelineEvent"
            @click="onTimelineEvent"
            @contextmenu="onTimelineEvent"
            @wheel="onWheel"
          >
            <template #item="{ item }">
              <div
                :title="'title' in item ? item.title : undefined"
                class="item-hit"
              />
            </template>
          </Timeline>
        </section>

        <details v-if="logEvents" class="event-log" open>
          <summary>Event log ({{ debug.firedEvents.length }})</summary>
          <ol class="event-list">
            <li v-for="(entry, index) in debug.firedEvents.toReversed()" :key="index">
              {{ entry }}
            </li>
          </ol>
        </details>
      </div>

      <aside class="controls-panel">
        <fieldset class="control-group">
          <legend>Features</legend>
          <label class="toggle">
            <input v-model="stackingEnabled" type="checkbox" />
            <span>Vertical stacking</span>
          </label>
          <label v-if="stackingEnabled" class="field">
            <span>Strategy</span>
            <select v-model="stackingStrategy">
              <option value="dataset">dataset (stable height)</option>
              <option value="viewport">viewport (compact)</option>
            </select>
          </label>
          <label v-if="stackingEnabled" class="field">
            <span>Collision width (px)</span>
            <input
              v-model.number="stackingCollisionWidth"
              type="range"
              min="0"
              max="48"
              step="4"
            />
            <output>{{ stackingCollisionWidth }}</output>
          </label>
          <label class="toggle">
            <input v-model="overlapDemo" type="checkbox" />
            <span>Overlapping ranges (group 2)</span>
          </label>
          <label class="toggle">
            <input v-model="fixedLabels" type="checkbox" />
            <span>Fixed group labels</span>
          </label>
          <label class="toggle">
            <input v-model="showNowMarker" type="checkbox" />
            <span>“Now” marker</span>
          </label>
          <label class="toggle">
            <input v-model="showHoverMarker" type="checkbox" />
            <span>Hover marker</span>
          </label>
          <label class="toggle">
            <input v-model="highlightActive" type="checkbox" />
            <span>Highlight range-1</span>
          </label>
          <label class="toggle">
            <input v-model="heavyLoad" type="checkbox" />
            <span>Stress test (4000 points)</span>
          </label>
          <label class="field">
            <span>Week starts on</span>
            <select v-model.number="weekStartsOn">
              <option :value="0">Sunday</option>
              <option :value="1">Monday</option>
            </select>
          </label>
        </fieldset>

        <fieldset class="control-group">
          <legend>Viewport</legend>
          <div class="button-row">
            <button type="button" @click="panViewport(-0.2)">← Pan</button>
            <button type="button" @click="panViewport(0.2)">Pan →</button>
          </div>
          <div class="button-row">
            <button type="button" @click="zoomViewport(1.25)">Zoom in</button>
            <button type="button" @click="zoomViewport(0.8)">Zoom out</button>
          </div>
          <div class="button-row">
            <button type="button" @click="resetViewport">Reset</button>
            <button type="button" @click="fitMaxRange">Fit all</button>
          </div>
        </fieldset>

        <fieldset class="control-group control-group--collapsed">
          <legend>Advanced props</legend>
          <label class="field">
            <span>initial start</span>
            <input v-model.number="initialViewportRange[0]" type="number" />
          </label>
          <label class="field">
            <span>initial end</span>
            <input v-model.number="initialViewportRange[1]" type="number" />
          </label>
          <label class="field">
            <span>viewport min</span>
            <input v-model.number="maxRange[0]" type="number" />
          </label>
          <label class="field">
            <span>viewport max</span>
            <input v-model.number="maxRange[1]" type="number" />
          </label>
          <label class="field">
            <span>min duration</span>
            <input v-model.number="minViewportDuration" type="number" />
          </label>
          <label class="field">
            <span>max duration</span>
            <input v-model.number="maxViewportDuration" type="number" />
          </label>
        </fieldset>

        <fieldset class="control-group">
          <legend>Debug</legend>
          <label class="toggle">
            <input v-model="logEvents" type="checkbox" />
            <span>Log events</span>
          </label>
          <button
            v-if="logEvents && debug.firedEvents.length"
            type="button"
            class="clear-log"
            @click="debug.firedEvents = []"
          >
            Clear log
          </button>
        </fieldset>
      </aside>
    </main>
  </div>
</template>

<script lang="ts" setup>
  import { watch, computed, ref, reactive, useTemplateRef, shallowRef } from 'vue';
  import Timeline from '../src/components/Timeline.vue';
  import type {
    TimelineGroup,
    TimelineItem,
    TimelineMarker,
    TimelineScale,
    TimelineStackingOptions,
  } from '../src/types/timeline.ts';

  const debug = reactive({
    scale: undefined as TimelineScale | undefined,
    viewport: { start: 0, end: 0 },
    firedEvents: [] as string[],
  });

  const timeline = useTemplateRef('timeline');

  const maxRange = ref([-500_000_000_000_000, 100_000_000_000_000]);
  const initialViewportRange = ref([1_691_089_357_146, 1_691_101_020_000]);
  const minViewportDuration = shallowRef(10_000);
  const maxViewportDuration = shallowRef(10_000_000_000_000);

  const stackingEnabled = shallowRef(true);
  const stackingStrategy = shallowRef<TimelineStackingOptions['strategy']>('dataset');
  const stackingCollisionWidth = shallowRef(16);
  const overlapDemo = shallowRef(true);
  const fixedLabels = shallowRef(false);
  const showNowMarker = shallowRef(true);
  const showHoverMarker = shallowRef(true);
  const highlightActive = shallowRef(false);
  const heavyLoad = shallowRef(false);
  const logEvents = shallowRef(false);
  const weekStartsOn = shallowRef<0 | 1>(0);

  const stackingOptions = computed((): TimelineStackingOptions | undefined => {
    if (!stackingEnabled.value) return undefined;
    return {
      enabled: true,
      strategy: stackingStrategy.value,
      collisionWidth: stackingCollisionWidth.value,
    };
  });

  const activeItemIds = computed(() =>
    highlightActive.value ? ['range-1'] : [],
  );

  const groups = computed((): TimelineGroup[] => [
    { label: 'Points', id: 'group1' },
    { label: 'Ranges', id: 'group2', cssVariables: { '--item-stack-height': 'calc((var(--group-items-height, 2em) - (var(--_lane-count, 1) - 1) * var(--item-stack-gap, 0.125em)) / var(--_lane-count, 1))' } },
    { label: 'Markers', id: 'group3' },
  ]);

  const baseItems = computed((): TimelineItem[] => [
    { id: 'marker-item-1', group: 'group3', type: 'marker', start: 1_691_090_970_000 },
    { id: 'point-1', group: 'group1', type: 'point', start: 1_691_090_880_000, title: '21:28:00' },
    { id: 'point-2', group: 'group1', type: 'point', start: Date.now() - 200_000, title: 'Recent' },
    { id: 'point-3', group: 'group1', type: 'point', start: Date.now() + 40_000_200_000, title: 'Far future' },
    { id: 'point-4', group: 'group1', type: 'point', start: 1_691_099_529_000, title: '23:52:09' },
    { id: 'background-1', type: 'background', start: 1_691_095_000_000, end: 1_691_096_000_000 },
    { id: 'background-2', type: 'background', group: 'background', start: 1_691_100_120_000, end: 1_691_101_020_000 },
    { id: 'range-1', group: 'group2', type: 'range', start: 1_691_095_214_000, end: 1_691_095_428_000 },
    { id: 'range-2', group: 'group2', type: 'range', start: 1_691_091_546_000, end: 1_691_091_615_000, cssVariables: { '--item-background': 'var(--color-2)' } },
    { id: 'range-3', group: 'group2', type: 'range', start: 1_691_097_441_000, end: 1_691_097_514_000 },
    { id: 'range-4', group: 'group2', type: 'range', start: 1_691_090_985_000, end: 1_691_091_085_000 },
    { id: 'range-5', group: 'group2', type: 'range', start: 1_691_093_875_000, end: 1_691_094_107_000 },
    { id: 'range-6', group: 'group2', type: 'range', start: 1_691_091_720_000, end: 1_691_091_805_000 },
    { id: 'range-7', group: 'group2', type: 'range', start: 1_691_096_492_000, end: 1_691_096_604_000 },
    { id: 'range-8', group: 'group2', type: 'range', start: 1_691_093_445_000, end: 1_691_093_515_000 },
    { id: 'range-9', group: 'group2', type: 'range', start: 1_691_092_246_000, end: 1_691_092_430_000 },
    { id: 'range-10', group: 'group2', type: 'range', cssVariables: { '--item-background': 'var(--color-1)' }, start: 1_691_096_029_000, end: 1_691_096_293_000 },
    { id: 'range-11', group: 'group2', type: 'range', start: 1_691_097_646_000, end: 1_691_097_805_000 },
    { id: 'range-12', group: 'group2', type: 'range', cssVariables: { '--item-background': 'var(--color-1)' }, start: 1_691_096_693_000, end: 1_691_096_779_000 },
    { id: 'range-13', group: 'group2', type: 'range', cssVariables: { '--item-background': 'var(--color-1)' }, start: 1_691_092_544_000, end: 1_691_092_671_000 },
    { id: 'range-14', group: 'group2', type: 'range', start: 1_691_090_867_000, end: 1_691_090_970_000 },
  ]);

  /** Extra ranges that overlap range-4 to demo stacking. */
  const overlapItems = computed((): TimelineItem[] => {
    if (!overlapDemo.value) return [];
    const base = 1_691_090_985_000;
    const span = 1_691_091_085_000 - base;
    return [
      { id: 'overlap-a', group: 'group2', type: 'range', start: base + span * 0.1, end: base + span * 0.7, cssVariables: { '--item-background': 'var(--color-4)' } },
      { id: 'overlap-b', group: 'group2', type: 'range', start: base + span * 0.25, end: base + span * 0.85, cssVariables: { '--item-background': 'var(--color-2)' } },
      { id: 'overlap-c', group: 'group2', type: 'range', start: base + span * 0.5, end: base + span * 0.95, cssVariables: { '--item-background': 'var(--color-1)' } },
    ];
  });

  const stressItems = computed((): TimelineItem[] => {
    if (!heavyLoad.value) return [];
    const [start, end] = initialViewportRange.value;
    const items: TimelineItem[] = [];
    for (let i = 0; i < 4000; i++) {
      items.push({
        id: `stress-${i}`,
        group: 'group1',
        type: 'point',
        start: start + Math.floor(Math.random() * (end - start)),
      });
    }
    return items;
  });

  const displayItems = computed((): TimelineItem[] => [
    ...baseItems.value,
    ...overlapItems.value,
    ...stressItems.value,
  ]);

  const currentTime = shallowRef(Date.now());
  const mouseHoverPosition = shallowRef<number | null>(null);

  const displayMarkers = computed((): TimelineMarker[] => {
    const list: TimelineMarker[] = [];
    if (showNowMarker.value) {
      list.push({
        start: currentTime.value,
        type: 'marker',
        id: 'now',
        className: 'now',
      });
    }
    if (showHoverMarker.value && mouseHoverPosition.value != null) {
      list.push({
        start: mouseHoverPosition.value,
        type: 'marker',
        id: 'hover',
        className: 'hover',
      });
    }
    return list;
  });

  setInterval(() => {
    currentTime.value = Date.now();
  }, 40);

  function formatTs(ts: number) {
    if (!ts) return '—';
    return new Date(ts).toLocaleString();
  }

  function logEvent(message: string) {
    if (!logEvents.value) return;
    debug.firedEvents.push(message);
  }

  function onTimelineEvent({ time, event, item }: { time?: number; event: MouseEvent | TouchEvent; item?: TimelineItem | null }) {
    logEvent(`${event.type} (${time ?? '—'}) ${item?.id ?? ''}`);
  }

  function onWheel(event: WheelEvent) {
    logEvent(`wheel (Δy: ${event.deltaY}, Δx: ${event.deltaX})`);
  }

  function onMousemoveTimeline({ time }: { time: number }) {
    mouseHoverPosition.value = time;
    logEvent(`mousemoveTimeline (${time})`);
    document.body.classList.add('disable-overscroll-behavior-x');
  }

  function onMouseleaveTimeline() {
    mouseHoverPosition.value = null;
    logEvent('mouseleaveTimeline');
    document.body.classList.remove('disable-overscroll-behavior-x');
  }

  function onChangeScale(scale: TimelineScale) {
    debug.scale = scale;
    logEvent('changeScale');
  }

  function onChangeViewport(viewport: { start: number; end: number }) {
    debug.viewport = viewport;
    logEvent('changeViewport');
  }

  function onChangeStacking(value: Record<string, { laneCount: number }>) {
    const counts = Object.entries(value).map(([id, { laneCount }]) => `${id}: ${laneCount}`).join(', ');
    logEvent(`changeStacking (${counts})`);
  }

  const viewportSize = computed(() => debug.viewport.end - debug.viewport.start);

  function panViewport(fraction: number) {
    const el = timeline.value;
    if (!el || !viewportSize.value) return;
    const delta = viewportSize.value * fraction;
    el.setViewport(debug.viewport.start + delta, debug.viewport.end + delta);
  }

  function zoomViewport(factor: number) {
    const el = timeline.value;
    if (!el || !viewportSize.value) return;
    const center = (debug.viewport.start + debug.viewport.end) / 2;
    const half = (viewportSize.value / 2) * factor;
    el.setViewport(center - half, center + half);
  }

  function resetViewport() {
    timeline.value?.setViewport(initialViewportRange.value[0], initialViewportRange.value[1]);
  }

  function fitMaxRange() {
    timeline.value?.setViewport(maxRange.value[0], maxRange.value[1]);
  }

  watch(() => debug.firedEvents.length, () => {
    if (debug.firedEvents.length > 100) {
      debug.firedEvents = debug.firedEvents.slice(-50);
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

    --sandbox-bg: #0f1117;
    --sandbox-surface: #1a1d27;
    --sandbox-border: rgb(255 255 255 / 8%);
    --sandbox-text: #e8eaef;
    --sandbox-muted: #9aa3b2;
    --sandbox-accent: #3a86ff;
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    min-height: 100vh;
    background: var(--sandbox-bg);
    color: var(--sandbox-text);
    font-family: system-ui, -apple-system, blinkmacsystemfont, "Segoe UI", roboto, sans-serif;
    line-height: 1.5;
  }

  body.disable-overscroll-behavior-x {
    overscroll-behavior-x: none; /* Prevents history navigation when scrolling the timeline */
  }
</style>

<style scoped>
  .sandbox {
    max-width: 90rem;
    margin: 0 auto;
    padding: 1.5rem;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .sandbox-header {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    justify-content: space-between;
    gap: 1rem;
  }

  .sandbox-title {
    margin: 0;
    font-size: 1.375rem;
    font-weight: 600;
    letter-spacing: -0.02em;
  }

  .sandbox-subtitle {
    margin: 0.25rem 0 0;
    font-size: 0.875rem;
    color: var(--sandbox-muted);
  }

  .viewport-readout {
    font-size: 0.75rem;
    color: var(--sandbox-muted);
    background: var(--sandbox-surface);
    border: 1px solid var(--sandbox-border);
    border-radius: 0.5rem;
    padding: 0.5rem 0.75rem;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.35rem 0.5rem;
  }

  .readout-label {
    font-weight: 600;
    color: var(--sandbox-text);
    margin-right: 0.25rem;
  }

  .readout-sep {
    opacity: 0.5;
  }

  .readout-scale {
    color: var(--sandbox-accent);
  }

  code {
    font-family: ui-monospace, "Cascadia Code", monospace;
    font-size: 0.7rem;
  }

  .sandbox-main {
    display: grid;
    grid-template-columns: 1fr min(18rem, 100%);
    gap: 1.25rem;
    align-items: start;
  }

  @media (width <= 56rem) {
    .sandbox-main {
      grid-template-columns: 1fr;
    }
  }

  .timeline-column {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    min-width: 0;
  }

  .timeline-panel {
    background: var(--sandbox-surface);
    border: 1px solid var(--sandbox-border);
    border-radius: 0.75rem;
    padding: 0.75rem;
    min-height: 16rem;
  }

  .timeline {
    --font-family: inherit;

    border-radius: 0.5rem;
    touch-action: none;
    min-height: 14rem;
  }

  .timeline:deep(.group-label) {
    opacity: 0.55;
    transition: opacity 0.15s ease;
  }

  .timeline:deep(.group:hover) {
    background-color: rgb(255 255 255 / 4%);
  }

  .timeline:deep(.group:hover .group-label) {
    opacity: 1;
  }

  .timeline:deep(.item) {
    opacity: 0.75;
    transition: opacity 0.15s ease;
  }

  .timeline:deep(.item.stacked) {
    --item-stack-height: calc((var(--group-items-height, 2em) - (var(--_stack-count, 1) - 1) * var(--item-stack-gap, 0.125em)) / var(--_stack-count, 1));
  }

  .timeline:deep(.item:hover) {
    opacity: 1;
  }

  .timeline:deep(.background) {
    --item-background: rgb(255 255 255 / 6%);
  }

  .timeline:deep(.marker.now) {
    --item-marker-width: 0.125rem;
    --item-background: var(--color-4);
  }

  .timeline:deep(.marker.hover) {
    --item-background: rgb(150 150 150 / 25%);
    --item-marker-width: 0.125rem;
  }

  .item-hit {
    position: absolute;
    inset: 0;
  }

  .controls-panel {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .control-group {
    margin: 0;
    padding: 0.75rem;
    border: 1px solid var(--sandbox-border);
    border-radius: 0.75rem;
    background: var(--sandbox-surface);
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
  }

  .control-group legend {
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--sandbox-muted);
    padding: 0 0.25rem;
  }

  .control-group--collapsed {
    font-size: 0.8125rem;
  }

  .toggle {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    font-size: 0.875rem;
  }

  .toggle input {
    accent-color: var(--sandbox-accent);
    width: 1rem;
    height: 1rem;
  }

  .field {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 0.35rem 0.5rem;
    align-items: center;
    font-size: 0.8125rem;
  }

  .field span:first-child {
    grid-column: 1 / -1;
    color: var(--sandbox-muted);
    font-size: 0.75rem;
  }

  .field input[type="number"],
  .field select {
    grid-column: 1 / -1;
    width: 100%;
    padding: 0.35rem 0.5rem;
    border-radius: 0.375rem;
    border: 1px solid var(--sandbox-border);
    background: var(--sandbox-bg);
    color: inherit;
    font: inherit;
  }

  .field input[type="range"] {
    grid-column: 1;
  }

  .field output {
    font-variant-numeric: tabular-nums;
    color: var(--sandbox-muted);
    font-size: 0.75rem;
  }

  .button-row {
    display: flex;
    gap: 0.5rem;
  }

  .button-row button,
  .clear-log {
    flex: 1;
    padding: 0.4rem 0.6rem;
    font-size: 0.8125rem;
    border-radius: 0.375rem;
    border: 1px solid var(--sandbox-border);
    background: var(--sandbox-bg);
    color: inherit;
    cursor: pointer;
    transition: background 0.15s ease, border-color 0.15s ease;
  }

  .button-row button:hover,
  .clear-log:hover {
    background: rgb(255 255 255 / 6%);
    border-color: rgb(255 255 255 / 15%);
  }

  .clear-log {
    flex: unset;
    width: 100%;
  }

  .event-log {
    background: var(--sandbox-surface);
    border: 1px solid var(--sandbox-border);
    border-radius: 0.75rem;
    padding: 0.75rem 1rem;
    font-size: 0.75rem;
  }

  .event-log summary {
    cursor: pointer;
    font-weight: 600;
    color: var(--sandbox-muted);
  }

  .event-list {
    margin: 0.75rem 0 0;
    padding-left: 1.25rem;
    max-height: 12rem;
    overflow: auto;
    font-family: ui-monospace, monospace;
    color: var(--sandbox-muted);
  }

  .event-list li {
    margin-bottom: 0.2rem;
  }
</style>
