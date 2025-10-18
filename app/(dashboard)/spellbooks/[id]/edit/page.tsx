import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { SpellbookEditForm } from "@/components/spellbook-edit-form";

export default async function EditSpellbookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const spellbook = await prisma.spellbook.findUnique({
    where: { id },
    include: {
      _count: {
        select: { spells: true },
      },
    },
  });

  if (!spellbook) {
    notFound();
  }

  // Only the owner can edit
  if (spellbook.userId !== session.user.id) {
    redirect("/dashboard");
  }

  return (
    <div className="max-w-4xl mx-auto">
      <SpellbookEditForm spellbook={spellbook} />
    </div>
  );
}
