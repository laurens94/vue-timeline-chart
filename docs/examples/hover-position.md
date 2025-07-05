<script setup>
import Example from './hover-position.vue'
</script>

# Hover position

<Example/>

## Code

<<< ./hover-position.vue{16-22,32-33}

::: info
`contain: unset` is set on the marker to allow the text content to overflow the `1px` wide marker.
:::

::: tip
Make sure dynamic items such as a hover position marker are not added to the `items` prop, as it would rerender all items every time the hover position changes and slow down the component.
:::
