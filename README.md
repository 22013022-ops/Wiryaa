# Wiryaa

Wiryaa is a job discovery and hiring platform. Candidates can build a profile and get job recommendations, while employers can publish a job post and review matched candidates. The app also includes authentication, profile management, notifications, connection requests, and English, Hindi, and Marathi language support.

## Project structure

- `client/` — React 19 single-page application built with Vite, React Router, and Tailwind CSS.
- `server/` — Express 5 API using MongoDB/Mongoose, JWT authentication, Cloudinary uploads, translation, embeddings, and recommendation services.

## Requirements

- Node.js 20 or newer and npm.
- A MongoDB database (MongoDB Atlas is needed for the vector-search recommendation index).
- An OpenRouter API key for AI text structuring.
- Cloudinary credentials for profile image and file uploads.

## Setup

Open two terminals from the repository root. Install dependencies for each app:

```powershell
cd server
npm install

cd ..\client
npm install
```

Create `server/.env` with the server configuration below. 

### Server environment

```dotenv
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>/<database>
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
OPENROUTER_API_KEY=your-openrouter-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
CLIENT_URL=http://localhost:5173
```

### Client environment

The client defaults to `http://localhost:5000/api`. To point it elsewhere, set `VITE_API_URL` in `client/.env`:

```dotenv
VITE_API_URL=https://api.example.com/api
```

## Run locally

Start the API in one terminal:

```powershell
cd server
npm run dev
```

Start the web client in another:

```powershell
cd client
npm run dev
```

Vite prints the local URL (usually `http://localhost:5173`). The API health endpoint is `http://localhost:5000/api/health` and returns `{ "status": "success" }` when the server is available. The API connects to MongoDB before it starts listening; a database connection failure prevents startup.

For a production client build:

```powershell
cd client
npm run build
npm run preview
```

## MongoDB Atlas Vector Search

Find Jobs uses Atlas Vector Search to retrieve candidate jobs, then computes and stores detailed match scores in the application. Create a vector-search index on the `JP_embeddings` collection with:

- Index name: `job_description_embeddings` (or the value of `MATCHING_VECTOR_INDEX`).
- Vector field: `embeddings.descriptionStructured.embedding`.
- Vector dimensions: `384`, matching `all-MiniLM-L6-v2` embeddings.
- Filter field: `status`.

Recommendations require the matching profiles and job-post embeddings to be present in MongoDB. The API queues embeddings after a job post or candidate profile changes.

## Main routes

- `/` (Public): Landing page.
- `/about` (Public): About Wiryaa.
- `/signup`, `/login` (Public): Account registration and sign-in.
- `/language` (Signed in): Language selection.
- `/find-jobs` (Signed in, eligible candidate): Candidate profile and job recommendations.
- `/hire-talents` (Signed in): Employer job post and matched candidates.
- `/profile` (Signed in): Account profile.

API route groups are mounted at `/api/auth`, `/api/users`, `/api/jobs`, `/api/hire-talents`, and `/api/notifications`. Protected API calls use a bearer JWT; the client stores the token in local storage and attaches it automatically. The health check is `GET /api/health`.

## Available scripts

### Client (`client/`)

- `npm run dev` — start the Vite development server.
- `npm run build` — create a production build in `client/dist/`.
- `npm run preview` — serve the production build locally.
- `npm run lint` — run ESLint.

### Server (`server/`)

- `npm start` — start the API with Node.js.
- `npm run dev` — start the API with Nodemon.
