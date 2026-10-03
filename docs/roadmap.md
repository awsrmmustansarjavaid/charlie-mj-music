# Roadmap

## Current static foundation

- Romantic responsive UI
- Moment creation
- Local memory storage
- JSON export
- YouTube discovery
- Spotify discovery
- Local AI prompt preparation
- Local microphone recording
- Theme switching
- Documentation

## Next optional modules

### Spotify PKCE module

Add a dedicated `spotify-auth.js` module implementing Spotify's current PKCE flow and scopes. Keep redirect configuration separate from source code and never introduce a client secret.

### Browser AI module

Add WebLLM or Transformers.js behind feature detection. Provide model download progress and an explicit local-processing notice.

### Recognition adapter

Create a provider-neutral interface:

```text
recognize(audioBlob) -> { title, artist, album, confidence }
```

Then implement only providers whose browser authentication/CORS model is compatible with static hosting.

### IndexedDB memory store

Move photo-heavy memories from localStorage to IndexedDB when the project begins handling larger media collections.

### PWA support

A future service worker and web manifest can make the app installable. Any caching strategy should be documented because cached pages affect update behavior.

## Explicitly not planned for the static edition

- Private server API keys in frontend code
- Hidden backend endpoints
- Database credentials in JavaScript
- GitHub Actions deployment workflow
