# Prompt Forge

A tiny tool that turns a quick note into a sharp, structured prompt for
[Claude Code](https://www.anthropic.com/claude-code). It runs entirely in the
browser — **no backend, no API keys, nothing to pay for.**

Two modes:

- **Quick request** — describe what you need in a sentence or two and get a
  scoped prompt with context, an ordered plan, and a clear definition of done.
- **Scaffold a project** — describe a product and get a ready-to-paste
  `CLAUDE.md` plus a scaffolding prompt that tells Claude Code which files to
  create.

A sidebar of example ideas lets you load a starting point with one tap.

## Run it locally

It's plain HTML/CSS/JS, so just open the file:

```bash
open index.html        # macOS
# or double-click index.html in your file explorer
```

That's it — no install step.

## Deploy to Vercel

Because it's a static site, deploying is a two-minute job with no configuration.

1. Push this folder to a GitHub repo.
2. Go to [vercel.com](https://vercel.com), sign in with GitHub, and click
   **Add New → Project**.
3. Import the repo. When asked for a framework, choose **Other** (there's no
   build step). Leave the build command empty and the output directory as the
   root.
4. Click **Deploy**. You'll get a live `https://` URL in about a minute, and
   every future `git push` redeploys automatically.

Works the same on **Netlify** or **GitHub Pages** — any static host will do.

## Customize

Everything lives in three files:

- `index.html` — the page structure.
- `styles.css` — the look. Colors are CSS variables at the top.
- `app.js` — the logic. The `STACKS` object holds the project presets, the
  `EXAMPLES` object holds the sidebar ideas, and `generateQuick` /
  `generateScaffold` build the prompts. Tweak the wording there to match how you
  like to talk to Claude Code.

## License

MIT — do whatever you like with it.
