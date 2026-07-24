
# Touch input <Badge type="tip" text="^4.0.0" />

Pinch-to-zoom and up to 2-finger panning are supported.

::: tip
By default, the component sets `touch-action: pan-y` on the wrapper element.
This prevents the browser from interfering with the touch gestures and only allows vertical scrolling.

For an even smoother experience, set `touch-action: none` on the wrapper element.

[Read more about `touch-action` on MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action)
:::

## Momentum <Badge type="tip" text="^5.2.0" />

A single-finger pan keeps gliding after you lift your finger, decelerating to a
stop, mimicking native scroll behavior.

Momentum is enabled by default and configurable via the [`momentum`](/reference/props#momentum) prop.
