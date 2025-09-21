// @noErrors
<template>
  <Timeline
    :groups="[{id: '1'}, {id: '2'}]"
    :viewportMin="0"
    :viewportMax="8000"
    :renderTimestampLabel="(timestamp, scale) => timestamp"
  />
</template>
