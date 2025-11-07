# SavedDigest

SavedDigest turns your Reddit saved items into an automated, AI-powered newsletter that lands in your inbox on a cadence you control.

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start Postgres with Docker Compose (provisions primary + shadow DBs expected by Prisma):

   ```bash
   docker compose up -d
   ```

3. Copy the environment template and fill in values for Reddit OAuth, SendGrid, OpenAI (optional), and security secrets:

   ```bash
   cp .env.example .env.local
   ```

4. Generate the Prisma client and run the initial migration:

   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

5. Launch the dev server:

   ```bash
   npm run dev
   ```

6. Visit `http://localhost:3000`, sign in with Reddit, then complete onboarding (timezone + cadence). The onboarding flow will:

   - Persist your preferences via `/api/preferences`
   - Kick off a Reddit sync via `/api/sync`
   - Build an email preview via `/api/newsletter/send?preview=1`

7. Use the dashboard to trigger manual syncs, previews, or sends while you validate newsletter content and AI summaries.

## Operational Checklist

- **Scheduler:** configure a cron job (e.g. Vercel cron or GitHub Actions) to hit `/api/scheduler?secret=CRON_SECRET` at least hourly.
- **SendGrid:** verify the sender identity and domain so production emails are not blocked.
- **Backups:** store `PROD_DATABASE_URL` in GitHub to enable the nightly `.github/workflows/backup.yml` job.
- **Secrets rotation:** keep `CRON_SECRET`, `NEXTAUTH_SECRET`, and `ENCRYPTION_KEY` unique per environment.

## Deployment

Deploy on Vercel or any Node.js host. Supply the same environment variables as `.env.example`, set up the scheduler cron, and ensure the Postgres database is reachable from your deployment.
