import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import { SpellView } from "@/components/spell-view";

export default async function DashboardSpellPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  
  if (!session) {
    // Se não está logado, redireciona para a rota pública
    const { id } = await params;
    redirect(`/spells/${id}`);
  }

  const { id } = await params;

  const spell = await prisma.spell.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
        },
      },
      spellbook: true,
    },
  });

  if (!spell) {
    notFound();
  }

  // Se não é público e não é o dono, nega acesso
  if (!spell.isPublic && spell.userId !== session.user.id) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground">
            You don't have permission to view this private spell.
          </p>
        </div>
      </div>
    );
  }

  // Incrementar views
  await prisma.spell.update({
    where: { id },
    data: { views: { increment: 1 } },
  });

  const isOwner = session.user.id === spell.userId;

  return (
    <div className="container py-6">
      <SpellView spell={spell} isOwner={isOwner} />
    </div>
  );
}
