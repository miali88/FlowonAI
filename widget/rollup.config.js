import { defineConfig } from 'rollup';
import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import postcss from 'rollup-plugin-postcss';
import replace from '@rollup/plugin-replace';
import json from '@rollup/plugin-json';
import strip from '@rollup/plugin-strip';
import postcssImport from 'postcss-import';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

export default defineConfig({
  input: 'src/main.tsx',
  output: {
    file: 'dist/embed.min.js',
    format: 'iife',
    name: 'FlowonWidget',
    sourcemap: true,
    globals: {},
    banner: '/* Flowon Widget v' + process.env.npm_package_version + ' */',
    intro: '(function() { "use strict"; var global = typeof window !== "undefined" ? window : this;',
    outro: '})();'
  },
  plugins: [
    replace({
      preventAssignment: true,
      'process.env.NODE_ENV': JSON.stringify('production'),
      'process.env.WIDGET_VERSION': JSON.stringify(process.env.npm_package_version),
    }),
    strip({
      include: '**/*.mjs',
      comments: 'none',
    }),
    resolve({
      browser: true,
      preferBuiltins: false,
    }),
    commonjs(),
    json(),
    typescript({ tsconfig: './tsconfig.app.json' }),
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      presets: [
        '@babel/preset-env',
        ['@babel/preset-react', { runtime: 'automatic' }],
        '@babel/preset-typescript',
      ],
    }),
    postcss({
      extensions: ['.css'],
      minimize: true,
      inject: {
        insertAt: 'top'
      },
      modules: {
        generateScopedName: 'flowon-widget-[hash:base64:8]',
        scopeBehaviour: 'local',
      },
      extract: false,
      plugins: [
        postcssImport(),
        tailwindcss({
          prefix: 'flowon-',
          important: '#flowon-widget-root',
        }),
        autoprefixer(),
      ]
    }),
    terser(),
  ],
  external: [],
});
