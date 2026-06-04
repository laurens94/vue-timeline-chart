import { describe, it, expect } from 'vitest';
import { assignLanes, isStackable, mergeStackingOptions } from './stacking.ts';
import type { TimelineItem } from '../types/timeline.ts';

function range (id: string, start: number, end: number, group = 'g'): TimelineItem {
  return { id, type: 'range', start, end, group };
}
function point (id: string, start: number, group = 'g'): TimelineItem {
  return { id, type: 'point', start, group };
}

describe('assignLanes', () => {
  it('returns empty result for no items', () => {
    const result = assignLanes([]);
    expect(result.laneCount).toBe(0);
    expect(result.laneAssignmentsByItem.size).toBe(0);
  });

  it('puts a single item in lane 0, not stacked', () => {
    const result = assignLanes([range('a', 0, 10)]);
    expect(result.laneCount).toBe(1);
    expect(result.laneAssignmentsByItem.get('a')).toEqual({ lane: 0, stackSize: 1, isStacked: false });
  });

  it('keeps sequential (non-overlapping) items with a gap in one lane', () => {
    const result = assignLanes([range('a', 0, 10), range('b', 20, 30)]);
    expect(result.laneCount).toBe(1);
    expect(result.laneAssignmentsByItem.get('a')!.lane).toBe(0);
    expect(result.laneAssignmentsByItem.get('b')!.lane).toBe(0);
    expect(result.laneAssignmentsByItem.get('b')!.isStacked).toBe(false);
  });

  it('treats touching intervals (a.end === b.start) as non-overlapping', () => {
    const result = assignLanes([range('a', 0, 10), range('b', 10, 20)]);
    expect(result.laneCount).toBe(1);
  });

  it('stacks two overlapping items into two lanes', () => {
    const result = assignLanes([range('a', 0, 10), range('b', 5, 15)]);
    expect(result.laneCount).toBe(2);
    expect(result.laneAssignmentsByItem.get('a')).toEqual({ lane: 0, stackSize: 2, isStacked: true });
    expect(result.laneAssignmentsByItem.get('b')).toEqual({ lane: 1, stackSize: 2, isStacked: true });
  });

  it('uses the minimal number of lanes for a long item over short ones', () => {
    // [0,100] overlaps both short items, but the two short ones don't overlap each other.
    const result = assignLanes([range('long', 0, 100), range('s1', 10, 20), range('s2', 30, 40)]);
    expect(result.laneCount).toBe(2);
    expect(result.laneAssignmentsByItem.get('long')!.lane).toBe(0);
    expect(result.laneAssignmentsByItem.get('s1')!.lane).toBe(1);
    expect(result.laneAssignmentsByItem.get('s2')!.lane).toBe(1);
  });

  it('reports stackSize per overlap cluster, laneCount as the global max', () => {
    // cluster 1: a,b overlap (depth 2). cluster 2: c alone (depth 1).
    const result = assignLanes([range('a', 0, 10), range('b', 5, 15), range('c', 100, 110)]);
    expect(result.laneCount).toBe(2);
    expect(result.laneAssignmentsByItem.get('a')!.stackSize).toBe(2);
    expect(result.laneAssignmentsByItem.get('b')!.stackSize).toBe(2);
    expect(result.laneAssignmentsByItem.get('c')!.stackSize).toBe(1);
    expect(result.laneAssignmentsByItem.get('c')!.lane).toBe(0);
  });

  describe('collisionWidth (minSpanMs)', () => {
    it('does not stack coincident points when minSpanMs is 0', () => {
      const result = assignLanes([point('a', 100), point('b', 100)], { minSpanMs: 0 });
      expect(result.laneCount).toBe(1);
    });

    it('stacks nearby points once given a minimum footprint', () => {
      const result = assignLanes([point('a', 100), point('b', 110)], { minSpanMs: 40 });
      // a -> [80,120], b -> [90,130] overlap
      expect(result.laneCount).toBe(2);
    });

    it('stacks narrow ranges whose content would visually clash', () => {
      const result = assignLanes([range('a', 100, 101), range('b', 105, 106)], { minSpanMs: 20 });
      // a -> [100,120], b -> [105,125] overlap
      expect(result.laneCount).toBe(2);
    });

    it('stacks a point sitting inside a range', () => {
      const result = assignLanes([range('r', 0, 100), point('p', 50)], { minSpanMs: 0 });
      expect(result.laneCount).toBe(2);
    });
  });

  describe('compare', () => {
    it('uses start order by default (earlier start gets the lower lane)', () => {
      const result = assignLanes([range('late', 10, 30), range('early', 0, 20)]);
      expect(result.laneAssignmentsByItem.get('early')!.lane).toBe(0);
      expect(result.laneAssignmentsByItem.get('late')!.lane).toBe(1);
    });

    it('lets a custom compare decide which overlapping item gets lane 0', () => {
      const priority: Record<string, number> = { late: 0, early: 1 };
      const result = assignLanes(
        [range('late', 10, 30), range('early', 0, 20)],
        { compare: (a, b) => priority[a.id] - priority[b.id] },
      );
      expect(result.laneAssignmentsByItem.get('late')!.lane).toBe(0);
      expect(result.laneAssignmentsByItem.get('early')!.lane).toBe(1);
    });
  });

  describe('maxLanes', () => {
    it('is unlimited by default (one lane per overlapping item)', () => {
      const result = assignLanes([range('a', 0, 10), range('b', 1, 11), range('c', 2, 12)]);
      expect(result.laneCount).toBe(3);
    });

    it('caps the number of lanes', () => {
      const items = [range('a', 0, 10), range('b', 1, 11), range('c', 2, 12), range('d', 3, 13)];
      const result = assignLanes(items, { maxLanes: 2 });
      expect(result.laneCount).toBe(2);
      for (const id of ['a', 'b', 'c', 'd']) {
        expect(result.laneAssignmentsByItem.get(id)!.lane).toBeLessThan(2);
      }
    });

    it('overflows into the lane that frees up earliest', () => {
      // a -> lane 0 (ends 10), b -> lane 1 (ends 20). c overlaps both; with the
      // cap of 2 reached it joins lane 0, which frees sooner than lane 1.
      const result = assignLanes(
        [range('a', 0, 10), range('b', 1, 20), range('c', 2, 5)],
        { maxLanes: 2 },
      );
      expect(result.laneAssignmentsByItem.get('a')!.lane).toBe(0);
      expect(result.laneAssignmentsByItem.get('b')!.lane).toBe(1);
      expect(result.laneAssignmentsByItem.get('c')!.lane).toBe(0);
      expect(result.laneCount).toBe(2);
      // a, b and c all overlap, but with the cap reached stackSize reports the
      // capped lane count (2), not the true overlap depth (3).
      expect(result.laneAssignmentsByItem.get('a')!.stackSize).toBe(2);
      expect(result.laneAssignmentsByItem.get('c')!.stackSize).toBe(2);
      expect(result.laneAssignmentsByItem.get('c')!.isStacked).toBe(true);
    });

    it('still packs non-overlapping items below the cap', () => {
      const result = assignLanes([range('a', 0, 10), range('b', 5, 15)], { maxLanes: 5 });
      expect(result.laneCount).toBe(2);
    });

    it('collapses everything into one lane when maxLanes is 1', () => {
      const result = assignLanes([range('a', 0, 10), range('b', 1, 11), range('c', 2, 12)], { maxLanes: 1 });
      expect(result.laneCount).toBe(1);
      expect(result.laneAssignmentsByItem.get('c')!.lane).toBe(0);
    });

    it('clamps a maxLanes below 1 up to a single lane', () => {
      const items = [range('a', 0, 10), range('b', 1, 11)];
      expect(assignLanes(items, { maxLanes: 0 }).laneCount).toBe(1);
      expect(assignLanes(items, { maxLanes: -5 }).laneCount).toBe(1);
    });
  });
});

describe('isStackable', () => {
  it('is true for ranges and points, false for backgrounds and markers', () => {
    expect(isStackable(range('r', 0, 10))).toBe(true);
    expect(isStackable(point('p', 0))).toBe(true);
    expect(isStackable({ id: 'bg', type: 'background', start: 0, end: 10, group: 'g' })).toBe(false);
    expect(isStackable({ id: 'm', type: 'marker', start: 0, group: 'g' })).toBe(false);
  });
});

describe('mergeStackingOptions', () => {
  it('returns defaults when nothing is provided', () => {
    expect(mergeStackingOptions(undefined, undefined)).toEqual({
      enabled: false,
      strategy: 'dataset',
      collisionWidth: 0,
      compare: undefined,
      maxLanes: 5,
    });
  });

  it('applies component-level options over defaults', () => {
    const resolved = mergeStackingOptions({ enabled: true, collisionWidth: 16 }, undefined);
    expect(resolved.enabled).toBe(true);
    expect(resolved.collisionWidth).toBe(16);
    expect(resolved.strategy).toBe('dataset');
  });

  it('lets a group override a single knob while inheriting the rest', () => {
    const resolved = mergeStackingOptions(
      { enabled: true, collisionWidth: 16 },
      { strategy: 'viewport' },
    );
    expect(resolved.enabled).toBe(true);       // inherited
    expect(resolved.collisionWidth).toBe(16);  // inherited
    expect(resolved.strategy).toBe('viewport'); // overridden
  });

  it('lets a group opt out', () => {
    const resolved = mergeStackingOptions({ enabled: true }, { enabled: false });
    expect(resolved.enabled).toBe(false);
  });
});
