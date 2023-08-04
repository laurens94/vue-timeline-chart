import { Ref, ref, watch } from 'vue';

export const useElementSize = (element: Ref<HTMLElement | null>) => {
  const width = ref(0);
  const height = ref(0);

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
