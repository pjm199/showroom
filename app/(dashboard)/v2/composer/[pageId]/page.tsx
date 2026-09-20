import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { V2ComposerEditor } from './composer-editor'

export default async function V2ComposerEditorPage({
  params,
}: {
  params: Promise<{ pageId: string }>
}) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const { pageId } = await params

  return (
    <div className="space-y-6">
      <V2ComposerEditor pageId={pageId} />
    </div>
  )
}
