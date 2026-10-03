# Moment-to-Discovery Engine

Charlie MJ Music is designed for a person who knows **how they feel** but does not know what song, poem, quote or caption to search for.

The central flow is now:

```text
Create My Moment
      ↓
Event + Mood + Relationship + Sound Vibe + Story
      ↓
Local Feeling Translator
      ↓
Discovery Pack
      ├── YouTube song search
      ├── Spotify song search
      ├── Romantic poetry search
      ├── Wise love quote search
      └── Romantic caption search
```

## 1. Creating a moment starts discovery automatically

When the user submits a valid moment, the application:

1. Saves the moment locally.
2. Keeps the moment context available instead of immediately clearing it.
3. Extracts search-friendly emotional signals from the story.
4. Combines those signals with event, mood, relationship context and soundtrack preference.
5. Builds live search URLs.
6. Displays a Discovery Pack inside the app.
7. Attempts to open the YouTube, Spotify, poetry, quote and caption searches automatically.
8. Keeps individual buttons available if the browser blocks some popups.

This fixes the common problem where a form appears to "create" something but does not actually help the user find anything.

## 2. Feeling Translator

The app includes a small transparent browser-side vocabulary rather than pretending to be an AI service.

Examples:

- `I miss my wife while working abroad` → long-distance love, missing you, hopeful reunion.
- `We had an argument and I want to reconnect` → healing relationship, forgiveness, second chance love.
- `It is our first dance` → wedding love song, first dance, eternal love.
- `I want to thank my husband for always supporting me` → gratitude, appreciation, heartfelt love.

These are search hints, not claims about what the user should feel.

## 3. Song discovery

The generated song search can include:

- Event
- Mood
- Relationship context
- Soundtrack preference
- Story-derived emotional signals
- An optional song or artist clue

The default mode searches **YouTube + Spotify**.

No private API key is required for basic browser search because the application opens the public search destinations directly.

## 4. Poetry discovery

The app creates a live web search such as:

```text
romantic poetry about missing you long distance love Marriage Anniversary
```

The application links to search results rather than copying complete poems. This avoids shipping copyrighted poetry as fake/default application data.

## 5. Wise quote discovery

The app similarly creates a live search such as:

```text
wise love quotes about gratitude love Marriage Anniversary Married Love
```

The user reads the quote on the external source. No quote database is required.

## 6. Caption discovery

For social posts, the app creates a separate romantic caption search using the same moment context.

## 7. Why search buttons still exist

Automatic multi-tab opening is controlled by the browser. Some browsers allow only the first new tab and block later tabs as popups.

Charlie MJ Music therefore uses two layers:

- **Automatic attempt:** the app tries to open all relevant searches immediately after the user submits the moment.
- **Reliable fallback:** the in-app Discovery Pack always shows individual buttons for YouTube, Spotify, poetry, quotes and captions.

This is a browser security limitation, not a missing backend.

## 8. No fake results

The application does not ship:

- fake songs
- fake artists
- fake poems
- fake quotes
- seeded memories

Live content is discovered from the selected external services/search engines.

## 9. Copyright and responsible use

Charlie MJ Music should not scrape or reproduce complete copyrighted lyrics or poems. It can link users to legitimate sources and can create original text through a local AI workflow.
