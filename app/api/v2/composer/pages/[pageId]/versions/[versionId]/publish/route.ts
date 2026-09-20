import { NextRequest } from 'next/server'
import { prismaV2 } from '@/lib/prisma-v2'
import { requireV2Auth } from '@/lib/v2/context'
import { requirePermission } from '@/lib/v2/permissions'
import { ok, errors } from '@/lib/v2/response'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ pageId: string; versionId: string }> }
) {
  const { pageId, versionId } = await params
  const ctx = await requireV2Auth()
  if (ctx instanceof Response) return ctx

  const perm = requirePermission(ctx.role, 'composer:publish')
  if (perm) return perm

  const page = await prismaV2.v2Page.findFirst({
    where: { id: pageId, shopId: ctx.shopId },
    select: { id: true },
  })
  if (!page) return errors.notFound('Page')

  const version = await prismaV2.v2PageVersion.findFirst({
    where: { id: versionId, pageId },
  })
  if (!version) return errors.notFound('Page version')

  if (version.status !== 'DRAFT' && version.status !== 'PREVIEW') {
    return errors.versionNotDraft()
  }

  const now = new Date()

  const published = await prismaV2.$transaction(async (tx) => {
    // Archive the current published version
    await tx.v2PageVersion.updateMany({
      where: { pageId, status: 'PUBLISHED' },
      data: { status: 'ARCHIVED', archivedAt: now },
    })

    // Publish the target version
    const publishedVersion = await tx.v2PageVersion.update({
      where: { id: versionId },
      data: { status: 'PUBLISHED', publishedAt: now },
      include: {
        sections: {
          include: { bindings: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    })

    // Create release record
    await tx.v2ReleaseRecord.create({
      data: {
        pageId,
        pageVersionId: versionId,
        publishedAt: now,
        publishedBy: ctx.userId,
      },
    })

    // Record publish event
    await tx.v2PublishEvent.create({
      data: {
        shopId: ctx.shopId,
        entityType: 'PAGE',
        entityId: pageId,
        action: 'PUBLISH',
        actorId: ctx.userId,
        meta: { versionId, versionLabel: version.label },
      },
    })

    return publishedVersion
  })

  return ok(published)
}
