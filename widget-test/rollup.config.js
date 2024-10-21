import { defineConfig } from 'rollup';
import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import css from 'rollup-plugin-css-only';

export default defineConfig({
  input: 'src/main.tsx',
  output: {
    file: 'dist/embed.bundle.js',
    format: 'iife',
    name: 'EmbeddedChatbot',
  },
  plugins: [
    resolve(),
    commonjs(),
    typescript({ tsconfig: './tsconfig.app.json' }),
    css({ output: 'bundle.css' }),
    terser(),
  ],
});