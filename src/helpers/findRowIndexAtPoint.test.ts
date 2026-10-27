import { describe, it, expect } from 'vitest';
import { findRowIndexAtPoint } from './findRowIndexAtPoint.ts';

function rows (count: number, hidden: number[] = []): Element[] {
  let top = 0;
  return Array.from({ length: count }, (_, index) => {
    const rect = hidden.includes(index)
      ? { top: 0, bottom: 0, left: 0, right: 0, height: 0 }
      : { top, bottom: top + 40, left: 0, right: 1000, height: 40 };
    if (!hidden.includes(index)) {
      top += 50;
    }
    return { getBoundingClientRect: () => rect } as Element;
  });
}

describe('findRowIndexAtPoint', () => {
  it('finds every row', () => {
    for (const count of [1, 2, 9, 200]) {
      for (let index = 0; index < count; index++) {
        expect(findRowIndexAtPoint(rows(count), count, { clientX: 300, clientY: index * 50 + 20 })).toBe(index);
      }
    }
  });

  it('includes the top edge and excludes the bottom edge', () => {
    expect(findRowIndexAtPoint(rows(3), 3, { clientX: 300, clientY: 50 })).toBe(1);
    expect(findRowIndexAtPoint(rows(3), 3, { clientX: 300, clientY: 90 })).toBe(-1);
  });

  it('returns -1 above the first row, below the last row and in a gap between rows', () => {
    expect(findRowIndexAtPoint(rows(3), 3, { clientX: 300, clientY: -10 })).toBe(-1);
    expect(findRowIndexAtPoint(rows(3), 3, { clientX: 300, clientY: 200 })).toBe(-1);
    expect(findRowIndexAtPoint(rows(3), 3, { clientX: 300, clientY: 45 })).toBe(-1);
  });

  it('returns -1 left and right of the row', () => {
    expect(findRowIndexAtPoint(rows(3), 3, { clientX: -1, clientY: 20 })).toBe(-1);
    expect(findRowIndexAtPoint(rows(3), 3, { clientX: 1000, clientY: 20 })).toBe(-1);
  });

  it('ignores elements after rowCount', () => {
    expect(findRowIndexAtPoint(rows(3), 2, { clientX: 300, clientY: 120 })).toBe(-1);
  });

  it('skips rows without height', () => {
    for (const hidden of [[0], [4], [8], [3, 4, 5], [0, 1, 2, 3, 4, 5, 6, 7], [1, 2, 3, 4, 5, 6, 7, 8]]) {
      const visible = [...Array(9).keys()].filter(index => !hidden.includes(index));
      visible.forEach((index, position) => {
        expect(findRowIndexAtPoint(rows(9, hidden), 9, { clientX: 300, clientY: position * 50 + 20 })).toBe(index);
      });
      expect(findRowIndexAtPoint(rows(9, hidden), 9, { clientX: 300, clientY: visible.length * 50 + 20 })).toBe(-1);
    }
    expect(findRowIndexAtPoint(rows(3, [0, 1, 2]), 3, { clientX: 300, clientY: 0 })).toBe(-1);
  });

  it('returns -1 when there are no rows', () => {
    expect(findRowIndexAtPoint([], 0, { clientX: 300, clientY: 20 })).toBe(-1);
  });
});
