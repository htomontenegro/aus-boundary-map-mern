# Feature List

## Public Map Interface

- Interactive map centred on Australia with smooth pan and zoom
- Live Australian electoral boundary data from the official ABS government API
- Drill-down geography selector — switch between Federal Parliament, individual states, and federal divisions
- 9 selectable map tile layers:
  - OpenStreetMap (default)
  - CartoDB Light, Dark, and Voyager
  - Esri World Satellite and World Topo
  - OpenTopoMap
  - Stadia Smooth and Stadia Dark
- Colour-coded location markers grouped by category
- Category tab bar to filter visible markers
- Fuzzy full-text search across entry titles, locations, and descriptions
- Sidebar panel listing all visible entries with title, location, and category
- Legend box showing active categories and their colours
- Fully responsive layout

## Admin Panel (`/admin`)

### Authentication
- JWT-based login with secure httpOnly token handling
- Rate-limited login endpoint (20 attempts per 15 min)
- Session persistence across page refreshes

### Entries Management
- Paginated list of all published and trashed entries
- Full-text search (MongoDB text index on title, location, description)
- Create entries with: title, description, location, coordinates, image URL, category
- Edit any field on existing entries
- Soft-delete (move to trash) and restore
- Bulk actions: trash, restore, or permanently delete multiple entries at once

### Categories Management
- Create, edit, and delete categories
- Set a label, hex colour, emoji icon, and sort order per category
- Changes reflect immediately on the public map

### Settings
- Geography selection: set default country, scope, area, and subdivision
- Toggle sidebar panel visibility
- Set default map tile layer
- Set marker tag mode

## Developer Features

- Full TypeScript throughout (frontend and backend)
- Monorepo with single `npm run dev` command
- Database seeder: `npm run seed` bootstraps admin user + 12 sample entries
- Docker Compose setup for one-command local environment
- `.env.example` with all documented variables
- Security: Helmet headers, CORS, rate limiting, bcrypt password hashing, input sanitisation
- MongoDB indexes for fast filtering and full-text search
- Clean REST API with consistent error responses
