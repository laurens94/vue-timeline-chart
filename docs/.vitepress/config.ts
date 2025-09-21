import { transformerTwoslash } from '@shikijs/vitepress-twoslash';
import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Vue Timeline Chart",
  description: "Documentation",
  base: '/vue-timeline-chart/',
  head: [
    ['script', { src: 'https://unpkg.com/d3@7.9.0/dist/d3.min.js', integrity: 'sha384-CjloA8y00+1SDAUkjs099PVfnY2KmDC2BZnws9kh8D/lX1s46w6EPhpXdqMfjK6i', crossorigin: 'anonymous', defer: 'true' }],
    ['script', { src: 'https://unpkg.com/@popperjs/core@2.11.8/dist/umd/popper.min.js', integrity: 'sha384-I7E8VVD/ismYTF4hNIPjVp/Zjvgyol6VFvRkX/vR+Vc4jQkC+hVqc2pM8ODewa9r', crossorigin: 'anonymous', defer: 'true' }],
    ['script', { src: 'https://unpkg.com/tippy.js@6.3.7/dist/tippy-bundle.umd.min.js', integrity: 'sha384-AiTRpehQ7zqeua0Ypfa6Q4ki/ddhczZxrKtiQbTQUlJIhBkTeyoZP9/W/5ulFt29', crossorigin: 'anonymous', defer: 'true' }],
  ],
  markdown: {
    codeTransformers: [
      transformerTwoslash()
    ],
    // Explicitly load these languages for types highlighting
    languages: ['js', 'ts', 'tsx', 'vue', 'scss', 'css'],
    theme: 'one-dark-pro',
  },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/favicon.svg',
    externalLinkIcon: true,
    search: {
      provider: 'local',
      options: {
        detailedView: true,
      }
    },
    nav: [
      { text: 'Guide', link: '/guide/getting-started', activeMatch: '/guide/' },
      { text: 'API', link: '/reference/props', activeMatch: '/reference/' },
      { text: 'Examples', link: '/examples/basic-example', activeMatch: '/examples/' },
      { text: 'Changelog', link: 'https://github.com/laurens94/vue-timeline-chart/releases' },
    ],
    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Getting Started', link: '/guide/getting-started' },
          { text: 'Performance', link: '/guide/performance' },
          { text: 'Timestamps and Scale', link: '/guide/timestamps-and-scale' },
          { text: 'Touch input', link: '/guide/touch-input' },
        ]
      },
      {
        text: 'API Reference',
        collapsed: false,
        items: [
          { text: 'Props', link: '/reference/props' },
          { text: 'Events', link: '/reference/events' },
          { text: 'Methods', link: '/reference/methods' },
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
          { text: 'Hover position', link: '/examples/hover-position' },
          { text: 'Custom timestamp labels', link: '/examples/custom-timestamp-labels' },
          { text: 'Custom timestamp intervals', link: '/examples/custom-timestamp-intervals' },
          { text: 'Draggable Items', link: '/examples/draggable-items' },
          { text: 'Custom Charts or Canvas Rendering', link: '/examples/custom-charts-or-canvas-rendering' },
          { text: 'Synced timelines', link: '/examples/synced-timelines' },
          { text: 'Tooltips', link: '/examples/tooltips' },
          { text: 'Set viewport', link: '/examples/set-viewport' },
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/laurens94/vue-timeline-chart' }
    ]
  }
})
