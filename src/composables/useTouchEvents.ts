import { Ref } from 'vue';
import { getDistance } from '../helpers/getDistance.ts';

/**
 * Helpers for touch events.
 */
export function useTouchEvents ({ viewportStart, viewportEnd }: { viewportStart: Ref<number>, viewportEnd: Ref<number> }) {
  /** The last touch x position when there is only a single touch point */
  let lastTouchX: number | null = null;

  /** The list of touch points when there are multiple touch points, set on touch start */
  let initialTouchList: TouchList | null = null;

  /** The viewport start time of the initial touch point, set on touch start */
  let initialTouchViewportStart: number | null = null;

  /** The viewport end time of the initial touch point, set on touch start */
  let initialTouchViewportEnd: number | null = null;

  /** The distance between the two initial touch points, set on touch start */
  let initialPinchDistance: number | null = null;

  /** Sets lastTouchX when there is only a single touch point or unset when there is none */
  function setLastTouchX (event: TouchEvent) {
    if (event.touches.length < 2) {
      const [touch] = Array.from(event.touches);
      lastTouchX = touch?.clientX || null;
    }
  }

  function setInitialTouchList (event: TouchEvent) {
    state.initialTouchList = event.touches;
    const [touch1, touch2] = Array.from(event.touches);
    state.initialTouchViewportStart = viewportStart.value;
    state.initialTouchViewportEnd = viewportEnd.value;
    state.initialPinchDistance = touch1 && touch2 ? getDistance(touch1, touch2) : null;
  }

  function animateViewport (fromStart: number, toStart: number, fromEnd: number, toEnd: number) {
    const startTime = performance.now();
    const durationMs = 300;

    function easeOutCubic (t: number): number {
      return 1 - Math.pow(1 - t, 3);
    }

    function frame (now: number) {
      const t = Math.min((now - startTime) / durationMs, 1);
      const eased = easeOutCubic(t);

      viewportStart.value = fromStart + (toStart - fromStart) * eased;
      viewportEnd.value = fromEnd + (toEnd - fromEnd) * eased;

      if (t < 1) {
        requestAnimationFrame(frame);
      }
    }

    requestAnimationFrame(frame);
  }

  const state = {
    get lastTouchX () {
      return lastTouchX;
    },
    set lastTouchX (value: number | null) {
      lastTouchX = value;
    },
    get initialTouchList () {
      return initialTouchList;
    },
    set initialTouchList (value: TouchList | null) {
      initialTouchList = value;
    },
    get initialTouchViewportStart () {
      return initialTouchViewportStart;
    },
    set initialTouchViewportStart (value: number | null) {
      initialTouchViewportStart = value;
    },
    get initialTouchViewportEnd () {
      return initialTouchViewportEnd;
    },
    set initialTouchViewportEnd (value: number | null) {
      initialTouchViewportEnd = value;
    },
    get initialPinchDistance () {
      return initialPinchDistance;
    },
    set initialPinchDistance (value: number | null) {
      initialPinchDistance = value;
    } };

  return {
    setLastTouchX,
    setInitialTouchList,
    animateViewport,
    state,
  };
}