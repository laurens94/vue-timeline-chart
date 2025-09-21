// .vitepress/theme/index.ts
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import Timeline from '../../../src/components/Timeline.vue'
import TwoslashFloatingVue from '@shikijs/vitepress-twoslash/client'
import '@shikijs/vitepress-twoslash/style.css'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app}) {
    app.component('Timeline', Timeline)
    app.use(TwoslashFloatingVue)
  }
} satisfies Theme
