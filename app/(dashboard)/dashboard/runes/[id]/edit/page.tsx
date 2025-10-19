import { notFound, redirect } from 'next/navigation'
import { auth } from '@/auth'
import { RuneEditForm } from '@/components/rune-edit-form'
import prisma from '@/lib/prisma'

export default async function EditRunePage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()

  if (!session?.user?.email) {
    redirect('/auth/signin')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  })

  if (!user) {
    redirect('/auth/signin')
  }

  const { id } = await params

  const rune = await prisma.rune.findUnique({
    where: { id }
  })

  if (!rune) {
    notFound()
  }

  if (rune.userId !== user.id) {
    redirect('/runes')
  }

  return <RuneEditForm rune={rune} />
}
