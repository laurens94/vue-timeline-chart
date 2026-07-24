import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { effectScope } from 'vue';
import { useMomentum } from './useMomentum.ts';

type FlingMock = Mock<(deltaX: number) => boolean | void>;

let pending: Map<number, FrameRequestCallback>;
let nextId: number;

/** Runs the single frame the fling loop currently has scheduled, at time `t`. */
function frame (t: number) {
  const callbacks = [...pending.values()];
  pending.clear();
  callbacks.forEach((cb) => cb(t));
}

/** Drives frames (16ms apart) until the fling stops or the cap is reached. */
function runToStop (startTime: number, maxFrames = 500) {
  let t = startTime;
  let frames = 0;
  while (pending.size > 0 && frames < maxFrames) {
    t += 16;
    frame(t);
    frames++;
  }
  return frames;
}

function create (options: { onFling?: FlingMock; config?: () => { enabled?: boolean; timeConstant?: number } } = {}) {
  const onFling: FlingMock = options.onFling ?? vi.fn<(deltaX: number) => boolean | void>();
  const config = options.config ?? (() => ({}));
  const scope = effectScope();
  const api = scope.run(() => useMomentum({ onFling, config }))!;
  return { ...api, onFling, scope };
}

beforeEach(() => {
  pending = new Map();
  nextId = 1;
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    const id = nextId++;
    pending.set(id, cb);
    return id;
  });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => {
    pending.delete(id);
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useMomentum', () => {
  it('flings forward (positive pan) when the finger drags left', () => {
    const { reset, track, release, onFling } = create();
    reset(100, 0);
    track(90, 16);
    track(80, 32);
    track(70, 48);
    release(50);

    expect(pending.size).toBe(1); // a fling is scheduled
    frame(66);
    expect(onFling).toHaveBeenCalledTimes(1);
    expect(onFling.mock.calls[0][0]).toBeGreaterThan(0);
  });

  it('flings backward (negative pan) when the finger drags right', () => {
    const { reset, track, release, onFling } = create();
    reset(0, 0);
    track(10, 16);
    track(20, 32);
    release(34);

    frame(50);
    expect(onFling.mock.calls[0][0]).toBeLessThan(0);
  });

  it('decelerates and eventually stops', () => {
    const { reset, track, release, onFling } = create();
    reset(300, 0);
    track(200, 16);
    track(100, 32);
    track(0, 48);
    release(50);

    const frames = runToStop(50);
    expect(frames).toBeGreaterThan(1);
    expect(pending.size).toBe(0); // no frame left scheduled
    const steps = onFling.mock.calls.map((c) => Math.abs(c[0]));
    expect(steps.at(-1)).toBeLessThan(steps[0]); // slowing down
  });

  it('does not fling below the minimum velocity', () => {
    const { reset, track, release, onFling } = create();
    reset(0, 0);
    track(0.5, 16); // ~0.03 px/ms, below threshold
    release(18);

    expect(pending.size).toBe(0);
    expect(onFling).not.toHaveBeenCalled();
  });

  it('does not fling when the finger rested before lifting', () => {
    const { reset, track, release, onFling } = create();
    reset(0, 0);
    track(20, 40);
    track(50, 60);
    release(130); // 70ms after the last move

    expect(pending.size).toBe(0);
    expect(onFling).not.toHaveBeenCalled();
  });

  it('stops when onFling reports a boundary (returns false)', () => {
    const onFling: FlingMock = vi.fn<(deltaX: number) => boolean | void>().mockReturnValue(false);
    const { reset, track, release } = create({ onFling });
    reset(300, 0);
    track(150, 16);
    track(0, 32);
    release(34);

    frame(50);
    expect(onFling).toHaveBeenCalledTimes(1);
    expect(pending.size).toBe(0); // boundary halted the fling
  });

  it('does nothing when disabled', () => {
    const { reset, track, release, onFling } = create({ config: () => ({ enabled: false }) });
    reset(300, 0);
    track(0, 32);
    release(34);

    expect(pending.size).toBe(0);
    expect(onFling).not.toHaveBeenCalled();
  });

  it('a shorter timeConstant stops sooner (feels heavier)', () => {
    function flingWith (timeConstant: number) {
      const { reset, track, release } = create({ config: () => ({ timeConstant }) });
      reset(300, 0);
      track(150, 16);
      track(0, 32);
      release(34);
      return runToStop(34);
    }

    expect(flingWith(100)).toBeLessThan(flingWith(400));
  });

  it('clamps a non-positive timeConstant so a fling never runs away', () => {
    const { reset, track, release } = create({ config: () => ({ timeConstant: -100 }) });
    reset(300, 0);
    track(0, 32);
    release(34);

    const frames = runToStop(34);
    expect(frames).toBeLessThan(500); // did not accelerate forever
    expect(pending.size).toBe(0);
  });

  it('falls back to the default when timeConstant is not finite', () => {
    const { reset, track, release } = create({ config: () => ({ timeConstant: NaN }) });
    reset(300, 0);
    track(0, 32);
    release(34);

    const frames = runToStop(34);
    expect(frames).toBeGreaterThan(0);
    expect(pending.size).toBe(0); // decayed to a stop instead of looping forever
  });

  // Magnitude of the fling's first pan step, one frame after the gesture ends.
  function firstStep (buildGesture: (api: ReturnType<typeof create>) => number) {
    const api = create();
    const endTime = buildGesture(api);
    api.onFling.mockClear();
    frame(endTime + 16);
    return Math.abs(api.onFling.mock.calls[0][0]);
  }

  it('compounds a quick same-direction re-fling onto the leftover momentum', () => {
    const lone = firstStep(({ reset, track, release }) => {
      reset(200, 0);
      track(100, 16);
      track(0, 32);
      release(34);
      return 34;
    });

    const compounded = firstStep(({ reset, track, release }) => {
      reset(200, 0);
      track(100, 16);
      track(0, 32);
      release(34);
      frame(50); // fling runs for a frame
      reset(200, 60); // catch it — its speed becomes a decaying carry
      track(100, 76);
      track(0, 92);
      release(94); // same-direction re-fling
      return 94;
    });

    expect(compounded).toBeGreaterThan(lone);
  });

  it('ignores leftover momentum when the re-fling reverses direction', () => {
    const lone = firstStep(({ reset, track, release }) => {
      reset(200, 0); // fling one way
      track(100, 16);
      track(0, 32);
      release(34);
      return 34;
    });

    const reversed = firstStep(({ reset, track, release }) => {
      reset(0, 0); // fling the opposite way
      track(100, 16);
      track(200, 32);
      release(34);
      frame(50);
      reset(200, 60); // catch it
      track(100, 76); // re-fling back the first way
      track(0, 92);
      release(94);
      return 94;
    });

    expect(reversed).toBeCloseTo(lone, 5); // opposite carry not added
  });

  it('stop discards pending gesture samples', () => {
    const { reset, track, stop, release, onFling } = create();
    reset(300, 0);
    track(150, 16);
    track(0, 32);
    stop(); // e.g. a second finger landed
    release(40);

    expect(pending.size).toBe(0);
    expect(onFling).not.toHaveBeenCalled();
  });

  it('reset cancels an in-flight fling', () => {
    const { reset, track, release } = create();
    reset(300, 0);
    track(0, 32);
    release(34);
    expect(pending.size).toBe(1);

    reset(0, 100); // new gesture
    expect(pending.size).toBe(0);
  });

  it('stops the fling when the scope is disposed', () => {
    const { reset, track, release, scope } = create();
    reset(300, 0);
    track(0, 32);
    release(34);
    expect(pending.size).toBe(1);

    scope.stop();
    expect(pending.size).toBe(0);
  });
});
