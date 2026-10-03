# Architecture

The frontend is plain HTML/CSS/JavaScript with Bootstrap for grid utilities. Express serves the static frontend and exposes small server-side provider proxy routes.

The browser never receives provider secret keys. The server reads `.env` and makes provider requests.

Local memories remain in browser `localStorage`; there is no required database.
