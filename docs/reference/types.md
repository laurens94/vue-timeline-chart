# Types

## TimelineGroup

TimelineGroups are the rows in the timeline with items.

<<< ../../src/types/timeline.ts#TimelineGroup

## TimelineItem

TimelineItems can be points, ranges, backgrounds or markers. They are assigned to a group's `id` by their `group` property.

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `id` | `string` | `undefined` | Unique ID, to match with `activeItems` prop |
| `start` | `number` | <Badge type="info" text="required" /> | Timestamp |
| `group` | `string` | `undefined` | `id` of the [TimelineGroup](#timelinegroup) to assign the item to |
| `end` | `number` | <Badge type="info" text="required for range and background" /> | Timestamp, only used for type `range` and `background` |
| `type` | `string` | <Badge type="info" text="required" /> | Type of item, one of: `point`, `range`, `background` or `marker` |
| `className` | `string` | `''` | CSS class(es) |
| `cssVariables` | `Record<string, string>` | `{}` | CSS variables to apply to the item (e.g. `{ '--height': '20%' }`) |

<<< ../../src/types/timeline.ts#TimelineItem

## TimelineMarker

To improve performance, you can add markers as an individual prop, instead of together with `items`. This allows you to update the position of a marker (e.g. to show the current time) while keeping the rest of the items cached.

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `id` | `string` | `undefined` | Unique ID, to match with `activeItems` prop |
| `type` | `string` | <Badge type="info" text="required" /> | `marker` |
| `start` | `number` | <Badge type="info" text="required" /> | Timestamp |
| `className` | `string` | `''` | CSS class(es) |
| `cssVariables` | `Record<string, string>` | `{}` | CSS variables to apply to the item (e.g. `{ '--height': '20%' }`) |

## TimelineBaseUnits

See [Timestamps and scale](/guide/timestamps-and-scale.md) for more information.

<<< ../../src/types/timeline.ts#TimelineBaseUnits

## TimelineScale

See [Timestamps and scale](/guide/timestamps-and-scale.md) for more information.

<<< ../../src/types/timeline.ts#TimelineScale

## TimelineScales

See [Timestamps and scale](/guide/timestamps-and-scale.md) for more information.

```ts
export type TimelineScales = {
  unit: TimelineBaseUnits;
  steps: number[];
}
```
