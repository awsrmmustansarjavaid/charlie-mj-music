# Privacy Model

## Local by default

Charlie MJ Music stores created moments in browser localStorage. Photos selected for saved moments can be represented as local data URLs.

## No bundled private credentials

The repository intentionally contains no production API secrets. Public repositories should be assumed to be readable by everyone.

## External services

When the user opens Spotify, YouTube or another external provider, that provider receives the information involved in the request according to its own policies.

## Browser storage limitation

Local storage is not a secure vault. Other software with access to the browser profile, browser extensions or a compromised device may potentially access local data.

## Clearing data

The app provides a clear-memory function. Users can also clear site data through browser settings.

## Future improvements

For larger photo collections, IndexedDB can replace localStorage. Optional client-side encryption can also be explored, but encryption key management must be designed carefully; encryption should not be presented as absolute protection on a compromised device.
