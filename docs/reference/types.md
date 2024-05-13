# Types

## TimelineGroup

TimelineGroups are the rows in the timeline with items.

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `id` | `string` | <Badge type="info" text="required" /> | Unique ID, to bind items to |
| `label` | `string` | `undefined` | Group label |
| `className` | `string` | `''` | CSS class(es) |
| `content` | `string` | `undefined` | Group label <Badge type="danger" text="deprecated" /> |

## TimelineItem

TimelineItems can be points, ranges, backgrounds or markers. They are assigned to a group by their `group` property.

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `id` | `string` | `undefined` | Unique ID, to match with `activeItems` prop |
| `start` | number | <Badge type="info" text="required" /> | Timestamp |
| `end` | number | <Badge type="info" text="required for range and background" /> | Timestamp, only used for type `range` and `background` |
| `className` | `string` | `''` | CSS class(es) |
| `type` | `string` | <Badge type="info" text="required" /> | Type of item, one of: `point`, `range`, `background` or `marker` |
| `cssVariables` | `Record<string, string>` | `{}` | CSS variables to apply to the item (e.g. `{ '--height': '20%' }`) |

## TimelineMarker

To improve performance, you can add markers as an individual prop, instead of together with `items`. This allows you to update the position of a marker (e.g. to show the current time) while keeping the rest of the items cached.

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `id` | `string` | `undefined` | Unique ID, to match with `activeItems` prop |
| `start` | number | <Badge type="info" text="required" /> | Timestamp |
| `className` | `string` | `''` | CSS class(es) |
| `type` | `string` | <Badge type="info" text="required" /> | `marker` |
