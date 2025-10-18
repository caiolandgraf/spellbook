import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { SpellbookView } from "@/components/spellbook-view";

export default async function SpellbookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id } = await params;

  const spellbook = await prisma.spellbook.findUnique({
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
      spells: {
        orderBy: { updatedAt: "desc" },
      },
      _count: {
        select: { spells: true },
      },
    },
  });

  if (!spellbook) {
    notFound();
  }

  // Se o spellbook não é público, só o dono pode ver
  if (!spellbook.isPublic && spellbook.userId !== session?.user?.id) {
    redirect("/dashboard");
  }

  return (
    <SpellbookView
      spellbook={spellbook}
      isOwner={spellbook.userId === session?.user?.id}
    />
  );
}
