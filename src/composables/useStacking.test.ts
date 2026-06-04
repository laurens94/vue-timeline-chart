import { describe, it, expect } from 'vitest';
import { ref } from 'vue';
import { useStacking } from './useStacking.ts';
import type { TimelineGroup, TimelineItem, TimelineStackingOptions } from '../types/timeline.ts';

// A cached computed returns the same object instance; a recompute returns a new
// one. So `stackingByGroup.value` identity tells us whether a change to one of
// the sources actually triggered recomputation.
function setup (stacking: TimelineStackingOptions) {
  const groups = ref<TimelineGroup[]>([{ id: 'g1', label: 'G1' }]);
  const items = ref<TimelineItem[]>([
    { id: 'a', type: 'range', start: 0, end: 100, group: 'g1' },
    { id: 'b', type: 'range', start: 50, end: 150, group: 'g1' },
  ]);
  const visibleItems = ref<TimelineItem[]>([...items.value]);
  const stackingRef = ref<TimelineStackingOptions | undefined>(stacking);
  const pxPerMs = ref(0.01);
  const composable = useStacking({ groups, items, visibleItems, stacking: stackingRef, pxPerMs });
  return { groups, items, visibleItems, stacking: stackingRef, pxPerMs, ...composable };
}

describe('useStacking recomputation', () => {
  it('does not recompute a dataset group when visibleItems changes', () => {
    const { stackingByGroup, visibleItems } = setup({ enabled: true });
    const first = stackingByGroup.value;
    visibleItems.value = [...visibleItems.value]; // new array, same content
    expect(stackingByGroup.value).toBe(first);
  });

  it('does not recompute when pxPerMs changes and no group uses collisionWidth', () => {
    const { stackingByGroup, pxPerMs } = setup({ enabled: true }); // collisionWidth defaults to 0
    const first = stackingByGroup.value;
    pxPerMs.value *= 2;
    expect(stackingByGroup.value).toBe(first);
  });

  it('recomputes when pxPerMs changes for a collisionWidth group', () => {
    const { stackingByGroup, pxPerMs } = setup({ enabled: true, collisionWidth: 16 });
    const first = stackingByGroup.value;
    pxPerMs.value *= 2;
    expect(stackingByGroup.value).not.toBe(first);
  });

  it('recomputes a viewport group when visibleItems changes', () => {
    const { stackingByGroup, visibleItems } = setup({ enabled: true, strategy: 'viewport' });
    const first = stackingByGroup.value;
    visibleItems.value = [...visibleItems.value];
    expect(stackingByGroup.value).not.toBe(first);
  });

  it('recomputes when the item set changes', () => {
    const { stackingByGroup, items } = setup({ enabled: true });
    const first = stackingByGroup.value;
    items.value = [...items.value, { id: 'c', type: 'range', start: 200, end: 300, group: 'g1' }];
    expect(stackingByGroup.value).not.toBe(first);
  });
});
