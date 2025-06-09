export default {
  name: 'optionsworld-trading-platform',
  output: 'dist',
  static: true,
  routes: [
    '/',
    '/options-chain',
    '/portfolio',
    '/strategy-builder',
    '/watchlist',
    '/scanner',
    '/learn'
  ],
  build: {
    command: 'npm run build',
    directory: 'dist'
  },
  spa: true
}