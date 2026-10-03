# Security

- Never commit `.env`.
- Provider secrets are server-side only.
- Uploaded recognition audio is deleted after the provider request finishes.
- Local memories stay in browser storage.
- External links use `noopener`.
- File uploads are limited to 12 MB in the recognition route.
