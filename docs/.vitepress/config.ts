import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Vue Timeline Chart",
  description: "Documentation",
  base: '/vue-timeline-chart/',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Guide', link: '/guide/getting-started', activeMatch: '/guide/' },
      { text: 'API', link: '/reference/props', activeMatch: '/reference/' },
      { text: 'Examples', link: '/examples/basic-example', activeMatch: '/examples/' },
    ],

    sidebar: [
      {
        text: 'Introduction',
        items: [
          { text: 'Getting Started', link: '/guide/getting-started' },
        ]
      },
      {
        text: 'API Reference',
        collapsed: false,
        items: [
          { text: 'Props', link: '/reference/props' },
          { text: 'Events', link: '/reference/events' },
          { text: 'Slots', link: '/reference/slots' },
          { text: 'Types', link: '/reference/types', items: [
            { text: 'TimelineGroup', link: '/reference/types#timelinegroup' },
            { text: 'TimelineItem', link: '/reference/types#timelineitem' },
            { text: 'TimelineMarker', link: '/reference/types#timelinemarker' },
          ] },
        ]
      },
      {
        text: 'Examples',
        collapsed: false,
        items: [
          { text: 'Basic example', link: '/examples/basic-example' },
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/laurens94/vue-timeline-chart' }
    ]
  }
})
