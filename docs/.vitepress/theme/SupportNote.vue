<template>
  <p class="support-note">
    I build vue-timeline-chart in my free time. As a thank-you, you can<br />
    <a
      href="https://ko-fi.com/lauwerens"
      target="_blank"
      rel="noreferrer"
      data-umami-event="donate"
    >☕ buy me a coffee</a> ❤️
  </p>
</template>

<style scoped>
  .support-note {
    margin-top: 1.5rem;
    padding-top: 1rem;
    border-top: 1px solid var(--vp-c-divider);
    font-size: 0.8125rem;
    line-height: 1.5;
    color: var(--vp-c-text-2);

    a {
      color: var(--vp-c-brand-1);
      font-weight: 500;

      &:hover {
        text-decoration: underline;
      }
    }
  }
</style>
