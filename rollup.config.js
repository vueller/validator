import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import vue from 'rollup-plugin-vue';
import postcss from 'rollup-plugin-postcss';

export default [
  // ESM build
  {
    input: 'src/index.js',
    output: {
      file: 'dist/validator.esm.js',
      format: 'es'
    },
    plugins: [
      nodeResolve(),
      commonjs()
    ]
  },
  // CommonJS build
  {
    input: 'src/index.js',
    output: {
      file: 'dist/validator.cjs.js',
      format: 'cjs',
      exports: 'named'
    },
    plugins: [
      nodeResolve(),
      commonjs()
    ]
  },
  // Vue 3 extension build
  {
    input: 'src/vue/index.js',
    output: {
      file: 'dist/validator-vue.esm.js',
      format: 'es'
    },
    external: ['vue'],
    plugins: [
      vue({
        css: false, // Let PostCSS handle CSS
      }),
      postcss({
        extract: false,
        inject: true,
      }),
      nodeResolve(),
      commonjs()
    ]
  }
];
