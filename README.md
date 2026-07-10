# LegalDraft AI — Enterprise Legal Document Platform

LegalDraft AI is an enterprise-grade legal workspace and AI-assisted drafting platform designed specifically for Indian courts and legal practitioners. The platform allows advocates to manage multitenant workspaces, coordinate clients and cases, schedule hearings, manage tasks, and generate court-ready drafts utilizing an advanced AI agent network.

---

## Table of Contents
1. [Technology Stack](#1-technology-stack)
2. [Project Directory Tour](#2-project-directory-tour)
3. [System Architecture & Data Flows](#3-system-architecture--data-flows)
4. [Database Schema & Sync Architecture](#4-database-schema--sync-architecture)
5. [AI Agent Network & Streaming Pipeline](#5-ai-agent-network--streaming-pipeline)
6. [Interactive Feature Walkthrough](#6-interactive-feature-walkthrough)
7. [Debugging & Troubleshooting Guidelines](#7-debugging--troubleshooting-guidelines)
8. [Setup & Running Locally](#8-setup--running-locally)

---

## 1. Technology Stack

The application is structured as a decoupled, dockerized multi-service system:

| Component | Framework / Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 19, Next.js 16 (App Router), TailwindCSS, Radix UI, Lucide | Responsive legal workspace UI and document editor. |
| **Core Backend** | NestJS (v10), TypeScript, TypeORM, RxJS | Identity management, RAG indexing, document management, and AI agent orchestrator. |
| **Microservice** | Python 3.11, FastAPI, SQLAlchemy, Alembic | Handles business entities (Workspaces, Clients, Cases, Hearings, Tasks, Notes). |
| **Database** | PostgreSQL 16 | Central persistent storage shared across NestJS and Python models. |
| **Caching/SSE** | Redis, Server-Sent Events (SSE) | Manages streaming buffers, session caching, and async tasks. |
| **AI Integration** | `@google/generative-ai` (Gemini SDK) | Real-time text generation, vector embeddings, and RAG retrieval. |

---

## 2. Project Directory Tour

```text
legaldraft-ai/
├── backend/                       # NestJS Core Backend
│   ├── src/
│   │   ├── auth/                  # JWT Guards, RBAC, Roles, and Decorators
│   │   ├── users/                 # NestJS User Entity & Lifecycle Service
│   │   ├── config/                # Environment config loaders
│   │   ├── rag/                   # Vector embeddings, RAG indexing, and prompts
│   │   ├── files/                 # Document storage & File Intelligence
│   │   └── ai/                    # AI Module
│   │       ├── controllers/       # SSE Streaming and chat endpoints
│   │       ├── providers/         # Google Gemini integration client
│   │       └── agents/            # Specialized Multi-Agent System (Draft, Review, etc.)
│   ├── Dockerfile
│   ├── ai.env                     # AI Specific Configurations (Ignored by Git)
│   └── .env                       # Backend Configs (Ignored by Git)
│
├── frontend/                      # Next.js SPA Client
│   ├── src/
│   │   ├── app/                   # App Router pages (Dashboard, Cases, Clients, Editor)
│   │   ├── context/               # React Context Providers (CasesContext, ClientsContext)
│   │   ├── lib/                   # API Fetch clients (NestJS / Python endpoints)
│   │   └── components/            # Reusable UI Blocks (CaseCard, Sidebar, Editor)
│   ├── Dockerfile
│   └── next.config.js
│
├── python-service/                # FastAPI Business Logic Service
│   ├── app/
│   │   ├── api/                   # Router definitions and request hooks
│   │   ├── core/                  # Configurations and JWT security hooks
│   │   ├── database/              # SQLAlchemy session setup and base models
│   │   ├── models/                # DB model schemas (auth, workspace, client, case)
│   │   ├── repositories/          # DB access layer (repository pattern)
│   │   └── services/              # Core business validation services
│   ├── alembic/                   # Database migration files and version history
│   ├── Dockerfile
│   └── requirements.txt
│
└── docker-compose.yml             # Local Multi-Container Deployment Manifest
```

---

## 3. System Architecture & Data Flows

LegalDraft AI runs on a dual-backend architecture:

1. **Write/Read Separation**: 
   - **NestJS** acts as the primary gateway for Authentication, RAG queries, document analyses, and the conversational AI.
   - **FastAPI (Python)** acts as the transactional service for managing workspaces, clients, and case files.
2. **Authentication Flow**:
   - NestJS generates symmetric HS256 JWT tokens containing `id`, `email`, and `role` claims on login.
   - Python-service intercepts these JWT tokens in incoming headers, verifies the signature using the shared `JWT_SECRET_KEY`, and maps the claims to a local user context.

---

## 4. Database Schema & Sync Architecture

Both services share the same PostgreSQL database, but maintain separate tables. The connection is synchronized at the user level:

```
    ┌─────────────────┐                     ┌─────────────────┐
    │  users (NestJS) │                     │  fastapi_users  │
    ├─────────────────┤                     ├─────────────────┤
    │ id (PK)         │ ───[Synced-on]────► │ id (PK)         │
    │ email           │                     │ email           │
    └─────────────────┘                     └─────────────────┘
                                                     │
                                                     ▼ (1:N)
                                            ┌─────────────────┐
                                            │fastapi_workspcs │
                                            ├─────────────────┤
                                            │ id (PK)         │
                                            │ owner_id (FK)   │
                                            └─────────────────┘
```

### Table Mappings & Key Structures
- **`users` (NestJS)**: Managed by NestJS TypeORM. Stores authentication credentials and admin statuses.
- **`fastapi_users` (Python)**: Managed by Python SQLAlchemy. Acts as the foreign key target for workspaces.
- **`fastapi_workspaces`**: Linked to `fastapi_users` via the `owner_id` foreign key.
- **`fastapi_workspace_members`**: Linking table mapping workspaces to member users.
- **`fastapi_clients`**: Linked to `fastapi_workspaces.id`. Contains client profiles.
- **`fastapi_cases`**: Linked to `fastapi_workspaces.id` and `fastapi_clients.id`. Represents court cases.

### The Auto-Sync Logic (deps.py)
To prevent foreign key violations, the FastAPI authentication dependency in [deps.py](python-service/app/api/deps.py) acts as a dynamic synchronizer:
1. Validates the NestJS-issued JWT token.
2. Performs a query on `fastapi_users` for the token's `sub` (user UUID).
3. If not found in `fastapi_users`, it dynamically creates a record with the same UUID and email, ensuring that any workspace provisioning or client creation referencing this user succeeds.

---

## 5. AI Agent Network & Streaming Pipeline

The AI Assistant is built around a Multi-Agent system defined in `backend/src/ai/agents/`.

```
[User Message] ──► [AiManagerService] ──► [Specialized Agent]
                                                 │
                                                 ▼ (Prompt construction)
                                        [ Gemini Provider ]
                                                 │
                                                 ▼ (SSE Stream Output)
                                      [ token-by-token yield ]
```

### 1. Specialized Agents
*   **DraftAgent** (`draft-agent.service.ts`): Builds prompts for generating court-ready documents like bail applications, sale deeds, or petition plaints.
*   **ResearchAgent** (`research-agent.service.ts`): Summarizes relevant Indian law sections (IPC, CrPC, BNS) and case laws using context.
*   **ReviewAgent** (`review-agent.service.ts`): Highlights clauses, risks, or missing terms in document drafts.
*   **TimelineAgent** (`timeline-agent.service.ts`): Parses transcripts or facts to structure a chronological case timeline.

### 2. Streaming Response Flow
1. Next.js triggers an HTTP POST request to `/ai/conversations/:id/messages/stream`.
2. The `AiController` handles the request and invokes the `AiManagerService.executeStream()` generator.
3. The generator loads the conversation history, detects the appropriate agent, generates the system instruction prompt, and opens a streaming chat using the `GeminiProvider`.
4. In the `GeminiProvider`, the chat utilizes `sendMessageStream` via the `@google/generative-ai` SDK.
5. As tokens arrive from the Gemini API, the NestJS controller emits Server-Sent Events (`data: { "token": "..." }`) using a RxJS `Subject` mapped to an `Observable<MessageEvent>`.
6. The frontend reads the stream reader body and appends incoming tokens to the chat bubble.

---

## 6. Interactive Feature Walkthrough

### 1. Registering & Sign In
- Navigate to `http://localhost:3000/register`.
- Register a new account. On first sign-in, the system initiates the workspace provisioning pipeline (`POST /workspaces/provision` to the Python service), creating your default workspace.

### 2. Managing Clients
- Navigate to `/clients` in the sidebar.
- Click **Add Client** to open the creation modal.
- Fill out the client details. This makes a POST request to `python-service/api/v1/clients` which saves the client inside the database linked to the current active workspace.

### 3. Creating & Managing Cases
- Navigate to `/cases` in the sidebar.
- Click **Add Case Record** and associate it with the created client.
- Select case categories (e.g. Criminal, Civil, Property) and input court and filing details.
- Once created, select the case in the sidebar to access:
  - Scheduling hearings
  - Adding case tasks and checklists
  - Attaching case notes
  - Linking drafts and document files

### 4. Interactive AI Chat
- Click on **AI Assistant** in the sidebar.
- Ask questions like:
  - *"Can you draft a regular bail application under Section 439 CrPC?"*
  - *"Analyze the legal risks of this lease agreement."*
- The assistant streams responses in real-time, detecting the correct agent for the task.

---

## 7. Debugging & Troubleshooting Guidelines

Here are the details of the errors resolved during the stabilization phase and how you can debug similar issues:

### Debugging Workspaces & Clients
If clients fail to save or the pages show load warnings:
1. Check the python service logs:
   ```bash
   docker logs legaldraftai-python-service-1 -f
   ```
2. Verify if a database constraint is violated (e.g. `ForeignKeyViolation` on user IDs).
3. If user tables are out of sync, check `python-service/app/api/deps.py` to ensure user credentials are correctly verified and auto-populated.

### Debugging AI Streaming & Connection Hangs
If the AI chat bubble remains blank or shows a continuous loading indicator:
1. Check the NestJS backend logs:
   ```bash
   docker logs legaldraftai-backend-1 -f
   ```
2. Filter for `[AI]` logs to trace exactly where the pipeline failed (Request received -> Selected agent -> Prompt generated -> Calling Gemini).
3. If you see a `429 Too Many Requests` or quota limit exceeded error from Google, it means the model does not have active quota under your API key.
4. If a model is unavailable, the pipeline catches the exception, outputs the full stack trace to the console, yields an `{ error: ... }` SSE chunk, and fails gracefully by yielding a fallback streaming response and a `{ done: true }` completion event to prevent frontend hangs.

---

## 8. Setup & Running Locally

### 1. Environment Configurations
Verify that you have configured the environment variables correctly inside the `backend` folder:
- **`backend/.env`**: Contains database connections and server setups.
- **`backend/ai.env`**: Contains Gemini AI variables:
  ```env
  AI_PROVIDER=gemini
  GEMINI_API_KEY=your-gemini-api-key
  GEMINI_MODEL=gemini-flash-lite-latest
  GEMINI_EMBEDDING_MODEL=text-embedding-004
  ```

> **Note**: `gemini-flash-lite-latest` (Gemini 1.5 Flash 8B/Lite) is the recommended model alias in development to bypass rate limits.

### 2. Starting the Platform
Launch all services using Docker Compose:
```bash
# Build images and start all containers in detached mode
docker compose up --build -d
```

### 3. Rebuilding Services
If you edit backend or python-service code files, rebuild and restart the containers to apply changes:
```bash
# Rebuild & restart NestJS backend
docker compose build backend && docker compose up -d backend

# Rebuild & restart FastAPI python-service
docker compose build python-service && docker compose up -d python-service
```
