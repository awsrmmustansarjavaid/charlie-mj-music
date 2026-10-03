# Music, Poetry & Quote Discovery

Charlie MJ Music separates **creating a moment** from **discovering content**. Creating a moment stores the user's own event, mood, story and optional photo locally. Discovery uses that information to build searches for real external content.

## Song search

The user can search by:

- song title
- artist
- feeling
- event
- current moment context

The app opens the query on either YouTube or Spotify. This avoids putting a private API key into a GitHub Pages repository.

## Poetry search

The Poetry button builds a web search such as `romantic poetry <theme>`. The application does not scrape or reproduce complete copyrighted poems. Users open the source and read the poem on its original website.

## Quote search

The Quotes button builds a web search such as `romantic love quotes <theme>`. This keeps the static application independent of a quote database and avoids shipping copied content as fake/default data.

## Search relationship to the moment

If the user has already entered an event, mood and story, those fields can contribute to discovery. The optional direct search field can contain a song title or artist. A short portion of the moment context is used so URLs stay practical.

## Why not scrape search results?

A GitHub Pages application should not depend on undocumented scraping endpoints. Search pages are stable browser destinations, while provider APIs can require credentials, quotas or specific OAuth flows. The application therefore opens the user's chosen service instead of pretending that a private search backend exists.

## Copyright note

Charlie MJ Music should not copy full song lyrics or full copyrighted poems into its own database. The app can link users to legitimate sources and generate original text with local AI.
