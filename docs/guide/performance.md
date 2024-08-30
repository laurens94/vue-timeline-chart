
# Performance

All items are rendered as individual DOM elements, so performance can be an issue when dealing with a large number of items.

The biggest performance bottleneck occurs when zooming in/out, as the width of all visible items are recalculated.

Some measures are implemented to improve performance:

- To prevent items from becoming too large, they are clamped to a maximum width (the viewportwidth + an offset). This offset can be adjusted using the `maxOffsetOutsideViewport` prop.

- Scrolling or panning horizontally repositions the items using CSS transforms.

- Items fully outside the viewport are not rendered.

- Items have the `contain: strict` CSS declaration set.

::: tip
When dealing with a large number of items, consider rendering them using a canvas-based rendering approach. See the [Custom Charts or Canvas Rendering example](/examples/custom-charts-or-canvas-rendering) for inspiration how to implement such a component.
:::

