import { describe, it, expect } from 'vitest';
import { getDistance } from './getDistance.ts';

function touch(clientX: number, clientY: number): Touch {
  return { clientX, clientY } as Touch;
}

describe('getDistance', () => {
  it('returns 0 for the same point', () => {
    expect(getDistance(touch(10, 20), touch(10, 20))).toBe(0);
  });

  it('calculates horizontal distance', () => {
    expect(getDistance(touch(0, 0), touch(100, 0))).toBe(100);
  });

  it('calculates vertical distance', () => {
    expect(getDistance(touch(0, 0), touch(0, 50))).toBe(50);
  });

  it('calculates diagonal distance (3-4-5 triangle)', () => {
    expect(getDistance(touch(0, 0), touch(3, 4))).toBe(5);
  });

  it('handles negative coordinate differences', () => {
    expect(getDistance(touch(10, 10), touch(7, 6))).toBe(5);
  });

  it('is symmetric', () => {
    const a = touch(3, 7);
    const b = touch(15, 22);
    expect(getDistance(a, b)).toBe(getDistance(b, a));
  });
});
