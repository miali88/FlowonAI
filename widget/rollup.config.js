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
    name: 'EmbeddedChatbot',
    sourcemap: true,
    globals: {}
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
        insertAt: 'top' // Ensures our styles take precedence
      },
      modules: {
        generateScopedName: 'ecb-[hash:base64:5]', // Add prefix to CSS modules
        exclude: /node_modules/,
      },
      extract: 'styles.css', // Extract to separate CSS file
      plugins: [
        postcssImport(),
        tailwindcss('./tailwind.config.js'),
        autoprefixer(),
      ]
    }),
    terser(),
  ],
  external: [],
});
