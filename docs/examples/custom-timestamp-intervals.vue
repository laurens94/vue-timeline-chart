// @noErrors
<script setup>
  function getQuarter (timestamp) {
    const year = new Date(timestamp).getFullYear();
    const month = new Date(timestamp).getMonth();
    return `Q${Math.floor(month / 3) + 1} ${month === 0 ? year : ''}`;
  }
</script>

<template>
  <Timeline
    :groups="[{id: '1'}, {id: '2'}]"
    :viewportMin="new Date(`${new Date().getFullYear()}-01-01`).getTime()"
    :viewportMax="new Date(`${new Date().getFullYear() + 1}-01-01`).getTime()"
    :scales="[
      { unit: 'days', steps: [1, 2] },
      { unit: 'months', steps: [1, 3] },
    ]"
    :minTimestampWidth="60"
  >
    <template #timestamp="{ timestamp, scale }">
      <template v-if="scale.unit === 'months' && scale.step === 3">
        {{ getQuarter(timestamp) }}
      </template>
    </template>
  </Timeline>
</template>
