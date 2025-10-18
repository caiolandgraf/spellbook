import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const spellSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  code: z.string().min(1),
  language: z.string().min(1),
  isPublic: z.boolean().default(true),
  tags: z.array(z.string()).default([]),
  spellbookId: z.string().optional().nullable(),
});

// GET /api/spells/[id] - Obter spell por ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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
      return NextResponse.json({ error: "Spell not found" }, { status: 404 });
    }

    const session = await auth();
    
    // Se o spell não é público, só o dono pode ver
    if (!spell.isPublic && spell.userId !== session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Incrementar views
    await prisma.spell.update({
      where: { id: id },
      data: { views: { increment: 1 } },
    });

    return NextResponse.json(spell);
  } catch (error) {
    console.error("Error fetching spell:", error);
    return NextResponse.json(
      { error: "Failed to fetch spell" },
      { status: 500 }
    );
  }
}

// PATCH /api/spells/[id] - Atualizar spell
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const spell = await prisma.spell.findUnique({
      where: { id },
    });

    if (!spell) {
      return NextResponse.json({ error: "Spell not found" }, { status: 404 });
    }

    if (spell.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = spellSchema.partial().parse(body);

    const updatedSpell = await prisma.spell.update({
      where: { id: id },
      data: validatedData,
      include: {
        spellbook: true,
      },
    });

    return NextResponse.json(updatedSpell);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating spell:", error);
    return NextResponse.json(
      { error: "Failed to update spell" },
      { status: 500 }
    );
  }
}

// DELETE /api/spells/[id] - Deletar spell
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const spell = await prisma.spell.findUnique({
      where: { id },
    });

    if (!spell) {
      return NextResponse.json({ error: "Spell not found" }, { status: 404 });
    }

    if (spell.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.spell.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting spell:", error);
    return NextResponse.json(
      { error: "Failed to delete spell" },
      { status: 500 }
    );
  }
}
