interface TimelineGroup {
  content: string;
  id: string;
}

interface TimelineItemBase {
  className?: string;
  start: number;
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

type TimelineItem = TimelineItemRange | TimelineItemPoint | TimelineItemBackground;
