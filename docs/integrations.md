# Integrations and Secret-Free Design

## Spotify

For a browser-only application, use Spotify's public-client authorization flow with **Authorization Code with PKCE**. PKCE is designed for clients that cannot safely keep a client secret.

Recommended production flow:

1. Register the application in Spotify for Developers.
2. Configure the exact GitHub Pages redirect URI.
3. Generate a random `code_verifier` in the browser.
4. Derive the PKCE challenge.
5. Redirect the user to Spotify authorization.
6. Receive the authorization code at the redirect URI.
7. Exchange it using the PKCE verifier.
8. Store short-lived tokens only as needed by the application.
9. Never place a Spotify client secret in this repository.

The current static edition provides search and direct-link functionality without pretending that an OAuth account is already connected. OAuth can be added as a separate module following Spotify's current documentation.

## YouTube

Basic discovery can use the public YouTube search URL, which requires no API key. Direct embeds can also be added when a user provides a valid YouTube video ID/URL.

If the YouTube Data API is later enabled, its browser-exposed key must be treated as public. Restrict it by allowed website referrers and API/quota scope where Google's current controls permit it. Do not treat a browser API key as a secret.

## AI

### Preferred: local/browser AI

Use a browser-compatible local model such as WebLLM or Transformers.js, subject to model size and browser/WebGPU support. Another option is a local Ollama installation configured for browser access.

Advantages:

- No private cloud API key.
- User's story can remain local.
- Works with the privacy-first design.

Trade-offs:

- Model download size.
- Device performance varies.
- Browser support varies.

### Optional user-owned cloud API

If a future version allows users to enter their own AI API key, clearly warn that the key is being used directly from the browser and can be exposed to browser extensions, developer tools or malicious scripts. Never ship the developer's private key.

## Song recognition

The browser can record audio, but recognition requires an actual recognition engine/service. A provider such as AudD or ACRCloud may require an API token.

For a static application, the safest design is:

- Record locally.
- Let the user configure their own provider credentials if the provider permits browser use.
- Do not commit the credential.
- Clearly explain provider costs, limits and privacy terms.

If a provider requires a secret client credential or forbids direct browser calls, that provider is not suitable for a pure GitHub Pages implementation without a backend.

## Important rule

If an integration cannot securely operate as a public/browser client, the feature should be marked as optional rather than hiding a secret in JavaScript.
