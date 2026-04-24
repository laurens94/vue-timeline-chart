import { bench, describe } from 'vitest';
import { ref, computed } from 'vue';
import { useScale } from './useScale.ts';
import type { TimelineScales } from '../types/timeline.ts';

const hour = 3_600_000;

function createScale(start: number, end: number, maxLabels = 10) {
  const viewportStart = ref(start);
  const viewportEnd = ref(end);
  const viewportDuration = computed(() => viewportEnd.value - viewportStart.value);
  const maxLabelsInView = ref(maxLabels);
  const scales = computed(() => []);
  const weekStartsOn = computed<0>(() => 0);

  return {
    ...useScale(viewportStart, viewportEnd, viewportDuration, maxLabelsInView, scales, weekStartsOn),
    viewportStart,
    viewportEnd,
  };
}

const benchOpts = { time: 3000, warmupTime: 500, warmupIterations: 20 };
const second = 1000;
const minute = 60 * second;

describe('useScale performance', () => {
  bench('scale selection (hours viewport)', () => {
    const { scale } = createScale(0, hour * 6);
    scale.value;
  }, benchOpts);

  bench('visibleTimestamps for 6-hour viewport', () => {
    const { visibleTimestamps } = createScale(0, hour * 6);
    visibleTimestamps.value;
  }, benchOpts);

  bench('visibleTimestamps for 1-year viewport', () => {
    const now = Date.now();
    const { visibleTimestamps } = createScale(now, now + hour * 24 * 365);
    visibleTimestamps.value;
  }, benchOpts);

  bench('visibleTimestamps for 5-second viewport (seconds scale)', () => {
    const now = Date.now();
    const { visibleTimestamps } = createScale(now, now + 5 * second);
    visibleTimestamps.value;
  }, benchOpts);

  bench('visibleTimestamps for 60-second viewport (seconds scale)', () => {
    const now = Date.now();
    const { visibleTimestamps } = createScale(now, now + minute);
    visibleTimestamps.value;
  }, benchOpts);

  bench('visibleTimestamps for 10ms viewport (ms scale)', () => {
    const now = Date.now();
    const customScales: TimelineScales[] = [{ unit: 'ms', steps: [1] }];
    const viewportStart = ref(now);
    const viewportEnd = ref(now + 10);
    const viewportDuration = computed(() => viewportEnd.value - viewportStart.value);
    const maxLabelsInView = ref(100);
    const scales = computed(() => customScales);
    const weekStartsOn = computed<0>(() => 0);
    const { visibleTimestamps } = useScale(
      viewportStart,
      viewportEnd,
      viewportDuration,
      maxLabelsInView,
      scales,
      weekStartsOn,
    );
    visibleTimestamps.value;
  }, benchOpts);

  bench('rapid viewport panning (100 shifts)', () => {
    const now = Date.now();
    const { viewportStart, viewportEnd, visibleTimestamps } = createScale(now, now + hour * 6);
    for (let i = 0; i < 100; i++) {
      viewportStart.value += hour * 0.1;
      viewportEnd.value += hour * 0.1;
      visibleTimestamps.value;
    }
  }, benchOpts);

  bench('rapid panning at seconds scale (100 shifts)', () => {
    const now = Date.now();
    const { viewportStart, viewportEnd, visibleTimestamps } = createScale(now, now + 5 * second);
    for (let i = 0; i < 100; i++) {
      viewportStart.value += 100;
      viewportEnd.value += 100;
      visibleTimestamps.value;
    }
  }, benchOpts);
});
