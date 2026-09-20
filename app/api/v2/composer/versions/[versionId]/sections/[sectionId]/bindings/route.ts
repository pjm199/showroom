import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prismaV2 } from '@/lib/prisma-v2'
import { requireV2Auth } from '@/lib/v2/context'
import { requirePermission } from '@/lib/v2/permissions'
import { ok, created, errors } from '@/lib/v2/response'

const createBindingSchema = z.object({
  slot: z.string().min(1),
  bindingType: z.enum(['PRODUCT', 'COLLECTION', 'MEDIA_ASSET', 'MANUAL']),
  refId: z.string().optional(),
  manualValue: z.record(z.unknown()).optional(),
  sortOrder: z.number().int().optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ versionId: string; sectionId: string }> }
) {
  const { versionId, sectionId } = await params
  const ctx = await requireV2Auth()
  if (ctx instanceof Response) return ctx

  const perm = requirePermission(ctx.role, 'composer:write')
  if (perm) return perm

  const section = await prismaV2.v2SectionInstance.findFirst({
    where: { id: sectionId, pageVersionId: versionId },
    include: { pageVersion: { include: { page: { select: { shopId: true } } } } },
  })
  if (!section || section.pageVersion.page.shopId !== ctx.shopId) {
    return errors.notFound('Section')
  }
  if (section.pageVersion.status !== 'DRAFT') return errors.versionNotDraft()

  const body = await request.json().catch(() => null)
  const parsed = createBindingSchema.safeParse(body)
  if (!parsed.success) {
    return errors.validation('Invalid binding data', parsed.error.flatten())
  }

  const data = parsed.data

  const bindingData = {
    sectionInstanceId: sectionId,
    slot: data.slot,
    bindingType: data.bindingType,
    manualValue: data.manualValue ?? null,
    sortOrder: data.sortOrder ?? 0,
    productId: data.bindingType === 'PRODUCT' ? (data.refId ?? null) : null,
    collectionId: data.bindingType === 'COLLECTION' ? (data.refId ?? null) : null,
    mediaAssetId: data.bindingType === 'MEDIA_ASSET' ? (data.refId ?? null) : null,
  }

  const binding = await prismaV2.v2SectionBinding.create({ data: bindingData })
  return created(binding)
}
