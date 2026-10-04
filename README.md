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

# Charlie MJ Music

Charlie MJ Music is a **100% client-side romantic discovery web app** for people who struggle to find the right song, poem, quote, or caption for a feeling they cannot easily describe.

The central idea is simple:

> **Tell the app what happened and how you feel → create the moment → immediately turn that feeling into real searches for songs, poetry, wise quotes, and captions.**

## ❤️ What actually happens when you create a moment?

When **Create My Moment** is pressed, the application does not only save a card. It immediately:

1. Saves the moment in browser storage.
2. Reads the event, mood, relationship context, soundtrack preference, and story.
3. Detects useful emotional themes such as *missing you*, *long distance*, *healing*, *gratitude*, *forever love*, *new romance*, and *wedding*.
4. Builds a real search phrase from that information.
5. Creates direct **YouTube** and **Spotify** music searches.
6. Creates focused **poetry** searches.
7. Creates **wise love quote** searches.
8. Creates **romantic caption** searches.
9. Shows every search in a Discovery Pack inside the app.
10. Attempts to open the discovery searches immediately in new tabs. If the browser blocks popups, the same working links remain available as buttons in the Discovery Pack.

This is deliberately implemented without a backend or secret API key.

## 🎵 Example

If someone enters:

> I am working abroad and really miss my wife. I want something emotional but hopeful that feels like home.

Charlie MJ Music can turn that into discovery concepts such as:

- long distance love
- missing you
- reunion song
- emotional love song
- home love song
- hopeful romance
- marriage love

Those concepts are then used to create the YouTube, Spotify, poetry, quote, caption, and broad-web searches.

## ✨ Key Features

- ❤️ Feeling-to-discovery engine
- 🎵 Real YouTube song search links
- 🟢 Real Spotify search links
- 📖 Poetry discovery
- 💬 Wise love quote discovery
- ✨ Romantic social-caption discovery
- 🔎 Broad web discovery
- 💌 Local-AI-ready love-letter prompts
- 🎙️ Browser microphone recording for song-recognition workflows
- 🧠 Emotional theme detection from free-form stories
- 💑 Relationship-aware search concepts
- 💍 Wedding / first-dance discovery
- 💕 Anniversary and birthday discovery
- 🌍 Long-distance and missing-someone discovery
- 🩹 Healing / reconnection discovery
- 🎨 Romantic Midnight and Rose themes
- 📸 Couple-photo memory support
- 💾 Local browser memories
- 📤 JSON export
- 🔄 Restore the latest moment after refresh
- 📱 Fully responsive Bootstrap layout
- 🔐 No private credentials embedded in source
- 🚫 No backend
- 🚫 No database
- 🚫 No GitHub Actions workflow

## ⚠️ Important: what “search” means in this static edition

GitHub Pages can safely host HTML, CSS, and JavaScript, but it cannot securely hide a private API secret. YouTube and Spotify also have their own API/authentication requirements.

Therefore the core discovery engine uses **real public search URLs** rather than fake in-app song data. The app opens or provides the actual YouTube/Spotify/web search pages with the user's moment already converted into a query.

This means the project does **not** pretend that a song database exists locally. No fake/default songs, quotes, poems, or memories are shipped with the project.

For a fully authenticated Spotify API integration, use Spotify's browser/public-client authorization flow such as PKCE. For professional song recognition, configure a recognition provider with a user-owned credential rather than embedding the developer's private key.

## 🏗️ Architecture

```text
Browser
  │
  ├── Create Moment
  │      ├── Event
  │      ├── Mood
  │      ├── Relationship
  │      ├── Soundtrack style
  │      └── Personal story
  │
  ├── Feeling Translator
  │      └── Emotional search concepts
  │
  ├── Discovery Pack
  │      ├── YouTube search
  │      ├── Spotify search
  │      ├── Poetry search
  │      ├── Wise quotes search
  │      └── Caption search
  │
  └── localStorage / IndexedDB-style browser storage

No server
No database
No GitHub Actions
No private production API keys
```

## 📁 Repository

```text
charlie-mj-music/
├── assets/
│   └── 3aebafd8-e155-49ae-a14e-44ab2d731d9e.png
├── css/
│   └── style.css
├── js/
│   └── app.js
├── docs/
│   ├── architecture.md
│   ├── development.md
│   ├── discovery.md
│   ├── features.md
│   ├── github-pages.md
│   ├── integrations.md
│   ├── privacy.md
│   └── roadmap.md
├── data/
├── index.html
├── CHANGELOG.md
├── CONTRIBUTING.md
├── LICENSE
├── README.md
└── .gitignore
```

## 🚀 Run locally

No installation is required.

The simplest option is to open `index.html` in a modern browser.

For microphone permissions and more predictable browser behavior, serve the folder with any simple static HTTP server, for example:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

The application itself does not require Python; Python is only one optional way to serve static files locally.

## 🌐 Publish on GitHub Pages — no workflow

1. Create a GitHub repository.
2. Upload the repository files to the `main` branch.
3. Open **Settings → Pages**.
4. Select **Deploy from a branch**.
5. Select `main` and `/ (root)`.
6. Save.
7. Wait for GitHub Pages to publish the site.

There is intentionally **no `.github/workflows/` directory** in this repository.

## 📚 Documentation

- [Architecture](docs/architecture.md)
- [Discovery Engine](docs/discovery.md)
- [Features](docs/features.md)
- [Integrations](docs/integrations.md)
- [GitHub Pages](docs/github-pages.md)
- [Privacy](docs/privacy.md)
- [Development](docs/development.md)
- [Roadmap](docs/roadmap.md)

## 🔐 Privacy model

Moment information and memories are stored locally in the user's browser. The static application does not send the user's story to a Charlie MJ Music backend because there is no backend.

When the user clicks an external discovery link, the query is sent to that external website because that is how the external search service works. The app makes this transition visible instead of silently uploading the user's private story.

## 📜 License

See [LICENSE](LICENSE).
