import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'src/index.js',
  output: {
    file: 'ha-plooum-cards.js',
    format: 'iife',
    name: 'HaPlooumCards',
    sourcemap: true
  },
  plugins: [
    resolve(),
    commonjs()
  ]
};
