# Feature Guide

## Create My Moment

The user can describe a real relationship moment with:

- Event
- Mood
- Relationship context
- Soundtrack preference
- Personal story/feeling
- Optional partner name
- Optional couple photo

Submitting the moment does **two things immediately**:

1. Saves the moment locally.
2. Starts the Moment-to-Discovery Engine.

## Moment-to-Discovery Engine

The engine translates the user's context into searches for:

- YouTube songs
- Spotify songs
- Romantic poetry
- Wise love quotes
- Romantic social captions

This is designed specifically for people who struggle to turn feelings into useful search terms.

## Advanced feeling assistance

Users can select optional context such as:

- New Love
- Married Love
- Long Distance
- Missing Someone
- First Date
- Proposal
- Wedding / First Dance
- Healing / Reconnection
- Gratitude
- Forever / Soulmates

They can also select a soundtrack vibe such as:

- Acoustic / Soft
- Piano / Emotional
- Romantic Pop
- R&B / Soul
- Indie / Dreamy
- Classic Love Song
- Wedding / First Dance
- Instrumental
- Urdu / South Asian
- Turkish / International

The story itself is also scanned locally for common emotional signals.

## Discovery Pack

After a moment is created, the Discover section displays live search buttons for every generated content type. If the browser blocks automatic popups, the buttons remain usable.

## Local memories

Memories are stored in browser localStorage. Users can:

- View saved moments.
- Delete individual moments.
- Delete all local moments.
- Export moments to JSON.
- Restore the most recent active moment after refresh.

Photos are stored as data URLs for the current static edition. Very large photo collections should eventually move to IndexedDB.

## Music discovery

Basic song discovery does not require an API key. The app builds direct YouTube and Spotify search URLs from the moment.

The default music mode is YouTube + Spotify.

## Love Letter Studio

The app can prepare an original writing prompt using the current moment. It does not pretend that a private cloud AI key is embedded in the static website.

The prompt can be copied into a local AI tool such as Ollama or a browser-compatible local model.

## Song recognition

The browser can record a short audio sample using MediaRecorder. Automatic recognition requires a compatible third-party recognition service and user-owned credentials.

## Responsive romantic UI

The application includes:

- Romantic glass cards
- Midnight Love / Rose Romance themes
- Animated vinyl
- Music waveform
- Heart-focused buttons
- Responsive Bootstrap grid
- Mobile/tablet/desktop layouts
- Discovery result cards

## No fake/default content

The repository does not preload songs, quotes, poems or memories. Real discovery begins from the user's own moment.
