import {
  eachMonthOfInterval,
  eachWeekOfInterval,
  eachDayOfInterval,
  eachHourOfInterval,
  eachMinuteOfInterval,
  eachYearOfInterval,
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

export const useScale = (viewportStart: Ref<number>, viewportEnd: Ref<number>, viewportDuration: Ref<number>, maxLabelsInView: Ref<number>, scales: ComputedRef<Scales[]>) => {
  // cached values:
  const _viewportDuration = ref(viewportDuration.value);
  const _maxLabelsInView = ref(maxLabelsInView.value);

  const possibleScales = computed(() => (scales.value?.length ? scales.value : [
    // #region default-scales
    {
      // every 1 second or 10 seconds
      unit: 'seconds',
      steps: [1, 10],
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
      // every 7 days, every month, every other month
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

  const visibleTimestamps = computed(() => {
    const timestamps: number[] = [];
    const start = viewportStart.value;
    const end = viewportEnd.value;

    let baseTimestamps = [] as Date[];
    switch (scale.value.unit) {
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
        baseTimestamps = eachWeekOfInterval({ start, end });
        break;
      case 'months':
        baseTimestamps = eachMonthOfInterval({ start, end });
        break;
      case 'years':
        baseTimestamps = eachYearOfInterval({ start, end });
        break;
    }

    for (const timestamp of baseTimestamps) {
      if (scale.value.step && scale.value.step > 1) {
        if (scale.value.unit === 'years' && timestamp.getFullYear() % scale.value.step === 0) {
          timestamps.push(timestamp.valueOf());
        }
        else if (scale.value.unit === 'months' && timestamp.getMonth() % scale.value.step === 0) {
          timestamps.push(timestamp.valueOf());
        }
        else if (scale.value.unit === 'days' && timestamp.getDate() % scale.value.step === 0) {
          timestamps.push(timestamp.valueOf());
        }
        else if (timestamp.valueOf() % (scale.value.step * baseDividers[scale.value.unit]) === 0) {
          timestamps.push(timestamp.valueOf());
        }
      }
      else {
        timestamps.push(timestamp.valueOf());
      }

      if (scale.value.step && scale.value.step < 1) {
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
