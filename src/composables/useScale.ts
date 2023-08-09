import {
  startOfMinute,
  eachMonthOfInterval,
  eachWeekOfInterval,
  eachDayOfInterval,
  eachHourOfInterval,
  eachMinuteOfInterval,
  eachYearOfInterval,
} from 'date-fns';

import {  Ref, computed, ref, watch } from 'vue';

export const useScale = (viewportStart: Ref<number>, viewportEnd: Ref<number>, maxLabelsInView: Ref<number>) => {
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

  type scale = {
    unit: string;
    step: number;
  }

  const possibleScales = [
    {
      unit: 'seconds',
    },
    {
      unit: 'minutes',
      steps: [.25, .5, 1, 5],
    },
    {
      unit: 'hours',
      steps: [.25, .5, 1],
    },
    {
      unit: 'days',
    },
    {
      unit: 'weeks',
      step: 1,
    },
    {
      unit: 'months',
    },
    {
      unit: 'years',
    },
  ].flatMap((scale) => {
    if (scale.steps) {
      return scale.steps.map((step) => ({ unit: scale.unit, step: step }));
    }
    return { unit: scale.unit, step: scale.step ?? 1 };
  }) as scale[];

  const scale = computed(() => {
    const start = startOfMinute(viewportStart.value).valueOf();
    const end = startOfMinute(viewportEnd.value).valueOf();
    const snappedDuration = end - start;

    let [scale] = possibleScales;

    for (const [index, entry] of possibleScales.entries()) {
      const quantityWithinRange = snappedDuration / (baseDividers[entry.unit] * (entry.step ?? 1));
      if (quantityWithinRange >= 1 && quantityWithinRange <= maxLabelsInView.value) {
        scale = entry;
        break;
      }
      if (quantityWithinRange < 1) {
        scale = possibleScales[index + 1] ?? entry;
        break;
      }
    }
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
        if (timestamp.valueOf() % (scale.value.step * baseDividers[scale.value.unit]) === 0) {
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
