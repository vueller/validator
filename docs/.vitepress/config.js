import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '@vueller/validator',
  description: 'Modern Validation Library',
  base: '/validator/',
  
  head: [
    ['link', { rel: 'icon', href: '/logo.svg' }]
  ],

  themeConfig: {
    logo: '/logo.svg',
    
    nav: [
      { text: 'Guide', link: '/guide/' },
      { text: 'API', link: '/api/' },
      { text: 'Examples', link: '/examples/' }
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Installation', link: '/guide/installation' },
            { text: 'Basic Usage', link: '/guide/basic-usage' },
            { text: 'Validation Rules', link: '/guide/validation-rules' },
            { text: 'Advanced', link: '/guide/advanced' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Core API', link: '/api/core' },
            { text: 'Vue API', link: '/api/vue' }
          ]
        }
      ],
      '/examples/': [
        {
          text: 'Examples',
          items: [
            { text: 'JavaScript', link: '/examples/javascript' },
            { text: 'Vue.js', link: '/examples/vue' },
            { text: 'Quick Start', link: '/examples/quick-start' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vueller/validator' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 @vueller'
    }
  }
})
