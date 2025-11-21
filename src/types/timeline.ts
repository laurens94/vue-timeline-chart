// #region TimelineGroup
export interface TimelineGroup {
  /** Unique ID for the group */
  id: string;
  /** Label for the group */
  label?: string;
  /** CSS class for the group */
  className?: string;
  /** CSS declarations to apply to the group (e.g. `{ '--height': '20%' }`) */
  cssVariables?: Record<string, string>;
}
// #endregion TimelineGroup

// #region TimelineItem
export interface TimelineItemBase {
  /** Unique ID for the item, should be defined for stability */
  id?: string;
  /** Type of item, one of: `point`, `range`, `background` or `marker` */
  type: 'point' | 'range' | 'background' | 'marker';
  /** Start timestamp */
  start: number;
  /** End timestamp */
  end?: number;
  /** CSS class for the item */
  className?: string;
  /** CSS declarations to apply to the item (e.g. `{ '--height': '20%' }`) */
  cssVariables?: Record<string, string>;
  /** Group ID to assign the item to */
  group?: TimelineGroup['id'];
}

export interface TimelineItemRange extends TimelineItemBase {
  type: 'range';
  end: number;
  title?: string;
  group: TimelineGroup['id'];
}

export interface TimelineItemPoint extends TimelineItemBase {
  type: 'point';
  title?: string;
  group: TimelineGroup['id'];
}

export interface TimelineItemBackground extends TimelineItemBase {
  type: 'background';
  end: number;
  group?: TimelineGroup['id'];
}

export interface TimelineMarker extends TimelineItemBase {
  type: 'marker';
  group?: TimelineGroup['id'];
}

export type TimelineItem = TimelineItemRange | TimelineItemPoint | TimelineItemBackground | TimelineMarker;
// #endregion TimelineItem

// #region TimelineBaseUnits
/** Base temporal units */
export type TimelineBaseUnits = 'ms' | 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years';
// #endregion TimelineBaseUnits

// #region TimelineScale
/** Single timeline scale definition */
export type TimelineScale = {
  unit: TimelineBaseUnits;
  step: number;
}
// #endregion TimelineScale

// #region TimelineScales
/** Timeline scale definition with multiple steps: for each step a TimelineScale is created */
export type TimelineScales = {
  unit: TimelineBaseUnits;
  steps: number[];
}
// #endregion TimelineScales
