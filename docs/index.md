---
# https://vitepress.dev/reference/default-theme-home-page
layout: home
head: [['link', { rel: 'icon', href: '/vue-timeline-chart/favicon.svg' }]]

hero:
  name: "vue-timeline-chart"
  text: "Vue 3 component"
  tagline: A simple yet versatile component that lets you plot points and ranges on a timeline.
  image:
    src: /logo.svg
    alt: Vue Timeline Chart
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/laurens94/vue-timeline-chart

features:
  - title: Zooming
    icon: ↔
    details: Near-infinite zooming in and out of the timeline chart.
  - title: Infinite scrolling
    icon: ⇄
    details: Scroll seamlessly without being limited to a single day/month/year.
  - title: Plot anything
    icon: ␣
    details: Use ranges, points, markers, backgrounds or even line charts.
  - title: Adjustable timestamp labels
    icon: 💬
    details: Adjust the timestamp labels per scale on the timeline chart.
  - title: Automatic timestamp snapping 
    icon: 📆
    details: Snap timestamps to different units of time based on the zoom-level
  - title: Customizable
    icon: ⚙️
    details: Fully customizable and extendable

---


<style>
:root {
  --color-1: #8338ec;
  --color-2: #ffbe0b;
  --color-3: #3a86ff;
  --color-4: #ff006e;
  --vp-home-hero-name-color: transparent;
  --vp-home-hero-name-background: linear-gradient(120deg,  var(--color-1), var(--color-2), var(--color-3), var(--color-4));
  --vp-home-hero-image-background-image: linear-gradient(120deg,  var(--color-1), var(--color-2), var(--color-3), var(--color-4));
  --vp-home-hero-image-filter: blur(4rem);
}

.clip::selection {
  color: var(--color-3);
  background-clip: none;
  background-color: color-mix(in srgb, currentColor, transparent 70%);
}
</style>
