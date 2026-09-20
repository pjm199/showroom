import { NextRequest } from 'next/server'
import { prismaV2 } from '@/lib/prisma-v2'
import { requireV2Auth } from '@/lib/v2/context'
import { requirePermission } from '@/lib/v2/permissions'
import { created, errors } from '@/lib/v2/response'
import { randomBytes } from 'crypto'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ pageId: string; versionId: string }> }
) {
  const { pageId, versionId } = await params
  const ctx = await requireV2Auth()
  if (ctx instanceof Response) return ctx

  const perm = requirePermission(ctx.role, 'composer:read')
  if (perm) return perm

  const page = await prismaV2.v2Page.findFirst({
    where: { id: pageId, shopId: ctx.shopId },
    select: { id: true },
  })
  if (!page) return errors.notFound('Page')

  const version = await prismaV2.v2PageVersion.findFirst({
    where: { id: versionId, pageId },
    select: { id: true },
  })
  if (!version) return errors.notFound('Page version')

  const token = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

  const snapshot = await prismaV2.v2PreviewSnapshot.create({
    data: {
      pageVersionId: versionId,
      token,
      expiresAt,
    },
  })

  const baseUrl = process.env.NEXT_PUBLIC_STOREFRONT_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3001'
  const previewUrl = `${baseUrl}/preview?token=${token}`

  return created({ ...snapshot, previewUrl })
}
