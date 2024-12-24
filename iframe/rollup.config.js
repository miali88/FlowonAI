import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import babel from '@rollup/plugin-babel';
import postcss from 'rollup-plugin-postcss';

export default {
  input: './iframeChat_text.js',
  output: [
    {
      file: 'text_dist/iframeChat_text.min.js',
      format: 'iife',
      name: 'IframeChatText',
      sourcemap: true
    },
  ],
  plugins: [
    resolve({
      browser: true
    }),
    commonjs(),
    postcss({
      inject: true,
      minimize: true
    }),
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
      presets: ['@babel/preset-env']
    }),
    terser()
  ]
};