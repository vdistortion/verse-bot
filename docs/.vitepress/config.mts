import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'Verse',
  description: 'Universal Telegram & VK bot framework',
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Packages', link: '/packages/tg-core' },
    ],
    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Getting Started', link: '/guide/getting-started' },
          { text: 'Project Structure', link: '/guide/structure' },
        ],
      },
      {
        text: 'Packages',
        items: [
          { text: '@verse/tg-core', link: '/packages/tg-core' },
          { text: '@verse/vk-core', link: '/packages/vk-core' },
          { text: '@verse/shared', link: '/packages/shared' },
          { text: '@verse/miniapp', link: '/packages/miniapp' },
        ],
      },
    ],
    socialLinks: [{ icon: 'github', link: 'https://github.com/your-org/verse' }],
  },
});
