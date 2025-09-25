export interface TimelineGroup {
  id: string;
  label?: string;
  className?: string;
  cssVariables?: Record<string, string>;
}

export interface TimelineItemBase {
  className?: string;
  start: number;
  end?: number;
  id?: string;
  cssVariables?: Record<string, string>;
  overlapCount?: number;
  overlapIndex?: number;
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
