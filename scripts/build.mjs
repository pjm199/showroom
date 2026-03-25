/**
 * Vercel/CI: run migrations before generate + next build so the DB matches schema.
 * Local: skip migrate if DATABASE_URL is unset (e.g. static analysis only).
 */
import { spawnSync } from "node:child_process";

function run(cmd) {
  const r = spawnSync(cmd, { shell: true, stdio: "inherit", env: process.env });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

if (process.env.DATABASE_URL) {
  run("npx prisma migrate deploy");
}
run("npx prisma generate");
run("npx next build");
