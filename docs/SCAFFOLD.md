# [PROJECT_NAME] — Project Scaffold Commands

Run these from the **project root** (e.g. `Showroom`). Ensure Node.js 18+ and npm/pnpm are installed.

---

## 1. Create Next.js app (if starting in empty folder)

If the folder is empty and you want Next.js to create the app here:

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --use-npm
```

When prompted:

- **Would you like to use `src/` directory?** → **No**
- **Would you like to use Turbopack?** → Optional (Yes for faster dev)

If you prefer a subfolder (e.g. `showroom-app`) instead of current dir:

```bash
npx create-next-app@latest showroom-app --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --use-npm
```

Then `cd showroom-app` for the steps below.

---

## 2. Install Prisma and init DB

```bash
npm install prisma @prisma/client
npx prisma init
```

---

## 3. Install shadcn/ui

```bash
npx shadcn@latest init
```

Suggested choices:

- **Style:** Default or New York
- **Base color:** Slate or Zinc
- **CSS variables:** Yes
- **Tailwind config:** Yes
- **Components path:** `components/ui`
- **Utils path:** `lib/utils`
- **React Server Components:** Yes
- **`components.json`:** Yes

---

## 4. Install common shadcn components (optional, for later)

You can add these when building UI in Phase 1–2:

```bash
npx shadcn@latest add button card input label form dialog dropdown-menu avatar sheet tabs badge
```

---

## 5. Environment file

Create `.env` in project root:

```bash
# Copy from example (create .env.example first if needed)
# Then set:
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public"
```

For local PostgreSQL:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/showroom?schema=public"
```

---

## 6. Replace Prisma schema and migrate

Copy the full `schema.prisma` from this repo’s `prisma/schema.prisma`, then:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

---

## 7. (Optional) Supabase for images

If using Supabase Storage for uploads (recommended in architecture):

```bash
npm install @supabase/supabase-js
```

Add to `.env`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## 8. Verify

```bash
npm run build
```

No errors → scaffold is ready for Phase 1.

---

## One-shot summary (after create-next-app)

```bash
npm install prisma @prisma/client
npx prisma init
npx shadcn@latest init
# Add .env with DATABASE_URL
# Replace prisma/schema.prisma with project schema, then:
npx prisma migrate dev --name init
npx prisma generate
npm run build
```
