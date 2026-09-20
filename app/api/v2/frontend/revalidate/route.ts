import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function POST(request: NextRequest) {
  const secret = request.headers.get('Authorization')?.replace('Bearer ', '')
  if (secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Invalid secret' } }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const paths: string[] = body.paths ?? []

  const revalidated: string[] = []
  const errs: string[] = []

  for (const path of paths) {
    try {
      revalidatePath(path)
      revalidated.push(path)
    } catch (e) {
      errs.push(path)
    }
  }

  return NextResponse.json({ revalidated, errors: errs })
}
