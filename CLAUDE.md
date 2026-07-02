# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Two independent apps in one repo:

1. **Frontend** (repo root): Create React App (React 19) gamified IFRS 17 training quiz. Supabase (Postgres) for auth, progress persistence, and leaderboards.
2. **Backend** (`backend/`): FastAPI + LangGraph RAG chatbot answering IFRS 17 questions. Uses OpenAI for LLM/embeddings and Supabase pgvector (production) or ChromaDB (local) as the vector store. Deployed to Render via `backend/Procfile` (Python 3.11).

The frontend works without the backend — the chatbot panel is the only feature that calls it.

## Commands

### Frontend (run from repo root)

```bash
npm start                                  # dev server on :3000
npm run build                              # production build
npm test                                   # jest in watch mode
npm test -- --watchAll=false               # run all tests once (CI style)
npm test -- --watchAll=false App.test.js   # run a single test file
```

### Backend (run from `backend/`)

```bash
python -m venv venv && venv\Scripts\activate   # venv expected at backend/venv
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000      # dev server; API docs at :8000/docs
pytest                                          # run tests (backend/tests/)
pytest tests/test_api.py -k health              # single test
black . && isort .                              # formatting
```

### Both servers at once (Windows)

```powershell
.\start-servers.ps1   # kills anything on :3000/:8000, starts backend then frontend
```

## Environment Variables

- **Frontend** (root `.env` / `.env.local`): `REACT_APP_SUPABASE_URL`, `REACT_APP_SUPABASE_ANON_KEY` (required); `REACT_APP_API_URL` (chatbot backend URL, defaults to `http://localhost:8000` in `src/components/ChatPanel.js`).
- **Backend** (`backend/.env`, loaded by `backend/app/config.py`): `OPENAI_API_KEY` plus `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_KEY` (required — `VECTOR_STORE_TYPE` defaults to `supabase`). All other settings have defaults in `config.py`. Optional LangSmith tracing via `LANGCHAIN_*` vars.
- **Warning**: `backend/.env.example` is stale — it predates the pgvector migration and lists no `SUPABASE_*` keys. Trust `backend/app/config.py` as the source of truth.

## Architecture

### Frontend

Entry flow: `src/index.js` → `src/App.js` → `src/IFRS17TrainingGame.js`.

`src/IFRS17TrainingGame.js` is the game orchestrator: it owns all game state (module, question, score, streak, XP, power-ups) and delegates logic to hooks:

- `src/hooks/useGamePersistence.js` — save/resume orchestration across guest and authenticated users
- `src/hooks/useQuestionFlow.js` — answering, scoring, module completion
- `src/hooks/useGameUIActions.js`, `useModuleTimer.js`, `useAchievements.js`

UI components live in `src/components/game/` (question panel, toasts, module-complete modal) and `src/components/layout/` (header, stats, modules grid). Question content for all 9 modules is in `src/data/IFRS17Modules.js`.

**Deferred authentication** (`DEFERRED_AUTH_IMPLEMENTATION.md`): users play Module 1 as a guest (localStorage only, keys in `GAME_CONFIG.STORAGE_KEYS`); completing Module 1 prompts sign-up, and `migrateGuestToAuthenticatedUser()` (in `src/modules/guestUserService.js`) transfers guest progress to the Supabase account. Controlled by the `ENABLE_DEFERRED_AUTH` flag and `MODULE_ACCESS` lists in `src/config/gameConfig.js`. Modules 2+ require auth.

**Dual persistence**: `src/modules/supabaseService.js` (cloud: `user_progress`, `game_progress`, leaderboards) with `src/modules/storageService.js` (localStorage, per-user keys) as fallback and for fast "last location" resume. On resume, `game_progress` takes priority. Supabase schema lives in the root `*.sql` files (`complete-persistence-setup.sql` is the most complete) and `migrations/`.

### Backend

FastAPI app (`backend/app/main.py`) exposing `/api/health`, `/api/chat`, `/api/chat/stream` (SSE), and `/api/ingest` (`backend/app/api/routes.py`).

Chat requests run through a linear LangGraph pipeline defined in `backend/app/core/graph.py`, with node implementations in `nodes.py`:

```
guardrail_agent (is it IFRS 17-related?) → classify_query → retrieve_documents → generate_answer → format_response
```

**Vector store switching**: `backend/app/rag/vectorstore.py` dispatches on `settings.VECTOR_STORE_TYPE` — `"supabase"` (pgvector via `supabase_vectorstore.py`, production default) or `"chroma"` (local, persisted to `backend/data/chroma_db/`). Functions like `similarity_search`/`add_documents` abstract over both; `get_vectorstore()` returns `None` for Supabase, so don't assume a LangChain vectorstore object exists.

Document ingestion: put PDFs in `backend/data/documents/`, then POST `/api/ingest` (loader/splitter in `backend/app/utils/`).

## Legacy Files — Do Not Edit

The live game component is `src/IFRS17TrainingGame.js`. These are dead copies kept around from earlier refactors:

- `IFRS17TrainingGame.js` at the **repo root** (1,600-line pre-refactor monolith)
- `src/originalcode.js`, `src/backup/`
- `src/modules/supabaseLeaderboard copy.js`
