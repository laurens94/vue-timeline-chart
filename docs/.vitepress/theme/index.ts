// .vitepress/theme/index.ts
import { h } from 'vue';
import type { Theme } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import Timeline from '../../../src/components/Timeline.vue';
import TwoslashFloatingVue from '@shikijs/vitepress-twoslash/client';
import '@shikijs/vitepress-twoslash/style.css';
import SupportNote from './SupportNote.vue';
import './custom.css';

export default {
  extends: DefaultTheme,
  Layout: () => h(DefaultTheme.Layout, null, {
    'aside-outline-after': () => h(SupportNote),
  }),
  enhanceApp ({ app }) {
    app.component('Timeline', Timeline);
    app.use(TwoslashFloatingVue);
  },
} satisfies Theme;
