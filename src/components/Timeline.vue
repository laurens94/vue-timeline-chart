<template>
  <div
    ref="rootEl"
    class="timeline-wrapper"
    @wheel="onWheel"
  >
    <!-- <div class="timestamps">
      <div
        v-for="timestamp in visibleTimestamps"
        :key="timestamp"
        class="timestamp"
        :style="{ left: `${timestamp * hourWidth}px` }"
      >
        {{ timestamp }}
      </div>
    </div> -->

    <div
      v-for="group in groups"
      :key="group.id"
      class="group"
    >
      <div class="group-label">
        {{ group.content }}
      </div>

      <div class="group-items">
        <div
          v-for="(item, index) in items?.filter((i) => i.group === group.id)"
          :key="index"
          :style="{ left: `${getLeftPos(item.start)}px`, width: `${getItemWidth(item.start, item.end)}px` }"
          :class="['item', item.type, item.className]"
        >
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed, ref } from 'vue';
  import { useElementSize } from '../composables/useElementSize';

  export interface Props {
    groups: TimelineGroup[];
    items: TimelineItem[];
    viewportMin?: number;
    viewportMax?: number;
    minViewportDuration?: number;
    maxViewportDuration?: number;
  }

  const props = withDefaults(defineProps<Props>(), {
    viewportMin: undefined,
    viewportMax: undefined,
    minViewportDuration: 60,
    maxViewportDuration: 60 * 60 * 24 * 7 * 4 * 3,
  });

  const rootEl = ref<HTMLElement | null>(null);
  const { width: containerWidth } = useElementSize(rootEl);

  const viewportStart = ref(1691089380);
  const viewportEnd = ref(1691101020);
  const viewportDuration = computed(() => viewportEnd.value - viewportStart.value);

  const visibleTimestamps = computed (() => {
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  });

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

    const mousePosXPercentage = (e.clientX - rootEl.value!.getBoundingClientRect().left) / containerWidth.value;
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
  }
</script>

<style lang="scss">
.timeline-wrapper {
  background-color: rgb(224, 224, 224);
  border: 1px solid orange;
  overflow: hidden;
}

.timestamps {
  position: relative;

  .timestamp {
    position: absolute;
  }
}

.group-items {
  position: relative;
  background: rgba(255,255,255,.5);
  height: 40px;

  .item {
    position: absolute;
    height: 100%;
    background-color: red;

    &.point {
      border-radius: 50%;
      height: 1rem;
      width: 1rem;
      top: 50%;
      transform: translate(-50%, -50%);
    }

    &.range {
      border-radius: 5px;
    }

    &.background {
      background-color: rgba(0,0,0,.1);
    }
  }
}
</style>
