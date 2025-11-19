# Smart Company Presentation Design Website

Internal Google-Slides-like editor with AI.

## Tech
- Next.js (App Router) + React + TailwindCSS + Zustand + Fabric.js
- NextAuth (Google/Email) with company domain restriction
- Prisma + PostgreSQL
- Basic AI stubs (analyze layout, suggest, extract colors)
- Dockerfile + docker-compose
- Jest + RTL smoke tests

## Setup (local)
1. Install deps
```bash
npm i
```
2. Create `.env`
```bash
cat > .env << 'EOF'
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/smart_slides?schema=public"
NEXTAUTH_SECRET="changeme"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
EMAIL_SERVER_HOST=""
EMAIL_SERVER_PORT=""
EMAIL_SERVER_USER=""
EMAIL_SERVER_PASSWORD=""
EMAIL_FROM="noreply@adc.com"
OPENAI_API_KEY=""
OPENAI_MODEL="gpt-4o-mini"
GROQ_API_KEY=""
CHAT_DUMMY_MODE="false"
COMPANY_DOMAIN="adc.com"
EOF
```
3. Prisma
```bash
npx prisma migrate dev
npm run prisma:seed
```
4. Dev server
```bash
npm run dev
```

## Setup (Docker)
```bash
docker compose up -d postgres
# generate & migrate against container DB
DATABASE_URL=postgres://postgres:postgres@localhost:5432/smart_slides?schema=public npx prisma migrate dev
npm run build
docker compose up --build
```

## Auth
- Only emails ending with `@adc.com` can sign in.
- Default seed creates `admin@adc.com` as ADMIN.

## Scripts
- `npm run dev` start dev server
- `npm run prisma:migrate` run migrations
- `npm run prisma:seed` seed admin user
- `npm test` run tests

## MVP Flow
- Login → Dashboard → Create → Edit (text) → Autosave → Preview → Export PDF (stub)

## Branding
- Primary: #0C7C59; Accent: #00A19A; Dark: #0A1F1A; Primary-50: #E7F5F0
- Font: Inter

## Chat Assistant

The in-app chatbot assistant uses **Groq (free tier)** by default, or OpenAI if configured.

### Free AI Setup (Recommended)

1. Get a free API key from [Groq Console](https://console.groq.com/)
2. Add to your `.env` file:
   ```
   GROQ_API_KEY="your_groq_api_key_here"
   ```
3. The assistant will automatically use Groq's free, fast AI models.

### OpenAI Setup (Optional)

If you prefer OpenAI, add to your `.env`:
```
OPENAI_API_KEY="your_openai_key_here"
OPENAI_MODEL="gpt-4o-mini"
```

The chat assistant will use OpenAI if `OPENAI_API_KEY` is set, otherwise it will use Groq if `GROQ_API_KEY` is set.

### Debugging the Chat Assistant

1. **Enable Dummy Mode** (for testing without OpenAI):
   ```bash
   # In .env file:
   CHAT_DUMMY_MODE=true
   ```
   This bypasses OpenAI and returns hardcoded responses to verify frontend/backend connectivity.

2. **Check Logs**:
   - **Frontend logs**: Open browser console (F12) and look for logs prefixed with `FRONTEND:`
   - **Backend logs**: Check the Next.js server terminal for logs prefixed with `BACKEND:`

3. **Response Format**:
   - Success: `{ reply: "..." }`
   - Error: `{ error: "...", message: "..." }`

4. **Common Issues**:
   - If you see "The assistant is not configured": Check that `OPENAI_API_KEY` is set in `.env`
   - If dummy mode works but real AI doesn't: Check OpenAI API key validity and quota
   - If no response at all: Check that the Next.js server is running on port 3000 (Vite proxy forwards `/api` to it)

## Notes
- Real-time collaboration, comments, sharing, and version history are scaffold targets; basic endpoints/UI can be extended.
- PDF export is stubbed; replace with real renderer later.

