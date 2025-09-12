import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '@vueller/validator',
  description: 'Modern universal validation library with Vue 3, JavaScript support, and upcoming React & Angular integrations',
  
  // GitHub Pages config
  base: '/validator/',
  
  // Ignore dead links for now
  ignoreDeadLinks: true,
  
  // Theme config
  themeConfig: {
    // Logo
    logo: '/logo.svg',
    
    // Navigation
    nav: [
      { text: 'Guide', link: '/guide/' },
      { text: 'Examples', link: '/examples/' },
      { 
        text: 'v1.2.0', 
        items: [
          { text: 'Changelog', link: '/changelog' },
          { text: 'Release Notes', link: 'https://github.com/vueller/validator/releases' }
        ]
      }
    ],

    // Sidebar
    sidebar: {
      '/guide/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Introduction', link: '/guide/' },
            { text: 'Installation', link: '/guide/installation' },
            { text: 'Quick Start', link: '/guide/quick-start' }
          ]
        },
        {
          text: 'Vue 3',
          items: [
            { text: 'Setup & Configuration', link: '/guide/vue/setup' },
            { text: 'Auto-validation', link: '/guide/vue/auto-validation' },
            { text: 'ValidatorForm Component', link: '/guide/vue/validator-form' },
            { text: 'Composables', link: '/guide/vue/composables' },
            { text: 'Custom Rules', link: '/guide/vue/custom-rules' }
          ]
        },
        {
          text: 'Vanilla JavaScript',
          items: [
            { text: 'Core Usage', link: '/guide/js/core' },
            { text: 'DOM Integration', link: '/guide/js/dom' },
            { text: 'Custom Rules', link: '/guide/js/custom-rules' },
            { text: 'Async Validation', link: '/guide/js/async' }
          ]
        },
      ],
      '/examples/': [
        {
          text: 'Vue 3 Examples',
          items: [
            { text: 'Overview', link: '/examples/' },
            { text: 'Basic Validation', link: '/examples/vue/basic' },
            { text: 'ValidatorForm', link: '/examples/vue/form' },
            { text: 'Custom Rules', link: '/examples/vue/custom-rules' },
            { text: 'Multi-language', link: '/examples/vue/i18n' }
          ]
        },
        {
          text: 'Vanilla JS Examples',
          items: [
            { text: 'Basic Usage', link: '/examples/js/basic' },
            { text: 'DOM Integration', link: '/examples/js/dom' },
            { text: 'Custom Rules', link: '/examples/js/custom-rules' },
            { text: 'Async Validation', link: '/examples/js/async' }
          ]
        }
      ]
    },

    // Social links
    socialLinks: [
      { icon: 'github', link: 'https://github.com/vueller/validator' },
      { icon: 'npm', link: 'https://www.npmjs.com/package/@vueller/validator' }
    ],

    // Footer
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 Vueller'
    },

    // Search
    search: {
      provider: 'local'
    },

    // Edit link
    editLink: {
      pattern: 'https://github.com/vueller/validator/edit/main/docs/:path',
      text: 'Edit this page on GitHub'
    },

    // Last updated
    lastUpdated: {
      text: 'Updated at',
      formatOptions: {
        dateStyle: 'full',
        timeStyle: 'medium'
      }
    }
  },

  // Markdown config
  markdown: {
    lineNumbers: true,
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    }
  },

  // Head config
  head: [
    ['link', { rel: 'icon', href: '/validator/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#007bff' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:locale', content: 'en' }],
    ['meta', { property: 'og:title', content: '@vueller/validator | Modern Vue 3 Validation' }],
    ['meta', { property: 'og:site_name', content: '@vueller/validator' }],
    ['meta', { property: 'og:url', content: 'https://vueller.github.io/validator/' }],
    ['meta', { property: 'og:description', content: 'Modern, reactive validation library with Vue 3 integration and real-time language switching.' }]
  ]
})
