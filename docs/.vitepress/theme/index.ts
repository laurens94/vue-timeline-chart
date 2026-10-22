// .vitepress/theme/index.ts
import { inBrowser, type Theme } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import Timeline from '../../../src/components/Timeline.vue';
import TwoslashFloatingVue from '@shikijs/vitepress-twoslash/client';
import '@shikijs/vitepress-twoslash/style.css';
import './custom.css';

export default {
  extends: DefaultTheme,
  enhanceApp ({ app, router }) {
    app.component('Timeline', Timeline);
    app.use(TwoslashFloatingVue);

    const pixelUrl = import.meta.env.VITE_DOCS_TRACKING_PIXEL_URL;
    if (inBrowser && pixelUrl) {
      const track = () => {
        new Image().src = pixelUrl;
      };
      track();
      router.onAfterRouteChange = track;
    }
  },
} satisfies Theme;
