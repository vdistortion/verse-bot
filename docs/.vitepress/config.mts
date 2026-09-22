import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'Verse Bot Framework',
  titleTemplate: ':title | Verse Bot',
  description: 'TypeScript packages for building bots that run on Telegram and VK.',
  head: [
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:site_name', content: 'Verse Bot' }],
    [
      'meta',
      {
        property: 'og:image',
        content: 'https://verse-bot.zvalentin.com/assets/branding/preview.jpg',
      },
    ],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    [
      'meta',
      {
        name: 'twitter:image',
        content: 'https://verse-bot.zvalentin.com/assets/branding/preview.jpg',
      },
    ],
  ],
  transformHead({ page, title, description }) {
    const path = page.replace(/(?:^|\/)index\.md$/, '').replace(/\.md$/, '');
    const canonicalUrl = `https://verse-bot.zvalentin.com${path ? `/${path}/` : '/'}`;

    return [
      ['link', { rel: 'canonical', href: canonicalUrl }],
      ['meta', { property: 'og:title', content: title }],
      ['meta', { property: 'og:description', content: description }],
      ['meta', { property: 'og:url', content: canonicalUrl }],
    ];
  },
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Packages', link: '/packages/' },
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
      '/packages/': [
        {
          text: 'Packages',
          items: [
            { text: 'Overview', link: '/packages/' },
            { text: 'Core', link: '/packages/core' },
            { text: 'PostgreSQL', link: '/packages/postgres' },
            { text: 'Telegram', link: '/packages/telegram' },
            { text: 'VK', link: '/packages/vk' },
            { text: 'Mini App', link: '/packages/miniapp' },
            { text: 'CLI', link: '/packages/create-verse-bot' },
          ],
        },
      ],
    },
  },
});
