interface TimelineGroup {
  id: string;
  content: string;
}

interface TimelineItemBase {
  className?: string;
  start: number;
  id?: string;
}

interface TimelineItemRange extends TimelineItemBase {
  type: 'range';
  end: number;
  title?: string;
  group: TimelineGroup['id'];
}

interface TimelineItemPoint extends TimelineItemBase {
  type: 'point';
  title?: string;
  group: TimelineGroup['id'];
}

interface TimelineItemBackground extends TimelineItemBase {
  type: 'background';
  end: number;
  group?: TimelineGroup['id'];
}

interface TimelineMarker extends TimelineItemBase {
  type: 'marker';
  group?: TimelineGroup['id'];
}

type TimelineItem = TimelineItemRange | TimelineItemPoint | TimelineItemBackground | TimelineMarker;
