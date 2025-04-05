import {
  eachMonthOfInterval,
  eachWeekOfInterval,
  eachDayOfInterval,
  eachHourOfInterval,
  eachMinuteOfInterval,
  eachYearOfInterval,
  getWeek,
} from 'date-fns';

import {  ComputedRef, Ref, computed, ref, watch } from 'vue';

// Order of units is important for sorting:
const baseDividers = {
  ms: 1,
  seconds: 1000,
  minutes: 1000 * 60,
  hours: 1000 * 60 * 60,
  days: 1000 * 60 * 60 * 24,
  weeks: 1000 * 60 * 60 * 24 * 7,
  months: 1000 * 60 * 60 * 24 * 7 * 4,
  years: 1000 * 60 * 60 * 24 * 7 * 4 * 12,
};

export type Scale = {
  unit: keyof typeof baseDividers;
  step: number;
}

export type Scales = {
  unit: keyof typeof baseDividers;
  steps: number[];
}

const getUnitIndex = (unit: keyof typeof baseDividers): number => {
  return Object.keys(baseDividers).indexOf(unit);
};

/**
 * The scales define the temporal units and their regularity.
 */
export const useScale = (viewportStart: Ref<number>, viewportEnd: Ref<number>, viewportDuration: Ref<number>, maxLabelsInView: Ref<number>, scales: ComputedRef<Scales[]>, weekStartsOn: ComputedRef<0 | 1 | 2 | 3 | 4 | 5 | 6>) => {
  // cached values:
  const _viewportDuration = ref(viewportDuration.value);
  const _maxLabelsInView = ref(maxLabelsInView.value);

  const possibleScales = computed(() => (scales.value?.length ? scales.value : [
    // #region default-scales
    {
      // every 100ms, 1 second or 10 seconds
      // NOTE: .1 seconds is used here instead of 100ms, so the first ms that would align with the gridline
      // (that provides the label) is shown when only the next occuring ms are within the viewport
      unit: 'seconds',
      steps: [.1, 1, 10],
    },
    {
      // every 15 seconds, 30 seconds, 1 minute, 5 minutes, etc.
      unit: 'minutes',
      steps: [.25, .5, 1, 5, 10],
    },
    {
      // every 15 minutes, 30 minutes, 1 hour, 2 hours
      unit: 'hours',
      steps: [.25, .5, 1, 2],
    },
    {
      // every day
      unit: 'days',
      steps: [1],
    },
    {
      // every week
      unit: 'weeks',
      steps: [1],
    },
    {
      // every month, every other month
      unit: 'months',
      steps: [1, 2],
    },
    {
      // every year, 5 years, 10 years, etc.
      unit: 'years',
      steps: [1, 5, 10, 25, 50, 100, 250, 500, 1000],
    },
    // #endregion default-scales
  ] as const).toSorted((a, b) => getUnitIndex(a.unit) - getUnitIndex(b.unit)).flatMap((scale) => {
    return scale.steps.toSorted((a, b) => a - b).map((step) => ({ unit: scale.unit, step: step }));
  }) as Scale[]);

  watch (viewportDuration, () => {
    _viewportDuration.value = viewportDuration.value;
  });

  watch (maxLabelsInView, () => {
    _maxLabelsInView.value = maxLabelsInView.value;
  });

  const scale = computed(() => {
    let [scale] = possibleScales.value;

    for (const [index, entry] of possibleScales.value.entries()) {
      const quantityWithinRange = _viewportDuration.value / (baseDividers[entry.unit] * (entry.step ?? 1));
      // console.debug(entry.unit, quantityWithinRange);
      if (quantityWithinRange >= 1 && quantityWithinRange <= _maxLabelsInView.value) {
        scale = entry;
        break;
      }
      if (quantityWithinRange < 1) {
        scale = possibleScales.value[index - 1] ?? entry;
        break;
      }
      if (quantityWithinRange >= 1 && index === possibleScales.value.length - 1) {
        scale = entry;
      }
    }

    // console.debug(scale.unit, scale.step);

    return {
      unit: scale.unit,
      step: scale.step ?? 1,
    };
  });

  /**
   * Checks if a specific moment falls on a step interval of the current scale.
   * @param instant - The Date instance to check.
   * @returns `true` if the instant falls on a step interval.
   */
  function alignsWithGridlines (instant: Date): boolean {
    switch (scale.value.unit) {
      case 'years': return instant.getFullYear() % scale.value.step === 0;
      case 'months': return instant.getMonth() % scale.value.step === 0;
      case 'weeks': return getWeek(instant, { weekStartsOn: weekStartsOn.value }) % scale.value.step === 0;
      case 'days': return instant.getDate() % scale.value.step === 0;
      case 'hours': return instant.getHours() % scale.value.step === 0;
      case 'minutes': return instant.getMinutes() % scale.value.step === 0;
      case 'seconds': return instant.getSeconds() % scale.value.step === 0;
      case 'ms': return instant.getMilliseconds() % scale.value.step === 0;
    }
  }

  const visibleTimestamps = computed(() => {
    const timestamps: number[] = [];
    const start = viewportStart.value;
    const end = viewportEnd.value;

    let baseTimestamps = [] as Date[];
    switch (scale.value.unit) {
      case 'ms':
        baseTimestamps = Array.from({ length: end - start }, (_, i) => new Date(start + i));
        break;
      case 'seconds':
        baseTimestamps = eachMinuteOfInterval({ start, end }).flatMap((minute) => {
          const secondsInMinute = [] as Date[];
          for (let i = 0; i < 60; i++) {
            secondsInMinute.push(new Date(minute.valueOf() + i * baseDividers.seconds));
          }
          return secondsInMinute;
        });
        break;
      case 'minutes':
        baseTimestamps = eachMinuteOfInterval({ start, end });
        break;
      case 'hours':
        baseTimestamps = eachHourOfInterval({ start, end });
        break;
      case 'days':
        baseTimestamps = eachDayOfInterval({ start, end });
        break;
      case 'weeks':
        baseTimestamps = eachWeekOfInterval({ start, end }, { weekStartsOn: weekStartsOn.value });
        break;
      case 'months':
        baseTimestamps = eachMonthOfInterval({ start, end });
        break;
      case 'years':
        baseTimestamps = eachYearOfInterval({ start, end });
        break;
    }

    for (const timestamp of baseTimestamps) {
      if (scale.value.step > 1 && !alignsWithGridlines(timestamp)) {
        continue;
      }

      timestamps.push(timestamp.valueOf());

      if (scale.value.step < 1) {
        // Also add the fractions within this unit:
        for (let i = 1; i < 1 / scale.value.step; i++) {
          timestamps.push(timestamp.valueOf() + i * scale.value.step * baseDividers[scale.value.unit]);
        }
      }
    }

    return timestamps;
  });

  return {
    scale,
    baseDividers,
    visibleTimestamps,
  };
};
