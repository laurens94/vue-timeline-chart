import { computed, shallowRef, toValue, watch, type CSSProperties, type MaybeRefOrGetter } from 'vue';
import type { TimelineGroup, TimelineItem, TimelineStackingOptions } from '../types/timeline.ts';
import { assignLanes, isStackable, mergeStackingOptions, type GroupStackingResult } from '../helpers/stacking.ts';

type LaneCounts = Record<TimelineGroup['id'], { laneCount: number }>;

/** Whether two lane-count summaries hold the same count for the same groups. */
function sameLaneCounts (a: LaneCounts, b: LaneCounts) {
  const ids = Object.keys(a);
  return ids.length === Object.keys(b).length && ids.every((id) => a[id]?.laneCount === b[id]?.laneCount);
}

export function useStacking (sources: {
  groups: MaybeRefOrGetter<TimelineGroup[]>;
  items: MaybeRefOrGetter<TimelineItem[]>;
  visibleItems: MaybeRefOrGetter<TimelineItem[]>;
  stacking: MaybeRefOrGetter<TimelineStackingOptions | undefined>;
  pxPerMs: MaybeRefOrGetter<number>;
}) {
  /** Stacking results per group. */
  const stackingByGroup = computed(() => {
    const map = new Map<TimelineGroup['id'], GroupStackingResult>();
    const componentStackingOptions = toValue(sources.stacking);

    for (const group of toValue(sources.groups)) {
      const options = mergeStackingOptions(componentStackingOptions, group.stacking);
      if (!options.enabled) {
        continue;
      }
      const items = toValue(options.strategy === 'viewport' ? sources.visibleItems : sources.items);
      const stackableItemsInGroup = items.filter((item) => item.group === group.id && isStackable(item));
      let minSpanMs = 0;
      if (options.collisionWidth > 0) {
        const pxPerMs = toValue(sources.pxPerMs);
        if (pxPerMs > 0) {
          minSpanMs = options.collisionWidth / pxPerMs;
        }
      }
      map.set(group.id, assignLanes(stackableItemsInGroup, {
        compare: options.compare,
        minSpanMs,
        maxLanes: options.maxLanes,
      }));
    }
    return map;
  });

  /** The per-group lane counts, republished only when a count actually changes. */
  const laneCountsByGroup = shallowRef<LaneCounts>({});
  watch(stackingByGroup, (groups) => {
    const counts: LaneCounts = {};
    for (const [groupId, { laneCount }] of groups) {
      counts[groupId] = { laneCount };
    }
    if (!sameLaneCounts(laneCountsByGroup.value, counts)) {
      laneCountsByGroup.value = counts;
    }
  }, { immediate: true });

  const groupStyles = computed(() => {
    const styles = new Map<TimelineGroup['id'], CSSProperties>();
    for (const group of toValue(sources.groups)) {
      const laneCount = stackingByGroup.value.get(group.id)?.laneCount ?? 0;
      styles.set(group.id, {
        ...group.cssVariables,
        ...(laneCount > 0 ? { '--_lane-count': laneCount } : {}),
      });
    }
    return styles;
  });

  return { stackingByGroup, laneCountsByGroup, groupStyles };
}
