import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
  input: 'src/next-bus-card.js',
  output: {
    dir: 'dist',
    format: 'es',
  },
  plugins: [
    nodeResolve(),
  ],
};
