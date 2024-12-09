<script setup>
import Example from './hover-position.vue'
</script>

# Hover position

<Example/>

## Code

<<< ./hover-position.vue{vue}

::: tip
Make sure dynamic items such as a hover position marker are not added to the `items` prop, as it would rerender all items every time the hover position changes and slow down the component.
:::
