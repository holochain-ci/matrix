import preprocess from 'svelte-preprocess'

// /** @type {import('@sveltejs/kit').Config} */

import adapter from '@sveltejs/adapter-static'

export default {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: preprocess(),
  kit: {
    adapter: adapter(),

    // make it work at github pages, where the root path of all pages and assets is /matrix/
    paths: {
      base: '/matrix',
      assets: '/matrix',
    },

    target: '#svelte',
  },
}
