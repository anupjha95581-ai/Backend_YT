# 🎬 Backend_YT — A Production-Grade Video Platform Backend

> A scalable, secure, and modular RESTful backend engine for a media-streaming platform — inspired by the core systems that power YouTube. Built from the ground up in Node.js and Express to model real-world backend engineering practices: authentication flows, file handling pipelines, database relationships, and clean error/response contracts.

This isn't a toy CRUD app. It's a deliberate exercise in building the kind of backend infrastructure that sits behind a real content platform — covering user auth, video/media upload pipelines, subscriptions, and more, with an architecture designed to be extended rather than thrown away.

**Repository:** [`Backend_YT`](https://github.com/anupjha95581-ai/Backend_YT/tree/main/BACKEND)

---

## 📚 Table of Contents

1. [Key Concepts & Learning Highlights](#-key-concepts--learning-highlights)
2. [Tech Stack & NPM Packages](#-tech-stack--npm-packages)
3. [Project Architecture & Folder Breakdown](#-project-architecture--folder-breakdown)
4. [Environment Variables Guide](#-environment-variables-guide)
5. [Step-by-Step Local Setup](#-step-by-step-local-setup--installation)

---

## 🧠 Key Concepts & Learning Highlights

Building this project was as much about backend *systems thinking* as it was about writing routes. Here's what it drove home:

### 🔐 Authentication & Authorization (JWT)
- Implemented a **dual-token strategy** — short-lived **Access Tokens** and long-lived **Refresh Tokens** — to balance security with a smooth user session experience.
- Refresh tokens are persisted in the database (per user) and rotated on re-authentication, so a compromised token can be invalidated without logging out the entire session lifecycle.
- Tokens are delivered via **secure, httpOnly cookies**, reducing exposure to client-side XSS attacks compared to storing them in local storage.
- Wrote custom middleware (`verifyJWT`) to protect routes and attach the authenticated user to the request object — the same pattern used in real production auth systems.

### 🏗️ Custom, Reusable API Handling
- Built two foundational utility classes — **`ApiError`** and **`ApiResponse`** — to standardize *every single response* the API sends. This means every success and error payload across the entire app follows one predictable shape, which is exactly what a frontend/consumer needs to build reliable error handling.
- Wrapped every controller in an **`asyncHandler`** higher-order function, eliminating repetitive `try/catch` boilerplate and ensuring async errors are funneled into Express's centralized error-handling middleware instead of crashing the process or getting silently swallowed.

### 🗃️ Asynchronous Database Design with Mongoose
- Modeled real-world relational concepts in a NoSQL document store — `User`, `Video`, `Subscription`, `Playlist`, and `Comment` schemas with references (`ObjectId`) linking them together.
- Used **Mongoose middleware (pre-save hooks)** to hash passwords automatically before persistence, and added instance methods (`isPasswordCorrect`, `generateAccessToken`) directly onto the schema for cleaner controller code.
- Leveraged the **Mongoose Aggregation Pipeline** to solve genuinely hard queries — like computing a channel's subscriber count and "is the current user subscribed" flag, or joining video/owner data — in a single efficient database round-trip instead of N+1 application-level lookups.
- Integrated `mongoose-aggregate-paginate-v2` to add clean, page-based pagination on top of aggregation queries (critical for endpoints like video feeds and comment lists that can't return every document at once).

### 🧩 Middleware Architecture
- Designed a request pipeline where **cross-cutting concerns are decoupled from business logic**: authentication (`auth.middleware.js`), file upload handling (`multer.middleware.js`), and centralized error formatting all live outside the controllers, which stay focused purely on domain logic.
- This taught the core Express lesson: middleware isn't just "extra code that runs before the route" — it's how you keep controllers thin and testable.

### 📁 File Upload Pipeline (Local → Cloud)
- Built a two-stage upload flow: **Multer** temporarily stores incoming files on local disk, then a service layer streams them to **Cloudinary** for permanent, CDN-backed storage — and cleans up the local temp file afterward regardless of success or failure.
- This mirrors how production systems avoid holding large binary blobs in application memory or database documents.

### ⚠️ Centralized, Predictable Error Handling
- Every thrown error — validation failures, auth failures, not-found resources — funnels through one Express error-handling middleware that formats it via `ApiError`, so the API **never leaks stack traces or inconsistent error shapes** to clients.

---

## 🛠️ Tech Stack & NPM Packages

### Core Runtime & Framework
| Package | Purpose |
|---|---|
| **express** | The backbone HTTP server framework — routing, middleware pipeline, and request/response handling. |
| **dotenv** | Loads environment variables from `.env` into `process.config`, keeping secrets out of source code. |
| **nodemon** *(dev)* | Auto-restarts the server on file changes during development for a fast feedback loop. |

### Database & ODM
| Package | Purpose |
|---|---|
| **mongoose** | Object Data Modeling (ODM) library for MongoDB — schema definition, validation, hooks, and query building. |
| **mongoose-aggregate-paginate-v2** | Adds clean pagination support on top of Mongoose's aggregation pipeline, used for feeds, comments, and search results. |

### Authentication & Security
| Package | Purpose |
|---|---|
| **jsonwebtoken** | Issues and verifies signed **Access** and **Refresh** tokens for stateless authentication. |
| **bcrypt** | One-way hashes user passwords before they're stored, so raw passwords are never persisted. |
| **cookie-parser** | Parses cookies on incoming requests, enabling secure httpOnly token storage. |
| **cors** | Configures Cross-Origin Resource Sharing so only trusted frontend origins can call the API. |

### File Handling & Media Storage
| Package | Purpose |
|---|---|
| **multer** | Middleware for handling `multipart/form-data`, used to accept video/image uploads and temporarily stage them on disk. |
| **cloudinary** | Cloud-based media storage and CDN — permanent home for uploaded avatars, thumbnails, and video files after Multer stages them locally. |

### Developer Experience & Code Quality
| Package | Purpose |
|---|---|
| **prettier** | Enforces a single, consistent code formatting style across the entire codebase (paired with `.prettierrc` / `.prettierignore`). |

> 💡 Exact package versions are pinned in `package.json` — run `npm install` to pull the locked dependency tree.

---

## 🏛️ Project Architecture & Folder Breakdown

The `BACKEND` directory follows a **layered, separation-of-concerns architecture** — every piece of the request lifecycle has exactly one home.

```
BACKEND/
├── public/                  # Static assets & temporary upload staging
│   └── temp/                 # Multer's local landing zone before Cloudinary upload
│
├── scripts/                 # Standalone operational scripts
│   ├── db-connect script     # Database connection bootstrap/verification
│   └── seed script            # Populates the database with sample data for local dev
│
├── src/
│   ├── controllers/          # Business logic — one file per resource (user, video, comment, etc.)
│   ├── models/                # Mongoose schemas & instance/static methods
│   ├── routes/                 # Express routers — map URLs to controller functions
│   ├── middlewares/           # Auth guards, Multer config, centralized error handling
│   ├── utils/                    # ApiError, ApiResponse, asyncHandler, Cloudinary upload helper
│   ├── db/                        # MongoDB connection logic
│   ├── app.js                    # Express app configuration (middleware registration, route mounting)
│   └── index.js                    # Application entry point — loads env, connects DB, starts server
│
├── .env.sample               # Template listing every required environment variable
├── .gitignore                  # Excludes node_modules, .env, and local upload artifacts from git
├── .prettierrc                  # Prettier formatting rules
├── .prettierignore              # Files/folders excluded from Prettier formatting
└── package.json                  # Dependencies, scripts, and project metadata
```

**Why this structure?** It follows the principle that **each layer should only know about the layer directly beneath it**: routes call controllers, controllers call models and utils, and nothing reaches across layers directly. This makes the codebase easy to navigate, test in isolation, and extend — adding a new resource means adding one model, one controller, and one route file, without touching anything else.

---

## 🔑 Environment Variables Guide

All configuration lives in environment variables — never hardcoded — following twelve-factor app principles. Copy `.env.sample` to `.env` and fill in your own values.

| Variable | Description |
|---|---|
| `PORT` | The port your local Express server listens on (e.g. `8000`). |
| `MONGODB_URI` | Your MongoDB connection string (local instance or a MongoDB Atlas cluster URI). |
| `CORS_ORIGIN` | The allowed frontend origin(s) permitted to make cross-origin requests to this API. |
| `ACCESS_TOKEN_SECRET` | Secret key used to sign short-lived JWT access tokens. |
| `ACCESS_TOKEN_EXPIRY` | How long an access token remains valid (e.g. `1d`). |
| `REFRESH_TOKEN_SECRET` | Separate secret key used to sign long-lived JWT refresh tokens — kept distinct from the access token secret for security isolation. |
| `REFRESH_TOKEN_EXPIRY` | How long a refresh token remains valid (e.g. `10d`). |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary account's cloud name, used to route uploads to the correct storage bucket. |
| `CLOUDINARY_API_KEY` | Cloudinary API key for authenticating upload requests. |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret — paired with the API key to authorize uploads server-side. |

> ⚠️ **Never commit your `.env` file.** It's already excluded via `.gitignore` — treat every secret above as sensitive credentials, especially in production.

---

## 🚀 Step-by-Step Local Setup & Installation

### 1. Clone the repository
```bash
git clone https://github.com/anupjha95581-ai/Backend_YT.git
cd Backend_YT/BACKEND
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
```bash
cp .env.sample .env
```
Then open `.env` in your editor and fill in each value described in the [Environment Variables Guide](#-environment-variables-guide) above — your MongoDB URI, JWT secrets, and Cloudinary credentials.

### 4. Ensure MongoDB is available
- **Local:** make sure your local MongoDB service is running, and point `MONGODB_URI` at `mongodb://127.0.0.1:27017/<db-name>`.
- **Atlas:** create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas), whitelist your IP, and paste the provided connection string into `MONGODB_URI`.

### 5. (Optional) Seed the database
If a seed script is provided under `scripts/`, run it to populate sample users/videos for local testing:
```bash
node scripts/<seed-script-name>.js
```

### 6. Start the development server
```bash
npm run dev
```
The API will boot on `http://localhost:<PORT>` (matching whatever you set for `PORT` in `.env`), with `nodemon` watching for file changes.

### 7. Verify it's running
Hit a health-check or public route (e.g. `GET /`) with `curl`, Postman, or Thunder Client to confirm the server and database connection are live.

```bash
curl http://localhost:8000/
```

---

## 📌 What This Project Demonstrates

This backend is meant to serve as a **portfolio artifact** proving hands-on ability to:
- Design and secure a real authentication system (not just "add a login route")
- Model non-trivial relational data in MongoDB and query it efficiently at scale
- Build a clean, layered Express architecture that other engineers could actually extend
- Handle binary file uploads correctly, from client to CDN
- Write consistent, predictable API contracts that a frontend team could build against with confidence

---

*Built as a hands-on deep dive into backend engineering fundamentals — feedback and PRs welcome.*
