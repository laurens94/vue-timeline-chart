<template>
  <div class="timeline-wrapper">
    <div
      ref="timelineEl"
      class="timeline"
      @wheel="onWheel"
      @click="onClick"
      @pointerdown="onPointerDown"
      @pointerup="onPointerUp"
      @contextmenu.prevent="onContextMenu"
      @mousemove="onMouseMove"
      @mouseleave="onMouseLeave"
    >
      <div class="timestamps">
        <div
          v-for="timestamp in visibleTimestamps"
          :key="timestamp"
          :class="['timestamp', timestampClassNames(timestamp)]"
          :style="{ '--_left': `${getLeftPos(timestamp)}px` }"
        >
          <slot
            name="timestamp"
            :timestamp="timestamp"
            :scale="scale"
          >
            {{ renderTimestampLabel(timestamp, scale) }}
          </slot>
        </div>

        <div
          v-for="(item) in visibleMarkers.filter((i) => i.group === '_timestamps').sort((a, b) => a.start - b.start)"
          :key="item.id || `${item.start}${item.type}`"
          :style="{ '--_left': `${getLeftPos(item.start)}px` }"
          :class="[item.type, item.className]"
        >
        </div>
      </div>

      <div class="groups">
        <div
          v-for="group in groups"
          :key="group.id"
          :class="['group', group.className]"
        >
          <div :class="['group-label', { fixed: fixedLabels }]">
            <slot name="group-label" :group="group">
              {{ group.label }}
            </slot>
          </div>

          <div class="group-items">
            <slot
              :name="`items-${group.id}`"
              :group="group"
              :itemsInViewport="visibleItems.filter((i) => i.group === group.id && i.type != 'background').sort((a, b) => a.start - b.start)"
              :viewportStart="viewportStart"
              :viewportEnd="viewportEnd"
            >
              <div
                v-for="(item, index) in visibleItems.filter((i) => i.group === group.id && i.type != 'background').sort((a, b) => a.start - b.start)"
                :key="index"
                :style="{ '--_left': `${getLeftPos(item.start, item.end)}px`, '--_width': item.type !== 'point' ? `${getItemWidth(item.start, item.end)}px` : null, ...item.cssVariables }"
                :class="['item', item.type, item.className, {active: activeItems.includes(item.id)}]"
                @click.stop="onClick($event, item)"
                @pointerdown.stop="onPointerDown($event, item)"
                @pointerup.stop="onPointerUp($event, item)"
                @contextmenu.prevent.stop="onContextMenu($event, item)"
              >
                <slot name="item" :item="item"></slot>
              </div>
            </slot>
          </div>
          <div
            v-for="(item) in visibleItems.filter((i) => i.group === group.id && i.type === 'background').sort((a, b) => a.start - b.start)"
            :key="item.id || `${item.start}${item.type}${item.end || ''}`"
            :style="{ '--_left': `${getLeftPos(item.start, item.end)}px`, '--_width': `${getItemWidth(item.start, item.end)}px` }"
            :class="[item.type, item.className]"
            @click.stop="onClick($event, item)"
            @pointerdown.stop="onPointerDown($event, item)"
            @pointerup.stop="onPointerUp($event, item)"
            @contextmenu.prevent.stop="onContextMenu($event, item)"
          >
          </div>
          <div
            v-for="(item) in visibleMarkers.filter((i) => i.group === group.id).sort((a, b) => a.start - b.start)"
            :key="item.id || `${item.start}${item.type}`"
            :style="{ '--_left': `${getLeftPos(item.start)}px` }"
            :class="[item.type, item.className]"
          >
          </div>
        </div>

        <div v-if="visibleItems.some((i) => !i.group && i.type == 'background')" class="backgrounds">
          <div
            v-for="(item) in visibleItems.filter((i) => !i.group && i.type == 'background')"
            :key="item.id || `${item.start}${item.type}${item.end || ''}`"
            :style="{ '--_left': `${getLeftPos(item.start, item.end)}px`, '--_width': `${getItemWidth(item.start, item.end)}px` }"
            :class="[item.type, item.className]"
          >
          </div>
        </div>

        <div v-if="visibleMarkers.length > 0" class="markers">
          <div
            v-for="(item) in visibleMarkers.filter((i) => !i.group)"
            :key="item.id || `${item.start}${item.type}`"
            :style="{ '--_left': `${getLeftPos(item.start)}px` }"
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
  import { useElementSize } from '../composables/useElementSize.ts';
  import { leadingZero } from '../helpers/leadingZero.ts';
  import { useScale } from '../composables/useScale.ts';
  import type { Scale } from '../composables/useScale.ts';
  import { startOfDay, startOfMonth, startOfYear } from 'date-fns';

  export interface TimelineGroup {
    id: string;
    label?: string;
    className?: string;
  }

  export interface TimelineItemBase {
    className?: string;
    start: number;
    end?: number;
    id?: string;
    cssVariables?: Record<string, string>;
  }

  export interface TimelineItemRange extends TimelineItemBase {
    type: 'range';
    end: number;
    title?: string;
    group: TimelineGroup['id'];
  }

  export interface TimelineItemPoint extends TimelineItemBase {
    type: 'point';
    title?: string;
    group: TimelineGroup['id'];
  }

  export interface TimelineItemBackground extends TimelineItemBase {
    type: 'background';
    end: number;
    group?: TimelineGroup['id'];
  }

  export interface TimelineMarker extends TimelineItemBase {
    type: 'marker';
    group?: TimelineGroup['id'];
  }

  export type TimelineItem = TimelineItemRange | TimelineItemPoint | TimelineItemBackground | TimelineMarker;

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
    renderTimestampLabel?: (timestamp: number, scale: { unit: string, step: number}) => string;
    fixedLabels?: boolean;
    minTimestampWidth?: number;
    maxZoomSpeed?: number;
    activeItems?: TimelineItem['id'][];
    maxOffsetOutsideViewport?: number;
  }

  const props = withDefaults(defineProps<Props>(), {
    groups: () => [],
    items: () => [],
    markers: () => [],
    viewportMin: undefined,
    viewportMax: undefined,
    minViewportDuration: 1000,
    maxViewportDuration: undefined,
    initialViewportStart: undefined,
    initialViewportEnd: undefined,
    renderTimestampLabel: (timestamp: number, scale: { unit: string, step: number}) => {
      const date = new Date(timestamp);
      let returnValue = '';

      if (!['hours', 'minutes', 'seconds', 'ms'].includes(scale.unit) || startOfDay(date).valueOf() === timestamp) {
        returnValue += `${date.toLocaleString('default', {
          month: scale.unit !== 'years' && (startOfMonth(date).valueOf() === timestamp || scale.unit === 'days' || (startOfDay(date).valueOf() === timestamp) && !(scale.unit === 'months' && scale.step === 0.25)) ? 'short' : undefined,
          year: startOfYear(date).valueOf() === timestamp ? 'numeric' : undefined,
          day: scale.unit !== 'years' && !(scale.unit === 'months' && scale.step >= 1) && startOfDay(date).valueOf() === timestamp ? 'numeric' : undefined,
        })} `;
      }

      if (['hours', 'minutes', 'seconds', 'ms'].includes(scale.unit)) {
        returnValue += `${leadingZero(date.getHours())}:${leadingZero(date.getMinutes())}${date.getSeconds() > 0 ? `:${leadingZero(date.getSeconds())}` : ''}`;
      }

      return returnValue;
    },
    fixedLabels: false,
    minTimestampWidth: 100,
    maxZoomSpeed: 60,
    activeItems: () => [],
    maxOffsetOutsideViewport: 50,
  });

  const emit = defineEmits<{
    (e: 'pointerdown', value: { time: number; event: MouseEvent, item: TimelineItem | null }): void;
    (e: 'pointerup', value: { time: number; event: MouseEvent, item: TimelineItem | null }): void;
    (e: 'click', value: { time: number; event: MouseEvent, item: TimelineItem | null }): void;
    (e: 'contextmenu', value: { time: number; event: MouseEvent, item: TimelineItem | null }): void;
    (e: 'mousemoveTimeline', value: { time: number; event: MouseEvent }): void;
    (e: 'mouseleaveTimeline', value: { event: MouseEvent }): void;
    (e: 'changeViewport', value: { start: number; end: number }): void;
    (e: 'changeScale', value: Scale): void;
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
    if (props.initialViewportStart === undefined && props.viewportMin === undefined) {
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
    if (props.initialViewportEnd === undefined && props.viewportMax === undefined) {
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

  const visibleItems = computed(() => props.items?.filter((item) => item.start < viewportEnd.value && (item.end ?? item.start) > viewportStart.value) || []);
  const visibleMarkers = computed(() => props.markers?.filter((item) => item.start < viewportEnd.value && item.start > viewportStart.value) || []);

  const maxLabelsInView = computed(() => containerWidth.value / props.minTimestampWidth);
  const { visibleTimestamps, scale } = useScale(viewportStart, viewportEnd, viewportDuration, maxLabelsInView);

  watch(scale, (newVal, oldVal) => {
    if (newVal.step === oldVal.step && newVal.unit === oldVal.unit) {
      return;
    }
    emit('changeScale', newVal);
  });

  function timestampClassNames (timestamp: number) {
    return {
      'is-second': timestamp % 1000 === 0,
      'is-minute': timestamp % 60000 === 0,
      'is-hour': timestamp % 3600000 === 0,
      'is-day': timestamp % 86400000 === 0,
    };
  }

  const clampOffsetForPerformanceInMs = computed(() => (props.maxOffsetOutsideViewport / containerWidth.value) * viewportDuration.value);
  const maxItemWidth = computed(() => containerWidth.value + 2 * (clampOffsetForPerformanceInMs.value / viewportDuration.value) * containerWidth.value);

  function getLeftPos (startTs: number, endTs?: number) {
    if (endTs !== undefined && startTs < viewportStart.value - clampOffsetForPerformanceInMs.value) {
      // makes sure item does not exceed viewport boundaries too much (too large items won't be rendered by the browser)
      const itemDuration = endTs - startTs;
      const actualItemWidth = (itemDuration / viewportDuration.value) * containerWidth.value;
      if (actualItemWidth > maxItemWidth.value) {
        const clampedLeftPosInPx = (-clampOffsetForPerformanceInMs.value / viewportDuration.value) * containerWidth.value;
        const clampedRightPosInMs = viewportEnd.value + clampOffsetForPerformanceInMs.value;

        if (endTs > clampedRightPosInMs) {
          return clampedLeftPosInPx;
        }
        const offsetInMs = clampedRightPosInMs - endTs;
        const offsetInPx = (offsetInMs / viewportDuration.value) * containerWidth.value;
        return (clampedLeftPosInPx) - offsetInPx;
      }
    }

    const pos = startTs - viewportStart.value;
    return (pos / viewportDuration.value) * containerWidth.value;
  }

  function getItemWidth (start: number, end: number) {
    if (isNaN(end)) {
      return null;
    }

    const itemDuration = end - start;
    const actualItemWidth = (itemDuration / viewportDuration.value) * containerWidth.value;
    return Math.min(actualItemWidth, maxItemWidth.value);
  }

  function scrollHorizontal (delta: number) {
    const deltaMs = (delta / containerWidth.value) * viewportDuration.value;
    if (delta > 0 && viewportEnd.value === props.viewportMax) {
      return;
    }
    if (delta < 0 && viewportStart.value === props.viewportMin) {
      return;
    }

    viewportStart.value = Math.round(props.viewportMin !== undefined ? Math.max(viewportStart.value + deltaMs, props.viewportMin) : viewportStart.value + deltaMs);
    viewportEnd.value = Math.round(props.viewportMax !== undefined ? Math.min(viewportEnd.value + deltaMs, props.viewportMax) : viewportEnd.value + deltaMs);
  }

  function onWheel (e: WheelEvent) {
    if (e.deltaY === 0) {
      // prevent swipe gesture triggered history navigation:
      e.preventDefault();
    }

    if (e.shiftKey) {
      e.preventDefault();
      // if there's no native horizontal scroll going on, convert vertical scroll to horizontal:
      const delta = e.deltaY === 0 && e.deltaX !== 0 ? e.deltaX : e.deltaY;
      scrollHorizontal(delta * (e.deltaMode === 0 ? 1 : 18));
      return;
    }
    if (e.deltaX !== 0) {
      scrollHorizontal(e.deltaX * (e.deltaMode === 0 ? 1 : 18));
      return;
    }
    if (!(e.metaKey || e.ctrlKey)) {
      return;
    }
    e.preventDefault();

    const mousePosXPercentage = (e.clientX - timelineEl.value!.getBoundingClientRect().left) / containerWidth.value;
    // Clamp deltaY so that the mouse scrollspeed does not affect the zoom speed too much, also take deltaMode into account:
    const clampedDeltaY = props.maxZoomSpeed ? Math.max(-props.maxZoomSpeed, Math.min(props.maxZoomSpeed, e.deltaY * (e.deltaMode === 0 ? 1 : 10))) : e.deltaY * (e.deltaMode === 0 ? 1 : 10);
    const zoomDelta = Math.round(-viewportDuration.value * 0.01 * clampedDeltaY);
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
    else if (props.maxViewportDuration) {
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
      console.error('Rounding issue probably occured while zooming.\n\nSetting different values for minViewportDuration and maxViewportDuration might help.');
      return;
    }

    viewportStart.value = Math.round(props.viewportMin !== undefined ? Math.max(proposedViewportStart, props.viewportMin) : proposedViewportStart);
    viewportEnd.value = Math.round(props.viewportMax !== undefined ? Math.min(proposedViewportEnd, props.viewportMax) : proposedViewportEnd);

    onMouseMove;
  }

  function getPositionInMsOfMouseEvent (event: MouseEvent) {
    const mousePosXPercentage = (event.clientX - timelineEl.value!.getBoundingClientRect().left) / containerWidth.value;
    return viewportStart.value + viewportDuration.value * mousePosXPercentage;
  }

  function onPointerDown (event: MouseEvent, item: TimelineItem | null = null) {
    emit('pointerdown', { time: getPositionInMsOfMouseEvent(event), event, item });
  }

  function onPointerUp (event: MouseEvent, item: TimelineItem | null = null) {
    emit('pointerup', { time: getPositionInMsOfMouseEvent(event), event, item });
  }

  function onClick (event: MouseEvent, item: TimelineItem | null = null) {
    emit('click', { time: getPositionInMsOfMouseEvent(event), event, item });
  }

  function onContextMenu (event: MouseEvent, item: TimelineItem | null = null) {
    emit('contextmenu', { time: getPositionInMsOfMouseEvent(event), event, item });
  }

  function onMouseMove (event: MouseEvent) {
    emit('mousemoveTimeline', { time: getPositionInMsOfMouseEvent(event), event });
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

  .item,
  .background,
  .marker {
    contain: strict;
  }

  .timestamp {
    contain: layout paint style;
  }

  .item,
  .background,
  .timestamp,
  .marker {
    translate: var(--_left) 0;
    width: var(--_width);
    position: absolute;
    top: 0;
    bottom: 0;
  }

  .marker {
    background: var(--item-background, red);
    width: var(--item-marker-width, 1px);
    transform: translateX(-50%);
  }

  .timestamps {
    --_padding-block: var(--timestamp-padding-block, 0.2em);
    --_padding-inline: var(--timestamp-padding-inline, 0.4em);
    --_lineheight: var(--timestamp-line-height, 1.5em);

    height: calc(var(--_padding-block) * 2 + var(--_lineheight));
    line-height: var(--_lineheight);
    background: var(--timestamps-background, color-mix(in srgb, currentColor 5%, transparent));
    color: var(--timestamps-color, inherit);

    .timestamp {
      padding: var(--_padding-block) var(--_padding-inline);
      position: absolute;
      height: 100%;
      border-left: var(--gridline-border-left, 1px dashed color-mix(in srgb, currentColor 15%, transparent));
      z-index: 0;
      font-size: 0.85em;
      white-space: nowrap;
    }

    .marker {
      height: calc(var(--_lineheight) + var(--_padding-block) * 2);
    }
  }

  .groups {
    position: relative;
  }

  .group {
    border-top: var(--group-border-top, 1px solid color-mix(in srgb, currentColor 15%, transparent));
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
      height: var(--group-items-height, 2em);
    }
  }

  .item {
    cursor: pointer;
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
  }
</style>
