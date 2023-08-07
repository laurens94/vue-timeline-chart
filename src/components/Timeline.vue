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
          :style="{ left: `${getLeftPos(item.start)}px`, width: `${getWidth(item.start, item.end)}px` }"
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

  const props = defineProps<{
    groups: TimelineGroup[];
    items?: TimelineItem[];
    viewportMin?: number;
    viewportMax?: number;
  }>();

  const viewportStart = ref(1691089380000);
  const viewportEnd = ref(1691101020000);

  const rootEl = ref<HTMLElement | null>(null);

  const { width: containerWidth } = useElementSize(rootEl);

  const visibleTimestamps = computed (() => {
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  });

  function getLeftPos (ts: number) {
    const total = viewportEnd.value - viewportStart.value;
    const pos = ts - viewportStart.value;
    return (pos / total) * containerWidth.value;
  }
  function getWidth (start: number, end?: number) {
    const total = viewportEnd.value - viewportStart.value;
    const pos = end - start;
    return (pos / total) * containerWidth.value;
  }

  const maxZoom = 1000 * 60;

  function scrollHorizontal (delta: number) {
    const total = viewportEnd.value - viewportStart.value;
    const deltaMs = (delta / containerWidth.value) * total;
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

    // TODO: fix zooming too quickly which causes the start and end to be the same:
    const total = viewportEnd.value - viewportStart.value;
    if (Math.abs(total) < maxZoom && e.deltaY < 0) {
      viewportEnd.value = viewportEnd.value + 1000;
      return;
    }
    const zoomDelta = -total * 0.01 * (e.deltaMode === 1 ? e.deltaY * 10 : e.deltaY);
    zoom(zoomDelta, mousePosXPercentage);
  }

  function zoom (zoomDeltaInMs: number, mousePosXPercentage = .5) {
    // mousePosXPercentage of 0.5 means the zoomDeltaInMs is equally distributed between viewportStart and viewportEnd
    const viewportDeltaLeft = zoomDeltaInMs * mousePosXPercentage;
    const viewportDeltaRight = zoomDeltaInMs - viewportDeltaLeft;
    viewportStart.value = Math.round(props.viewportMin ? Math.max(viewportStart.value + viewportDeltaLeft, props.viewportMin) : viewportStart.value + viewportDeltaLeft);
    viewportEnd.value = Math.round(props.viewportMax ? Math.min(viewportEnd.value - viewportDeltaRight, props.viewportMax) : viewportEnd.value - viewportDeltaRight);
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
