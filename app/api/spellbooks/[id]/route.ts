import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const spellbookSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  isPublic: z.boolean().default(true),
  tags: z.array(z.string()).default([]),
});

// GET /api/spellbooks/[id] - Obter spellbook por ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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
      return NextResponse.json(
        { error: "Spellbook not found" },
        { status: 404 }
      );
    }

    const session = await auth();

    // Se o spellbook não é público, só o dono pode ver
    if (!spellbook.isPublic && spellbook.userId !== session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(spellbook);
  } catch (error) {
    console.error("Error fetching spellbook:", error);
    return NextResponse.json(
      { error: "Failed to fetch spellbook" },
      { status: 500 }
    );
  }
}

// PATCH /api/spellbooks/[id] - Atualizar spellbook
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

    const spellbook = await prisma.spellbook.findUnique({
      where: { id },
    });

    if (!spellbook) {
      return NextResponse.json(
        { error: "Spellbook not found" },
        { status: 404 }
      );
    }

    if (spellbook.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = spellbookSchema.partial().parse(body);

    const updatedSpellbook = await prisma.spellbook.update({
      where: { id },
      data: validatedData,
      include: {
        _count: {
          select: { spells: true },
        },
      },
    });

    return NextResponse.json(updatedSpellbook);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating spellbook:", error);
    return NextResponse.json(
      { error: "Failed to update spellbook" },
      { status: 500 }
    );
  }
}

// PUT /api/spellbooks/[id] - Atualizar spellbook (alias para PATCH)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return PATCH(request, { params });
}

// DELETE /api/spellbooks/[id] - Deletar spellbook
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

    const spellbook = await prisma.spellbook.findUnique({
      where: { id },
    });

    if (!spellbook) {
      return NextResponse.json(
        { error: "Spellbook not found" },
        { status: 404 }
      );
    }

    if (spellbook.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.spellbook.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting spellbook:", error);
    return NextResponse.json(
      { error: "Failed to delete spellbook" },
      { status: 500 }
    );
  }
}
