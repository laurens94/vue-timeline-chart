/**
 * Returns the index of the row that contains the point, or -1. The first `rowCount` rows must be stacked vertically from top to bottom.
 * Rows without height (e.g. `display: none`) are skipped.
 */
export function findRowIndexAtPoint (rows: ArrayLike<Element>, rowCount: number, point: { clientX: number; clientY: number }): number {
  let low = 0;
  let high = rowCount - 1;
  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    let index = middle;
    let rect = rows[index].getBoundingClientRect();
    while (rect.height === 0 && index < high) {
      index++;
      rect = rows[index].getBoundingClientRect();
    }
    if (rect.height === 0 || point.clientY < rect.top) {
      high = middle - 1;
    }
    else if (point.clientY >= rect.bottom) {
      low = index + 1;
    }
    else {
      return point.clientX >= rect.left && point.clientX < rect.right ? index : -1;
    }
  }
  return -1;
}
