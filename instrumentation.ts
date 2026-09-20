/**
 * Warm Prisma on Node cold starts (Vercel serverless) to reduce first-request DB flakes.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  try {
    const { prisma } = await import("./lib/db");
    await prisma.$connect();
  } catch (e) {
    console.error("[instrumentation] prisma.$connect failed", e);
  }
}
