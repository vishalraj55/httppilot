# HTTPilot ⚡

> A modern, browser-based API testing tool built for developers who want a fast, clean alternative to Postman.

![HTTPilot](https://img.shields.io/badge/status-beta-blue?style=flat-square)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![NestJS](https://img.shields.io/badge/NestJS-11-red?style=flat-square&logo=nestjs)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?style=flat-square&logo=postgresql)
![Firebase](https://img.shields.io/badge/Firebase-Auth-orange?style=flat-square&logo=firebase)

---

## Overview

HTTPilot is a full-stack API testing web application that lets developers send HTTP requests, inspect responses, manage saved request collections, and configure environment variables all from a clean, developer-focused UI.

Built as a portfolio project to demonstrate full-stack engineering across authentication, proxy architecture, real-time database interactions, and modern UI design.

---

## Features

- **Proxy-based request engine** - All HTTP requests are routed through a NestJS backend proxy, bypassing CORS restrictions and supporting all methods (GET, POST, PUT, PATCH, DELETE)
- **Environment variables** - Define variables like `{{base_url}}` and swap environments (Development, Staging, Production) without editing each request
- **Collections** - Save, organize, and reload requests into named folders
- **Request history** - Every sent request is automatically saved and reloadable from the sidebar
- **Auth presets** - Bearer Token and Basic Auth tabs that automatically inject the correct Authorization header
- **Response viewer** - Syntax-highlighted JSON body, response headers, status code, response time, and size
- **Copy response** - One-click copy of the full response body
- **Firebase Authentication** - Email/password and Google sign-in
- **Mobile responsive** - Collapsible sidebar drawer and responsive request builder on all screen sizes

---

## Tech Stack

### Frontend

| Technology              | Purpose                              |
| ----------------------- | ------------------------------------ |
| Next.js 15 (App Router) | React framework, routing, SSR        |
| Tailwind CSS            | Utility-first styling                |
| CodeMirror 6            | JSON body editor and response viewer |
| Firebase SDK            | Client-side authentication           |

### Backend

| Technology         | Purpose                        |
| ------------------ | ------------------------------ |
| NestJS 11          | REST API framework             |
| Prisma 7           | ORM and database migrations    |
| PostgreSQL         | Primary database               |
| Axios              | Outbound HTTP proxy requests   |
| Firebase Admin SDK | Server-side token verification |
| Passport.js        | Authentication strategy        |

### Infrastructure

| Service           | Purpose                 |
| ----------------- | ----------------------- |
| Vercel            | Frontend deployment     |
| Render            | Backend deployment      |
| Neon / PostgreSQL | Managed database        |
| Firebase          | Authentication provider |

---

## Architecture

```
┌-----------------------------------------------------┐
│                    Browser (Next.js)                │
│                                                     │
│  ┌----------┐  ┌--------------┐ ┌---------------┐   │
│  │ Sidebar  │  │RequestBuilder│ │ResponseViewer │   │
│  │Collection│  │ URL + Method │ │ Body + Headers│   │
│  │ History  │  │Headers/Body  │ │ Status + Time │   │
│  └----------┘  └------┬-------┘ └---------------┘   │
└-----------------------------------------------------┘
                                              │ POST /api/proxy
                              ┌---------------▼---------------┐
                              │        NestJS Backend         │
                              │                               │
                              │  FirebaseAuthGuard (JWT)      │
                              │  ↓                            │
                              │  ProxyService (Axios)         │
                              │  ↓                            │
                              │  Substitutes {{variables}}    │
                              │  ↓                            │
                              │  Makes real HTTP request      │
                              │  ↓                            │
                              │  Saves to RequestHistory      │
                              │  ↓                            │
                              │  Returns response to client   |
                              └---------------┬---------------┘
                                              │
                              ┌---------------▼---------------┐
                              │    PostgreSQL (via Prisma)    │
                              │  Users, Collections,          │
                              │  Requests, Environments,      │
                              │  RequestHistory               │
                              └-------------------------------┘
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm
- PostgreSQL database
- Firebase project

### 1. Clone the repository

```bash
git clone https://github.com/vishalraj55/httppilot.git
cd httppilot
```

### 2. Backend setup

```bash
cd backend
pnpm install
```

Create `backend/.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/httppilot"
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk@your-project.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
PORT=4000
```

Run migrations and start:

```bash
npx prisma migrate dev
npx prisma generate
pnpm start:dev
```

### 3. Frontend setup

```bash
cd frontend
pnpm install
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
```

Start the frontend:

```bash
pnpm dev
```

### 4. Open the app

Visit `http://localhost:3000`

---

## Project Structure

```
httppilot/
├── frontend/                    # Next.js 15 App Router
│   └── src/
│       ├── app/
│       │   ├── (auth)/login/    # Login page
│       │   └── dashboard/       # Main app page
│       ├── components/
│       │   ├── RequestBuilder   # URL bar, headers, body, auth, save
│       │   ├── ResponseViewer   # Status, body, headers, copy
│       │   ├── Sidebar          # Collections + history
│       │   ├── TopBar           # Logo, environment selector, user
│       │   └── EnvironmentSelector # Environment CRUD modal
│       ├── context/
│       │   └── AuthContext      # Firebase auth state
│       ├── lib/
│       │   ├── firebase.ts      # Firebase initialization
│       │   └── api.ts           # Authenticated fetch wrapper
│       └── types/               # Shared TypeScript types
│
└── backend/                     # NestJS 11
    ├── prisma/
    │   └── schema.prisma        # DB models
    └── src/
        ├── proxy/               # Core proxy endpoint
        ├── collections/         # Collection + request CRUD
        ├── environments/        # Environment variable CRUD
        ├── history/             # Request history
        ├── users/               # User auto-creation
        ├── auth/                # Firebase JWT guard
        └── prisma/              # Prisma service
```

---

## Database Schema

```
User
 ├── Collections
 │    └── Requests
 ├── Environments (variables: JSON)
 └── RequestHistory
```

---

## API Endpoints

| Method | Endpoint                                   | Description                     |
| ------ | ------------------------------------------ | ------------------------------- |
| POST   | `/api/proxy`                               | Send HTTP request through proxy |
| GET    | `/api/collections`                         | Get all collections             |
| POST   | `/api/collections`                         | Create collection               |
| DELETE | `/api/collections/:id`                     | Delete collection               |
| POST   | `/api/collections/:id/requests`            | Save request to collection      |
| DELETE | `/api/collections/:id/requests/:requestId` | Delete saved request            |
| GET    | `/api/environments`                        | Get all environments            |
| POST   | `/api/environments`                        | Create environment              |
| PUT    | `/api/environments/:id`                    | Update environment              |
| DELETE | `/api/environments/:id`                    | Delete environment              |
| GET    | `/api/history`                             | Get request history (last 50)   |
| DELETE | `/api/history`                             | Clear all history               |

All endpoints require a Firebase JWT `Authorization: Bearer <token>` header.

---

## Key Engineering Decisions

**Proxy architecture** - Rather than making requests directly from the browser (which would hit CORS restrictions), all requests go through the NestJS backend. This mirrors how production API tools like Postman work and allows the server to log history, inject auth headers, and substitute environment variables server-side.

**Firebase Admin JWT verification** - Every request to the backend is verified using the Firebase Admin SDK, which validates the JWT token issued by Firebase client-side. This gives stateless, scalable authentication without managing sessions.

**Prisma 7 with pg adapter** - Prisma 7 dropped the traditional query engine in favour of driver adapters. The app uses `@prisma/adapter-pg` for a direct PostgreSQL connection, which is more performant and suitable for serverless/edge environments.

**Environment variable substitution** - Variables like `{{base_url}}` are resolved server-side in the proxy before the request is sent, using a simple regex replace. This means users can switch environments without touching individual requests.

---

## Author

**Vishal Raj**

- GitHub: [@vishalraj55](https://github.com/vishalraj55)

---

## License

MIT
