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

export default defineConfig({
  input: 'src/main.tsx',
  output: {
    file: 'dist/embed.min.js',
    format: 'iife',
    name: 'EmbeddedChatbot',
    sourcemap: true,
  },
  plugins: [
    replace({
      'process.env.NODE_ENV': JSON.stringify('production'),
      preventAssignment: true,
    }),
    strip({
      include: '**/*.mjs',
      // Removes all comments including "use client"
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
      inject: true,
      modules: {
        exclude: /node_modules/,
      },
    }),
    terser(),
  ],
  external: [],
});
