import { NextRequest } from 'next/server'
import { prismaV2 } from '@/lib/prisma-v2'
import { requireV2Auth } from '@/lib/v2/context'
import { requirePermission } from '@/lib/v2/permissions'
import { noContent, errors } from '@/lib/v2/response'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ versionId: string; sectionId: string; bindingId: string }> }
) {
  const { versionId, sectionId, bindingId } = await params
  const ctx = await requireV2Auth()
  if (ctx instanceof Response) return ctx

  const perm = requirePermission(ctx.role, 'composer:write')
  if (perm) return perm

  const binding = await prismaV2.v2SectionBinding.findFirst({
    where: { id: bindingId, sectionInstanceId: sectionId },
    include: {
      sectionInstance: {
        include: {
          pageVersion: { include: { page: { select: { shopId: true } } } },
        },
      },
    },
  })
  if (!binding || binding.sectionInstance.pageVersion.page.shopId !== ctx.shopId) {
    return errors.notFound('Binding')
  }
  if (binding.sectionInstance.pageVersion.status !== 'DRAFT') {
    return errors.versionNotDraft()
  }

  await prismaV2.v2SectionBinding.delete({ where: { id: bindingId } })
  return noContent()
}
