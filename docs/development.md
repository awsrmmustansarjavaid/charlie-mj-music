# Development Guide

## No build system

There is no npm installation and no compilation step.

The main files are:

- `index.html` — page structure and application controls
- `css/style.css` — romantic responsive design
- `js/app.js` — discovery engine and browser functionality

## Testing

Use a modern browser and test:

1. Create a moment.
2. Confirm the Discovery Pack appears automatically.
3. Confirm YouTube and Spotify search links contain the moment context.
4. Confirm poetry, quote, and caption links are created.
5. Test popup-blocking behavior; the visible cards must still work.
6. Refresh and confirm the latest moment is restored.
7. Export memories as JSON.
8. Test microphone permissions only on a secure origin or localhost.
