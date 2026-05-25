# Australian Boundary Map

An interactive Australian electoral boundary map with a full content management system. Visualize federal electorates, states, and divisions on a live map — and manage location-based entries through a built-in admin panel.

---

## Features

- Interactive map of Australian federal electorates and state boundaries
- Live boundary data from the official ABS (Australian Bureau of Statistics) API
- 9 selectable map tile layers (satellite, topo, dark, light, and more)
- Drill-down geography selector: Country → Federal → State → Division
- Location entries with category-based colour-coded markers
- Full-text fuzzy search across all entries
- Category filtering via tab bar
- Sidebar panel listing visible entries
- Full admin CMS: create, edit, delete, and bulk-manage entries
- Custom categories with colour, emoji icon, and sort order
- Map settings: default tile layer, sidebar visibility, marker mode
- JWT authentication for admin access
- Rate limiting and security headers included

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Mapping | React Leaflet + Leaflet.js |
| Search | Fuse.js (client-side fuzzy search) |
| Styling | Tailwind CSS |
| Backend | Express.js + TypeScript |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| Security | Helmet, CORS, express-rate-limit |

---

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

### 1. Clone and install
```bash
git clone <your-repo-url>
cd aus-boundary-map-mern
npm run install:all
```

### 2. Configure environment
```bash
cp server/.env.example server/.env
```
Edit `server/.env` and set your values (see [Environment Variables](#environment-variables) below).

### 3. Seed the database
```bash
npm run seed
```
This creates the admin user and loads 12 sample entries across 4 categories.

### 4. Start development servers
```bash
npm run dev
```
- Frontend: [http://localhost:5174](http://localhost:5174)
- Backend API: [http://localhost:4001](http://localhost:4001)

### 5. Log in to admin
Open [http://localhost:5174/admin](http://localhost:5174/admin) and log in with the credentials you set in `.env` (defaults: `admin@example.com` / `changeme123`).

---

## Environment Variables

All variables live in `server/.env`. Copy `server/.env.example` to get started.

| Variable | Description | Default |
|---|---|---|
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/boundary_map` |
| `JWT_SECRET` | Secret for signing JWT tokens (min 32 chars) | — |
| `PORT` | Port for the Express server | `4001` |
| `CLIENT_URL` | Frontend URL (used for CORS) | `http://localhost:5174` |
| `SEED_ADMIN_EMAIL` | Admin email created by seed script | `admin@example.com` |
| `SEED_ADMIN_PASSWORD` | Admin password created by seed script | `changeme123` |

Generate a secure JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Docker (optional)

Run the full stack with one command:
```bash
docker-compose up --build
```
MongoDB, the API server, and the frontend all start together. No local MongoDB installation required.

---

## NPM Scripts

| Command | Description |
|---|---|
| `npm run install:all` | Install dependencies for root, server, and client |
| `npm run dev` | Start client and server concurrently |
| `npm run seed` | Seed admin user, categories, and sample entries |
| `npm run dev:server` | Start server only |
| `npm run dev:client` | Start client only |

---

## Project Structure

```
aus-boundary-map-mern/
├── client/                  # React + Vite frontend
│   └── src/
│       ├── components/map/  # Map UI components
│       ├── pages/           # PublicMapPage, AdminPage
│       ├── services/        # Axios API client
│       └── hooks/           # useGeography hook
├── server/                  # Express + TypeScript backend
│   └── src/
│       ├── controllers/     # Route handlers
│       ├── models/          # Mongoose models
│       ├── routes/          # Express routers
│       └── middleware/      # Auth, error handling
├── scripts/
│   └── seed.ts              # Database seeder
└── docker-compose.yml
```

---

## Deployment

### Railway (recommended)
1. Create a new project on [Railway](https://railway.app)
2. Add a MongoDB plugin
3. Deploy the `server/` folder, set env vars in the Railway dashboard
4. Deploy the `client/` folder as a static site (set `VITE_API_URL` to your server URL)

### Render
1. Create a Web Service for the server (`npm run build` → `npm start`)
2. Create a Static Site for the client (`npm run build` in `client/`)
3. Add a MongoDB Atlas database and connect via `MONGO_URI`

---

## License

Single-use license. See [LICENSE.md](LICENSE.md) for full terms.
