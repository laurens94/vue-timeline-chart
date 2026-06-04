import { bench, describe } from 'vitest';
import { assignLanes } from './stacking.ts';
import type { TimelineItem } from '../types/timeline.ts';

const benchOpts = { time: 3000, warmupTime: 500, warmupIterations: 20 };

function makeItems (count: number, maxOverlap: number): TimelineItem[] {
  const items: TimelineItem[] = [];
  for (let i = 0; i < count; i++) {
    const start = i * 100;
    items.push({ id: `i${i}`, type: 'range', start, end: start + 100 * maxOverlap, group: 'g' });
  }
  return items;
}

describe('assignLanes performance', () => {
  bench('1000 items, shallow overlap', () => {
    assignLanes(makeItems(1000, 2));
  }, benchOpts);

  bench('1000 items, deep overlap', () => {
    assignLanes(makeItems(1000, 20));
  }, benchOpts);

  bench('5000 items, shallow overlap', () => {
    assignLanes(makeItems(5000, 2));
  }, benchOpts);
});
