import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        buy: resolve(__dirname, 'buy.html'),
        sell: resolve(__dirname, 'sell.html'),
        communities: resolve(__dirname, 'communities.html'),
        blog: resolve(__dirname, 'blog.html'),
        contact: resolve(__dirname, 'contact.html'),
        hero: resolve(__dirname, 'hero.html'),
        'sold-portfolio': resolve(__dirname, 'sold-portfolio.html'),
        backroom: resolve(__dirname, 'backroom.html'),
        privacy: resolve(__dirname, 'privacy.html'),
        terms: resolve(__dirname, 'terms.html'),
      },
    },
  },
})
