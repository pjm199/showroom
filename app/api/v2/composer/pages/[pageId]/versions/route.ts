import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prismaV2 } from '@/lib/prisma-v2'
import { requireV2Auth } from '@/lib/v2/context'
import { requirePermission } from '@/lib/v2/permissions'
import { ok, created, errors } from '@/lib/v2/response'

const createVersionSchema = z.object({
  label: z.string().max(100).optional(),
  cloneFromVersionId: z.string().optional(),
})

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  const { pageId } = await params
  const ctx = await requireV2Auth()
  if (ctx instanceof Response) return ctx

  const perm = requirePermission(ctx.role, 'composer:read')
  if (perm) return perm

  const page = await prismaV2.v2Page.findFirst({
    where: { id: pageId, shopId: ctx.shopId },
    select: { id: true },
  })
  if (!page) return errors.notFound('Page')

  const versions = await prismaV2.v2PageVersion.findMany({
    where: { pageId },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { sections: true } } },
  })

  return ok(versions)
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  const { pageId } = await params
  const ctx = await requireV2Auth()
  if (ctx instanceof Response) return ctx

  const perm = requirePermission(ctx.role, 'composer:write')
  if (perm) return perm

  const page = await prismaV2.v2Page.findFirst({
    where: { id: pageId, shopId: ctx.shopId },
    select: { id: true },
  })
  if (!page) return errors.notFound('Page')

  const body = await request.json().catch(() => ({}))
  const parsed = createVersionSchema.safeParse(body)
  if (!parsed.success) {
    return errors.validation('Invalid version data', parsed.error.flatten())
  }

  const { label, cloneFromVersionId } = parsed.data

  const version = await prismaV2.$transaction(async (tx) => {
    const newVersion = await tx.v2PageVersion.create({
      data: {
        pageId,
        status: 'DRAFT',
        label: label ?? null,
        createdBy: ctx.userId,
      },
    })

    if (cloneFromVersionId) {
      const source = await tx.v2PageVersion.findFirst({
        where: { id: cloneFromVersionId, pageId },
        include: {
          sections: {
            include: { bindings: true },
            orderBy: { sortOrder: 'asc' },
          },
        },
      })

      if (source) {
        for (const section of source.sections) {
          const newSection = await tx.v2SectionInstance.create({
            data: {
              pageVersionId: newVersion.id,
              sectionTypeId: section.sectionTypeId,
              label: section.label,
              config: section.config as any,
              isEnabled: section.isEnabled,
              sortOrder: section.sortOrder,
              audienceRuleId: section.audienceRuleId,
            },
          })

          for (const binding of section.bindings) {
            await tx.v2SectionBinding.create({
              data: {
                sectionInstanceId: newSection.id,
                slot: binding.slot,
                bindingType: binding.bindingType,
                productId: binding.productId,
                collectionId: binding.collectionId,
                mediaAssetId: binding.mediaAssetId,
                manualValue: binding.manualValue as any,
                sortOrder: binding.sortOrder,
              },
            })
          }
        }
      }
    }

    return tx.v2PageVersion.findUnique({
      where: { id: newVersion.id },
      include: {
        sections: {
          include: { bindings: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    })
  })

  return created(version)
}
