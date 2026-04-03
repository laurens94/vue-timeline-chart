import { describe, it, expect } from 'vitest';
import { leadingZero } from './leadingZero.ts';

describe('leadingZero', () => {
  it('pads a single-digit number', () => {
    expect(leadingZero(5)).toBe('05');
  });

  it('pads zero', () => {
    expect(leadingZero(0)).toBe('00');
  });

  it('does not pad a two-digit number', () => {
    expect(leadingZero(12)).toBe('12');
  });

  it('does not pad a three-digit number', () => {
    expect(leadingZero(123)).toBe('123');
  });

  it('pads a single-digit string', () => {
    expect(leadingZero('3')).toBe('03');
  });

  it('does not pad a two-digit string', () => {
    expect(leadingZero('42')).toBe('42');
  });

  it('trims whitespace before padding', () => {
    expect(leadingZero(' 7 ')).toBe('07');
  });

  it('handles undefined', () => {
    expect(leadingZero(undefined)).toBe('undefined');
  });
});
