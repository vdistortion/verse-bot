import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'Verse Bot Framework',
  description: 'Write commands once, run on Telegram and VK',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Packages', link: '/packages/miniapp' },
    ],
    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Project Structure', link: '/guide/structure' },
            { text: 'Architecture', link: '/guide/architecture' },
          ],
        },
        {
          text: 'Development',
          items: [
            { text: 'Creating Commands', link: '/guide/creating-commands' },
            { text: 'Configuration', link: '/guide/configuration' },
          ],
        },
      ],
    },
  },
});
