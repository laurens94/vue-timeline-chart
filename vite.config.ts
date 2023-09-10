import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

// https://vitejs.dev/guide/build.html#library-mode
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'vue-timeline-chart',
      fileName: 'vue-timeline-chart',
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        exports: 'named',
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
  plugins: [dts({
    copyDtsFiles: true,
    outDir: [
      'dist',
    ],
    staticImport: true,
    compilerOptions: {
      declarationMap: true,
    },
  }), vue()],
});
