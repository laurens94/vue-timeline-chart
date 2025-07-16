<template>
  <div class="timeline-wrapper">
    <div
      ref="timelineEl"
      class="timeline"
      @wheel="onWheel"
      @click="onClick"
      @touchmove="onTouchMove"
      @touchstart="onTouchStart"
      @touchend="onTouchEnd"
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
          v-for="(markerItem, index) in visibleMarkers.filter((item) => item.group === '_timestamps')"
          :key="markerItem.id ?? `${markerItem.start}${markerItem.type}`"
          :class="[markerItem.type, markerItem.className]"
          :style="getStyle(markerItem, index)"
        >
          <slot :item="markerItem" name="marker"></slot>
        </div>

        <div
          v-for="(markerItem, index) in visibleItems.filter((item) => item.group === '_timestamps' && item.type === 'marker')"
          :key="markerItem.id ?? `${markerItem.start}${markerItem.type}`"
          :class="[markerItem.type, markerItem.className]"
          :style="getStyle(markerItem, index)"
        >
          <slot :item="markerItem" name="marker"></slot>
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

          <div :style="{ height: getGroupItemsHeight(group.id) }" class="group-items">
            <slot
              :name="`items-${group.id}`"
              :group="group"
              :itemsInViewport="visibleItems.filter((item) => item.group === group.id)"
              :viewportStart="viewportStart"
              :viewportEnd="viewportEnd"
            >
              <div
                v-for="(backgroundItem, index) in visibleItems.filter((item) => item.group === group.id && item.type !== 'background')"
                :key="backgroundItem.id ?? `${backgroundItem.start}${backgroundItem.type}${backgroundItem.end || ''}${index}`"
                :class="[
                  'item',
                  backgroundItem.type,
                  backgroundItem.className,
                  {
                    active: activeItems.includes(backgroundItem.id),
                    'has-overlap': backgroundItem.overlapCount && backgroundItem.overlapCount > 1,
                    [`overlap-index-${backgroundItem.overlapIndex}`]: backgroundItem.overlapIndex !== undefined,
                    [`overlap-count-${backgroundItem.overlapCount}`]: backgroundItem.overlapCount !== undefined
                  }
                ]"
                :style="getStyle(backgroundItem, index)"
                @click.stop="onClick($event, backgroundItem)"
                @pointermove.stop="onPointerMove($event, backgroundItem)"
                @pointerdown.stop="onPointerDown($event, backgroundItem)"
                @pointerup.stop="onPointerUp($event, backgroundItem)"
                @contextmenu.prevent.stop="onContextMenu($event, backgroundItem)"
              >
                <slot
                  :item="backgroundItem"
                  :overlapCount="backgroundItem.overlapCount"
                  :overlapIndex="backgroundItem.overlapIndex"
                  name="item"
                ></slot>
              </div>
            </slot>
          </div>
          <div
            v-for="(backgroundItem, index) in visibleItems.filter((item) => item.group === group.id && item.type === 'background')"
            :key="backgroundItem.id ?? `${backgroundItem.start}${backgroundItem.type}${backgroundItem.end || ''}`"
            :class="[
              backgroundItem.type,
              backgroundItem.className,
              {
                'has-overlap': backgroundItem.overlapCount && backgroundItem.overlapCount > 1,
                [`overlap-index-${backgroundItem.overlapIndex}`]: backgroundItem.overlapIndex !== undefined,
                [`overlap-count-${backgroundItem.overlapCount}`]: backgroundItem.overlapCount !== undefined
              }
            ]"
            :style="getStyle(backgroundItem, index)"
            @click.stop="onClick($event, backgroundItem)"
            @pointermove.stop="onPointerMove($event, backgroundItem)"
            @pointerdown.stop="onPointerDown($event, backgroundItem)"
            @pointerup.stop="onPointerUp($event, backgroundItem)"
            @contextmenu.prevent.stop="onContextMenu($event, backgroundItem)"
          >
            <slot
              :item="backgroundItem"
              :overlapCount="backgroundItem.overlapCount"
              :overlapIndex="backgroundItem.overlapIndex"
              name="background"
            ></slot>
          </div>
          <div
            v-for="(markerItem, index) in visibleMarkers.filter((item) => item.group === group.id)"
            :key="markerItem.id ?? `${markerItem.start}${markerItem.type}`"
            :class="[
              markerItem.type,
              markerItem.className,
              {
                'has-overlap': markerItem.overlapCount && markerItem.overlapCount > 1,
                [`overlap-index-${markerItem.overlapIndex}`]: markerItem.overlapIndex !== undefined,
                [`overlap-count-${markerItem.overlapCount}`]: markerItem.overlapCount !== undefined
              }
            ]"
            :style="getStyle(markerItem, index, true)"
          >
            <slot
              :item="markerItem"
              :overlapCount="markerItem.overlapCount"
              :overlapIndex="markerItem.overlapIndex"
              name="marker"
            ></slot>
          </div>
        </div>

        <div
          v-if="visibleBackgroundsWithoutGroup.length > 0"
          class="backgrounds"
        >
          <div
            v-for="(item, index) in visibleBackgroundsWithoutGroup"
            :key="item.id ?? `${item.start}${item.type}${item.end || ''}`"
            :style="getStyle(item, index)"
            :class="[
              item.type,
              item.className,
              {
                'has-overlap': item.overlapCount && item.overlapCount > 1,
                [`overlap-index-${item.overlapIndex}`]: item.overlapIndex !== undefined,
                [`overlap-count-${item.overlapCount}`]: item.overlapCount !== undefined
              }
            ]"
            @click.stop="onClick($event, item)"
            @pointermove.stop="onPointerMove($event, item)"
            @pointerdown.stop="onPointerDown($event, item)"
            @pointerup.stop="onPointerUp($event, item)"
            @contextmenu.prevent.stop="onContextMenu($event, item)"
          >
            <slot
              :item="item"
              :overlapCount="item.overlapCount"
              :overlapIndex="item.overlapIndex"
              name="background"
            ></slot>
          </div>
        </div>

        <div
          v-if="visibleMarkersWithoutGroup.length > 0"
          class="markers"
        >
          <div
            v-for="(item, index) in visibleMarkersWithoutGroup"
            :key="item.id ?? `${item.start}${item.type}`"
            :style="getStyle(item, index, true)"
            :class="[
              item.type,
              item.className,
              {
                'has-overlap': item.overlapCount && item.overlapCount > 1,
                [`overlap-index-${item.overlapIndex}`]: item.overlapIndex !== undefined,
                [`overlap-count-${item.overlapCount}`]: item.overlapCount !== undefined
              }
            ]"
          >
            <slot
              name="marker"
              :item="item"
              :overlapCount="item.overlapCount"
              :overlapIndex="item.overlapIndex"
            ></slot>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup generic="GTimelineItem extends TimelineItem, GTimelineGroup extends TimelineGroup, GTimelineMarker extends TimelineMarker">
  import { computed, CSSProperties, nextTick, onMounted, onUnmounted, ref, watch, watchEffect } from 'vue';
  import { useElementSize } from '../composables/useElementSize.ts';
  import { leadingZero } from '../helpers/leadingZero.ts';
  import type { Scale, Scales } from '../composables/useScale.ts';
  import { useScale } from '../composables/useScale.ts';
  import { startOfDay, startOfMonth, startOfYear } from 'date-fns';
  import { useElementBounding } from '@vueuse/core';
  import type { TimelineGroup, TimelineItem, TimelineMarker } from '../types/timeline.ts';
  import { getDistance } from '../helpers/getDistance.ts';
  import { useTouchEvents } from '../composables/useTouchEvents.ts';

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
    itemCompareFunction?: (a: TimelineItem, b: TimelineItem) => number;
    dynamicRowHeight?: 'viewport' | 'dataset' | 'fixed';
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
    itemCompareFunction: undefined,
    dynamicRowHeight: 'fixed',
  });

  const emit = defineEmits<{
    (e: 'pointermove', value: { time: number; event: PointerEvent, item: GTimelineItem | GTimelineMarker | null }): void;
    (e: 'pointerdown', value: { time: number; event: PointerEvent, item: GTimelineItem | GTimelineMarker | null }): void;
    (e: 'pointerup', value: { time: number; event: PointerEvent, item: GTimelineItem | GTimelineMarker | null }): void;
    (e: 'wheel', value: WheelEvent): void;
    (e: 'click', value: { time: number; event: MouseEvent, item: GTimelineItem | GTimelineMarker | null }): void;
    (e: 'contextmenu', value: { time: number; event: MouseEvent, item: GTimelineItem | GTimelineMarker | null }): void;
    (e: 'touchmove', value: { time: number; event: TouchEvent}): void;
    (e: 'touchstart', value: { time: number; event: TouchEvent}): void;
    (e: 'touchend', value: { event: TouchEvent}): void;
    (e: 'mousemoveTimeline', value: { time: number; event: MouseEvent }): void;
    (e: 'mouseleaveTimeline', value: { event: MouseEvent }): void;
    (e: 'changeViewport', value: { start: number; end: number }): void;
    (e: 'changeScale', value: Scale): void;
    (e: 'overlapChangeViewport', value: { groupId: string; oldCount: number; newCount: number }): void;
    (e: 'overlapChangeDataset', value: { groupId: string; oldCount: number; newCount: number }): void;
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

  /** The number of screen pixels per timeline ms */
  const pxPerMs = computed(() => containerWidth.value / viewportDuration.value);

  watch([viewportStart, viewportEnd], ([start, end]) => {
    emit('changeViewport', { start, end });
  });

  watchEffect(() => {
    try {
      checkValidityOfProps();
    }
    catch (e) {
      console.error(e);
    }
  });

  const { left: containerLeft } = useElementBounding(timelineEl);

  function getFirstItemOccurence () {
    return props.items?.reduce((min, item) => {
      if (item.start < min) {
        return item.start;
      }
      return min;
    }, Infinity);
  }

  function getLastItemOccurence () {
    return props.items?.reduce((max, item) => {
      if ((item.end !== undefined && item.end > max) || item.start > max) {
        return item.end ?? item.start;
      }
      return max;
    }, -Infinity);
  }

  function setInitialViewportValues () {
    setViewport(
      props.initialViewportStart ?? props.viewportMin ?? getFirstItemOccurence() ?? 0,
      props.initialViewportEnd ?? props.viewportMax ?? getLastItemOccurence() ?? 10000
    );
  }

  watch([() => props.viewportMin, () => props.viewportMax], () => {
    setViewport(viewportStart.value, viewportEnd.value);
  });

  watch([() => props.initialViewportStart, () => props.initialViewportEnd], () => {
    setViewport(props.initialViewportStart, props.initialViewportEnd);
  });

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

  function updateItemLevelHeight () {
    ITEM_LEVEL_HEIGHT.value = remToPixels(1.5);
    styleCache.clear();
    styleCacheMarkers.clear();
  }

  function handleResize () {
    updateItemLevelHeight();
  }

  onMounted(() => {
    setInitialViewportValues();
    updateItemLevelHeight();

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
    }

    nextTick(() => {
      styleCache.clear();
      styleCacheMarkers.clear();
    });
  });

  onUnmounted(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', handleResize);
    }
  });

  function getItemHeight (item: TimelineItem | TimelineMarker, forCss = false): number {
    let height = ITEM_LEVEL_HEIGHT.value;
    const maxHeight = ITEM_LEVEL_HEIGHT.value;

    if (item.cssVariables && ('--height' in item.cssVariables || '--item-level-height' in item.cssVariables)) {
      const customHeight = item.cssVariables['--height'] || item.cssVariables['--item-level-height'];

      if (customHeight) {
        if (typeof customHeight === 'string' && customHeight.endsWith('%')) {
          const percentage = parseFloat(customHeight) / 100;

          if (!isNaN(percentage)) {
            if (forCss) {
              return percentage * 100;
            }
            height = ITEM_LEVEL_HEIGHT.value * percentage;
          }
        }

        else if (typeof customHeight === 'string' && customHeight.endsWith('px')) {
          const pixels = parseFloat(customHeight);
          if (!isNaN(pixels)) {
            height = pixels;
          }
        }


        else if (typeof customHeight === 'string' && customHeight.endsWith('rem')) {
          const rems = parseFloat(customHeight);
          if (!isNaN(rems)) {
            height = remToPixels(rems);
          }
        }
      }
    }

    return Math.min(height, maxHeight);
  }

  function styleObject (item: TimelineItem) {
    const isFullHeight = item.type === 'marker' || item.type === 'background';

    return {
      '--_left': `${getLeftPos(item.start, item.end)}px`,
      ...(!isFullHeight ? { '--_top': `${getTopPos(item)}px` } : {}),
      '--_width': item.end !== undefined ? `${getItemWidth(item.start, item.end)}px` : null,
      ...item.cssVariables,
    } as CSSProperties;
  }

  function getStyle (item: TimelineItem | TimelineMarker, itemIndex: number, markers = false) {
    const cache = markers ? styleCacheMarkers : styleCache;
    const cachedValue = cache.get(item.id ?? `${item.start}${item.type}${item.end || ''}${itemIndex}`);
    if (cachedValue) {
      return cachedValue;
    }
    const value = styleObject(item);
    cache.set(item.id ?? `${item.start}${item.type}${item.end || ''}${itemIndex}`, value);
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

  function remToPixels (rem: number): number {
    try {
      if (typeof document === 'undefined' || !document.documentElement) {
        return rem * 16;
      }

      const fontSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      return rem * fontSize;
    }
    catch (e) {
      console.warn('[vue-timeline-chart] Error converting rem to pixels:', e);
      return rem * 16;
    }
  }

  const ITEM_LEVEL_HEIGHT = ref(24);

  const maxLevelByGroup = ref<Record<string, number>>({ _nogroup: 0 });
  const maxOverlapCountByGroup = ref<Record<string, number>>({ _nogroup: 0 });
  const prevViewportOverlapByGroup = ref<Record<string, number>>({ _nogroup: 0 });

  watch(() => props.groups, (groups) => {
    const newMaxLevelByGroup: Record<string, number> = { _nogroup: 0 };
    const newMaxOverlapCountByGroup: Record<string, number> = { _nogroup: 0 };
    const newPrevViewportOverlapByGroup: Record<string, number> = { _nogroup: 0 };

    for (const group of groups) {
      newMaxLevelByGroup[group.id] = 0;
      newMaxOverlapCountByGroup[group.id] = 0;
      newPrevViewportOverlapByGroup[group.id] = 0;
    }

    maxLevelByGroup.value = newMaxLevelByGroup;
    maxOverlapCountByGroup.value = newMaxOverlapCountByGroup;
    prevViewportOverlapByGroup.value = newPrevViewportOverlapByGroup;
  }, { immediate: true });

  function getGroupItemsHeight (groupId: string) {
    const maxLevel = maxLevelByGroup.value[groupId] || 0;

    let itemsToConsider: TimelineItem[];
    if (props.dynamicRowHeight === 'viewport') {
      itemsToConsider = visibleItems.value.filter(item => item.group === groupId);
    }
    else if (props.dynamicRowHeight === 'dataset') {
      itemsToConsider = props.items.filter(item => item.group === groupId);
    }
    else {
      itemsToConsider = visibleItems.value.filter(item => item.group === groupId);
    }

    const levelHeights: number[] = [];
    const itemsByLevel: Record<number, TimelineItem[]> = {};

    const sortedItems = [...itemsToConsider].sort(props.itemCompareFunction || ((a, b) => a.start - b.start));

    const occupiedPositions: { level: number; start: number; end: number }[] = [];
    const overlapGroups: Record<number, TimelineItem[]> = {};
    let maxOverlapCount = 0;

    for (const item of sortedItems) {
      const itemStart = item.start;
      const itemEnd = item.end ?? item.start;

      let level = 0;
      while (occupiedPositions.some(pos =>
        pos.level === level &&
        itemStart <= pos.end &&
        itemEnd >= pos.start
      )) {
        level++;
      }

      if (!overlapGroups[level]) {
        overlapGroups[level] = [];
      }

      item.overlapIndex = overlapGroups[level].length;
      overlapGroups[level].push(item);

      const overlapCount = overlapGroups[level].length;
      for (const groupItem of overlapGroups[level]) {
        groupItem.overlapCount = overlapCount;
      }

      maxOverlapCount = Math.max(maxOverlapCount, overlapCount);

      occupiedPositions.push({
        level,
        start: itemStart,
        end: itemEnd,
      });

      if (!itemsByLevel[level]) {
        itemsByLevel[level] = [];
      }
      itemsByLevel[level].push(item);
    }

    if (maxOverlapCountByGroup.value[groupId] !== maxOverlapCount) {
      const oldCount = maxOverlapCountByGroup.value[groupId] || 0;
      maxOverlapCountByGroup.value = {
        ...maxOverlapCountByGroup.value,
        [groupId]: maxOverlapCount,
      };

      if (props.dynamicRowHeight === 'dataset') {
        emit('overlapChangeDataset', {
          groupId,
          oldCount,
          newCount: maxOverlapCount,
        });
      }
    }

    if (props.dynamicRowHeight === 'fixed') {
      for (let level = 0; level <= maxLevel; level++) {
        const itemsAtLevel = itemsByLevel[level] || [];
        let maxHeightAtLevel = ITEM_LEVEL_HEIGHT.value;

        for (const item of itemsAtLevel) {
          const itemHeight = getItemHeight(item);
          maxHeightAtLevel = Math.max(maxHeightAtLevel, itemHeight);
        }

        levelHeights[level] = maxHeightAtLevel;
      }
    }
    else {
      for (let level = 0; level <= maxLevel; level++) {
        const itemsAtLevel = itemsByLevel[level] || [];
        let maxHeightAtLevel = ITEM_LEVEL_HEIGHT.value;

        if (itemsAtLevel.length > 0 && itemsAtLevel[0].overlapCount && itemsAtLevel[0].overlapCount > 1) {
          const overlapFactor = Math.min(itemsAtLevel[0].overlapCount, 3);
          maxHeightAtLevel = ITEM_LEVEL_HEIGHT.value * overlapFactor;
        }

        levelHeights[level] = maxHeightAtLevel;
      }
    }

    const totalHeight = levelHeights.reduce((sum, height) => sum + height, 0);

    if (props.dynamicRowHeight === 'viewport' && prevViewportOverlapByGroup.value[groupId] !== maxOverlapCount) {
      const oldCount = prevViewportOverlapByGroup.value[groupId] || 0;
      prevViewportOverlapByGroup.value = {
        ...prevViewportOverlapByGroup.value,
        [groupId]: maxOverlapCount,
      };

      emit('overlapChangeViewport', {
        groupId,
        oldCount,
        newCount: maxOverlapCount,
      });
    }

    return `${Math.max(ITEM_LEVEL_HEIGHT.value, totalHeight)}px`;
  }

  function getTopPos (item: TimelineItem | TimelineMarker) {
    let topPosition = 0;

    const isMarker = 'type' in item && item.type === 'marker';

    let itemsToCheck: (TimelineItem | TimelineMarker)[] = [];
    const groupId = item.group || '_nogroup';

    if (item.group) {
      if (isMarker) {
        itemsToCheck = visibleMarkers.value.filter(i => i.group === item.group);
      }
      else {
        itemsToCheck = visibleItems.value.filter(i => i.group === item.group);
      }
    }
    else {
      if (isMarker) {
        itemsToCheck = visibleMarkersWithoutGroup.value;
      }
      else if ('type' in item && item.type === 'background') {
        itemsToCheck = visibleBackgroundsWithoutGroup.value;
      }
    }

    if (itemsToCheck.length > 0) {
      const sortedItems = [...itemsToCheck].sort(props.itemCompareFunction || ((a, b) => a.start - b.start));

      const occupiedPositions: { level: number; start: number; end: number; height: number }[] = [];
      const levelHeights: number[] = [];
      const overlapGroups: Record<number, (TimelineItem | TimelineMarker)[]> = {};

      const currentItemIndex = sortedItems.findIndex(i => i === item);
      let currentItemHeight: number = 0;

      for (let i = 0; i < currentItemIndex; i++) {
        const otherItem = sortedItems[i];
        const otherItemStart = otherItem.start;
        const otherItemEnd = otherItem.end ?? otherItem.start;

        let otherItemHeight = ITEM_LEVEL_HEIGHT.value;

        if (otherItem.cssVariables && '--height' in otherItem.cssVariables) {
          const heightValue = otherItem.cssVariables['--height'];
          if (typeof heightValue === 'string' && heightValue.endsWith('%')) {
            otherItemHeight = ITEM_LEVEL_HEIGHT.value;
          }
          else {
            otherItemHeight = getItemHeight(otherItem);
          }
        }
        else {
          otherItemHeight = getItemHeight(otherItem);
        }

        if (!currentItemHeight) {
          currentItemHeight = otherItemHeight;
        }

        let level = 0;
        while (occupiedPositions.some(pos =>
          pos.level === level &&
          otherItemStart <= pos.end &&
          otherItemEnd >= pos.start
        )) {
          level++;
        }

        if (!overlapGroups[level]) {
          overlapGroups[level] = [];
        }

        otherItem.overlapIndex = overlapGroups[level].length;
        overlapGroups[level].push(otherItem);

        for (const groupItem of overlapGroups[level]) {
          groupItem.overlapCount = overlapGroups[level].length;
        }

        if (levelHeights[level] === undefined) {
          levelHeights[level] = otherItemHeight;
        }
        else {
          levelHeights[level] = Math.max(levelHeights[level], otherItemHeight);
        }

        occupiedPositions.push({
          level,
          start: otherItemStart,
          end: otherItemEnd,
          height: otherItemHeight,
        });
      }

      const itemStart = item.start;
      const itemEnd = item.end ?? item.start;

      let level = 0;
      while (occupiedPositions.some(pos =>
        pos.level === level &&
        itemStart <= pos.end &&
        itemEnd >= pos.start
      )) {
        level++;
      }

      if (!overlapGroups[level]) {
        overlapGroups[level] = [];
      }

      item.overlapIndex = overlapGroups[level].length;
      overlapGroups[level].push(item);

      for (const groupItem of overlapGroups[level]) {
        groupItem.overlapCount = overlapGroups[level].length;
      }

      if (level > (maxLevelByGroup.value[groupId] || 0)) {
        maxLevelByGroup.value = {
          ...maxLevelByGroup.value,
          [groupId]: level,
        };
      }

      topPosition = level * ITEM_LEVEL_HEIGHT.value;
    }

    return topPosition;
  }

  function scrollHorizontal (delta: number, event: WheelEvent | TouchEvent) {
    const deltaMs = (delta / containerWidth.value) * viewportDuration.value;
    if (delta > 0 && viewportEnd.value === props.viewportMax) {
      return;
    }
    if (delta < 0 && viewportStart.value === props.viewportMin) {
      return;
    }

    setViewport(viewportStart.value + deltaMs, viewportEnd.value + deltaMs);

    if (event.type === 'wheel') {
      onMouseMove(event as WheelEvent);
    }
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
  }

  /**
   * Set the viewport to the given start and end.
   *
   * If only one of the two is provided, the other value will stay unchanged.
   * Values are rounded to whole numbers and clamped to the viewportMin and viewportMax props.
   * The proposed duration is clamped to the minViewportDuration and maxViewportDuration props.
   * @param start - The start of the viewport in ms
   * @param end - The end of the viewport in ms
   */
  function setViewport (start?: number, end?: number) {
    if (start === undefined && end === undefined) {
      console.warn('[vue-timeline-chart] setViewport: both start and end are undefined. No viewport will be set.');
      return;
    }
    let proposedStart = start === undefined ? viewportStart.value : (props.viewportMin !== undefined ? Math.max(start, props.viewportMin) : start);
    let proposedEnd = end === undefined ? viewportEnd.value : (props.viewportMax !== undefined ? Math.min(end, props.viewportMax) : end);
    const proposedDuration = proposedEnd - proposedStart;
    if (props.minViewportDuration !== undefined && proposedDuration < props.minViewportDuration) {
      const viewportDelta = props.minViewportDuration - proposedDuration;
      proposedStart -= viewportDelta * 0.5;
      proposedEnd += viewportDelta * 0.5;
    }
    else if (props.maxViewportDuration !== undefined && proposedDuration > props.maxViewportDuration) {
      const viewportDelta = props.maxViewportDuration - proposedDuration;
      proposedStart -= viewportDelta * 0.5;
      proposedEnd += viewportDelta * 0.5;
    }
    viewportStart.value = Math.round(proposedStart);
    viewportEnd.value = Math.round(proposedEnd);
  }

  function onWheel (e: WheelEvent) {
    checkValidityOfProps();
    emit('wheel', e);

    if (e.deltaY === 0) {
      e.preventDefault();
    }

    if (e.shiftKey) {
      e.preventDefault();
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
    const clampedDeltaY = props.maxZoomSpeed ? Math.max(-props.maxZoomSpeed, Math.min(props.maxZoomSpeed, e.deltaY * (e.deltaMode === 0 ? 1 : 10))) : e.deltaY * (e.deltaMode === 0 ? 1 : 10);
    const zoomDelta = Math.round(-viewportDuration.value * 0.01 * clampedDeltaY);
    zoom(zoomDelta, mousePosXPercentage, e);
  }

  function zoom (zoomDeltaInMs: number, mousePosXPercentage = .5, event: WheelEvent) {
    if (zoomDeltaInMs > 0) {
      zoomDeltaInMs = viewportDuration.value - zoomDeltaInMs < props.minViewportDuration
        ? viewportDuration.value - props.minViewportDuration
        : zoomDeltaInMs;
    }
    else if (props.maxViewportDuration) {
      zoomDeltaInMs = viewportDuration.value - zoomDeltaInMs > props.maxViewportDuration
        ? -(props.maxViewportDuration - viewportDuration.value)
        : zoomDeltaInMs;
    }

    const viewportDeltaLeft = zoomDeltaInMs * mousePosXPercentage;
    const viewportDeltaRight = zoomDeltaInMs - viewportDeltaLeft;

    const proposedViewportStart = viewportStart.value + viewportDeltaLeft;
    const proposedViewportEnd = viewportEnd.value - viewportDeltaRight;

    if (proposedViewportStart >= proposedViewportEnd) {
      console.error('Rounding issue probably occurred while zooming.\n\nSetting different values for minViewportDuration and maxViewportDuration might help.');
      return;
    }

    setViewport(proposedViewportStart, proposedViewportEnd);

    onMouseMove(event);
  }

  /**
   * Returns the position in the timeline where the mouse, pointer or touch event occurred.
   * When multiple touchpoints are involved, the average position is returned.
   */
  function getPositionInMsOfUIEvent (event: MouseEvent | PointerEvent | TouchEvent) {
    let xPos: number;
    if ('touches' in event) {
      xPos = Array.from(event.touches).reduce((sum, touch) => sum + touch.clientX, 0) / event.touches.length;
    }
    else {
      xPos = event.clientX;
    }
    const mousePosXPercentage = (xPos - containerLeft.value) / containerWidth.value;
    return viewportStart.value + viewportDuration.value * mousePosXPercentage;
  }

  const { state: touchState, setLastTouchX, setInitialTouchList } = useTouchEvents({ viewportStart, viewportEnd });

  function onTouchMove (event: TouchEvent) {
    if (event.touches.length === 2 && touchState.initialPinchDistance !== null && touchState.initialTouchViewportStart !== null && touchState.initialTouchViewportEnd !== null) {
      const [touch1, touch2] = [...event.touches].sort((a, b) => a.clientX - b.clientX);
      const [initialTouch1, initialTouch2] = [touch1, touch2].map(t =>
        [...touchState.initialTouchList!].find(init => init.identifier === t.identifier)!
      );

      const currentPinchDistance = getDistance(touch1, touch2);
      const pinchZoomRatio = currentPinchDistance / touchState.initialPinchDistance;

      const prevCenterX = (initialTouch1.screenX + initialTouch2.screenX) / 2;
      const currCenterX = (touch1.screenX + touch2.screenX) / 2;

      const panDeltaInPx = currCenterX - prevCenterX;
      const panDeltaInMs = -panDeltaInPx / pxPerMs.value;

      const zoomAnchorX = (prevCenterX - containerLeft.value) / containerWidth.value;

      const initialDuration = touchState.initialTouchViewportEnd - touchState.initialTouchViewportStart;
      const newDuration = initialDuration / pinchZoomRatio;
      const deltaDuration = newDuration - initialDuration;

      const proposedStart = touchState.initialTouchViewportStart - deltaDuration * zoomAnchorX + panDeltaInMs;
      const proposedEnd = proposedStart + newDuration;

      setViewport(proposedStart, proposedEnd);
    }
    else if (event.touches.length === 1) {
      const [touch] = event.touches;

      if (touchState.lastTouchX === null) {
        touchState.lastTouchX = touch.clientX;
      }
      else {
        const deltaX = touchState.lastTouchX - touch.clientX;
        scrollHorizontal(deltaX, event);
        setLastTouchX(event);
      }
    }

    emit('touchmove', { time: getPositionInMsOfUIEvent(event), event });
  }

  function onTouchStart (event: TouchEvent) {
    setInitialTouchList(event);
    setLastTouchX(event);

    emit('touchstart', { time: getPositionInMsOfUIEvent(event), event });
  }

  function onTouchEnd (event: TouchEvent) {
    setLastTouchX(event);
    setInitialTouchList(event);

    emit('touchend', { event });
  }

  function onPointerDown (event: PointerEvent, item: GTimelineItem | GTimelineMarker | null = null) {
    emit('pointerdown', { time: getPositionInMsOfUIEvent(event), event, item });
  }

  function onPointerMove (event: PointerEvent, item: GTimelineItem | GTimelineMarker | null = null) {
    emit('pointermove', { time: getPositionInMsOfUIEvent(event), event, item });
  }

  function onPointerUp (event: PointerEvent, item: GTimelineItem | GTimelineMarker | null = null) {
    emit('pointerup', { time: getPositionInMsOfUIEvent(event), event, item });
  }

  function onClick (event: MouseEvent, item: GTimelineItem | GTimelineMarker | null = null) {
    emit('click', { time: getPositionInMsOfUIEvent(event), event, item });
  }

  function onContextMenu (event: MouseEvent, item: GTimelineItem | GTimelineMarker | null = null) {
    emit('contextmenu', { time: getPositionInMsOfUIEvent(event), event, item });
  }

  function onMouseMove (event: MouseEvent) {
    emit('mousemoveTimeline', { time: getPositionInMsOfUIEvent(event), event });
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
    touch-action: pan-y;
    overflow: hidden;
    position: relative;
    user-select: none;
    font-family: var(--font-family, inherit), sans-serif;
    --item-level-height: 1.5rem;

    @media print {
      color: black;
      print-color-adjust: exact;
    }
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
    translate: var(--_left) var(--_top, 0);
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
    height: var(--height, var(--item-level-height, 1.5rem));
    max-height: var(--item-level-height, 1.5rem);
    background: var(--item-background, #007bff);
    opacity: 0.7;
    bottom: auto;

    &:hover,
    &.active {
      opacity: 1;
    }

    &.point {
      --_size: var(--item-point-size, 1rem);

      height: var(--_size);
      width: var(--_size);
      border-radius: 50%;
      transform: translate(-50%, 0);
    }

    &.range {
      border-radius: var(--item-range-border-radius, 0.5em);
      height: var(--height, var(--item-level-height, 1.5rem));
      max-height: var(--item-level-height, 1.5rem); /* Enforce maximum height */
    }
  }

  .background {
    background: var(--item-background, rgba(0, 0, 0, 10%));
  }
</style>
