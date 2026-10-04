# Discovery Engine

## Purpose

The discovery engine exists for the main problem Charlie MJ Music is trying to solve:

> “I know what I feel, but I do not know what song, poem, quote, or caption expresses it.”

## Exact flow

```text
Moment form
   ↓
Event + mood + relationship + vibe + story
   ↓
Feeling translator
   ↓
Detected emotional concepts
   ↓
Search context
   ↓
YouTube + Spotify + Poetry + Quotes + Captions
```

## Automatic behavior

Submitting **Create My Moment** immediately creates the discovery pack. It does not wait for another search button.

The application attempts to open the generated searches in new tabs because the form submission is a direct user action. Browser popup protection can still block some tabs. When that happens, the Discovery Pack remains visible and every search has its own working external link.

## Why direct search URLs?

A static GitHub Pages site cannot safely hide a developer's private API key. It also cannot guarantee that a third-party API allows unrestricted browser-side requests.

The app therefore uses official/public search destinations:

- YouTube search
- Spotify search
- Google web search for poetry
- Google web search for quotes
- Google web search for captions

This is a real search flow, not a fake local list of songs.

## Feeling translator

The translator combines:

- event
- mood
- relationship stage
- soundtrack style
- words detected in the personal story

Examples of detected concepts include:

- missing you
- long distance love
- reunion
- healing
- reconciliation
- gratitude
- first love
- new romance
- forever love
- soulmate
- wedding romance
- emotional love
- family love

## Extending the engine

Add new rules to the dictionaries in `js/app.js` or add new regular-expression rules inside `analyzeMoment()`.

Keep the output as short search concepts rather than copying private stories into many repeated search terms.
