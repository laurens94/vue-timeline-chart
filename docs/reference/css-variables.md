---
outline: deep
---

# CSS variables

The timeline is styled almost entirely with CSS custom properties, so you can theme it without overriding selectors. Set them at whichever level you need:

- **Whole timeline** — on the component (a wrapping class or the `style` attribute), e.g. `.timeline { --item-background: teal; }`.
- **A single group** — through that group's [`cssVariables`](/reference/types#timelinegroup).
- **A single item** — through that item's [`cssVariables`](/reference/types#timelineitem).

Values cascade as expected (in order of `timeline-component` → `group` → `item`), so a variable set on a group or item overrides the same variable set on the timeline.

## Timeline

| Variable | Default | Description |
| --- | --- | --- |
| `--font-family` | `inherit` | Font family for the whole timeline |

## Timestamps

| Variable | Default | Description |
| --- | --- | --- |
| `--timestamps-background` | `color-mix(in srgb, currentColor 5%, transparent)` | Background of the timestamps header |
| `--timestamps-color` | `inherit` | Text color of the timestamps header |
| `--timestamp-padding-block` | `0.2em` | Block padding of a timestamp label |
| `--timestamp-padding-inline` | `0.4em` | Inline padding of a timestamp label |
| `--timestamp-line-height` | `1.5em` | Line height of timestamp labels (sets the header height) |
| `--gridline-border-left` | `1px dashed color-mix(in srgb, currentColor 15%, transparent)` | The vertical gridline drawn at each timestamp |

## Groups and labels

| Variable | Default | Description |
| --- | --- | --- |
| `--group-border-top` | `1px solid color-mix(in srgb, currentColor 15%, transparent)` | Top border of each group |
| `--group-padding-top` | `0` | Space above a group's items |
| `--group-padding-bottom` | `0.4em` | Space below a group's items |
| `--group-items-height` | `2em` | Height of a group's item row |
| `--label-padding` | `0.2em 0.4em 0.4em` | Padding of the group label |
| `--label-line-height` | `1em` | Line height of the group label |
| `--label-color` | `currentColor` | Group label text color |
| `--label-background` | `transparent` | Group label background |
| `--label-width` | `auto` | Group label width |

## Items

| Variable | Default | Description |
| --- | --- | --- |
| `--item-background` | `#007bff` | Background of an item. Markers default to `red` and backgrounds to `rgb(0 0 0 / 10%)`. |
| `--item-point-size` | `1rem` | Diameter of a `point` item |
| `--item-range-border-radius` | `0.5em` | Corner radius of a `range` item |
| `--item-marker-width` | `1px` | Width of a `marker` item |

### Stacking

These apply when [stacking](/examples/stacking-items) is enabled.

| Variable | Default | Description |
| --- | --- | --- |
| `--item-stack-height` | `var(--group-items-height, 2em)` | Height of a single lane. Defaults to the row height, so a single-lane group looks identical whether or not stacking is enabled. |
| `--item-stack-gap` | `0.125em` | Vertical gap between lanes |

#### Read-only

These are set by the component so you can make the lane height respond to the amount of lanes within a stack (see the [stacking example](/examples/stacking-items)).

| Variable | Set on | Description |
| --- | --- | --- |
| `--_lane-count` | each group | Current number of lanes in the group |
| `--_stack-count` | each item | Current number of lanes within that item's stack |
