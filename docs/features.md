# Feature Guide

## Create My Moment

The user selects an event and mood, writes a story, optionally names a partner and optionally selects a photo.

The form is not populated with sample data. A moment is saved only after the user submits it.

## Local memories

Memories are stored in the browser under an application-specific localStorage key. Users can:

- View saved moments.
- Delete individual moments.
- Delete all local moments.
- Export moments to JSON.

Photos are stored as data URLs when the user chooses to save them. Large photo collections can consume browser storage, so a future IndexedDB implementation is recommended for larger libraries.

## Music discovery

The app can construct YouTube and Spotify search URLs directly. This avoids unnecessary API keys for basic search discovery.

## Local AI prompts

The app generates a context-aware prompt from the current event, mood, partner and story. The prompt can be sent to a local model or another tool chosen by the user.

The app deliberately does not include a private cloud AI key.

## Microphone recording

The browser MediaRecorder API creates a local audio recording. Recognition is intentionally a separate step because a recognition provider may require authentication.

## Theme

The theme preference is stored locally. It does not require an account.
