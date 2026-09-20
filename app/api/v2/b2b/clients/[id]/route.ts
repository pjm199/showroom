import { NextRequest } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prismaV2 } from '@/lib/prisma-v2'
import { requireV2Auth } from '@/lib/v2/context'
import { requirePermission } from '@/lib/v2/permissions'
import { ok, noContent, errors } from '@/lib/v2/response'

const updateClientSchema = z.object({
  companyName: z.string().min(1).max(200).optional(),
  contactName: z.string().max(150).nullable().optional(),
  password: z.string().min(6).optional(),
  customerGroupId: z.string().nullable().optional(),
  assignedCatalogId: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
})

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const ctx = await requireV2Auth()
  if (ctx instanceof Response) return ctx

  const perm = requirePermission(ctx.role, 'b2b:read')
  if (perm) return perm

  const client = await prismaV2.v2B2BClient.findFirst({
    where: { id, shopId: ctx.shopId },
    include: {
      customerGroup: { select: { id: true, name: true } },
      assignedCatalog: { select: { id: true, name: true, slug: true } },
      priceOverrides: {
        include: {
          product: { select: { id: true, title: true, slug: true, priceCents: true } },
        },
        orderBy: { updatedAt: 'desc' },
      },
      _count: { select: { priceOverrides: true, orders: true } },
    },
  })
  if (!client) return errors.notFound('B2B client')

  const { passwordHash: _, ...safe } = client
  return ok(safe)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const ctx = await requireV2Auth()
  if (ctx instanceof Response) return ctx

  const perm = requirePermission(ctx.role, 'b2b:write')
  if (perm) return perm

  const client = await prismaV2.v2B2BClient.findFirst({
    where: { id, shopId: ctx.shopId },
    select: { id: true },
  })
  if (!client) return errors.notFound('B2B client')

  const body = await request.json().catch(() => null)
  const parsed = updateClientSchema.safeParse(body)
  if (!parsed.success) {
    return errors.validation('Invalid client data', parsed.error.flatten())
  }

  const data = parsed.data

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

  const updateData: Record<string, unknown> = {}
  if (data.companyName !== undefined) updateData.companyName = data.companyName
  if (data.contactName !== undefined) updateData.contactName = data.contactName
  if (data.customerGroupId !== undefined) updateData.customerGroupId = data.customerGroupId
  if (data.assignedCatalogId !== undefined) updateData.assignedCatalogId = data.assignedCatalogId
  if (data.isActive !== undefined) updateData.isActive = data.isActive
  if (data.password) updateData.passwordHash = await bcrypt.hash(data.password, 10)

  const updated = await prismaV2.v2B2BClient.update({
    where: { id },
    data: updateData,
    include: {
      customerGroup: { select: { id: true, name: true } },
      assignedCatalog: { select: { id: true, name: true, slug: true } },
    },
  })

  const { passwordHash: _, ...safe } = updated
  return ok(safe)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const ctx = await requireV2Auth()
  if (ctx instanceof Response) return ctx

  const perm = requirePermission(ctx.role, 'b2b:delete')
  if (perm) return perm

  const client = await prismaV2.v2B2BClient.findFirst({
    where: { id, shopId: ctx.shopId },
    select: { id: true },
  })
  if (!client) return errors.notFound('B2B client')

  await prismaV2.v2B2BClient.delete({ where: { id } })
  return noContent()
}
