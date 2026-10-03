# Development Guide

## Principles

1. Keep the application static unless there is a documented architectural reason to change it.
2. Do not commit secrets.
3. Do not add fake/default content.
4. Comment important browser and security decisions.
5. Keep accessibility in mind.
6. Prefer progressive enhancement when browser APIs are unavailable.

## HTML

`index.html` contains the complete application shell and semantic sections for the hero, moment creation, discovery, tools and memories.

## CSS

`css/style.css` contains the romantic visual system, responsive rules and theme variables. The design avoids excessive decorative effects so the UI remains usable.

## JavaScript

`js/app.js` handles:

- Form validation.
- Local storage.
- Photo preview.
- Music search links.
- Local AI prompt preparation.
- Microphone recording.
- Memory rendering/export/deletion.
- Theme preference.

## Testing checklist

- Open the page on desktop.
- Test mobile width.
- Create a moment.
- Reload and verify local memory remains.
- Export JSON.
- Delete a memory.
- Test YouTube search.
- Test Spotify search.
- Test direct music URL validation.
- Test theme toggle.
- Test microphone permission on HTTPS/localhost.
- Confirm no API secret exists in source.

## Adding an integration

Document the integration before coding it. Identify:

- Whether authentication is required.
- Whether the client secret can be avoided.
- Whether CORS allows browser calls.
- Whether the provider permits public/browser clients.
- Whether the provider charges for use.
- What user data leaves the browser.
