import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref, nextTick } from 'vue';
import { useElementSize } from './useElementSize.ts';

let observeCallbacks: Array<(entries: ResizeObserverEntry[]) => void>;
let disconnectFn: () => void;

beforeEach(() => {
  observeCallbacks = [];
  disconnectFn = vi.fn();

  vi.stubGlobal('ResizeObserver', class {
    callback: (entries: ResizeObserverEntry[]) => void;
    constructor(callback: (entries: ResizeObserverEntry[]) => void) {
      this.callback = callback;
      observeCallbacks.push(callback);
    }
    observe() {}
    disconnect() { disconnectFn(); }
    unobserve() {}
  });
});

function fireResize(width: number, height: number) {
  const entry = {
    contentRect: { width, height, x: 0, y: 0, top: 0, right: width, bottom: height, left: 0, toJSON: () => ({}) },
  } as unknown as ResizeObserverEntry;

  for (const cb of observeCallbacks) {
    cb([entry]);
  }
}

describe('useElementSize', () => {
  it('returns 0 width and height initially', () => {
    const el = ref<HTMLElement | null>(null);
    const { width, height } = useElementSize(el);
    expect(width.value).toBe(0);
    expect(height.value).toBe(0);
  });

  it('updates dimensions when ResizeObserver fires', async () => {
    const el = ref<HTMLElement | null>(null);
    const { width, height } = useElementSize(el);

    el.value = document.createElement('div');
    await nextTick();

    fireResize(800, 600);

    expect(width.value).toBe(800);
    expect(height.value).toBe(600);
  });

  it('updates when resize fires a second time', async () => {
    const el = ref<HTMLElement | null>(null);
    const { width, height } = useElementSize(el);

    el.value = document.createElement('div');
    await nextTick();

    fireResize(800, 600);
    expect(width.value).toBe(800);

    fireResize(1024, 768);
    expect(width.value).toBe(1024);
    expect(height.value).toBe(768);
  });

  it('disconnects observer when element becomes null', async () => {
    const el = ref<HTMLElement | null>(null);
    useElementSize(el);

    el.value = document.createElement('div');
    await nextTick();
    expect(disconnectFn).not.toHaveBeenCalled();

    el.value = null;
    await nextTick();

    expect(disconnectFn).toHaveBeenCalled();
  });

  it('reconnects observer when element changes', async () => {
    const el = ref<HTMLElement | null>(null);
    useElementSize(el);

    el.value = document.createElement('div');
    await nextTick();
    const callbackCount = observeCallbacks.length;

    el.value = document.createElement('div');
    await nextTick();

    expect(observeCallbacks.length).toBeGreaterThan(callbackCount);
  });
});
