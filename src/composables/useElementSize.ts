import { shallowRef, TemplateRef, watch } from 'vue';

export const useElementSize = (element: TemplateRef<HTMLElement>) => {
  const width = shallowRef(0);
  const height = shallowRef(0);

  let observer: ResizeObserver;

  function connect (el: HTMLElement) {
    observer = new ResizeObserver(([entry]) => {
      const rect = entry?.contentRect;
      if (rect) {
        [width.value, height.value] = [rect.width, rect.height];
      }
    });

    observer.observe(el);
  }

  watch(element, (el) => {
    if (el) {
      connect(el);
      return;
    }
    observer?.disconnect();
  });

  return {
    width,
    height,
  };
};
