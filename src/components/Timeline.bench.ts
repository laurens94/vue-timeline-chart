import { bench, describe } from 'vitest';
import { mount } from '@vue/test-utils';
import { vi } from 'vitest';
import { nextTick } from 'vue';
import Timeline from './Timeline.vue';
import type { TimelineGroup, TimelineItem, TimelineMarker } from '../types/timeline.ts';

vi.stubGlobal('ResizeObserver', class {
  constructor(private cb: (entries: ResizeObserverEntry[]) => void) {}
  observe() {
    this.cb([{
      contentRect: { width: 1000, height: 400, x: 0, y: 0, top: 0, right: 1000, bottom: 400, left: 0, toJSON: () => ({}) },
    } as unknown as ResizeObserverEntry]);
  }
  disconnect() {}
  unobserve() {}
});

const hour = 3_600_000;
const now = Date.now();

function generateItems(count: number): TimelineItem[] {
  const items: TimelineItem[] = [];
  const groups = ['g1', 'g2', 'g3', 'g4', 'g5'];
  for (let i = 0; i < count; i++) {
    items.push({
      id: `item-${i}`,
      type: 'range',
      start: now + (i * hour * 0.1),
      end: now + (i * hour * 0.1) + hour * 0.5,
      group: groups[i % groups.length],
    });
  }
  return items;
}

function generateGroups(count: number): TimelineGroup[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `g${i + 1}`,
    label: `Group ${i + 1}`,
  }));
}

function generateMarkers(count: number): TimelineMarker[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `marker-${i}`,
    type: 'marker' as const,
    start: now + (i * hour * 0.5),
  }));
}

function mountWith(itemCount: number) {
  const items = generateItems(itemCount);
  const vpEnd = now + hour * Math.max(4, itemCount * 0.01);
  return mount(Timeline as any, {
    props: {
      groups: generateGroups(5),
      items,
      markers: generateMarkers(10),
      initialViewportStart: now,
      initialViewportEnd: vpEnd,
    },
    attachTo: document.body,
  });
}

describe('Timeline mount performance', () => {
  bench('mount with 100 items', async () => {
    const wrapper = mountWith(100);
    await nextTick();
    wrapper.unmount();
  });

  bench('mount with 1,000 items', async () => {
    const wrapper = mountWith(1_000);
    await nextTick();
    wrapper.unmount();
  });

  bench('mount with 10,000 items', async () => {
    const wrapper = mountWith(10_000);
    await nextTick();
    wrapper.unmount();
  });
});

describe('Timeline viewport panning performance', () => {
  bench('pan 50 steps with 1,000 items', async () => {
    const wrapper = mountWith(1_000);
    await nextTick();

    const vm = wrapper.vm as unknown as { setViewport: (start?: number, end?: number) => void };
    const step = hour * 0.2;
    let start = now;
    let end = now + hour * 4;

    for (let i = 0; i < 50; i++) {
      start += step;
      end += step;
      vm.setViewport(start, end);
    }
    await nextTick();
    wrapper.unmount();
  });

  bench('pan 50 steps with 10,000 items', async () => {
    const wrapper = mountWith(10_000);
    await nextTick();

    const vm = wrapper.vm as unknown as { setViewport: (start?: number, end?: number) => void };
    const step = hour * 0.2;
    let start = now;
    let end = now + hour * 4;

    for (let i = 0; i < 50; i++) {
      start += step;
      end += step;
      vm.setViewport(start, end);
    }
    await nextTick();
    wrapper.unmount();
  });
});

describe('Timeline zoom performance', () => {
  bench('zoom in/out 50 steps with 1,000 items', async () => {
    const wrapper = mountWith(1_000);
    await nextTick();

    const vm = wrapper.vm as unknown as { setViewport: (start?: number, end?: number) => void };
    let start = now;
    let end = now + hour * 4;

    for (let i = 0; i < 25; i++) {
      start += hour * 0.05;
      end -= hour * 0.05;
      vm.setViewport(start, end);
    }
    for (let i = 0; i < 25; i++) {
      start -= hour * 0.05;
      end += hour * 0.05;
      vm.setViewport(start, end);
    }
    await nextTick();
    wrapper.unmount();
  });
});
