<div align="center">

  <img src="./assets/3aebafd8-e155-49ae-a14e-44ab2d731d9e.png" alt="Charlie MJ Music" width="700">

  <h1>Charlie MJ Music</h1>

  <p>
    <strong>A romantic music discovery experience for couples, lovers, and special moments.</strong>
  </p>

  <p>
    <a href="https://awsrmmustansarjavaid.github.io/charlie-mj-music/">
      <strong>🎵 Live Demo</strong>
    </a>
  </p>

</div>

**A privacy-first romantic music and moment discovery web app for couples.**

Charlie MJ Music helps couples turn a feeling, memory, celebration, or relationship moment into a music-focused experience. It is deliberately designed as a **static, GitHub Pages-friendly application**.

## What this final edition is

- HTML, CSS and JavaScript only
- Bootstrap responsive grid via CDN
- No Node.js backend
- No Python backend
- No database server
- No GitHub Actions workflow
- No private API keys committed to the repository
- Local browser storage for memories
- Browser microphone recording for recognition preparation
- Moment-to-Discovery Engine that automatically starts live searches after moment creation
- YouTube + Spotify song discovery from feelings, events and relationship context
- Romantic poetry, wise quote and social-caption discovery from the same moment
- Feeling Translator for people who do not know what song/keywords to search
- Spotify search/link support without exposing a client secret
- YouTube search/link support without requiring a private search backend
- Local-AI-friendly prompt generation
- Romantic responsive visual design
- No fake songs, poems, quotes or seeded memories

## Important integration principle

A public GitHub Pages site cannot securely hide a secret API key. This project therefore **does not pretend to do so**.

- Spotify authentication should use OAuth Authorization Code with PKCE.
- Recognition providers should use a user-owned credential or a future provider designed for browser/public clients.
- AI can use local/browser models or a user-owned local AI installation.
- Public search pages are used where a private API is unnecessary.

See `docs/integrations.md` for the detailed integration strategy.

## Features

### Romantic experience

- Cinematic love-themed interface
- Midnight Love / Rose Romance visual theme toggle
- Heart-shaped CTAs and romantic glass cards
- Animated vinyl and music waveform
- Responsive Bootstrap layout
- Mobile, tablet and desktop support

### Create My Moment

- Event selection
- Mood selection
- Partner name
- Personal story
- Couple photo preview
- Local memory storage
- JSON export
- Local deletion

### Music + love-content discovery

- Moment creation automatically starts a Discovery Pack
- YouTube + Spotify song search from the moment
- Feeling-to-search translation for difficult-to-explain emotions
- Romantic poetry discovery
- Wise love quote discovery
- Romantic Instagram/social caption discovery
- Direct YouTube/Spotify URL opening
- No fake/default songs, poems or quotes

### Love tools

- Local-AI prompt generation
- Love-letter prompt preparation
- Browser microphone recording
- Recognition-provider-ready audio capture

## Project structure

```text
charlie-mj-music/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── app.js
├── assets/
│   ├── 3aebafd8-e155-49ae-a14e-44ab2d731d9e.png
│   └── icons/
├── docs/
│   ├── architecture.md
│   ├── features.md
│   ├── integrations.md
│   ├── github-pages.md
│   ├── privacy.md
│   ├── development.md
│   └── roadmap.md
├── .gitignore
├── LICENSE
└── README.md
```

## Run locally

No installation is required.

1. Download or clone the repository.
2. Open `index.html` in a modern browser.
3. For microphone features, use a secure context such as `localhost` or HTTPS.

For the most reliable local development, use any simple static file server. The application itself does not require a server backend.

## Publish on GitHub Pages — without GitHub Actions

1. Create a GitHub repository.
2. Upload these files to the repository's `main` branch.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, select **Deploy from a branch**.
5. Select `main` and `/ (root)`.
6. Save.
7. GitHub Pages will publish the static files.

There is intentionally **no `.github/workflows/` directory** in this repository.

## Browser requirements

Use a current Chrome, Edge, Firefox or Safari release. Microphone access requires browser permission and normally HTTPS/localhost.

## Privacy

Moment information and photos are kept in browser storage by this application. Clearing site data can remove them. The application does not include a server endpoint for uploading them.

External services such as Spotify, YouTube or a recognition provider are separate services and have their own privacy policies and authentication requirements.

Read `docs/privacy.md` before enabling third-party integrations.

## Development principles

Every source file contains comments explaining the important implementation decisions. Keep these principles when extending the project:

- Never commit API secrets.
- Do not add a backend unless the architecture is intentionally changed.
- Do not add fake content just to make the interface look populated.
- Keep personal memories local by default.
- Clearly label features that require third-party credentials.
- Prefer official APIs and OAuth flows designed for public/browser clients.

## Documentation

- [Architecture](docs/architecture.md)
- [Features](docs/features.md)
- [Integrations](docs/integrations.md)
- [GitHub Pages deployment](docs/github-pages.md)
- [Privacy](docs/privacy.md)
- [Development guide](docs/development.md)
- [Roadmap](docs/roadmap.md)

## License

MIT License. See `LICENSE`.
