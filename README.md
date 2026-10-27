# Xuejia Shi — Portfolio

A bilingual, presentation-style engineering portfolio for interviews and everyday browsing.

## Highlights

- English / Chinese language switching with browser-language detection
- Keyboard and scroll-friendly presentation sections
- Evidence-led case study for [NutriFlow AI](https://github.com/Lsxj/fushi-dazi)
- Enterprise engineering experience and technical journey
- Responsive, accessible layout built with React, TypeScript and Vite
- Legacy technical blog preserved at `/archive/`

## Local development

```bash
npm ci
npm run dev
```

Run the quality checks with:

```bash
npm test
npm run build
```

Publish the verified `dist` output to the dedicated GitHub Pages branch with:

```bash
npm run deploy
```

## Content and license

Site code is available under the MIT License. Personal biography, employment history, project narratives, names, and portfolio content remain © Xuejia Shi and are not licensed for reuse.

## Interview presentation variants

- Apple, updated for the 2026-10-28 Enterprise Systems interview: `/?view=present`; Introduction → Selected work & impact → Why this role in Enterprise Systems → all six CitiDirect pages. English and Chinese supported. Use `&section=projects` for the three-project summary and `&section=why-role` for Why. Legacy `role=aidp` links normalize to the same default presentation; there is no separate AiDP variant.
- Web role: `/?view=present&role=web`. The old `company=standard-chartered` URL remains an alias; subsequent navigation uses `role=web`.
- The introduction, layout, styles and project components are shared. Web customizes Why and selects four Velocity detail pages followed by CitiDirect overview and frontend architecture. Arrow keys and the bottom dock retain `role=web` for Web; Apple needs no role parameter.

Deployment of the Web-role presentation was explicitly authorized on 2026-10-20. The current Apple presentation and both local speaking scripts share the sequence above.
