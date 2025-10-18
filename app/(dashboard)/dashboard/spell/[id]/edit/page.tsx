import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { SpellEditForm } from "@/components/spell-edit-form";
import { notFound } from "next/navigation";

export default async function EditSpellPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  
  if (!session) {
    redirect("/auth/signin");
  }

  const { id } = await params;

  const spell = await prisma.spell.findUnique({
    where: { id },
    include: {
      spellbook: true,
    },
  });

  if (!spell) {
    notFound();
  }

  // Verificar se o usuário é o dono do spell
  if (spell.userId !== session.user.id) {
    redirect(`/spells/${id}`);
  }

  return <SpellEditForm spell={spell} />;
}
