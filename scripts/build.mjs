/**
 * Vercel/CI: run migrations before generate + next build so the DB matches schema.
 * Local: skip migrate if DATABASE_URL is unset (e.g. static analysis only).
 */
import { spawnSync } from "node:child_process";

function run(cmd, env) {
  const r = spawnSync(cmd, { shell: true, stdio: "inherit", env });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

// Prefer running migrations against DIRECT_URL (direct Postgres) when available.
// This avoids Supabase Session pooler "max clients" flakes.
if (process.env.DIRECT_URL) {
  run("npx prisma migrate deploy", {
    ...process.env,
    DATABASE_URL: process.env.DIRECT_URL,
  });
} else if (process.env.DATABASE_URL) {
  // Local/dev fallback: try with DATABASE_URL, but this may fail on Supabase Session pooler.
  run("npx prisma migrate deploy", process.env);
}
run("npx prisma generate", process.env);
run("npx next build", process.env);
