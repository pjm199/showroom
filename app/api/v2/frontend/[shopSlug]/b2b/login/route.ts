import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prismaV2 } from '@/lib/prisma-v2'
import { errors } from '@/lib/v2/response'
import {
  createB2BSessionToken,
  setB2BSessionCookie,
} from '@/lib/v2/b2b/session'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ shopSlug: string }> }
) {
  const { shopSlug } = await params

  const shop = await prismaV2.v2Shop.findUnique({
    where: { slug: shopSlug },
    select: { id: true, slug: true },
  })
  if (!shop) return errors.notFound('Shop')

  const body = await request.json().catch(() => null)
  const parsed = loginSchema.safeParse(body)
  if (!parsed.success) {
    return errors.validation('Invalid login credentials', parsed.error.flatten())
  }

  const client = await prismaV2.v2B2BClient.findFirst({
    where: {
      shopId: shop.id,
      email: parsed.data.email.toLowerCase(),
      isActive: true,
    },
  })

  if (!client?.passwordHash) {
    return errors.unauthorized()
  }

  const valid = await bcrypt.compare(parsed.data.password, client.passwordHash)
  if (!valid) return errors.unauthorized()

  const token = createB2BSessionToken({
    clientId: client.id,
    shopId: shop.id,
    shopSlug: shop.slug,
    email: client.email,
    companyName: client.companyName,
  })

  const response = NextResponse.json({
    data: {
      token,
      client: {
        id: client.id,
        companyName: client.companyName,
        contactName: client.contactName,
        email: client.email,
      },
    },
  })
  setB2BSessionCookie(response, token)
  return response
}
