<script setup>
  import { ref } from 'vue'
  const scale = ref(undefined);
  const minTimestampWidth = ref(100);
</script>

# Timestamps and scale

## Timestamps

The timestamps that are displayed on the top of the timeline will snap to a certain unit of time, depending on the zoom level and some other factors.

The `minTimestampWidth` prop sets a minimum width to prevent overlapping timestamps.

`minTimestampWidth`: 
<input type="range" v-model="minTimestampWidth" id="minTimestampWidth" min="10" max="150" /> (`{{ minTimestampWidth }}`)

  <Timeline
    :items="[]"
    :groups="[{id: 1, label: 'Zoom in and out to see the scale change'},{ id: 2, label: scale }]"
    :viewportMin="-4714566600000"
    :viewportMax="1714566600000"
    @changeScale="scale = $event"
    :minTimestampWidth="minTimestampWidth"
  />

::: info
Which timestamps are displayed is determined by:

1. The maximum amount of timestamps in view (automatically calculated by taking the container width and dividing it by the `minTimestampWidth` prop)
2. The possible [scales](#scales) to snap to.
:::

## Scales

The interval between the timestamps and which unit of time is being used, is internally called a _scale_.

By default, the timestamps will snap to the scales below.

The `scales` prop allows you to overwrite them.

<<< ../../src/composables/useScale.ts#default-scales


::: warning IMPORTANT
The calculation for steps is done by taking the timestamp and doing a modulo operation with the unit in milliseconds.

The time values (`ms`, `seconds`, `minutes`, `hours`, `years`) are evenly distributed and easy to do calculations with, so here the steps property is intuitive.

However, `days` and `months` are based on the calendar, e.g. `days` will snap to the start of every day and `months` will snap to the start of every month. `weeks` only works with a step of 1.

Because of this, the modulo operation is only taking the dayOfMonth or monthOfYear into account, which might create some gaps (e.g. between May 30th and June 2nd when using a step of 2).
:::
