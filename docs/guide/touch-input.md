
# Touch input <Badge type="tip" text="^4.0.0" />

Pinch-to-zoom and up to 2-finger panning are supported.

::: tip
By default, the component sets `touch-action: pan-y` on the wrapper element.
This prevents the browser from interfering with the touch gestures and only allows vertical scrolling.

For an even smoother experience, set `touch-action: none` on the wrapper element.

[Read more about `touch-action` on MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action)
:::