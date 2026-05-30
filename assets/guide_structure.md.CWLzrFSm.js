import{_ as s,H as e,f as n,i as t}from"./chunks/framework.DLd0CbzH.js";const m=JSON.parse('{"title":"Project Structure","description":"","frontmatter":{},"headers":[],"relativePath":"guide/structure.md","filePath":"guide/structure.md"}'),p={name:"guide/structure.md"};function r(c,a,i,o,l,d){return e(),n("div",null,[...a[0]||(a[0]=[t(`<h1 id="project-structure" tabindex="-1">Project Structure <a class="header-anchor" href="#project-structure" aria-label="Permalink to &quot;Project Structure&quot;">​</a></h1><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>/</span></span>
<span class="line"><span>├── apps/</span></span>
<span class="line"><span>│ └── imp-bot/ # Example bot application</span></span>
<span class="line"><span>├── packages/</span></span>
<span class="line"><span>│ ├── tg-core/ # Telegram adapter (GrammY)</span></span>
<span class="line"><span>│ ├── vk-core/ # VK adapter (custom fetch client)</span></span>
<span class="line"><span>│ ├── shared/ # UniversalContext, DB, formatting</span></span>
<span class="line"><span>│ └── miniapp/ # Telegram Mini App utilities</span></span>
<span class="line"><span>└── docs/</span></span></code></pre></div><p>Commands in <code>apps/imp-bot/src/commands/</code> receive a <code>UniversalContext</code> and are platform-agnostic — the same handler runs on both Telegram and VK.</p>`,3)])])}const _=s(p,[["render",r]]);export{m as __pageData,_ as default};
