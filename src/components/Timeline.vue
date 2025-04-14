<template>
  <div class="timeline-wrapper">
    <div
      ref="timelineEl"
      class="timeline"
      @wheel="onWheel"
      @click="onClick"
      @pointermove="onPointerMove"
      @pointerdown="onPointerDown"
      @pointerup="onPointerUp"
      @contextmenu.prevent="onContextMenu"
      @mousemove="onMouseMove"
      @mouseleave="onMouseLeave"
    >
      <div class="timestamps">
        <slot name="timestamps-before" :scale="scale"></slot>

        <div
          v-for="(timestamp, index) in visibleTimestamps"
          :key="timestamp"
          :class="['timestamp', timestampClassNames(timestamp)]"
          :style="{ '--_left': `${timestampLeftPositions[index]}px` }"
        >
          <slot
            name="timestamp"
            :timestamp="timestamp"
            :scale="scale"
          >
            {{ renderTimestampLabel(timestamp, scale) }}
          </slot>
        </div>
        <slot name="timestamps-after" :scale="scale"></slot>

        <div
          v-for="(item) in visibleMarkers.filter((item) => item.group === '_timestamps')"
          :key="item.id ?? `${item.start}${item.type}`"
          :style="getStyle(item)"
          :class="[item.type, item.className]"
        >
          <slot name="marker" :item="item"></slot>
        </div>

        <div
          v-for="(item) in visibleItems.filter((item) => item.group === '_timestamps' && item.type === 'marker')"
          :key="item.id ?? `${item.start}${item.type}`"
          :style="getStyle(item)"
          :class="[item.type, item.className]"
        >
          <slot name="marker" :item="item"></slot>
        </div>
      </div>

      <div class="groups">
        <div
          v-for="group in groups"
          :key="group.id"
          :class="['group', group.className]"
          :style="group.cssVariables"
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
              :itemsInViewport="visibleItems.filter((item) => item.group === group.id)"
              :viewportStart="viewportStart"
              :viewportEnd="viewportEnd"
            >
              <div
                v-for="(item, index) in visibleItems.filter((item) => item.group === group.id && item.type !== 'background')"
                :key="item.id ?? index"
                :style="getStyle(item)"
                :class="['item', item.type, item.className, {active: activeItems.includes(item.id)}]"
                @click.stop="onClick($event, item)"
                @pointermove.stop="onPointerMove($event, item)"
                @pointerdown.stop="onPointerDown($event, item)"
                @pointerup.stop="onPointerUp($event, item)"
                @contextmenu.prevent.stop="onContextMenu($event, item)"
              >
                <slot name="item" :item="item"></slot>
              </div>
            </slot>
          </div>
          <div
            v-for="(item) in visibleItems.filter((item) => item.group === group.id && item.type === 'background')"
            :key="item.id ?? `${item.start}${item.type}${item.end || ''}`"
            :style="getStyle(item)"
            :class="[item.type, item.className]"
            @click.stop="onClick($event, item)"
            @pointermove.stop="onPointerMove($event, item)"
            @pointerdown.stop="onPointerDown($event, item)"
            @pointerup.stop="onPointerUp($event, item)"
            @contextmenu.prevent.stop="onContextMenu($event, item)"
          >
          </div>
          <div
            v-for="(item) in visibleMarkers.filter((item) => item.group === group.id)"
            :key="item.id ?? `${item.start}${item.type}`"
            :style="getStyle(item, true)"
            :class="[item.type, item.className]"
          >
            <slot name="marker" :item="item"></slot>
          </div>
        </div>

        <div v-if="visibleBackgroundsWithoutGroup.length > 0" class="backgrounds">
          <div
            v-for="(item) in visibleBackgroundsWithoutGroup"
            :key="item.id ?? `${item.start}${item.type}${item.end || ''}`"
            :style="getStyle(item)"
            :class="[item.type, item.className]"
            @click.stop="onClick($event, item)"
            @pointermove.stop="onPointerMove($event, item)"
            @pointerdown.stop="onPointerDown($event, item)"
            @pointerup.stop="onPointerUp($event, item)"
            @contextmenu.prevent.stop="onContextMenu($event, item)"
          >
          </div>
        </div>

        <div v-if="visibleMarkersWithoutGroup.length > 0" class="markers">
          <div
            v-for="(item) in visibleMarkersWithoutGroup"
            :key="item.id ?? `${item.start}${item.type}`"
            :style="getStyle(item, true)"
            :class="[item.type, item.className]"
          >
            <slot name="marker" :item="item"></slot>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup generic="GTimelineItem extends TimelineItem, GTimelineGroup extends TimelineGroup, GTimelineMarker extends TimelineMarker">
  import { computed, CSSProperties, nextTick, onMounted, ref, watch, watchEffect } from 'vue';
  import { useElementSize } from '../composables/useElementSize.ts';
  import { leadingZero } from '../helpers/leadingZero.ts';
  import { useScale } from '../composables/useScale.ts';
  import type { Scale, Scales } from '../composables/useScale.ts';
  import { startOfDay, startOfMonth, startOfYear } from 'date-fns';
  import { useElementBounding } from '@vueuse/core';
  import type { TimelineItem, TimelineGroup, TimelineMarker } from '../types/timeline.ts';

  type Props = {
    groups?: GTimelineGroup[];
    items?: GTimelineItem[];
    markers?: GTimelineMarker[];
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
    scales?: Scales[];
    weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  }

  const props = withDefaults(defineProps<Props>(), {
    groups: () => [],
    items: () => [],
    markers: () => [],
    scales: () => [],
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
          era: startOfYear(date).valueOf() === timestamp && startOfYear(date).getFullYear() <= 0 ? 'short' : undefined,
          day: scale.unit !== 'years' && !(scale.unit === 'months' && scale.step >= 1) && startOfDay(date).valueOf() === timestamp ? 'numeric' : undefined,
        })} `;
      }

      if (['hours', 'minutes', 'seconds', 'ms'].includes(scale.unit)) {
        returnValue += `${leadingZero(date.getHours())}:${leadingZero(date.getMinutes())}${date.getSeconds() > 0 ? `:${leadingZero(date.getSeconds())}` : ''}${date.getMilliseconds() > 0 ? `.${leadingZero(date.getMilliseconds())}` : ''}`;
      }

      return returnValue;
    },
    fixedLabels: false,
    minTimestampWidth: 100,
    maxZoomSpeed: 60,
    activeItems: () => [],
    maxOffsetOutsideViewport: 50,
    weekStartsOn: 0,
  });

  const emit = defineEmits<{
    (e: 'pointermove', value: { time: number; event: PointerEvent, item: GTimelineItem | GTimelineMarker | null }): void;
    (e: 'pointerdown', value: { time: number; event: PointerEvent, item: GTimelineItem | GTimelineMarker | null }): void;
    (e: 'pointerup', value: { time: number; event: PointerEvent, item: GTimelineItem | GTimelineMarker | null }): void;
    (e: 'wheel', value: WheelEvent): void;
    (e: 'click', value: { time: number; event: MouseEvent, item: GTimelineItem | GTimelineMarker | null }): void;
    (e: 'contextmenu', value: { time: number; event: MouseEvent, item: GTimelineItem | GTimelineMarker | null }): void;
    (e: 'mousemoveTimeline', value: { time: number; event: MouseEvent }): void;
    (e: 'mouseleaveTimeline', value: { event: MouseEvent }): void;
    (e: 'changeViewport', value: { start: number; end: number }): void;
    (e: 'changeScale', value: Scale): void;
  }>();

  defineExpose({
    setViewport,
    onWheel,
  });

  const timelineEl = ref<HTMLElement | null>(null);
  const { width: containerWidth } = useElementSize(timelineEl);

  const viewportStart = ref<number>(0);
  const viewportEnd = ref<number>(10000);
  const viewportDuration = computed(() => viewportEnd.value - viewportStart.value);

  watch([viewportStart, viewportEnd], ([start, end]) => {
    emit('changeViewport', { start, end });
  });

  watchEffect(() => {
    try {
      checkValidityOfProps();
      setInitialViewportValues();
    }
    catch (e) {
      console.error(e);
    }
  });

  const { left: containerLeft } = useElementBounding(timelineEl);

  function setInitialViewportValues () {
    if (props.initialViewportStart === undefined && props.viewportMin === undefined) {
      const firstStartOccurence = props.items?.reduce((min, item) => {
        if (item.start < min) {
          return item.start;
        }
        return min;
      }, Infinity);
      setViewport(firstStartOccurence ?? 0, undefined);
    }
    else {
      setViewport(props.initialViewportStart ?? props.viewportMin ?? 0, undefined);
    }
    if (props.initialViewportEnd === undefined && props.viewportMax === undefined) {
      const lastEndOccurence = props.items?.reduce((max, item) => {
        if ((item.end !== undefined && item.end > max) || item.start > max) {
          return item.end ?? item.start;
        }
        return max;
      }, -Infinity);
      setViewport(undefined, lastEndOccurence ?? 10000);
    }
    else {
      setViewport(undefined, props.initialViewportEnd ?? props.viewportMax ?? 10000);
    }
  }

  const visibleItems = computed(() => props.items.filter((item) => item.start < viewportEnd.value && (item.end ?? item.start) > viewportStart.value).sort((a, b) => a.start - b.start) || []);
  const visibleMarkers = computed(() => props.markers.filter((item) => item.start < viewportEnd.value && item.start > viewportStart.value).sort((a, b) => a.start - b.start) || []);
  const visibleMarkersWithoutGroup = computed(() => visibleMarkers.value.filter((item) => !item.group));
  const visibleBackgroundsWithoutGroup = computed(() => visibleItems.value.filter((item) => item.type === 'background' && !item.group));

  const styleCache = new Map();
  const styleCacheMarkers = new Map();
  watch([viewportStart, viewportEnd, containerWidth], () => {
    styleCache.clear();
    styleCacheMarkers.clear();
  });

  watch(visibleItems, () => {
    styleCache.clear();
  });

  watch(visibleMarkers, () => {
    styleCacheMarkers.clear();
  });

  onMounted(() => {
    nextTick(() => {
      styleCache.clear();
      styleCacheMarkers.clear();
    });
  });

  function styleObject (item: TimelineItem) {
    return {
      '--_left': `${getLeftPos(item.start, item.end)}px`,
      '--_width': item.end !== undefined ? `${getItemWidth(item.start, item.end)}px` : null,
      ...item.cssVariables,
    } as CSSProperties;
  }

  function getStyle (item: TimelineItem | TimelineMarker, markers = false) {
    const cache = markers ? styleCacheMarkers : styleCache;
    const cachedValue = cache.get(item.id ?? `${item.start}${item.type}${item.end || ''}`);
    if (cachedValue) {
      return cachedValue;
    }
    const value = styleObject(item);
    cache.set(item.id ?? `${item.start}${item.type}${item.end || ''}`, value);
    return value;
  }

  const maxLabelsInView = computed(() => containerWidth.value / props.minTimestampWidth);
  const { visibleTimestamps, scale } = useScale(viewportStart, viewportEnd, viewportDuration, maxLabelsInView, computed(() => props.scales), computed(() => props.weekStartsOn));
  const timestampLeftPositions = computed(() => visibleTimestamps.value.map((timestamp) => getLeftPos(timestamp)));

  watch(scale, (newVal, oldVal) => {
    if (newVal.step === oldVal?.step && newVal.unit === oldVal?.unit) {
      return;
    }
    emit('changeScale', newVal);
  }, { immediate: true });

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
    const itemDuration = end - start;
    const actualItemWidth = (itemDuration / viewportDuration.value) * containerWidth.value;
    return Math.min(actualItemWidth, maxItemWidth.value);
  }

  function scrollHorizontal (delta: number, event: WheelEvent) {
    const deltaMs = (delta / containerWidth.value) * viewportDuration.value;
    if (delta > 0 && viewportEnd.value === props.viewportMax) {
      return;
    }
    if (delta < 0 && viewportStart.value === props.viewportMin) {
      return;
    }

    setViewport(viewportStart.value + deltaMs, viewportEnd.value + deltaMs);
    onMouseMove(event);
  }

  function checkValidityOfProps () {
    const hasInvalidInitialViewport = props.initialViewportStart !== undefined && props.initialViewportEnd !== undefined && props.initialViewportStart >= props.initialViewportEnd;
    if (hasInvalidInitialViewport) {
      throw new Error('[vue-timeline-chart] Invalid props: initialViewportStart must be smaller than initialViewportEnd');
    }
    const hasInvalidViewportMinMax = props.viewportMin !== undefined && props.viewportMax !== undefined && props.viewportMin >= props.viewportMax;
    if (hasInvalidViewportMinMax) {
      throw new Error('[vue-timeline-chart] Invalid props: viewportMin must be smaller than viewportMax');
    }
    const initialViewportStartIsBeforeViewportMin = props.initialViewportStart !== undefined && props.viewportMin !== undefined && props.initialViewportStart < props.viewportMin;
    if (initialViewportStartIsBeforeViewportMin) {
      throw new Error('[vue-timeline-chart] Invalid props: initialViewportStart must be greater than or equal to viewportMin');
    }
    const initialViewportEndIsAfterViewportMax = props.initialViewportEnd !== undefined && props.viewportMax !== undefined && props.initialViewportEnd > props.viewportMax;
    if (initialViewportEndIsAfterViewportMax) {
      throw new Error('[vue-timeline-chart] Invalid props: initialViewportEnd must be smaller than or equal to viewportMax');
    }
  }

  /**
   * Set the viewport to the given start and end.
   *
   * If only one of the two is provided, the other value will stay unchanged.
   * Values are rounded to whole numbers and clamped to the viewportMin and viewportMax props if those are provided.
   * @param start - The start of the viewport in ms
   * @param end - The end of the viewport in ms
   */
  function setViewport (start?: number, end?: number) {
    if (start !== undefined) {
      viewportStart.value = Math.round(props.viewportMin !== undefined ? Math.max(start, props.viewportMin) : start);
    }
    if (end !== undefined) {
      viewportEnd.value = Math.round(props.viewportMax !== undefined ? Math.min(end, props.viewportMax) : end);
    }
  }

  function onWheel (e: WheelEvent) {
    checkValidityOfProps();
    emit('wheel', e);

    if (e.deltaY === 0) {
      // prevent swipe gesture triggered history navigation:
      e.preventDefault();
    }

    if (e.shiftKey) {
      e.preventDefault();
      // if there's no native horizontal scroll going on, convert vertical scroll to horizontal:
      const delta = e.deltaY === 0 && e.deltaX !== 0 ? e.deltaX : e.deltaY;
      scrollHorizontal(delta * (e.deltaMode === 0 ? 1 : 18), e);
      return;
    }
    if (e.deltaX !== 0) {
      scrollHorizontal(e.deltaX * (e.deltaMode === 0 ? 1 : 18), e);
      return;
    }
    if (!(e.metaKey || e.ctrlKey)) {
      return;
    }
    e.preventDefault();

    const mousePosXPercentage = (e.clientX - containerLeft.value) / containerWidth.value;
    // Clamp deltaY so that the mouse scrollspeed does not affect the zoom speed too much, also take deltaMode into account:
    const clampedDeltaY = props.maxZoomSpeed ? Math.max(-props.maxZoomSpeed, Math.min(props.maxZoomSpeed, e.deltaY * (e.deltaMode === 0 ? 1 : 10))) : e.deltaY * (e.deltaMode === 0 ? 1 : 10);
    const zoomDelta = Math.round(-viewportDuration.value * 0.01 * clampedDeltaY);
    zoom(zoomDelta, mousePosXPercentage, e);
  }

  function zoom (zoomDeltaInMs: number, mousePosXPercentage = .5, event: WheelEvent) {
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

    setViewport(proposedViewportStart, proposedViewportEnd);

    onMouseMove(event);
  }

  function getPositionInMsOfMouseEvent (event: MouseEvent | PointerEvent) {
    const mousePosXPercentage = (event.clientX - containerLeft.value) / containerWidth.value;
    return viewportStart.value + viewportDuration.value * mousePosXPercentage;
  }

  function onPointerMove (event: PointerEvent, item: GTimelineItem | GTimelineMarker | null = null) {
    emit('pointermove', { time: getPositionInMsOfMouseEvent(event), event, item });
  }

  function onPointerDown (event: PointerEvent, item: GTimelineItem | GTimelineMarker | null = null) {
    emit('pointerdown', { time: getPositionInMsOfMouseEvent(event), event, item });
  }

  function onPointerUp (event: PointerEvent, item: GTimelineItem | GTimelineMarker | null = null) {
    emit('pointerup', { time: getPositionInMsOfMouseEvent(event), event, item });
  }

  function onClick (event: MouseEvent, item: GTimelineItem | GTimelineMarker | null = null) {
    emit('click', { time: getPositionInMsOfMouseEvent(event), event, item });
  }

  function onContextMenu (event: MouseEvent, item: GTimelineItem | GTimelineMarker | null = null) {
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
