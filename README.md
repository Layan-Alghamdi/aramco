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

## Notes
- Real-time collaboration, comments, sharing, and version history are scaffold targets; basic endpoints/UI can be extended.
- PDF export is stubbed; replace with real renderer later.

