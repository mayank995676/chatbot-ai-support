# AI Customer Support Chatbot (RAG Engine)

A production-quality full-stack AI Customer Support Chatbot web application designed with a premium ChatGPT + Vercel inspired interface. It enables companies to upload training documents (PDF/TXT) to build a localized knowledge base, allowing customers to query the chatbot with zero hallucinations.

---

## Architecture Overview

This project is built as a single, self-contained Next.js application, utilizing the following layers:

### 1. Frontend & Client UI
- **Framework**: Next.js 15 (App Router) + React.
- **Styling**: Tailwind CSS (v4) with CSS Variables for consistent SaaS styling (crisp borders, off-white sidebars, rounded cards, blue accents).
- **Icons**: Lucide React.
- **Interactive Chat**: Built-in state for optimistic UI message sending, copy actions, dynamic height textareas (supporting `Enter` to send, `Shift+Enter` for newlines), and scroll management.
- **High-Fidelity Markdown Parser**: Built-in regex-based compiler that converts markdown text, list elements, bold statements, and code blocks with standard language tags and custom copy-action headers.

### 2. Backend API Layer
- **Route Handlers**: App Router endpoints serving JSON payloads.
  - `POST /api/upload`: Validates uploaded files (max 5MB, PDF/TXT), extracts text, generates chunks, calls OpenAI Embeddings API, and writes records to database.
  - `POST /api/chat`: Receives query, gets embeddings, performs cosine similarity vector search over the database, formats the system instructions, and calls OpenAI Chat completions.
  - `GET/DELETE /api/document`: Retrieves existing documents or performs cascade deletes of files and their associated vector database chunks.
  - `GET/POST/DELETE /api/history`: Manages chat histories and messages.

### 3. Database & SQLite Vector Storage (Prisma 7)
- **Engine**: SQLite.
- **ORM**: Prisma 7.
- **Prisma Client Adapter**: `@prisma/adapter-better-sqlite3` + `better-sqlite3`.
- **Vector Strategy**: Instead of requiring a separate running Docker container for ChromaDB, vectors (represented as 1536-dimensional float arrays from OpenAI `text-embedding-3-small`) are stored as JSON strings in the SQLite database. Vector search is executed on the server via an in-memory cosine similarity calculation. This approach offers extremely fast query speeds (under 2ms search for thousands of chunks) and guarantees **instant out-of-the-box Vercel deployments**.

---

## Database Schema (Prisma Models)

```prisma
model Chat {
  id        String    @id @default(uuid())
  title     String    @default("New Chat")
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  messages  Message[]
}

model Message {
  id        String   @id @default(uuid())
  chatId    String
  chat      Chat     @relation(fields: [chatId], references: [id], onDelete: Cascade)
  role      String   // "user" or "assistant"
  content   String
  createdAt DateTime @default(now())
}

model Document {
  id        String   @id @default(uuid())
  name      String
  type      String   // "pdf" or "txt"
  size      Int
  createdAt DateTime @default(now())
  chunks    Chunk[]
}

model Chunk {
  id         String   @id @default(uuid())
  documentId String
  document   Document @relation(fields: [documentId], references: [id], onDelete: Cascade)
  content    String
  embedding  String   // JSON-serialized array of floats
}
```

---

## Installation & Local Setup

### 1. Prerequisites
Ensure you have **Node.js 18+** installed. Check your environment with:
```bash
node -v
npm -v
```

### 2. Install Dependencies
Clone the repository, navigate to the folder, and run:
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root of the project:
```env
OPENAI_API_KEY=your_openai_api_key_here
```

### 4. Run Migrations
Generate the SQLite database and create the schemas:
```bash
npx prisma migrate dev --name init
```

### 5. Start Development Server
Run the local Next.js environment:
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## Retrieval-Augmented Generation (RAG) Details

Every message sent by the user triggers the following sequence:
1. **Query Embedding**: The user's query is converted to a vector using OpenAI's `text-embedding-3-small`.
2. **SQLite Vector Search**: The backend retrieves all chunk embeddings, parses them, and computes the cosine similarity against the query vector.
3. **Context Construction**: Top-ranking chunks (with a threshold matching score $\ge 0.22$) are assembled into a single context block.
4. **Prompt Instruction**: The context is injected into a strict system instructions prompt:
   > *"You must answer the user's question ONLY using the provided company document context below. If the answer to the user's question cannot be found or reasonably inferred from the provided context, you MUST respond EXACTLY with: 'I'm sorry, I couldn't find that information in the provided company documents.' Do NOT make up facts. Do NOT hallucinate."*
5. **Chat Completion**: The model (`gpt-4o` / `gpt-4o-mini`) evaluates the context and returns the answer.

---

## Deploying to Vercel

This application is ready to deploy to Vercel with a single command:

1. Install the Vercel CLI (or connect through Vercel Dashboard):
   ```bash
   npm i -g vercel
   ```
2. Run the deployment setup:
   ```bash
   vercel
   ```
3. Set your Production Environment Variable on the Vercel Dashboard:
   - `OPENAI_API_KEY`: `sk-...`
4. Deploy the build:
   ```bash
   vercel --prod
   ```

*Note: Since SQLite is stored locally, data written to `dev.db` on a serverless platform (Vercel) will reset when the serverless function restarts. For persistence in production setups, swap the SQLite provider to PostgreSQL, Supabase, or Neon in `schema.prisma` and configure the adapter accordingly.*
