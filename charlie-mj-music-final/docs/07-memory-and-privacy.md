# Memory and Privacy

Memories are stored in the browser's localStorage. They are not sent to a Charlie MJ database because this version does not require a database.

Provider searches naturally send search queries to the selected external provider. AI generation sends the supplied prompt to the configured local Ollama endpoint. Recognition sends recorded audio to the configured recognition provider.

Do not put API secrets in frontend files.
