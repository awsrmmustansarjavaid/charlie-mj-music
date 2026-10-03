# ♡ Charlie MJ Music

**A romantic music discovery web application for couples, meaningful moments, memories and original love messages.**

This repository is intentionally **real-data-first**. It contains **no default songs, fake poetry, fake quotes, seeded memories or demo music records**.

## What it does

- Romantic responsive interface for desktop, tablet and mobile.
- Heart-shaped / pill controls and love-letter inspired cards.
- Animated rose, wine, plum and midnight background layers.
- Event + mood + personal feeling input.
- Optional photo upload and browser preview.
- Live YouTube search through the official YouTube Data API.
- Live Spotify track search through Spotify Web API client credentials.
- Microphone recording for AudD music recognition.
- Optional local Ollama AI for original captions/messages/poetry.
- Private browser-local memories using `localStorage`.
- JSON export of local memories.
- No GitHub Actions required.
- Node/Express backend keeps API secrets out of frontend code.

## Run locally

1. Install Node.js 20+.
2. Copy `.env.example` to `.env`.
3. Add only the provider credentials you want to use.
4. Run `npm install`.
5. Run `npm start`.
6. Open `http://localhost:3000`.

Without API credentials, the romantic UI, local form, photo preview and local memory features still work. Provider-specific features show a clear configuration message instead of fake results.

## Integrations

### YouTube
Create a Google Cloud project, enable YouTube Data API v3 and place the API key in `YOUTUBE_API_KEY`.

### Spotify
Create a Spotify developer application and add `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET`. This repository uses Spotify's application-level catalog search flow for tracks.

### AudD
Create an AudD API token and set `AUDD_API_TOKEN` to enable microphone-based recognition.

### Ollama
Install Ollama locally, pull a model such as `llama3.2`, and keep `OLLAMA_URL` pointed at the local Ollama server.

## Repository

```text
charlie-mj-music/
├── public/
│   ├── index.html
│   ├── css/style.css
│   ├── js/app.js
│   └── assets/
├── server/server.js
├── docs/
├── scripts/
├── .env.example
├── .gitignore
├── package.json
├── LICENSE
└── README.md
```

## Documentation

- `docs/01-overview.md` — product concept and goals
- `docs/02-features.md` — complete feature specification
- `docs/03-design-system.md` — romantic UI and responsive design
- `docs/04-architecture.md` — frontend/backend architecture
- `docs/05-integrations.md` — external services and credentials
- `docs/06-local-ai.md` — Ollama setup
- `docs/07-memory-and-privacy.md` — local storage and privacy
- `docs/08-development.md` — development workflow
- `docs/09-windows-packaging.md` — future desktop packaging
- `docs/10-roadmap.md` — future enhancements
- `docs/11-no-demo-data.md` — why the repository contains no fake content
- `docs/12-github.md` — GitHub setup without Actions

## GitHub

GitHub is used as source hosting only. There is deliberately no `.github/workflows` directory. You can push this project normally with `git init`, `git add .`, `git commit`, `git branch -M main`, and `git remote add origin ...`.

## Important API note

External providers require their own credentials, quotas, terms and availability. The app does not pretend to provide live provider results when credentials are missing.
