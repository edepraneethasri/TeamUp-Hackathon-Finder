# TeamUp — Hackathon Teammate Finder

A beginner-friendly full-stack student project built with HTML, CSS, JavaScript, Node.js, Express, and SQLite.

## Requirements
- Node.js LTS installed
- Internet connection for the optional Google Fonts import (the app still works without it)

## Run the project
1. Extract the ZIP file.
2. Open the `TeamUp` folder in VS Code.
3. Open the VS Code terminal: **Terminal → New Terminal**.
4. Install dependencies:
   ```bash
   npm install
   ```
5. Start the server:
   ```bash
   npm start
   ```
6. Open `http://localhost:3000` in your browser.

Do not open `public/index.html` directly with a file URL. Open the localhost address so the frontend can call the backend APIs.

## Project structure
```text
TeamUp/
├── server.js           # Express server and API routes
├── package.json        # Project details and dependencies
├── teamup.db           # Created automatically when the server starts
└── public/
    ├── index.html      # Page structure and forms
    ├── style.css       # Responsive design
    └── app.js          # Frontend logic and API calls
```

## API routes
- `GET /api/students` — list student profiles
- `POST /api/students` — create a profile
- `GET /api/requests` — list collaboration requests
- `POST /api/requests` — create a collaboration request

## How data flows
1. The browser runs `public/app.js`.
2. `fetch()` sends HTTP requests to the Express API.
3. `server.js` validates the submitted values.
4. SQLite saves or reads records in `teamup.db`.
5. The server returns JSON, and the browser updates the page.

## Demo limitations
- Sample profiles are inserted automatically the first time the database is created.
- This demo has no login or identity verification. Do not use real sensitive personal information.
- Requests are saved as `Pending`; there is no accept/reject workflow yet.
- For a public deployment, add authentication, stronger abuse protection, and privacy controls before collecting real student data.
