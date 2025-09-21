<script setup>
import Example from './tooltips.vue'
</script>

# Tooltips

This example shows how to add tooltips using [Tippy.js.](https://atomiks.github.io/tippyjs/)

::: info
When manually adding tooltips using CSS, you might want to overwrite the [`contain: strict`](https://developer.mozilla.org/en-US/docs/Web/CSS/contain) CSS declaration on those timeline items. Setting it to `layout size` will still benefit from increased performance and allows overflown content (such as tooltips) to be visible.
:::

<Example/>

## Code

<<< ./tooltips.vue{vue twoslash}
