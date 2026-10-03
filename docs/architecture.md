# Architecture

## Goal

Charlie MJ Music is intentionally a static web application. The architecture avoids a private server because the primary goal is simple GitHub Pages deployment and local-first personal data handling.

## Runtime model

```text
Browser
├── HTML presentation
├── CSS romantic visual system
├── JavaScript application logic
├── localStorage → moment metadata/theme
├── Browser File API → local photo preview
├── MediaRecorder → local audio recording
└── External services
    ├── Spotify public-client OAuth/PKCE
    ├── YouTube public search pages / embeds
    └── Optional recognition provider
```

## Why there is no backend

A backend is not required for the core experience. Adding one would introduce hosting, deployment, secret management, maintenance and a privacy boundary that the static edition intentionally avoids.

## What the browser can safely do

- Render the entire interface.
- Store user-created data locally.
- Open public search pages.
- Use browser APIs such as FileReader, MediaRecorder and Clipboard where supported.
- Run compatible local/browser AI models.
- Perform OAuth flows designed for public clients.

## What the browser cannot securely do

A static page cannot keep a secret from its visitor. JavaScript, bundled configuration and network requests are inspectable. Therefore, a private API secret must never be embedded in production files.

## Data flow for a saved moment

```text
User input
   ↓
Validation
   ↓
Moment object
   ↓
localStorage
   ↓
Rendered memory card / JSON export
```

No application server is involved.
