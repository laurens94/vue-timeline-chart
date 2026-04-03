import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick, h } from 'vue';
import Timeline from './Timeline.vue';
import type { TimelineGroup, TimelineItem, TimelineMarker } from '../types/timeline.ts';

// Mock ResizeObserver for happy-dom
let resizeCallback: ((entries: ResizeObserverEntry[]) => void) | null = null;

beforeEach(() => {
  resizeCallback = null;
  vi.stubGlobal('ResizeObserver', class {
    constructor(callback: (entries: ResizeObserverEntry[]) => void) {
      resizeCallback = callback;
    }
    observe() {
      resizeCallback?.([{
        contentRect: { width: 1000, height: 400, x: 0, y: 0, top: 0, right: 1000, bottom: 400, left: 0, toJSON: () => ({}) },
      } as unknown as ResizeObserverEntry]);
    }
    disconnect() {}
    unobserve() {}
  });
});

const baseGroups: TimelineGroup[] = [
  { id: 'group-1', label: 'Group 1' },
  { id: 'group-2', label: 'Group 2' },
];

const now = new Date('2024-06-15T12:00:00Z').valueOf();
const hour = 3_600_000;

const baseItems: TimelineItem[] = [
  { id: 'range-1', type: 'range', start: now, end: now + hour, group: 'group-1', title: 'Range Item' },
  { id: 'point-1', type: 'point', start: now + hour * 2, group: 'group-1', title: 'Point Item' },
  { id: 'bg-1', type: 'background', start: now, end: now + hour * 3, group: 'group-2' },
  { id: 'bg-ungrouped', type: 'background', start: now + hour, end: now + hour * 2 },
];

const baseMarkers: TimelineMarker[] = [
  { id: 'marker-1', type: 'marker', start: now + hour * 1.5, group: 'group-1' },
  { id: 'marker-ungrouped', type: 'marker', start: now + hour * 2.5 },
  { id: 'marker-ts', type: 'marker', start: now + hour, group: '_timestamps' },
];

function mountTimeline(props: Record<string, unknown> = {}, slots?: Record<string, unknown>) {
  return mount(Timeline, {
    props: {
      groups: baseGroups,
      items: baseItems,
      markers: baseMarkers,
      viewportMin: now - hour,
      viewportMax: now + hour * 5,
      initialViewportStart: now - hour * 0.5,
      initialViewportEnd: now + hour * 4,
      ...props,
    },
    // @ts-expect-error -- slot render functions are loosely typed in tests
    slots,
    attachTo: document.body,
  });
}

// ─── Rendering ──────────────────────────────────────────────────────────────────

describe('Timeline rendering', () => {
  describe('groups', () => {
    it('renders a .group for each group', () => {
      const wrapper = mountTimeline();
      const groups = wrapper.findAll('.group');
      expect(groups.length).toBe(2);
    });

    it('renders group labels', () => {
      const wrapper = mountTimeline();
      const labels = wrapper.findAll('.group-label');
      expect(labels[0].text()).toContain('Group 1');
      expect(labels[1].text()).toContain('Group 2');
    });

    it('applies cssVariables on groups as inline styles', () => {
      const wrapper = mountTimeline({
        groups: [
          { id: 'g1', label: 'G1', cssVariables: { '--height': '50%' } },
        ],
        items: [],
        markers: [],
      });
      const group = wrapper.find('.group');
      expect(group.attributes('style')).toContain('--height: 50%');
    });
  });

  describe('items', () => {
    it('renders range items with .range class', async () => {
      const wrapper = mountTimeline();
      await nextTick();
      expect(wrapper.findAll('.item.range').length).toBeGreaterThanOrEqual(1);
    });

    it('renders point items with .point class', async () => {
      const wrapper = mountTimeline();
      await nextTick();
      expect(wrapper.findAll('.item.point').length).toBeGreaterThanOrEqual(1);
    });

    it('renders background items with .background class', async () => {
      const wrapper = mountTimeline();
      await nextTick();
      expect(wrapper.findAll('.background').length).toBeGreaterThanOrEqual(1);
    });

    it('does not render items outside the viewport', async () => {
      const farFuture = now + hour * 100;
      const wrapper = mountTimeline({
        items: [
          { id: 'far-away', type: 'range', start: farFuture, end: farFuture + hour, group: 'group-1' },
        ],
      });
      await nextTick();
      expect(wrapper.findAll('.item.range').length).toBe(0);
    });

    it('applies custom className on items', async () => {
      const wrapper = mountTimeline({
        items: [
          { id: 'custom', type: 'range', start: now, end: now + hour, group: 'group-1', className: 'my-custom-class' },
        ],
      });
      await nextTick();
      expect(wrapper.find('.item.my-custom-class').exists()).toBe(true);
    });
  });

  describe('active items', () => {
    it('adds .active class to items in activeItems', async () => {
      const wrapper = mountTimeline({ activeItems: ['range-1'] });
      await nextTick();
      const activeItem = wrapper.find('.item.active');
      expect(activeItem.exists()).toBe(true);
    });

    it('does not add .active class to items not in activeItems', async () => {
      const wrapper = mountTimeline({ activeItems: [] });
      await nextTick();
      expect(wrapper.find('.item.active').exists()).toBe(false);
    });
  });

  describe('fixed labels', () => {
    it('adds .fixed class when fixedLabels is true', () => {
      const wrapper = mountTimeline({ fixedLabels: true });
      expect(wrapper.find('.group-label.fixed').exists()).toBe(true);
    });

    it('does not add .fixed class by default', () => {
      const wrapper = mountTimeline();
      expect(wrapper.find('.group-label.fixed').exists()).toBe(false);
    });
  });

  describe('timestamps', () => {
    it('renders timestamp elements', () => {
      const wrapper = mountTimeline();
      expect(wrapper.findAll('.timestamp').length).toBeGreaterThan(0);
    });

    it('uses custom renderTimestampLabel', () => {
      const renderFn = vi.fn((_ts: number, _scale: { unit: string; step: number }) => 'CUSTOM');
      const wrapper = mountTimeline({ renderTimestampLabel: renderFn });
      const timestamps = wrapper.findAll('.timestamp');
      expect(timestamps.length).toBeGreaterThan(0);
      expect(renderFn).toHaveBeenCalled();
      expect(timestamps[0].text()).toBe('CUSTOM');
    });
  });

  describe('markers', () => {
    it('renders markers with .marker class', async () => {
      const wrapper = mountTimeline();
      await nextTick();
      expect(wrapper.findAll('.marker').length).toBeGreaterThanOrEqual(1);
    });

    it('renders ungrouped markers in the markers container', async () => {
      const wrapper = mountTimeline();
      await nextTick();
      const markersContainer = wrapper.find('.markers');
      expect(markersContainer.exists()).toBe(true);
      expect(markersContainer.findAll('.marker').length).toBeGreaterThanOrEqual(1);
    });

    it('renders markers with group _timestamps in the timestamps section', async () => {
      const wrapper = mountTimeline();
      await nextTick();
      const timestampsSection = wrapper.find('.timestamps');
      expect(timestampsSection.findAll('.marker').length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('ungrouped backgrounds', () => {
    it('renders backgrounds without a group in the .backgrounds container', async () => {
      const wrapper = mountTimeline();
      await nextTick();
      const bgContainer = wrapper.find('.backgrounds');
      expect(bgContainer.exists()).toBe(true);
      expect(bgContainer.findAll('.background').length).toBeGreaterThanOrEqual(1);
    });
  });
});

// ─── Events ─────────────────────────────────────────────────────────────────────

describe('Timeline events', () => {
  it('emits click with time, event, and null item on timeline click', async () => {
    const wrapper = mountTimeline();
    const timeline = wrapper.find('.timeline');
    await timeline.trigger('click');

    const emitted = wrapper.emitted('click');
    expect(emitted).toBeTruthy();
    expect(emitted![0][0]).toHaveProperty('time');
    expect(emitted![0][0]).toHaveProperty('event');
    expect(emitted![0][0]).toHaveProperty('item', null);
  });

  it('emits click with item when clicking on an item', async () => {
    const wrapper = mountTimeline();
    const item = wrapper.find('.item');
    if (item.exists()) {
      await item.trigger('click');
      const emitted = wrapper.emitted('click');
      expect(emitted).toBeTruthy();
      expect(emitted![0][0]).toHaveProperty('item');
      expect((emitted![0][0] as { item: TimelineItem }).item).not.toBeNull();
    }
  });

  it('emits contextmenu on right-click', async () => {
    const wrapper = mountTimeline();
    const timeline = wrapper.find('.timeline');
    await timeline.trigger('contextmenu');

    expect(wrapper.emitted('contextmenu')).toBeTruthy();
  });

  it('emits pointermove on pointer move', async () => {
    const wrapper = mountTimeline();
    const timeline = wrapper.find('.timeline');
    await timeline.trigger('pointermove');

    expect(wrapper.emitted('pointermove')).toBeTruthy();
  });

  it('emits pointerdown on pointer down', async () => {
    const wrapper = mountTimeline();
    const timeline = wrapper.find('.timeline');
    await timeline.trigger('pointerdown');

    expect(wrapper.emitted('pointerdown')).toBeTruthy();
  });

  it('emits pointerup on pointer up', async () => {
    const wrapper = mountTimeline();
    const timeline = wrapper.find('.timeline');
    await timeline.trigger('pointerup');

    expect(wrapper.emitted('pointerup')).toBeTruthy();
  });

  it('emits mousemoveTimeline on mouse move', async () => {
    const wrapper = mountTimeline();
    const timeline = wrapper.find('.timeline');
    await timeline.trigger('mousemove');

    expect(wrapper.emitted('mousemoveTimeline')).toBeTruthy();
  });

  it('emits mouseleaveTimeline on mouse leave', async () => {
    const wrapper = mountTimeline();
    const timeline = wrapper.find('.timeline');
    await timeline.trigger('mouseleave');

    expect(wrapper.emitted('mouseleaveTimeline')).toBeTruthy();
  });

  it('emits wheel event on scroll', async () => {
    const wrapper = mountTimeline();
    const timeline = wrapper.find('.timeline');
    await timeline.trigger('wheel', { deltaX: 0, deltaY: 10, deltaMode: 0 });

    expect(wrapper.emitted('wheel')).toBeTruthy();
  });

  it('emits changeViewport on mount', async () => {
    const wrapper = mountTimeline();
    await nextTick();

    expect(wrapper.emitted('changeViewport')).toBeTruthy();
    const payload = wrapper.emitted('changeViewport')![0][0] as { start: number; end: number };
    expect(payload).toHaveProperty('start');
    expect(payload).toHaveProperty('end');
  });

  it('emits changeScale on mount', async () => {
    const wrapper = mountTimeline();
    await nextTick();

    expect(wrapper.emitted('changeScale')).toBeTruthy();
    const payload = wrapper.emitted('changeScale')![0][0] as { unit: string; step: number };
    expect(payload).toHaveProperty('unit');
    expect(payload).toHaveProperty('step');
  });
});

// ─── Interactions ───────────────────────────────────────────────────────────────

describe('Timeline interactions', () => {
  describe('setViewport', () => {
    it('sets viewport via exposed method', async () => {
      const wrapper = mountTimeline();
      await nextTick();

      const vm = wrapper.vm as unknown as { setViewport: (start?: number, end?: number) => void };
      vm.setViewport(now, now + hour * 2);
      await nextTick();

      const emitted = wrapper.emitted('changeViewport')!;
      const last = emitted[emitted.length - 1][0] as { start: number; end: number };
      expect(last.start).toBe(now);
      expect(last.end).toBe(now + hour * 2);
    });

    it('clamps to viewportMin and viewportMax', async () => {
      const wrapper = mountTimeline({
        viewportMin: now,
        viewportMax: now + hour * 3,
      });
      await nextTick();

      const vm = wrapper.vm as unknown as { setViewport: (start?: number, end?: number) => void };
      vm.setViewport(now - hour * 10, now + hour * 20);
      await nextTick();

      const emitted = wrapper.emitted('changeViewport')!;
      const last = emitted[emitted.length - 1][0] as { start: number; end: number };
      expect(last.start).toBeGreaterThanOrEqual(now);
      expect(last.end).toBeLessThanOrEqual(now + hour * 3);
    });

    it('enforces minViewportDuration', async () => {
      const minDuration = hour;
      const wrapper = mountTimeline({ minViewportDuration: minDuration });
      await nextTick();

      const vm = wrapper.vm as unknown as { setViewport: (start?: number, end?: number) => void };
      vm.setViewport(now, now + 100);
      await nextTick();

      const emitted = wrapper.emitted('changeViewport')!;
      const last = emitted[emitted.length - 1][0] as { start: number; end: number };
      expect(last.end - last.start).toBeGreaterThanOrEqual(minDuration);
    });

    it('enforces maxViewportDuration', async () => {
      const maxDuration = hour * 2;
      const wrapper = mountTimeline({ maxViewportDuration: maxDuration });
      await nextTick();

      const vm = wrapper.vm as unknown as { setViewport: (start?: number, end?: number) => void };
      vm.setViewport(now, now + hour * 10);
      await nextTick();

      const emitted = wrapper.emitted('changeViewport')!;
      const last = emitted[emitted.length - 1][0] as { start: number; end: number };
      expect(last.end - last.start).toBeLessThanOrEqual(maxDuration);
    });

    it('rounds to integers', async () => {
      const wrapper = mountTimeline();
      await nextTick();

      const vm = wrapper.vm as unknown as { setViewport: (start?: number, end?: number) => void };
      vm.setViewport(now + 0.7, now + hour + 0.3);
      await nextTick();

      const emitted = wrapper.emitted('changeViewport')!;
      const last = emitted[emitted.length - 1][0] as { start: number; end: number };
      expect(Number.isInteger(last.start)).toBe(true);
      expect(Number.isInteger(last.end)).toBe(true);
    });

    it('keeps unchanged value when only start is provided', async () => {
      const wrapper = mountTimeline();
      await nextTick();

      const vm = wrapper.vm as unknown as { setViewport: (start?: number, end?: number) => void };
      const emitted = wrapper.emitted('changeViewport')!;
      const initial = emitted[emitted.length - 1][0] as { start: number; end: number };
      const prevEnd = initial.end;

      vm.setViewport(now + hour);
      await nextTick();

      const last = emitted[emitted.length - 1][0] as { start: number; end: number };
      expect(last.end).toBe(prevEnd);
    });

    it('warns when both start and end are undefined', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const wrapper = mountTimeline();
      await nextTick();

      const vm = wrapper.vm as unknown as { setViewport: (start?: number, end?: number) => void };
      vm.setViewport(undefined, undefined);

      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('both start and end are undefined'));
      warnSpy.mockRestore();
    });
  });

  describe('prop validation', () => {
    it('logs error when initialViewportStart >= initialViewportEnd', async () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mountTimeline({
        initialViewportStart: now + hour * 5,
        initialViewportEnd: now + hour,
      });
      await nextTick();

      expect(errorSpy).toHaveBeenCalled();
      errorSpy.mockRestore();
    });

    it('logs error when viewportMin >= viewportMax', async () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mountTimeline({
        viewportMin: now + hour * 10,
        viewportMax: now,
      });
      await nextTick();

      expect(errorSpy).toHaveBeenCalled();
      errorSpy.mockRestore();
    });
  });

  describe('viewport initialization', () => {
    it('uses initialViewportStart and initialViewportEnd when provided', async () => {
      const wrapper = mountTimeline({
        initialViewportStart: now,
        initialViewportEnd: now + hour * 2,
      });
      await nextTick();

      const emitted = wrapper.emitted('changeViewport')!;
      const last = emitted[emitted.length - 1][0] as { start: number; end: number };
      expect(last.start).toBe(now);
      expect(last.end).toBe(now + hour * 2);
    });

    it('falls back to viewportMin/viewportMax when initial values are not set', async () => {
      const wrapper = mountTimeline({
        initialViewportStart: undefined,
        initialViewportEnd: undefined,
        viewportMin: now,
        viewportMax: now + hour * 3,
        items: [],
      });
      await nextTick();

      const emitted = wrapper.emitted('changeViewport')!;
      const last = emitted[emitted.length - 1][0] as { start: number; end: number };
      expect(last.start).toBe(now);
      expect(last.end).toBe(now + hour * 3);
    });
  });

  describe('horizontal scroll via wheel', () => {
    it('shifts viewport on Shift+wheel', async () => {
      const wrapper = mountTimeline({
        initialViewportStart: now,
        initialViewportEnd: now + hour * 3,
      });
      await nextTick();

      const emitted = wrapper.emitted('changeViewport')!;
      const before = emitted[emitted.length - 1][0] as { start: number; end: number };
      const duration = before.end - before.start;

      const timeline = wrapper.find('.timeline');
      await timeline.trigger('wheel', {
        deltaX: 0,
        deltaY: 50,
        deltaMode: 0,
        shiftKey: true,
        ctrlKey: false,
        metaKey: false,
        clientX: 500,
      });
      await nextTick();

      const after = emitted[emitted.length - 1][0] as { start: number; end: number };
      const afterDuration = after.end - after.start;

      expect(afterDuration).toBe(duration);
      expect(after.start).toBeGreaterThan(before.start);
    });

    it('scrolls horizontally on native horizontal wheel (deltaX)', async () => {
      const wrapper = mountTimeline({
        initialViewportStart: now,
        initialViewportEnd: now + hour * 3,
      });
      await nextTick();

      const emitted = wrapper.emitted('changeViewport')!;
      const before = emitted[emitted.length - 1][0] as { start: number; end: number };

      const timeline = wrapper.find('.timeline');
      await timeline.trigger('wheel', {
        deltaX: 50,
        deltaY: 0,
        deltaMode: 0,
        shiftKey: false,
        ctrlKey: false,
        metaKey: false,
        clientX: 500,
      });
      await nextTick();

      const after = emitted[emitted.length - 1][0] as { start: number; end: number };
      expect(after.start).toBeGreaterThan(before.start);
    });
  });

  describe('zoom via Ctrl/Meta+wheel', () => {
    it('zooms in on Ctrl+wheel up', async () => {
      const wrapper = mountTimeline({
        initialViewportStart: now,
        initialViewportEnd: now + hour * 4,
      });
      await nextTick();

      const emitted = wrapper.emitted('changeViewport')!;
      const before = emitted[emitted.length - 1][0] as { start: number; end: number };
      const durationBefore = before.end - before.start;

      const timeline = wrapper.find('.timeline');
      await timeline.trigger('wheel', {
        deltaX: 0,
        deltaY: -30,
        deltaMode: 0,
        shiftKey: false,
        ctrlKey: true,
        metaKey: false,
        clientX: 500,
      });
      await nextTick();

      const after = emitted[emitted.length - 1][0] as { start: number; end: number };
      const durationAfter = after.end - after.start;
      expect(durationAfter).toBeLessThan(durationBefore);
    });

    it('zooms out on Ctrl+wheel down', async () => {
      const wrapper = mountTimeline({
        initialViewportStart: now,
        initialViewportEnd: now + hour * 2,
        maxViewportDuration: hour * 10,
      });
      await nextTick();

      const emitted = wrapper.emitted('changeViewport')!;
      const before = emitted[emitted.length - 1][0] as { start: number; end: number };
      const durationBefore = before.end - before.start;

      const timeline = wrapper.find('.timeline');
      await timeline.trigger('wheel', {
        deltaX: 0,
        deltaY: 30,
        deltaMode: 0,
        shiftKey: false,
        ctrlKey: true,
        metaKey: false,
        clientX: 500,
      });
      await nextTick();

      const after = emitted[emitted.length - 1][0] as { start: number; end: number };
      const durationAfter = after.end - after.start;
      expect(durationAfter).toBeGreaterThan(durationBefore);
    });

    it('does not zoom below minViewportDuration', async () => {
      const minDuration = hour;
      const wrapper = mountTimeline({
        initialViewportStart: now,
        initialViewportEnd: now + hour * 1.1,
        minViewportDuration: minDuration,
      });
      await nextTick();

      const timeline = wrapper.find('.timeline');
      for (let i = 0; i < 20; i++) {
        await timeline.trigger('wheel', {
          deltaX: 0,
          deltaY: -60,
          deltaMode: 0,
          shiftKey: false,
          ctrlKey: true,
          metaKey: false,
          clientX: 500,
        });
      }
      await nextTick();

      const emitted = wrapper.emitted('changeViewport')!;
      const last = emitted[emitted.length - 1][0] as { start: number; end: number };
      expect(last.end - last.start).toBeGreaterThanOrEqual(minDuration);
    });
  });
});

// ─── Touch Events ───────────────────────────────────────────────────────────────

describe('Timeline touch events', () => {
  function makeTouchInit(touches: Array<{ clientX: number; clientY: number; identifier?: number; screenX?: number; screenY?: number }>): Record<string, unknown> {
    const touchList = touches.map((t, i) => ({
      clientX: t.clientX,
      clientY: t.clientY,
      screenX: t.screenX ?? t.clientX,
      screenY: t.screenY ?? t.clientY,
      identifier: t.identifier ?? i,
      target: null,
      pageX: t.clientX,
      pageY: t.clientY,
      radiusX: 0,
      radiusY: 0,
      rotationAngle: 0,
      force: 1,
    }));
    const list = Object.assign([...touchList], {
      length: touchList.length,
      item: (i: number) => touchList[i] ?? null,
      [Symbol.iterator]: touchList[Symbol.iterator].bind(touchList),
    });
    return { touches: list };
  }

  it('emits touchstart', async () => {
    const wrapper = mountTimeline();
    const timeline = wrapper.find('.timeline');
    await timeline.trigger('touchstart', makeTouchInit([{ clientX: 500, clientY: 200 }]));

    expect(wrapper.emitted('touchstart')).toBeTruthy();
    const payload = wrapper.emitted('touchstart')![0][0] as { time: number; event: TouchEvent };
    expect(payload).toHaveProperty('time');
    expect(payload).toHaveProperty('event');
  });

  it('emits touchmove with single finger panning', async () => {
    const wrapper = mountTimeline();
    const timeline = wrapper.find('.timeline');

    await timeline.trigger('touchstart', makeTouchInit([{ clientX: 500, clientY: 200 }]));
    await timeline.trigger('touchmove', makeTouchInit([{ clientX: 450, clientY: 200 }]));

    expect(wrapper.emitted('touchmove')).toBeTruthy();
  });

  it('emits touchend', async () => {
    const wrapper = mountTimeline();
    const timeline = wrapper.find('.timeline');

    await timeline.trigger('touchstart', makeTouchInit([{ clientX: 500, clientY: 200 }]));
    await timeline.trigger('touchend', makeTouchInit([]));

    expect(wrapper.emitted('touchend')).toBeTruthy();
    const payload = wrapper.emitted('touchend')![0][0] as { event: TouchEvent };
    expect(payload).toHaveProperty('event');
  });

  it('handles two-finger pinch zoom via touchmove', async () => {
    const wrapper = mountTimeline({
      initialViewportStart: now,
      initialViewportEnd: now + hour * 4,
    });
    await nextTick();

    const timeline = wrapper.find('.timeline');

    await timeline.trigger('touchstart', makeTouchInit([
      { clientX: 300, clientY: 200, identifier: 0, screenX: 300, screenY: 200 },
      { clientX: 700, clientY: 200, identifier: 1, screenX: 700, screenY: 200 },
    ]));

    await timeline.trigger('touchmove', makeTouchInit([
      { clientX: 200, clientY: 200, identifier: 0, screenX: 200, screenY: 200 },
      { clientX: 800, clientY: 200, identifier: 1, screenX: 800, screenY: 200 },
    ]));

    expect(wrapper.emitted('touchmove')).toBeTruthy();
    const viewportEvents = wrapper.emitted('changeViewport')!;
    expect(viewportEvents.length).toBeGreaterThan(1);
  });

  it('single-finger touchmove pans the viewport', async () => {
    const wrapper = mountTimeline({
      initialViewportStart: now,
      initialViewportEnd: now + hour * 3,
    });
    await nextTick();

    const emitted = wrapper.emitted('changeViewport')!;
    const before = emitted[emitted.length - 1][0] as { start: number; end: number };

    const timeline = wrapper.find('.timeline');
    await timeline.trigger('touchstart', makeTouchInit([{ clientX: 500, clientY: 200 }]));
    await timeline.trigger('touchmove', makeTouchInit([{ clientX: 400, clientY: 200 }]));
    await nextTick();

    const after = emitted[emitted.length - 1][0] as { start: number; end: number };
    expect(after.start).toBeGreaterThan(before.start);
  });
});

// ─── Item-level and background events ───────────────────────────────────────────

describe('Timeline item-level events', () => {
  it('emits click with the item when clicking a specific item', async () => {
    const wrapper = mountTimeline();
    await nextTick();

    const items = wrapper.findAll('.item');
    expect(items.length).toBeGreaterThan(0);
    await items[0].trigger('click');

    const emitted = wrapper.emitted('click')!;
    expect(emitted.length).toBeGreaterThanOrEqual(1);
    const payload = emitted[emitted.length - 1][0] as { item: TimelineItem | null };
    expect(payload.item).not.toBeNull();
  });

  it('emits pointerdown with item when pressing on a specific item', async () => {
    const wrapper = mountTimeline();
    await nextTick();

    const items = wrapper.findAll('.item');
    expect(items.length).toBeGreaterThan(0);
    await items[0].trigger('pointerdown');

    const emitted = wrapper.emitted('pointerdown')!;
    const payload = emitted[emitted.length - 1][0] as { item: TimelineItem | null };
    expect(payload.item).not.toBeNull();
  });

  it('emits pointermove with item on item pointer move', async () => {
    const wrapper = mountTimeline();
    await nextTick();

    const items = wrapper.findAll('.item');
    expect(items.length).toBeGreaterThan(0);
    await items[0].trigger('pointermove');

    const emitted = wrapper.emitted('pointermove')!;
    const payload = emitted[emitted.length - 1][0] as { item: TimelineItem | null };
    expect(payload.item).not.toBeNull();
  });

  it('emits pointerup with item on item pointer up', async () => {
    const wrapper = mountTimeline();
    await nextTick();

    const items = wrapper.findAll('.item');
    expect(items.length).toBeGreaterThan(0);
    await items[0].trigger('pointerup');

    const emitted = wrapper.emitted('pointerup')!;
    const payload = emitted[emitted.length - 1][0] as { item: TimelineItem | null };
    expect(payload.item).not.toBeNull();
  });

  it('emits contextmenu with item on item right-click', async () => {
    const wrapper = mountTimeline();
    await nextTick();

    const items = wrapper.findAll('.item');
    expect(items.length).toBeGreaterThan(0);
    await items[0].trigger('contextmenu');

    const emitted = wrapper.emitted('contextmenu')!;
    const payload = emitted[emitted.length - 1][0] as { item: TimelineItem | null };
    expect(payload.item).not.toBeNull();
  });

  it('emits click on grouped background items', async () => {
    const wrapper = mountTimeline();
    await nextTick();

    const groupBgs = wrapper.findAll('.group .background');
    expect(groupBgs.length).toBeGreaterThan(0);
    await groupBgs[0].trigger('click');

    const emitted = wrapper.emitted('click')!;
    const payload = emitted[emitted.length - 1][0] as { item: TimelineItem | null };
    expect(payload.item).not.toBeNull();
    expect((payload.item as TimelineItem).type).toBe('background');
  });

  it('emits pointer events on grouped background items', async () => {
    const wrapper = mountTimeline();
    await nextTick();

    const groupBgs = wrapper.findAll('.group .background');
    expect(groupBgs.length).toBeGreaterThan(0);
    await groupBgs[0].trigger('pointermove');
    await groupBgs[0].trigger('pointerdown');
    await groupBgs[0].trigger('pointerup');
    await groupBgs[0].trigger('contextmenu');

    expect(wrapper.emitted('pointermove')!.length).toBeGreaterThanOrEqual(1);
    expect(wrapper.emitted('pointerdown')!.length).toBeGreaterThanOrEqual(1);
    expect(wrapper.emitted('pointerup')!.length).toBeGreaterThanOrEqual(1);
    expect(wrapper.emitted('contextmenu')!.length).toBeGreaterThanOrEqual(1);
  });

  it('emits click on ungrouped background items', async () => {
    const wrapper = mountTimeline();
    await nextTick();

    const bgContainer = wrapper.find('.backgrounds');
    expect(bgContainer.exists()).toBe(true);

    const bgs = bgContainer.findAll('.background');
    expect(bgs.length).toBeGreaterThan(0);
    await bgs[0].trigger('click');

    const emitted = wrapper.emitted('click')!;
    const payload = emitted[emitted.length - 1][0] as { item: TimelineItem | null };
    expect(payload.item).not.toBeNull();
  });

  it('emits pointer events on ungrouped background items', async () => {
    const wrapper = mountTimeline();
    await nextTick();

    const bgContainer = wrapper.find('.backgrounds');
    const bgs = bgContainer.findAll('.background');
    expect(bgs.length).toBeGreaterThan(0);

    await bgs[0].trigger('pointermove');
    await bgs[0].trigger('pointerdown');
    await bgs[0].trigger('pointerup');
    await bgs[0].trigger('contextmenu');

    expect(wrapper.emitted('pointermove')!.length).toBeGreaterThanOrEqual(1);
    expect(wrapper.emitted('pointerdown')!.length).toBeGreaterThanOrEqual(1);
    expect(wrapper.emitted('pointerup')!.length).toBeGreaterThanOrEqual(1);
    expect(wrapper.emitted('contextmenu')!.length).toBeGreaterThanOrEqual(1);
  });
});

// ─── Additional coverage ────────────────────────────────────────────────────────

describe('Timeline additional coverage', () => {
  it('falls back to first/last item occurrence when no initial viewport or bounds', async () => {
    const wrapper = mountTimeline({
      initialViewportStart: undefined,
      initialViewportEnd: undefined,
      viewportMin: undefined,
      viewportMax: undefined,
      items: [
        { id: 'r1', type: 'range', start: 5000, end: 8000, group: 'group-1' },
        { id: 'r2', type: 'range', start: 2000, end: 6000, group: 'group-1' },
      ],
    });
    await nextTick();

    const emitted = wrapper.emitted('changeViewport')!;
    const last = emitted[emitted.length - 1][0] as { start: number; end: number };
    expect(last.start).toBe(2000);
    expect(last.end).toBe(8000);
  });

  it('uses item.start as max when item.end is undefined (points)', async () => {
    const wrapper = mountTimeline({
      initialViewportStart: undefined,
      initialViewportEnd: undefined,
      viewportMin: undefined,
      viewportMax: undefined,
      items: [
        { id: 'p1', type: 'point', start: 3000, group: 'group-1' },
        { id: 'p2', type: 'point', start: 7000, group: 'group-1' },
      ],
    });
    await nextTick();

    const emitted = wrapper.emitted('changeViewport')!;
    const last = emitted[emitted.length - 1][0] as { start: number; end: number };
    expect(last.start).toBe(3000);
    expect(last.end).toBe(7000);
  });

  it('re-applies viewport when viewportMin/viewportMax props change', async () => {
    const wrapper = mountTimeline({
      viewportMin: now - hour,
      viewportMax: now + hour * 5,
      initialViewportStart: now,
      initialViewportEnd: now + hour * 4,
    });
    await nextTick();

    const emitted = wrapper.emitted('changeViewport')!;
    const countBefore = emitted.length;

    await wrapper.setProps({ viewportMin: now, viewportMax: now + hour * 3 });
    await nextTick();

    expect(emitted.length).toBeGreaterThan(countBefore);
  });

  it('re-applies viewport when initialViewportStart/End props change', async () => {
    const wrapper = mountTimeline({
      initialViewportStart: now,
      initialViewportEnd: now + hour * 2,
    });
    await nextTick();

    const emitted = wrapper.emitted('changeViewport')!;
    const countBefore = emitted.length;

    await wrapper.setProps({
      initialViewportStart: now + hour,
      initialViewportEnd: now + hour * 3,
    });
    await nextTick();

    expect(emitted.length).toBeGreaterThan(countBefore);
    const last = emitted[emitted.length - 1][0] as { start: number; end: number };
    expect(last.start).toBe(now + hour);
    expect(last.end).toBe(now + hour * 3);
  });

  it('renders marker-type items in the items array with group _timestamps', async () => {
    const wrapper = mountTimeline({
      items: [
        ...baseItems,
        { id: 'item-marker-ts', type: 'marker', start: now + hour * 1.5, group: '_timestamps' } as TimelineItem,
      ],
    });
    await nextTick();

    const timestampsSection = wrapper.find('.timestamps');
    const markers = timestampsSection.findAll('.marker');
    expect(markers.length).toBeGreaterThanOrEqual(1);
  });

  it('does not scroll past viewportMax when scrolling right', async () => {
    const wrapper = mountTimeline({
      viewportMin: now,
      viewportMax: now + hour * 2,
      initialViewportStart: now + hour * 0.5,
      initialViewportEnd: now + hour * 2,
    });
    await nextTick();

    const emitted = wrapper.emitted('changeViewport')!;
    const before = emitted[emitted.length - 1][0] as { start: number; end: number };
    expect(before.end).toBe(now + hour * 2);

    const timeline = wrapper.find('.timeline');
    await timeline.trigger('wheel', {
      deltaX: 200,
      deltaY: 0,
      deltaMode: 0,
      shiftKey: false,
      ctrlKey: false,
      metaKey: false,
      clientX: 500,
    });
    await nextTick();

    const after = emitted[emitted.length - 1][0] as { start: number; end: number };
    expect(after.end).toBeLessThanOrEqual(now + hour * 2);
  });

  it('does not scroll past viewportMin when scrolling left', async () => {
    const wrapper = mountTimeline({
      viewportMin: now,
      viewportMax: now + hour * 4,
      initialViewportStart: now,
      initialViewportEnd: now + hour * 2,
    });
    await nextTick();

    const emitted = wrapper.emitted('changeViewport')!;
    const before = emitted[emitted.length - 1][0] as { start: number; end: number };
    expect(before.start).toBe(now);

    const timeline = wrapper.find('.timeline');
    await timeline.trigger('wheel', {
      deltaX: -200,
      deltaY: 0,
      deltaMode: 0,
      shiftKey: false,
      ctrlKey: false,
      metaKey: false,
      clientX: 500,
    });
    await nextTick();

    const after = emitted[emitted.length - 1][0] as { start: number; end: number };
    expect(after.start).toBeGreaterThanOrEqual(now);
  });

  it('handles zoom rounding edge case gracefully', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const wrapper = mountTimeline({
      initialViewportStart: now,
      initialViewportEnd: now + 2,
      minViewportDuration: 1,
    });
    await nextTick();

    const vm = wrapper.vm as unknown as { setViewport: (start?: number, end?: number) => void };
    vm.setViewport(now, now + 1);
    await nextTick();

    const timeline = wrapper.find('.timeline');
    for (let i = 0; i < 50; i++) {
      await timeline.trigger('wheel', {
        deltaX: 0,
        deltaY: -60,
        deltaMode: 0,
        shiftKey: false,
        ctrlKey: true,
        metaKey: false,
        clientX: 500,
      });
    }

    errorSpy.mockRestore();
  });
});

// ─── Slots ──────────────────────────────────────────────────────────────────────

describe('Timeline slots', () => {
  it('#group-label receives group as slot prop', () => {
    const wrapper = mountTimeline({}, {
      'group-label': (slotProps: { group: TimelineGroup }) => {
        return h('span', { class: 'custom-label' }, slotProps.group.label ?? slotProps.group.id);
      },
    });
    const labels = wrapper.findAll('.custom-label');
    expect(labels.length).toBe(2);
    expect(labels[0].text()).toBe('Group 1');
    expect(labels[1].text()).toBe('Group 2');
  });

  it('#timestamp receives timestamp and scale as slot props', () => {
    const receivedProps: Array<{ timestamp: number; scale: { unit: string; step: number } }> = [];
    mountTimeline({}, {
      timestamp: (slotProps: { timestamp: number; scale: { unit: string; step: number } }) => {
        receivedProps.push(slotProps);
        return h('span', {}, String(slotProps.timestamp));
      },
    });
    expect(receivedProps.length).toBeGreaterThan(0);
    expect(receivedProps[0]).toHaveProperty('timestamp');
    expect(receivedProps[0]).toHaveProperty('scale');
    expect(receivedProps[0].scale).toHaveProperty('unit');
    expect(receivedProps[0].scale).toHaveProperty('step');
  });

  it('#item receives item as slot prop', async () => {
    const receivedItems: TimelineItem[] = [];
    mountTimeline({}, {
      item: (slotProps: { item: TimelineItem }) => {
        receivedItems.push(slotProps.item);
        return h('span', { class: 'custom-item' }, slotProps.item.id);
      },
    });
    await nextTick();
    expect(receivedItems.length).toBeGreaterThan(0);
    expect(receivedItems[0]).toHaveProperty('id');
    expect(receivedItems[0]).toHaveProperty('type');
  });

  it('#marker receives item as slot prop', async () => {
    const receivedMarkers: TimelineMarker[] = [];
    mountTimeline({}, {
      marker: (slotProps: { item: TimelineMarker }) => {
        receivedMarkers.push(slotProps.item);
        return h('span', { class: 'custom-marker' }, slotProps.item.id);
      },
    });
    await nextTick();
    expect(receivedMarkers.length).toBeGreaterThan(0);
    expect(receivedMarkers[0]).toHaveProperty('type', 'marker');
  });

  it('#timestamps-before receives scale as slot prop', () => {
    let receivedScale: { unit: string; step: number } | null = null;
    mountTimeline({}, {
      'timestamps-before': (slotProps: { scale: { unit: string; step: number } }) => {
        receivedScale = slotProps.scale;
        return h('div', { class: 'ts-before' }, 'before');
      },
    });
    expect(receivedScale).not.toBeNull();
    expect(receivedScale).toHaveProperty('unit');
    expect(receivedScale).toHaveProperty('step');
  });

  it('#timestamps-after receives scale as slot prop', () => {
    let receivedScale: { unit: string; step: number } | null = null;
    mountTimeline({}, {
      'timestamps-after': (slotProps: { scale: { unit: string; step: number } }) => {
        receivedScale = slotProps.scale;
        return h('div', { class: 'ts-after' }, 'after');
      },
    });
    expect(receivedScale).not.toBeNull();
    expect(receivedScale).toHaveProperty('unit');
  });

  it('#items-{groupId} receives group, items, and viewport props', () => {
    let receivedProps: Record<string, unknown> | null = null;
    mountTimeline({}, {
      'items-group-1': (slotProps: Record<string, unknown>) => {
        receivedProps = slotProps;
        return h('div', { class: 'custom-group-items' }, 'custom');
      },
    });
    expect(receivedProps).not.toBeNull();
    expect(receivedProps).toHaveProperty('group');
    expect(receivedProps).toHaveProperty('itemsInViewport');
    expect(receivedProps).toHaveProperty('viewportStart');
    expect(receivedProps).toHaveProperty('viewportEnd');
  });
});
