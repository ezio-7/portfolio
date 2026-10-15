# portfolio

Live: https://ezio-7.github.io/portfolio/

Built with [Astro](https://astro.build) + Tailwind CSS, deployed to GitHub Pages by `.github/workflows/deploy.yml` on every push to `main`.

## Develop

```bash
npm install
npm run dev
```

## Update content

All text lives in `src/data/`:

- `profile.ts` — name, tagline, links, skills, education, achievements
- `experience.ts` — roles and project blocks
- `caseStudies.ts` — Selected Work cards (diagrams live in `src/components/diagrams/`)
- `projects.ts` — side projects

Resume PDF: replace `public/Ayush_Anand_Resume.pdf`.

## One-time GitHub setup

Repo → Settings → Pages → Source: **GitHub Actions**.
