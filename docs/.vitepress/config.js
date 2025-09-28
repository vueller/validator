import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Universal Validator',
  description: 'A modern, framework-agnostic validation library',
  
  themeConfig: {
    logo: '/logo.svg',
    
    nav: [
      { text: 'Guide', link: '/guide/' },
      { text: 'Examples', link: '/examples/' },
      { text: 'API', link: '/api/' },
      { text: 'GitHub', link: 'https://github.com/vueller/validator' }
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Introduction', link: '/guide/' },
            { text: 'Installation', link: '/guide/installation' },
            { text: 'Basic Usage', link: '/guide/basic-usage' },
            { text: 'Validation Rules', link: '/guide/validation-rules' }
          ]
        },
        {
          text: 'Advanced',
          items: [
            { text: 'Advanced Guide', link: '/guide/advanced' }
          ]
        }
      ],
      
      '/examples/': [
        {
          text: 'Examples',
          items: [
            { text: 'Overview', link: '/examples/' },
            { text: 'JavaScript', link: '/examples/javascript' },
            { text: 'Vue.js', link: '/examples/vue' }
          ]
        }
      ],
      
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Overview', link: '/api/' },
            { text: 'Core API', link: '/api/core' },
            { text: 'Vue Components', link: '/api/vue' },
            { text: 'Universal API', link: '/api/universal' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vueller/validator' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 Vueller Team'
    },

    editLink: {
      pattern: 'https://github.com/vueller/validator/edit/main/docs/:path'
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
