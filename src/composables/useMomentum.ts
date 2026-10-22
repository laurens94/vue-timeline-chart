import { onScopeDispose } from 'vue';
import type { TimelineMomentumOptions } from '../types/timeline.ts';

/** Default time (ms) for a fling's speed to decay to ~1/e. Higher = longer glide. */
const DEFAULT_TIME_CONSTANT = 200;

/** Minimum release speed (px/ms) required to start a fling. */
const MIN_FLING_VELOCITY = 0.05;

/** Speed (px/ms) below which the fling ends. */
const MIN_STEP_VELOCITY = 0.02;

/** Upper bound (px/ms) on fling speed, so compounding flings can't run away. */
const MAX_FLING_VELOCITY = 8;

/** Only samples within this window (ms) before release estimate the velocity. */
const VELOCITY_WINDOW = 100;

/** If the finger rested longer than this (ms) before lifting, don't fling. */
const RELEASE_IDLE_LIMIT = 50;

interface Sample {
  x: number;
  t: number;
}

interface UseMomentumOptions {
  /**
   * Applies one pan step (in px) during the fling. Return `false` when the
   * viewport can't move any further so the fling stops (e.g. at a boundary).
   */
  onFling: (deltaX: number) => boolean | void;
  /** Resolved options, read fresh on each release. */
  config: () => TimelineMomentumOptions;
}

/**
 * Momentum ("fling") panning for touch drags: tracks finger velocity during a
 * single-finger drag and, on release, keeps panning with an exponential decay
 * until it slows to a stop or hits a boundary. Rapid same-direction flings
 * compound onto the leftover momentum (like a flywheel).
 */
export function useMomentum ({ onFling, config }: UseMomentumOptions) {
  let samples: Sample[] = [];
  let rafId: number | null = null;
  let velocity = 0;
  let timeConstant = DEFAULT_TIME_CONSTANT;
  let lastFrameTime = 0;

  /** Speed left over from a fling interrupted by a new touch, and when it was. */
  let carryVelocity = 0;
  let carryTime = 0;

  /** Ends any running fling and discards pending gesture samples. */
  function stop () {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    samples = [];
  }

  /** Begins a fresh gesture; call on touchstart (and when dropping to one finger). */
  function reset (x: number, t: number) {
    // A touch during a fling keeps its speed as a decaying carry, so a quick
    // same-direction fling can add to it.
    carryVelocity = rafId !== null ? velocity : 0;
    carryTime = t;
    stop();
    samples = [{ x, t }];
  }

  /** Records a finger position during a single-finger drag. */
  function track (x: number, t: number) {
    samples.push({ x, t });
    while (samples[0].t < t - VELOCITY_WINDOW) {
      samples.shift();
    }
  }

  /** Releases the gesture; call on touchend. Starts a fling if fast enough. */
  function release (t: number) {
    const recent = samples.filter(sample => t - sample.t <= VELOCITY_WINDOW);
    samples = [];

    const { enabled = true, timeConstant: configured = DEFAULT_TIME_CONSTANT } = config();
    if (!enabled) {
      return;
    }
    // Guard against NaN/Infinity, which would make step() loop forever.
    timeConstant = Number.isFinite(configured) ? Math.max(1, configured) : DEFAULT_TIME_CONSTANT;

    const [first] = recent;
    const last = recent[recent.length - 1];
    if (!first || first === last) {
      return;
    }
    if (t - last.t > RELEASE_IDLE_LIMIT) {
      return; // finger rested before lifting → no fling
    }

    const dt = last.t - first.t;
    if (dt <= 0) {
      return;
    }
    // A drag pans by (previousX - currentX), so pan velocity is the negated
    // finger velocity.
    const releaseVelocity = -(last.x - first.x) / dt;
    if (Math.abs(releaseVelocity) < MIN_FLING_VELOCITY) {
      return; // a slow lift (or a tap that caught a fling) just stops
    }

    // Add the leftover momentum only when the new fling goes the same way; it
    // has been decaying since the touch landed, so a slow gesture keeps little
    // of it.
    const carry = Math.sign(carryVelocity) === Math.sign(releaseVelocity)
      ? carryVelocity * Math.exp(-(t - carryTime) / timeConstant)
      : 0;
    carryVelocity = 0;
    velocity = clampVelocity(releaseVelocity + carry);

    lastFrameTime = t;
    rafId = requestAnimationFrame(step);
  }

  function step (now: number) {
    const dt = now - lastFrameTime;
    lastFrameTime = now;
    velocity *= Math.exp(-dt / timeConstant);
    if (Math.abs(velocity) < MIN_STEP_VELOCITY) {
      stop();
      return;
    }
    if (onFling(velocity * dt) === false) {
      stop();
      return;
    }
    rafId = requestAnimationFrame(step);
  }

  function clampVelocity (v: number) {
    return Math.max(-MAX_FLING_VELOCITY, Math.min(MAX_FLING_VELOCITY, v));
  }

  onScopeDispose(stop);

  return { track, reset, release, stop };
}
