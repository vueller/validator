import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import vue from 'rollup-plugin-vue';
import postcss from 'rollup-plugin-postcss';

export default [
  // ESM build (core only, no Vue)
  {
    input: 'src/core/index.js',
    output: {
      file: 'dist/validator.esm.js',
      format: 'es',
      inlineDynamicImports: true
    },
    plugins: [nodeResolve(), commonjs()],
    external: []
  },
  // CommonJS build (core only, no Vue)
  {
    input: 'src/core/index.js',
    output: {
      file: 'dist/validator.cjs.js',
      format: 'cjs',
      exports: 'named',
      inlineDynamicImports: true
    },
    plugins: [nodeResolve(), commonjs()],
    external: []
  },
  // Vue 3 extension build
  {
    input: 'src/vue/index.js',
    output: {
      file: 'dist/validator-vue.esm.js',
      format: 'es',
      inlineDynamicImports: true
    },
    external: ['vue'],
    plugins: [
      vue({
        css: false // Let PostCSS handle CSS
      }),
      postcss({
        extract: false,
        inject: true
      }),
      nodeResolve(),
      commonjs()
    ]
  }
];
