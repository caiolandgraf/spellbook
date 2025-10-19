import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { RuneView } from "@/components/rune-view";

export default async function RunePublicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const rune = await prisma.rune.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          name: true,
          username: true,
          image: true,
        },
      },
    },
  });

  if (!rune) {
    notFound();
  }

  // Increment views
  await prisma.rune.update({
    where: { id },
    data: { views: { increment: 1 } },
  });

  return <RuneView rune={rune} />;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const rune = await prisma.rune.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          name: true,
          username: true,
        },
      },
    },
  });

  if (!rune) {
    return {
      title: "Rune Not Found",
    };
  }

  return {
    title: `${rune.title} - Rune by ${rune.user.username || rune.user.name}`,
    description: rune.description || "Check out this awesome rune!",
  };
}
