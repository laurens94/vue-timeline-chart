import { describe, it, expect } from 'vitest';
import { ref } from 'vue';
import { useTouchEvents } from './useTouchEvents.ts';

function makeTouchEvent(touches: Array<{ clientX: number; clientY: number; identifier?: number; screenX?: number; screenY?: number }>): TouchEvent {
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
  })) as unknown as Touch[];

  const list = Object.assign([...touchList], {
    length: touchList.length,
    item: (i: number) => touchList[i] ?? null,
    [Symbol.iterator]: touchList[Symbol.iterator].bind(touchList),
  }) as unknown as TouchList;

  return { touches: list } as unknown as TouchEvent;
}

describe('useTouchEvents', () => {
  function create(start = 0, end = 10000) {
    const viewportStart = ref(start);
    const viewportEnd = ref(end);
    return useTouchEvents({ viewportStart, viewportEnd });
  }

  describe('initial state', () => {
    it('starts with all null values', () => {
      const { state } = create();
      expect(state.lastTouchX).toBeNull();
      expect(state.initialTouchList).toBeNull();
      expect(state.initialTouchViewportStart).toBeNull();
      expect(state.initialTouchViewportEnd).toBeNull();
      expect(state.initialPinchDistance).toBeNull();
    });
  });

  describe('setLastTouchX', () => {
    it('stores clientX for a single touch', () => {
      const { setLastTouchX, state } = create();
      setLastTouchX(makeTouchEvent([{ clientX: 150, clientY: 0 }]));
      expect(state.lastTouchX).toBe(150);
    });

    it('clears lastTouchX when there are no touches', () => {
      const { setLastTouchX, state } = create();
      setLastTouchX(makeTouchEvent([{ clientX: 150, clientY: 0 }]));
      expect(state.lastTouchX).toBe(150);

      setLastTouchX(makeTouchEvent([]));
      expect(state.lastTouchX).toBeNull();
    });

    it('does not update lastTouchX for multi-touch events', () => {
      const { setLastTouchX, state } = create();
      state.lastTouchX = 100;
      setLastTouchX(makeTouchEvent([
        { clientX: 50, clientY: 0 },
        { clientX: 200, clientY: 0 },
      ]));
      expect(state.lastTouchX).toBe(100);
    });
  });

  describe('setInitialTouchList', () => {
    it('stores viewport start and end from refs', () => {
      const { setInitialTouchList, state } = create(5000, 15000);
      setInitialTouchList(makeTouchEvent([{ clientX: 100, clientY: 0 }]));

      expect(state.initialTouchViewportStart).toBe(5000);
      expect(state.initialTouchViewportEnd).toBe(15000);
    });

    it('calculates pinch distance for two touches', () => {
      const { setInitialTouchList, state } = create();
      setInitialTouchList(makeTouchEvent([
        { clientX: 0, clientY: 0 },
        { clientX: 100, clientY: 0 },
      ]));

      expect(state.initialPinchDistance).toBe(100);
      expect(state.initialTouchList).not.toBeNull();
    });

    it('sets pinch distance to null for a single touch', () => {
      const { setInitialTouchList, state } = create();
      setInitialTouchList(makeTouchEvent([{ clientX: 50, clientY: 0 }]));

      expect(state.initialPinchDistance).toBeNull();
    });
  });

  describe('state getters and setters', () => {
    it('allows setting and reading all state properties', () => {
      const { state } = create();

      state.lastTouchX = 42;
      expect(state.lastTouchX).toBe(42);

      state.initialTouchViewportStart = 1000;
      expect(state.initialTouchViewportStart).toBe(1000);

      state.initialTouchViewportEnd = 2000;
      expect(state.initialTouchViewportEnd).toBe(2000);

      state.initialPinchDistance = 300;
      expect(state.initialPinchDistance).toBe(300);
    });
  });
});
