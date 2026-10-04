# Integrations

## YouTube

The static edition uses YouTube's public search URL format. No YouTube Data API key is required for the core search feature.

## Spotify

The static edition uses Spotify's web search URL for the core search feature. This avoids exposing a Spotify client secret.

If a future version adds authenticated Spotify Web API features, use Spotify's browser/public-client authorization flow such as Authorization Code with PKCE. Never place a client secret in JavaScript shipped through GitHub Pages.

## AI

The application can prepare prompts for local AI. This is intentionally different from calling a private cloud AI server. A user may connect a local model/runtime separately.

## Song recognition

The microphone recorder is browser-side. A real recognition service requires its own API credential. The credential should be owned/configured by the user and must not be committed to this repository.
