import { NextRequest } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prismaV2 } from '@/lib/prisma-v2'
import { requireV2Auth } from '@/lib/v2/context'
import { requirePermission } from '@/lib/v2/permissions'
import { ok, created, errors } from '@/lib/v2/response'

const createClientSchema = z.object({
  companyName: z.string().min(1).max(200),
  contactName: z.string().max(150).optional(),
  email: z.string().email(),
  password: z.string().min(6).optional(),
  customerGroupId: z.string().nullable().optional(),
  assignedCatalogId: z.string().nullable().optional(),
})

export async function GET(request: NextRequest) {
  const ctx = await requireV2Auth()
  if (ctx instanceof Response) return ctx

  const perm = requirePermission(ctx.role, 'b2b:read')
  if (perm) return perm

  const isActive = request.nextUrl.searchParams.get('isActive')

  const clients = await prismaV2.v2B2BClient.findMany({
    where: {
      shopId: ctx.shopId,
      ...(isActive !== null ? { isActive: isActive === 'true' } : {}),
    },
    include: {
      customerGroup: { select: { id: true, name: true } },
      assignedCatalog: { select: { id: true, name: true, slug: true } },
      _count: { select: { priceOverrides: true, orders: true } },
    },
    orderBy: { companyName: 'asc' },
  })

  const safe = clients.map(({ passwordHash: _, ...client }) => client)
  return ok(safe)
}

export async function POST(request: NextRequest) {
  const ctx = await requireV2Auth()
  if (ctx instanceof Response) return ctx

  const perm = requirePermission(ctx.role, 'b2b:write')
  if (perm) return perm

  const body = await request.json().catch(() => null)
  const parsed = createClientSchema.safeParse(body)
  if (!parsed.success) {
    return errors.validation('Invalid client data', parsed.error.flatten())
  }

  const data = parsed.data

  const existing = await prismaV2.v2B2BClient.findUnique({
    where: { shopId_email: { shopId: ctx.shopId, email: data.email.toLowerCase() } },
    select: { id: true },
  })
  if (existing) {
    return errors.conflict(`A B2B client with email '${data.email}' already exists`)
  }

  if (data.assignedCatalogId) {
    const catalog = await prismaV2.v2B2BCatalog.findFirst({
      where: { id: data.assignedCatalogId, shopId: ctx.shopId },
      select: { id: true },
    })
    if (!catalog) return errors.validation('Assigned catalog not found')
  }

  if (data.customerGroupId) {
    const group = await prismaV2.v2CustomerGroup.findFirst({
      where: { id: data.customerGroupId, shopId: ctx.shopId },
      select: { id: true },
    })
    if (!group) return errors.validation('Customer group not found')
  }

  const passwordHash = data.password
    ? await bcrypt.hash(data.password, 10)
    : null

  const client = await prismaV2.v2B2BClient.create({
    data: {
      shopId: ctx.shopId,
      companyName: data.companyName,
      contactName: data.contactName ?? null,
      email: data.email.toLowerCase(),
      passwordHash,
      customerGroupId: data.customerGroupId ?? null,
      assignedCatalogId: data.assignedCatalogId ?? null,
    },
    include: {
      customerGroup: { select: { id: true, name: true } },
      assignedCatalog: { select: { id: true, name: true, slug: true } },
    },
  })

  const { passwordHash: _, ...safe } = client
  return created(safe)
}
