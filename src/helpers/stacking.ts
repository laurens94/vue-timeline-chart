import type { TimelineItem, TimelineStackingOptions } from '../types/timeline.ts';

/** A single group's stacking options after defaults are applied. */
export interface EffectiveStackingOptions {
  enabled: boolean;
  strategy: TimelineStackingOptions['strategy'];
  compare?: (a: TimelineItem, b: TimelineItem) => number;
  collisionWidth: number;
  maxLanes: number;
}

/** Stacking information for a single item in a group. */
export interface LaneAssignment {
  /** 0-based lane (vertical position) within the group. */
  lane: number;
  /** Number of lanes in this item's overlap cluster. */
  stackSize: number;
  /** Whether this item shares its cluster with at least one other lane. */
  isStacked: boolean;
}

/** Stacking information for a group. */
export interface GroupStackingResult {
  /** Stacking information for each item in the group. */
  laneAssignmentsByItem: Map<TimelineItem['id'], LaneAssignment>;
  /** Number of lanes used by the group (drives the group height). */
  laneCount: number;
}

/** Default stacking options. */
const DEFAULT_STACKING: EffectiveStackingOptions = {
  enabled: false,
  strategy: 'dataset',
  compare: undefined,
  collisionWidth: 0,
  maxLanes: 5,
};

/** Merge component options, group options and defaults. */
export function mergeStackingOptions (
  componentOptions: TimelineStackingOptions | undefined,
  groupOptions: TimelineStackingOptions | undefined,
): EffectiveStackingOptions {
  return { ...DEFAULT_STACKING, ...componentOptions, ...groupOptions };
}

/** Whether an item is stackable. */
export function isStackable (item: TimelineItem): boolean {
  return item.type === 'range' || item.type === 'point';
}

/** The item's effective collision span in ms (at least `minSpanMs` wide). */
function effectiveItemSpan (item: TimelineItem, minSpanMs: number) {
  if (item.type === 'point') {
    return { start: item.start - minSpanMs / 2, end: item.start + minSpanMs / 2 };
  }
  const end = item.end ?? item.start;
  return { start: item.start, end: Math.max(end, item.start + minSpanMs) };
}

/**
 * Greedy first-fit lane assignment in processing order (start time, or `compare`).
 * Half-open `[start, end)` spans are widened to at least `minSpanMs`. When
 * `maxLanes` is full and no lane fits, the item goes in the lane that frees up earliest.
 */
export function assignLanes (
  items: TimelineItem[],
  options: { compare?: (a: TimelineItem, b: TimelineItem) => number; minSpanMs?: number; maxLanes?: number } = {},
): GroupStackingResult {
  const minSpanMs = options.minSpanMs ?? 0;
  const maxLanes = Math.max(1, Math.floor(options.maxLanes ?? Infinity));

  const intervals = items.map((item) => ({
    item,
    ...effectiveItemSpan(item, minSpanMs),
    lane: 0,
  }));

  // Processing order: custom compare, or ascending effective start.
  intervals.sort((a, b) => (options.compare ? options.compare(a.item, b.item) : a.start - b.start));

  /** Greedy first-fit. laneEnds[i] holds the end of the last item placed in lane i. */
  const laneEnds: number[] = [];
  for (const entry of intervals) {
    let placed = false;
    for (let lane = 0; lane < laneEnds.length; lane++) {
      if (laneEnds[lane] <= entry.start) {
        laneEnds[lane] = entry.end;
        entry.lane = lane;
        placed = true;
        break;
      }
    }
    if (placed) {
      continue;
    }
    const nextLane = laneEnds.length;
    if (nextLane < maxLanes) {
      entry.lane = nextLane;
      laneEnds.push(entry.end);
    }
    else {
      // At the lane cap and no free lane: overlap into the lane that frees up
      // earliest, keeping the forced overlap as small as possible.
      let earliestFreeLane = 0;
      for (let lane = 1; lane < laneEnds.length; lane++) {
        if (laneEnds[lane] < laneEnds[earliestFreeLane]) {
          earliestFreeLane = lane;
        }
      }
      entry.lane = earliestFreeLane;
      laneEnds[earliestFreeLane] = Math.max(laneEnds[earliestFreeLane], entry.end);
    }
  }

  // Group items into clusters of overlapping items; each item's `stackSize` is its
  // lane count. In start order, a cluster ends when an item starts at/after `clusterMaxEnd`
  const sortedIntervals = intervals.toSorted((a, b) => a.start - b.start);
  const laneAssignmentsByItem = new Map<TimelineItem['id'], LaneAssignment>();
  let cluster: typeof intervals = [];
  let clusterMaxEnd = -Infinity;
  /** The highest lane index used in the cluster so far */
  let clusterMaxLane = 0;

  const commitCluster = () => {
    const stackSize = clusterMaxLane + 1;
    for (const entry of cluster) {
      laneAssignmentsByItem.set(entry.item.id, { lane: entry.lane, stackSize, isStacked: stackSize > 1 });
    }
    cluster = [];
    clusterMaxEnd = -Infinity;
    clusterMaxLane = 0;
  };

  for (const entry of sortedIntervals) {
    if (cluster.length && entry.start >= clusterMaxEnd) {
      commitCluster();
    }
    cluster.push(entry);
    clusterMaxEnd = Math.max(clusterMaxEnd, entry.end);
    clusterMaxLane = Math.max(clusterMaxLane, entry.lane);
  }
  if (cluster.length) {
    commitCluster();
  }

  return { laneAssignmentsByItem, laneCount: laneEnds.length };
}
