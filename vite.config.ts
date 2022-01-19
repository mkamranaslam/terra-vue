import * as path from 'path';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import vue from '@vitejs/plugin-vue';
import { viteExternalsPlugin } from 'vite-plugin-externals'

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.NODE_ENV === "production" ? "/terra-vue/" : "/",
  resolve: {
    alias: {
      '@terra-money/terra.js': '@terra-money/terra.js/dist/bundle.js',
      'process': path.resolve(__dirname, 'src/polyfills/process-es6.js'),
      'readable-stream': 'vite-compatible-readable-stream',
    },
  },
  //define: {
  //  'process.env': {},
  //},
  //server: {
  //  https: {
  //    cert: process.env.LOCALHOST_HTTPS_CERT,
  //    key: process.env.LOCALHOST_HTTPS_KEY,
  //    //@ts-ignore
  //    maxSessionMemory: 100,
  //    peerMaxConcurrentStreams: 300,
  //  },
  //},
  plugins: [
    tsconfigPaths(),
    vue(),
    viteExternalsPlugin({
      electron: 'electron',
      'electron-fetch': 'electron-fetch',
      react: 'React',
      lazy: ['electron', 'react', 'lazy'],
    }),
  ],
  //build: {
  //  sourcemap: true,
  //  rollupOptions: {
  //    input: {
  //      main: path.resolve(__dirname, 'index.html'),
  //      subpage: path.resolve(__dirname, 'subpage.html'),
  //    },
  //  },
  //},
});
