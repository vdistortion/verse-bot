import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'Verse',
  description: 'Universal Telegram & VK bot framework',
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Packages', link: '/packages/tg-bot-core' },
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
          { text: '@scope/tg-bot-core', link: '/packages/tg-bot-core' },
          { text: '@scope/vk-bot-core', link: '/packages/vk-bot-core' },
          { text: '@scope/shared', link: '/packages/shared' },
          { text: '@scope/miniapp', link: '/packages/miniapp' },
        ],
      },
    ],
    socialLinks: [{ icon: 'github', link: 'https://github.com/your-org/verse' }],
  },
});
