---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "vue-timeline-chart"
  text: "Vue 3 component"
  tagline: A simple yet versatile component that lets you plot points and ranges on a timeline.
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/laurens94/vue-timeline-chart
  image:
    src: https://github.com/laurens94/vue-timeline-chart/assets/5780704/5ab32f01-0034-4538-a2f3-15f03956420a
    alt: timeline with customized styling

features:
  - title: Zooming
    icon: ↔
    details: Zoom in and out of the timeline chart to see more or less detail.
  - title: Infinite scrolling
    icon: ⇄
    details: Scroll through the timeline chart to see more data.
  - title: Plot anything
    icon: ␣
    details: Use ranges, points, markers, backgrounds or even line charts
  - title: Adjustable timestamp labels
    icon: 💬
    details: Adjust the timestamp labels per scale on the timeline chart.
  - title: Customizable
    icon: ⚙️
    details: Fully customizable and extendable

---


<style>
:root {
  --vp-home-hero-name-color: transparent;
  --vp-home-hero-name-background: -webkit-linear-gradient(120deg, #bd34fe 30%, #41d1ff);

  --vp-home-hero-image-background-image: linear-gradient(-45deg, #bd34fe 50%, #47caff 50%);
  --vp-home-hero-image-filter: blur(4rem);
}
</style>
