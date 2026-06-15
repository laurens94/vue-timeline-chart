// #region TimelineGroup
export interface TimelineGroup {
  /** Unique ID for the group */
  id: string;
  /** Label for the group */
  label?: string;
  /** CSS class for the group */
  className?: string;
  /** CSS declarations to apply to the group (e.g. `{ '--label-background': 'rebeccapurple' }`) */
  cssVariables?: Record<string, string>;
  /** Per-group stacking options; merged over the component-level `stacking` prop. */
  stacking?: TimelineStackingOptions;
}
// #endregion TimelineGroup

// #region TimelineStacking
/** Options controlling vertical stacking of time-overlapping items. */
export interface TimelineStackingOptions {
  /** Enable vertical stacking of time-overlapping items. */
  enabled?: boolean;
  /**
   * `'dataset'` (default): lanes computed over all items in the group, so the
   * height is stable and only recomputes on zoom/resize/data change.
   * `'viewport'`: lanes computed over visible items only — more compact, but
   * recomputes (and may change height) on pan.
   */
  strategy?: 'dataset' | 'viewport';
  /** Custom processing order. Overrides the default start-time sort. */
  compare?: (a: TimelineItem, b: TimelineItem) => number;
  /**
   * Minimum horizontal footprint (in px) an item claims for collision
   * detection. Allows items to stack earlier than they would otherwise,
   * avoiding visual clashes. `0` = pure time-interval collision.
   */
  collisionWidth?: number;
  /**
   * Maximum number of lanes a group may grow to. Once the cap is reached,
   * items will overlap with other items in the existing lanes. This limits the
   * group height, which matters when using `collisionWidth`, since all items
   * will stack when the timeline is zoomed far out. Defaults to `5`; set
   * `Infinity` to disable the cap.
   */
  maxLanes?: number;
}
// #endregion TimelineStacking

// #region TimelineItem
export interface TimelineItemBase {
  /** Unique ID for the item, required for stability and performance */
  id: string;
  /** Type of item, one of: `point`, `range`, `background` or `marker` */
  type: 'point' | 'range' | 'background' | 'marker';
  /** Start timestamp */
  start: number;
  /** End timestamp */
  end?: number;
  /** CSS class for the item */
  className?: string;
  /** CSS declarations to apply to the item (e.g. `{ '--item-background': 'rebeccapurple' }`) */
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
