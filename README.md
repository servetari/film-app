# StreamBox (Film App)

A full‑stack film/series web app with user auth, multilingual UI, search, favourites, kids mode, rich content details and real‑time notifications. Monorepo with `backend` (Node/Express/MongoDB) and `frontend` (React).

## Prerequisites
- Node.js 18+ (recommended LTS)
- npm 8+ (bundled with Node)
- MongoDB (local or Atlas connection string)
- Optional: Cloudinary account (for video uploads)
- Optional: OMDb API key (to fetch metadata by title)

## Quick Start

1) Clone the repo
- git clone <your-repo-url>
- cd film-app

2) Install dependencies
- cd backend && npm install
- cd ../frontend && npm install

3) Configure environment (backend/.env)
Create a file `backend/.env` with at least the following:

```
# Required
MONGO_URI=mongodb://localhost:27017/streambox
JWT_SECRET=replace_this_with_a_strong_secret

# Optional
PORT=5000                        # default 5000
OMDB_API_KEY=your_omdb_api_key   # needed for /api/content/omdb/:title
CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>
# If you don’t use uploads, CLOUDINARY_URL can be omitted.
```

4) Run the project
- Backend: in `backend/` run `npm start` (nodemon)
- Frontend: in `frontend/` run `npm start` (React dev server)

The app runs at:
- API: http://localhost:5000
- Web: http://localhost:3000

## Features
- Auth: Register/Login (JWT), profile edit and password change
- Multilingual UI: TR/EN (switch from navbar)
- Kids Mode: pick Kids/Adult post-login; Kids mode filters content by age limit (≤ 13)
- Search: by title + filters (type/genre) with localized results
- Favorites: add/remove, quick “Favorites” list on home
- Details Modal: “More-Details” opens rich details anywhere (Featured + list items)
- Real‑time Notifications: new content broadcasts via Server‑Sent Events (SSE); bell shows a red dot and dropdown list
- Admin Area: manage content and lists (requires `isAdmin: true` on user)

## Environment Notes
- Do NOT commit `.env` files. The repo includes a root `.gitignore` that excludes env files and build artifacts.
- MongoDB: You can use a local instance or MongoDB Atlas URI.
- OMDb: Create a free key at https://www.omdbapi.com/ to enable the admin metadata helper endpoint.
- Cloudinary: If you plan to upload videos from the admin, set `CLOUDINARY_URL`. Otherwise you can skip it.

## Important Endpoints (server)
- Auth
  - POST `/api/auth/register` — creates user; enforces unique email/username
  - POST `/api/auth/login` — returns `{ token, user }`
  - GET  `/api/auth/check?email=<e>&username=<u>` — availability check used by UI
- Content
  - GET  `/api/content/random?type=movie|series`
  - GET  `/api/content/search?q=&type=&genre=&limit=`
  - GET  `/api/content/find/:id`
  - GET  `/api/content/omdb/:title` (admin; requires `OMDB_API_KEY`)
- Lists
  - GET  `/api/lists?type=&genre=&full=true|false`
- Favorites
  - GET/POST/DELETE under `/api/users/favorites`
- Notifications
  - GET  `/api/notifications` — recent items
  - GET  `/api/notifications/stream?token=<JWT>` — SSE stream

## Dev Tips
- Frontend automatically attaches `Authorization` and language headers, plus profile mode, via Axios interceptors (`frontend/src/index.js`).
- If you get CORS issues, check `backend/index.js` CORS usage and ensure ports are correct.
- For admin routes in the UI (`/admin`), ensure your user has `isAdmin: true` in the database.

## Scripts
Backend
- npm start — runs Express with nodemon

Frontend
- npm start — starts React dev server
- npm run build — production build

## License
This project is for learning/demo purposes. Replace secrets and review before deploying to production.

