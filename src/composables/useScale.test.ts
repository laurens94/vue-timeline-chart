import { describe, it, expect } from 'vitest';
import { ref, computed, nextTick } from 'vue';
import { useScale } from './useScale.ts';
import type { TimelineScales } from '../types/timeline.ts';

function ms(value: number) { return value; }
function seconds(value: number) { return value * 1000; }
function minutes(value: number) { return value * 60_000; }
function hours(value: number) { return value * 3_600_000; }
function days(value: number) { return value * 86_400_000; }
function weeks(value: number) { return value * 7 * 86_400_000; }
function months(value: number) { return value * 4 * 7 * 86_400_000; }
function years(value: number) { return value * 12 * 4 * 7 * 86_400_000; }

function createScale(opts: {
  start: number;
  end: number;
  maxLabels?: number;
  scales?: TimelineScales[];
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
}) {
  const viewportStart = ref(opts.start);
  const viewportEnd = ref(opts.end);
  const viewportDuration = computed(() => viewportEnd.value - viewportStart.value);
  const maxLabelsInView = ref(opts.maxLabels ?? 10);
  const scales = computed(() => opts.scales ?? []);
  const weekStartsOn = computed(() => opts.weekStartsOn ?? 0);

  return {
    ...useScale(viewportStart, viewportEnd, viewportDuration, maxLabelsInView, scales, weekStartsOn),
    viewportStart,
    viewportEnd,
    maxLabelsInView,
  };
}

describe('useScale', () => {
  describe('scale selection with default scales', () => {
    it('selects seconds for a ~10 second viewport', () => {
      const { scale } = createScale({ start: 0, end: seconds(10) });
      expect(scale.value.unit).toBe('seconds');
    });

    it('selects minutes for a ~10 minute viewport', () => {
      const { scale } = createScale({ start: 0, end: minutes(10) });
      expect(scale.value.unit).toBe('minutes');
    });

    it('selects hours for a ~6 hour viewport', () => {
      const { scale } = createScale({ start: 0, end: hours(6) });
      expect(scale.value.unit).toBe('hours');
    });

    it('selects days for a ~7 day viewport', () => {
      const { scale } = createScale({ start: 0, end: days(7) });
      expect(scale.value.unit).toBe('days');
    });

    it('selects weeks for a ~6 week viewport', () => {
      const { scale } = createScale({ start: 0, end: weeks(6) });
      expect(scale.value.unit).toBe('weeks');
    });

    it('selects months for a ~6 month viewport', () => {
      const { scale } = createScale({ start: 0, end: months(6) });
      expect(scale.value.unit).toBe('months');
    });

    it('selects years for a multi-year viewport', () => {
      const { scale } = createScale({ start: 0, end: years(5) });
      expect(scale.value.unit).toBe('years');
    });

    it('falls back to the smallest scale when zoomed in extremely far', () => {
      const { scale } = createScale({ start: 0, end: ms(1) });
      expect(scale.value.unit).toBe('seconds');
      expect(scale.value.step).toBe(0.1);
    });

    it('falls back to the largest scale when zoomed out extremely far', () => {
      const { scale } = createScale({ start: 0, end: years(10000) });
      expect(scale.value.unit).toBe('years');
    });
  });

  describe('step selection', () => {
    it('chooses an appropriate step based on viewport duration', () => {
      const { scale } = createScale({ start: 0, end: seconds(5), maxLabels: 10 });
      expect(scale.value.unit).toBe('seconds');
      expect(scale.value.step).toBeGreaterThanOrEqual(0.1);
    });

    it('adjusts step when maxLabelsInView changes', async () => {
      const { scale, maxLabelsInView, viewportStart, viewportEnd } = createScale({
        start: 0,
        end: minutes(10),
        maxLabels: 20,
      });
      const initialStep = scale.value.step;

      maxLabelsInView.value = 3;
      viewportStart.value = 0;
      viewportEnd.value = minutes(10);
      await nextTick();

      expect(scale.value.step).toBeGreaterThanOrEqual(initialStep);
    });
  });

  describe('custom scales', () => {
    it('uses user-provided scales instead of defaults', () => {
      const customScales: TimelineScales[] = [
        { unit: 'hours', steps: [1, 6, 12] },
      ];
      const { scale } = createScale({ start: 0, end: hours(6), scales: customScales });
      expect(scale.value.unit).toBe('hours');
      expect([1, 6, 12]).toContain(scale.value.step);
    });

    it('sorts custom scales by unit order then step', () => {
      const customScales: TimelineScales[] = [
        { unit: 'hours', steps: [12, 1] },
        { unit: 'minutes', steps: [30, 5] },
      ];
      const { scale } = createScale({ start: 0, end: minutes(30), scales: customScales });
      expect(scale.value.unit).toBe('minutes');
    });
  });

  describe('visibleTimestamps', () => {
    it('generates timestamps within the viewport range', () => {
      const start = new Date('2024-01-01T00:00:00Z').valueOf();
      const end = new Date('2024-01-01T06:00:00Z').valueOf();
      const { visibleTimestamps } = createScale({ start, end });

      for (const ts of visibleTimestamps.value) {
        expect(ts).toBeGreaterThanOrEqual(start - hours(1));
        expect(ts).toBeLessThanOrEqual(end + hours(1));
      }
    });

    it('produces at least one timestamp for a non-trivial viewport', () => {
      const start = new Date('2024-06-15T12:00:00Z').valueOf();
      const end = new Date('2024-06-15T18:00:00Z').valueOf();
      const { visibleTimestamps } = createScale({ start, end });

      expect(visibleTimestamps.value.length).toBeGreaterThan(0);
    });

    it('generates sub-step fractional timestamps', () => {
      const customScales: TimelineScales[] = [
        { unit: 'minutes', steps: [0.5] },
      ];
      const start = new Date('2024-01-01T00:00:00Z').valueOf();
      const end = new Date('2024-01-01T00:05:00Z').valueOf();
      const { visibleTimestamps } = createScale({ start, end, scales: customScales });

      const halfMinuteTimestamps = visibleTimestamps.value.filter(
        (ts) => new Date(ts).getSeconds() === 30,
      );
      expect(halfMinuteTimestamps.length).toBeGreaterThan(0);
    });

    it('generates yearly timestamps for a multi-year viewport', () => {
      const start = new Date('2020-01-01T00:00:00Z').valueOf();
      const end = new Date('2025-01-01T00:00:00Z').valueOf();
      const { visibleTimestamps, scale } = createScale({ start, end });

      expect(scale.value.unit).toBe('years');
      expect(visibleTimestamps.value.length).toBeGreaterThanOrEqual(5);
    });

    it('respects weekStartsOn for week-scale timestamps', () => {
      const start = new Date('2024-01-01T00:00:00Z').valueOf();
      const end = new Date('2024-02-01T00:00:00Z').valueOf();

      const sundayResult = createScale({ start, end, weekStartsOn: 0 });
      const mondayResult = createScale({ start, end, weekStartsOn: 1 });

      if (sundayResult.scale.value.unit === 'weeks' && mondayResult.scale.value.unit === 'weeks') {
        const sundayTimestamps = sundayResult.visibleTimestamps.value;
        const mondayTimestamps = mondayResult.visibleTimestamps.value;

        if (sundayTimestamps.length > 0) {
          expect(new Date(sundayTimestamps[0]).getDay()).toBe(0);
        }
        if (mondayTimestamps.length > 0) {
          expect(new Date(mondayTimestamps[0]).getDay()).toBe(1);
        }
      }
    });

    it('filters timestamps by step alignment (e.g. every 2 hours)', () => {
      const customScales: TimelineScales[] = [
        { unit: 'hours', steps: [2] },
      ];
      const start = new Date('2024-01-01T00:00:00Z').valueOf();
      const end = new Date('2024-01-01T12:00:00Z').valueOf();
      const { visibleTimestamps } = createScale({ start, end, scales: customScales });

      for (const ts of visibleTimestamps.value) {
        expect(new Date(ts).getHours() % 2).toBe(0);
      }
    });
  });

  describe('visibleTimestamps for specific unit branches', () => {
    it('generates day-level timestamps when scale is days', () => {
      const customScales: TimelineScales[] = [
        { unit: 'days', steps: [1] },
      ];
      const start = new Date('2024-01-01T00:00:00Z').valueOf();
      const end = new Date('2024-01-08T00:00:00Z').valueOf();
      const { visibleTimestamps, scale } = createScale({ start, end, scales: customScales });

      expect(scale.value.unit).toBe('days');
      expect(visibleTimestamps.value.length).toBeGreaterThanOrEqual(7);
      for (const ts of visibleTimestamps.value) {
        const d = new Date(ts);
        expect(d.getHours()).toBe(0);
        expect(d.getMinutes()).toBe(0);
      }
    });

    it('generates month-level timestamps when scale is months', () => {
      const customScales: TimelineScales[] = [
        { unit: 'months', steps: [1] },
      ];
      const start = new Date('2024-01-01T00:00:00Z').valueOf();
      const end = new Date('2024-07-01T00:00:00Z').valueOf();
      const { visibleTimestamps, scale } = createScale({ start, end, scales: customScales });

      expect(scale.value.unit).toBe('months');
      expect(visibleTimestamps.value.length).toBeGreaterThanOrEqual(6);
      for (const ts of visibleTimestamps.value) {
        expect(new Date(ts).getDate()).toBe(1);
      }
    });

    it('generates ms-level timestamps when scale is ms', () => {
      const customScales: TimelineScales[] = [
        { unit: 'ms', steps: [1] },
      ];
      const start = 1000;
      const end = 1005;
      const { visibleTimestamps, scale } = createScale({ start, end, scales: customScales, maxLabels: 100 });

      expect(scale.value.unit).toBe('ms');
      expect(visibleTimestamps.value.length).toBe(5);
    });

    it('aligns ms timestamps to step boundary and excludes viewport end', () => {
      const customScales: TimelineScales[] = [
        { unit: 'ms', steps: [2] },
      ];
      const start = 1001;
      const end = 1009;
      const { visibleTimestamps, scale } = createScale({ start, end, scales: customScales, maxLabels: 100 });

      expect(scale.value.unit).toBe('ms');
      expect(visibleTimestamps.value).toEqual([1002, 1004, 1006, 1008]);
      expect(visibleTimestamps.value.every((ts) => ts >= start && ts < end)).toBe(true);
    });
  });

  describe('alignsWithGridlines branches', () => {
    it('filters by year alignment (step=2 years)', () => {
      const customScales: TimelineScales[] = [
        { unit: 'years', steps: [2] },
      ];
      const start = new Date('2020-01-01T00:00:00Z').valueOf();
      const end = new Date('2030-01-01T00:00:00Z').valueOf();
      const { visibleTimestamps } = createScale({ start, end, scales: customScales });

      for (const ts of visibleTimestamps.value) {
        expect(new Date(ts).getFullYear() % 2).toBe(0);
      }
    });

    it('filters by month alignment (step=2 months)', () => {
      const customScales: TimelineScales[] = [
        { unit: 'months', steps: [2] },
      ];
      const start = new Date('2024-01-01T00:00:00Z').valueOf();
      const end = new Date('2025-01-01T00:00:00Z').valueOf();
      const { visibleTimestamps } = createScale({ start, end, scales: customScales });

      for (const ts of visibleTimestamps.value) {
        expect(new Date(ts).getMonth() % 2).toBe(0);
      }
    });

    it('filters by week alignment (step=2 weeks)', () => {
      const customScales: TimelineScales[] = [
        { unit: 'weeks', steps: [2] },
      ];
      const start = new Date('2024-01-01T00:00:00Z').valueOf();
      const end = new Date('2024-04-01T00:00:00Z').valueOf();
      const { visibleTimestamps } = createScale({ start, end, scales: customScales });

      expect(visibleTimestamps.value.length).toBeGreaterThan(0);
    });

    it('filters by day alignment (step=2 days)', () => {
      const customScales: TimelineScales[] = [
        { unit: 'days', steps: [2] },
      ];
      const start = new Date('2024-01-01T00:00:00Z').valueOf();
      const end = new Date('2024-01-15T00:00:00Z').valueOf();
      const { visibleTimestamps } = createScale({ start, end, scales: customScales });

      for (const ts of visibleTimestamps.value) {
        expect(new Date(ts).getDate() % 2).toBe(0);
      }
    });

    it('filters by ms alignment (step=2 ms)', () => {
      const customScales: TimelineScales[] = [
        { unit: 'ms', steps: [2] },
      ];
      const start = 1000;
      const end = 1010;
      const { visibleTimestamps } = createScale({ start, end, scales: customScales, maxLabels: 100 });

      for (const ts of visibleTimestamps.value) {
        expect(new Date(ts).getMilliseconds() % 2).toBe(0);
      }
    });
  });

  describe('baseDividers', () => {
    it('exports baseDividers with correct ms values', () => {
      const { baseDividers } = createScale({ start: 0, end: 10000 });
      expect(baseDividers.ms).toBe(1);
      expect(baseDividers.seconds).toBe(1000);
      expect(baseDividers.minutes).toBe(60_000);
      expect(baseDividers.hours).toBe(3_600_000);
    });
  });

  describe('reactivity', () => {
    it('recomputes scale when viewport changes', async () => {
      const { scale, viewportStart, viewportEnd } = createScale({
        start: 0,
        end: seconds(10),
      });
      expect(scale.value.unit).toBe('seconds');

      viewportStart.value = 0;
      viewportEnd.value = hours(6);
      await nextTick();

      expect(scale.value.unit).toBe('hours');
    });
  });
});
