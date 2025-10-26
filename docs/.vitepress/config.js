import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '@vueller/validator',
  description: 'Modern validation library for JavaScript and Vue 3',
  
  head: [
    ['link', { rel: 'icon', href: '/logo.svg' }],
    ['meta', { name: 'theme-color', content: '#646cff' }]
  ],

  themeConfig: {
    logo: '/logo.svg',
    
    nav: [
      { text: 'Guide', link: '/guide/' },
      { text: 'API Reference', link: '/api/' },
      { text: 'Examples', link: '/examples/' },
      { text: 'GitHub', link: 'https://github.com/vueller/validator' }
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Overview', link: '/guide/' },
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Installation', link: '/guide/installation' },
            { text: 'Basic Usage', link: '/guide/basic-usage' }
          ]
        },
        {
          text: 'Framework Integration',
          items: [
            { text: 'Vue Integration', link: '/guide/vue-integration' },
            { text: 'JavaScript Usage', link: '/guide/javascript-usage' }
          ]
        },
        {
          text: 'Advanced Features',
          items: [
            { text: 'Custom Rules', link: '/guide/custom-rules' },
            { text: 'Internationalization', link: '/guide/internationalization' },
            { text: 'Advanced Patterns', link: '/guide/advanced-patterns' }
          ]
        },
        {
          text: 'Reference',
          items: [
            { text: 'API Reference', link: '/guide/api-reference' },
            { text: 'Validation Rules', link: '/guide/validation-rules' },
            { text: 'Examples', link: '/guide/examples' }
          ]
        },
        {
          text: 'Migration',
          items: [
            { text: 'Migration Guide', link: '/guide/migration-guide' }
          ]
        }
      ],
      
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Core API', link: '/api/core' },
            { text: 'Vue API', link: '/api/vue' },
            { text: 'Universal API', link: '/api/universal' }
          ]
        }
      ],
      
      '/examples/': [
        {
          text: 'Examples',
          items: [
            { text: 'Quick Start', link: '/examples/quick-start' },
            { text: 'JavaScript Examples', link: '/examples/javascript' },
            { text: 'Vue Examples', link: '/examples/vue' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vueller/validator' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025 Vueller Team'
    },

    search: {
      provider: 'local'
    }
  },

  markdown: {
    theme: 'github-dark',
    lineNumbers: true
  }
})