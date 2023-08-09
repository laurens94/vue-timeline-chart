export const leadingZero = function (nr?: number | string): string {
  return `${nr}`.trim().padStart(2, '0');
};

