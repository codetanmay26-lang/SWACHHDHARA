# SWACHHDHARA — SIH 2026

> **Team Tech Saarthi** · Smart India Hackathon 2026 · Problem Statement 26256 · Ministry of Jal Shakti

A responsive, single-page prototype for a proposed rural onsite sanitation treatment and monitoring concept.

---

## Local development

```powershell
npm install
npm run dev        # http://localhost:5173/
```

## Deploy to Vercel (one-click)

1. Push this repo to GitHub (make sure `node_modules/` and `dist/` are NOT committed — they are in `.gitignore`).
2. Go to **[vercel.com/new](https://vercel.com/new)** → import the GitHub repo.
3. Vercel auto-reads `vercel.json` — **do not change any settings**, just click **Deploy**.
4. Done. Every future push to `main` redeploys automatically.

### What is pre-configured (`vercel.json`)

| Setting | Value |
|---------|-------|
| Framework | Vite |
| Build command | `npm run build` |
| Output directory | `dist` |
| Node version | 22 (from `.nvmrc` + `package.json engines`) |
| SPA routing | All paths → `index.html` |

## Tech stack

| Layer | Technology |
|-------|-----------|
| UI | React 19 + TypeScript |
| Bundler | Vite 7 |
| Styling | Tailwind CSS 4 |
| Charts | Recharts 2 |
| Icons | Lucide React |
