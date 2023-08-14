<template>
  <div class="timeline-wrapper">
    <div
      ref="timelineEl"
      class="timeline"
      @wheel="onWheel"
      @click="onClick"
      @contextmenu.prevent="onContextMenu"
      @mousemove="onMouseMove"
      @mouseleave="onMouseLeave"
    >
      <div class="timestamps">
        <div
          v-for="timestamp in visibleTimestamps"
          :key="timestamp"
          :class="['timestamp', timestampClassNames(timestamp)]"
          :style="{ left: `${getLeftPos(timestamp)}px` }"
        >
          <slot name="timestamp" :timestamp="timestamp">
            {{ renderTimestampLabel(timestamp) }}
          </slot>
        </div>

        <div
          v-for="(item) in visibleMarkers.filter((i) => i.group === '_timestamps').sort((a, b) => a.start - b.start)"
          :key="item.id || `${item.start}${item.type}`"
          :style="{ left: `${getLeftPos(item.start)}px` }"
          :class="[item.type, item.className]"
        >
        </div>
      </div>

      <div class="groups">
        <div
          v-for="group in groups"
          :key="group.id"
          class="group"
        >
          <div :class="['group-label', { fixed: fixedLabels }]">
            <slot name="group-label" :group="group">
              {{ group.content }}
            </slot>
          </div>

          <div class="group-items">
            <div
              v-for="(item, index) in visibleItems.filter((i) => i.group === group.id && i.type != 'background').sort((a, b) => a.start - b.start)"
              :key="index"
              :style="{ left: `${getLeftPos(item.start)}px`, width: item.type !== 'point' ? `${getItemWidth(item.start, item.end)}px` : null }"
              :class="['item', item.type, item.className, {active: activeItems.includes(item.id)}]"
              @click.stop="onClick($event, item)"
              @contextmenu.prevent.stop="onContextMenu($event, item)"
            >
              <slot name="item" :item="item"></slot>
            </div>
          </div>
          <div
            v-for="(item) in visibleItems.filter((i) => i.group === group.id && i.type === 'background').sort((a, b) => a.start - b.start)"
            :key="item.id || `${item.start}${item.type}${item.end || ''}`"
            :style="{ left: `${getLeftPos(item.start)}px`, width: `${getItemWidth(item.start, item.end)}px` }"
            :class="[item.type, item.className]"
            @click.stop="onClick($event, item)"
            @contextmenu.prevent.stop="onContextMenu($event, item)"
          >
          </div>
          <div
            v-for="(item) in visibleMarkers.filter((i) => i.group === group.id).sort((a, b) => a.start - b.start)"
            :key="item.id || `${item.start}${item.type}`"
            :style="{ left: `${getLeftPos(item.start)}px` }"
            :class="[item.type, item.className]"
          >
          </div>
        </div>

        <div v-if="visibleItems.some((i) => !i.group && i.type == 'background')" class="backgrounds">
          <div
            v-for="(item) in visibleItems.filter((i) => !i.group && i.type == 'background')"
            :key="item.id || `${item.start}${item.type}${item.end || ''}`"
            :style="{ left: `${getLeftPos(item.start)}px`, width: `${getItemWidth(item.start, item.end)}px` }"
            :class="[item.type, item.className]"
          >
          </div>
        </div>

        <div v-if="visibleMarkers.length > 0" class="markers">
          <div
            v-for="(item) in visibleMarkers.filter((i) => !i.group)"
            :key="item.id || `${item.start}${item.type}`"
            :style="{ left: `${getLeftPos(item.start)}px` }"
            :class="[item.type, item.className]"
          >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed, ref, watch, watchEffect } from 'vue';
  import { useElementSize } from '../composables/useElementSize';
  import { leadingZero } from '../helpers/leadingZero';
  import { useScale } from '../composables/useScale';

  export interface Props {
    groups?: TimelineGroup[];
    items?: TimelineItem[];
    markers?: TimelineMarker[];
    viewportMin?: number;
    viewportMax?: number;
    minViewportDuration?: number;
    maxViewportDuration?: number;
    initialViewportStart?: number;
    initialViewportEnd?: number;
    renderTimestampLabel?: (timestamp: number) => string;
    fixedLabels?: boolean;
    minTimestampWidth?: number;
    activeItems?: TimelineItem[];
  }

  const props = withDefaults(defineProps<Props>(), {
    groups: () => [],
    items: () => [],
    markers: () => [],
    viewportMin: undefined,
    viewportMax: undefined,
    minViewportDuration: 1000 * 60,
    maxViewportDuration: 1000 * 60 * 60 * 24 * 7 * 4 * 3,
    initialViewportStart: undefined,
    initialViewportEnd: undefined,
    renderTimestampLabel: (timestamp: number) => {
      const date = new Date(timestamp);
      return `${leadingZero(date.getHours())}:${leadingZero(date.getMinutes())}${date.getSeconds() > 0 ? `:${leadingZero(date.getSeconds())}` : ''}`;
    },
    fixedLabels: false,
    minTimestampWidth: 100,
    activeItems: () => [],
  });

  const emit = defineEmits<{
    (e: 'click', value: { time: number; event: MouseEvent, item: TimelineItem | null }): void;
    (e: 'contextmenu', value: { time: number; event: MouseEvent, item: TimelineItem | null }): void;
    (e: 'mousemoveTimeline', value: { time: number; event: MouseEvent }): void;
    (e: 'mouseleaveTimeline', value: { event: MouseEvent }): void;
    (e: 'changeViewport', value: { start: number; end: number }): void;
  }>();

  const timelineEl = ref<HTMLElement | null>(null);
  const { width: containerWidth } = useElementSize(timelineEl);

  const viewportStart = ref<number>(0);
  const viewportEnd = ref<number>(10000);
  const viewportDuration = computed(() => viewportEnd.value - viewportStart.value);

  watch([viewportStart, viewportEnd], ([start, end]) => {
    emit('changeViewport', { start, end });
  });

  watchEffect(() => {
    setViewportValues();
  });

  function setViewportValues () {
    if (!props.initialViewportStart && !props.viewportMin) {
      const firstStartOccurence = props.items?.reduce((min, item) => {
        if (item.start < min) {
          return item.start;
        }
        return min;
      }, Infinity);
      viewportStart.value = firstStartOccurence ?? 0;
    }
    else {
      viewportStart.value = props.initialViewportStart ?? props.viewportMin ?? 0;
    }
    if (!props.initialViewportEnd && !props.viewportMax) {
      const lastEndOccurence = props.items?.reduce((max, item) => {
        if (item.end > max || item.start > max) {
          return item.end ?? item.start;
        }
        return max;
      }, -Infinity);
      viewportEnd.value = lastEndOccurence ?? 10000;
    }
    else {
      viewportEnd.value = props.initialViewportEnd ?? props.viewportMax ?? 10000;
    }
  }

  const visibleItems = computed(() => {
    return props.items?.filter((item) => {
      return item.start < viewportEnd.value && (item.end ?? item.start) > viewportStart.value;
    }) || [];
  });

  const visibleMarkers = computed(() => {
    return props.markers?.filter((item) => {
      return item.start < viewportEnd.value && item.start > viewportStart.value;
    }) || [];
  });

  const maxLabelsInView = computed(() => containerWidth.value / props.minTimestampWidth);
  const { visibleTimestamps } = useScale(viewportStart, viewportEnd, viewportDuration, maxLabelsInView);

  function timestampClassNames (timestamp: number) {
    return {
      'is-second': timestamp % 1000 === 0,
      'is-minute': timestamp % 60000 === 0,
      'is-hour': timestamp % 3600000 === 0,
      'is-day': timestamp % 86400000 === 0,
    };
  }

  function getLeftPos (ts: number) {
    const pos = ts - viewportStart.value;
    return (pos / viewportDuration.value) * containerWidth.value;
  }
  function getItemWidth (start: number, end: number) {
    if (!end) {
      return null;
    }
    const itemDuration = end - start;
    return (itemDuration / viewportDuration.value) * containerWidth.value;
  }

  function scrollHorizontal (delta: number) {
    const deltaMs = (delta / containerWidth.value) * viewportDuration.value;
    if (delta > 0 && viewportEnd.value === props.viewportMax) {
      return;
    }
    if (delta < 0 && viewportStart.value === props.viewportMin) {
      return;
    }

    viewportStart.value = Math.round(props.viewportMin ? Math.max(viewportStart.value + deltaMs, props.viewportMin) : viewportStart.value + deltaMs);
    viewportEnd.value = Math.round(props.viewportMax ? Math.min(viewportEnd.value + deltaMs, props.viewportMax) : viewportEnd.value + deltaMs);
  }

  function onWheel (e: WheelEvent) {
    if (e.deltaX !== 0) {
      scrollHorizontal(e.deltaMode === 1 ? e.deltaX * 18 : e.deltaX);
      return;
    }
    if (e.deltaX === 0 && e.shiftKey) {
      // if there's no native horizontal scroll going on, convert vertical scroll to horizontal:
      scrollHorizontal(
        e.deltaMode === 1 ? e.deltaY * 18 : e.deltaY
      );
      return;
    }
    if (!(e.metaKey || e.ctrlKey)) {
      return;
    }
    e.preventDefault();

    const mousePosXPercentage = (e.clientX - timelineEl.value!.getBoundingClientRect().left) / containerWidth.value;
    const zoomDelta = Math.round(-viewportDuration.value * 0.01 * (e.deltaMode === 1 ? e.deltaY * 10 : e.deltaY));
    zoom(zoomDelta, mousePosXPercentage);
  }

  function zoom (zoomDeltaInMs: number, mousePosXPercentage = .5) {
    // limit zoomDelta so that it can never zoom with more ms than the viewportDuration:
    if (zoomDeltaInMs > 0) {
      // zooming in
      zoomDeltaInMs = viewportDuration.value - zoomDeltaInMs < props.minViewportDuration
        ? viewportDuration.value - props.minViewportDuration
        : zoomDeltaInMs;
    }
    else {
      // zooming out
      zoomDeltaInMs = viewportDuration.value - zoomDeltaInMs > props.maxViewportDuration
        ? -(props.maxViewportDuration - viewportDuration.value)
        : zoomDeltaInMs;
    }

    // mousePosXPercentage of 0.5 means the zoomDeltaInMs is equally distributed between viewportStart and viewportEnd
    const viewportDeltaLeft = zoomDeltaInMs * mousePosXPercentage;
    const viewportDeltaRight = zoomDeltaInMs - viewportDeltaLeft;

    const proposedViewportStart = viewportStart.value + viewportDeltaLeft;
    const proposedViewportEnd = viewportEnd.value - viewportDeltaRight;

    if (proposedViewportStart >= proposedViewportEnd) {
      console.error('Possible rounding issue occured while zooming.\n\nSetting different values for minViewportDuration and maxViewportDuration might help.');
      return;
    }

    viewportStart.value = Math.round(props.viewportMin ? Math.max(proposedViewportStart, props.viewportMin) : proposedViewportStart);
    viewportEnd.value = Math.round(props.viewportMax ? Math.min(proposedViewportEnd, props.viewportMax) : proposedViewportEnd);

    onMouseMove;
  }

  function onClick (event: MouseEvent, item: TimelineItem | null = null) {
    const mousePosXPercentage = (event.clientX - timelineEl.value!.getBoundingClientRect().left) / containerWidth.value;
    const positionInMs = viewportStart.value + viewportDuration.value * mousePosXPercentage;
    emit('click', { time: positionInMs, event, item });
  }

  function onContextMenu (event: MouseEvent, item: TimelineItem | null = null) {
    const mousePosXPercentage = (event.clientX - timelineEl.value!.getBoundingClientRect().left) / containerWidth.value;
    const positionInMs = viewportStart.value + viewportDuration.value * mousePosXPercentage;
    emit('contextmenu', { time: positionInMs, event, item });
  }

  function onMouseMove (event: MouseEvent) {
    const mousePosXPercentage = (event.clientX - timelineEl.value!.getBoundingClientRect().left) / containerWidth.value;
    const positionInMs = viewportStart.value + viewportDuration.value * mousePosXPercentage;
    emit('mousemoveTimeline', { time: positionInMs, event });
  }

  function onMouseLeave (event: MouseEvent) {
    emit('mouseleaveTimeline', { event });
  }

</script>

<style lang="scss" scoped>
  * {
    box-sizing: border-box;
  }

  .timeline-wrapper {
    overflow: hidden;
    position: relative;
    user-select: none;
    font-family: var(--font-family, inherit);
  }

  .timestamps {
    --_padding-block: var(--timestamp-padding-block, 0.2em);
    --_padding-inline: var(--timestamp-padding-inline, 0.4em);
    --_lineheight: var(--timestamp-line-height, 1.5em);

    height: calc(var(--_padding-block) * 2 + var(--_lineheight));
    line-height: var(--_lineheight);
    background: var(--timestamps-background, #fff);
    color: var(--timestamps-color, black);

    .timestamp {
      padding: var(--_padding-block) var(--_padding-inline);
      position: absolute;
      height: 100%;
      border-left: var(--gridline-border-left, 1px dashed rgba(0, 0, 0, 10%));
      z-index: 0;
      font-size: 0.85em;
    }

    .marker {
      height: calc(var(--_lineheight) + var(--_padding-block) * 2);
    }
  }

  .groups {
    position: relative;
  }

  .group {
    border-top: var(--group-border-top, 1px solid rgba(0, 0, 0, 10%));
    padding-top: var(--group-padding-top, 0);
    padding-bottom: var(--group-padding-bottom, 0.4em);
    z-index: 1;
    position: relative;

    .group-label {
      padding: var(--label-padding, 0.2em 0.4em 0.4em);
      line-height: var(--label-line-height, 1em);
      font-size: 0.85em;
      color: var(--label-color, currentColor);
      background: var(--label-background, transparent);
      width: var(--label-width, auto);

      &.fixed {
        position: absolute;
        top: 0;
        bottom: 0;
        z-index: 1;
      }
    }

    .group-items {
      position: relative;
      height: var(--group-height, 2em);
    }
  }

  .item {
    cursor: pointer;
    position: absolute;
    top: 0;
    bottom: 0;
    height: 100%;
    background: var(--item-background, #007bff);
    opacity: 0.7;

    &:hover,
    &.active {
      opacity: 1;
    }

    &.point {
      --_size: var(--item-point-size, 1rem);

      height: var(--_size);
      width: var(--_size);
      border-radius: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
    }

    &.range {
      border-radius: var(--item-range-border-radius, 0.5em);
    }
  }

  .background {
    background: var(--item-background, rgba(0, 0, 0, 10%));
    position: absolute;
    top: 0;
    bottom: 0;
  }

  .marker {
    background: var(--item-background, red);
    position: absolute;
    top: 0;
    bottom: 0;
    width: var(--item-marker-width, 1px);
    transform: translateX(-50%);
  }
</style>
