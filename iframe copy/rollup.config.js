import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import babel from '@rollup/plugin-babel';
import postcss from 'rollup-plugin-postcss';

export default {
  input: './chatWidget.js',
  output: [
    {
      file: 'dist/chatwidget.min.js',
      format: 'iife',
      name: 'ChatWidget',
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