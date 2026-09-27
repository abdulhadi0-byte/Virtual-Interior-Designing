# Virtual Interior Designing (Static, GitHub Pages)

A backend-less version of Virtual Interior Designing — plain HTML/CSS/JS,
no build step, deploys straight to GitHub Pages. Uses the browser's
localStorage instead of Supabase, and calls Google Gemini directly from
the browser for room analysis.

## ⚠️ Important security note

This site calls the Gemini API **directly from the browser**, because
GitHub Pages only serves static files — there's no server to hide an API
key behind. That means:

- Each visitor enters their **own** Gemini API key on first use (a modal
  prompts for it). It's stored only in *their* browser's localStorage —
  never committed to this repo, never sent anywhere except Google's API.
- If you deploy this publicly and use your own key, anyone who opens
  browser DevTools while using the site *could* see it in the network
  request. This is an inherent limitation of static/backend-less sites,
  not a bug in this code.
- **Recommended:** in [Google AI Studio](https://aistudio.google.com/apikey),
  after creating your key, click into its settings and restrict it to
  only the Generative Language API, and consider setting a daily request
  quota so a leaked key can't rack up unexpected usage.
- For a real production app, the safer long-term move is routing Gemini
  calls through a small backend (like your existing FastAPI project) that
  keeps the key server-side. This static version is meant for demos,
  personal use, or your FYP defense — not for handling other people's
  API keys at scale.

## Deploying to GitHub Pages

1. Push this folder's contents to a GitHub repo (can be a new repo, or
   a `docs/` folder or separate branch in an existing one).
2. In the repo: **Settings → Pages**.
3. Under "Build and deployment", set **Source: Deploy from a branch**.
4. Pick the branch (e.g. `main`) and folder (`/root` or `/docs`,
   depending on where you put these files).
5. Save. GitHub gives you a live URL like
   `https://yourusername.github.io/your-repo-name/`.
6. Visit the site, go to Upload, and you'll be prompted for your Gemini
   API key the first time — get a free one at
   [aistudio.google.com/apikey](https://aistudio.google.com/apikey).

## How data works (no Supabase)

- **Designs** are saved to `localStorage` under key `vid_designs` —
  persists across visits on the same browser/device, but not shared
  across devices or synced anywhere.
- **Profile info** (name, email, phone, avatar) saved under
  `vid_profile` — same local-only behavior.
- **API key** saved under `vid_gemini_api_key`.
- "Reset Local Data" in the sidebar clears designs + profile; Settings
  page has a "Clear Everything" option that wipes all of it including
  the API key.

localStorage has a ~5–10MB per-origin limit, so this keeps only the most
recent 30 saved designs (older ones drop off automatically).

## Structure

```
index.html          Landing page
dashboard.html       Dashboard (stats + recent designs)
upload.html           Upload + Gemini analysis
results.html            Suggestions view + save
saved.html                 All saved designs
profile.html                 Profile (local only)
settings.html                  API key management
css/styles.css                  Shared purple theme
js/shared.js                     Sidebar, localStorage helpers, API key modal
js/gemini.js                      Gemini API call logic
```

## Upgrading later

If you want real accounts, cross-device sync, or a hidden API key again,
your existing Supabase + FastAPI backend setup (from the Next.js/Vercel
version of this project) is the way to go — this static version is a
simpler, self-contained alternative for GitHub Pages specifically.
