# Architecture

Charlie MJ Music is intentionally a static single-page application.

## Runtime

- HTML5
- CSS3
- Vanilla JavaScript
- Bootstrap grid via CDN
- Browser localStorage
- Browser MediaRecorder API

## No server

There is no Node.js, Python web server, database, API gateway, or cloud function in the repository.

## Discovery architecture

The application generates search URLs directly in the browser. It does not attempt to hide credentials or scrape external pages.

## Data flow

```text
User
 ↓
index.html
 ↓
js/app.js
 ↓
Feeling translator
 ↓
Search URL builder
 ↓
External search provider
```

## Storage

The latest moment and saved memories are stored locally. The browser remains the source of truth.
