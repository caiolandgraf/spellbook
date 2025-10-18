import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// POST /api/spells/[id]/favorite - Adicionar aos favoritos
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verificar se o spell existe
    const spell = await prisma.spell.findUnique({
      where: { id },
    });

    if (!spell) {
      return NextResponse.json({ error: "Spell not found" }, { status: 404 });
    }

    // Verificar se já está nos favoritos
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_spellId: {
          userId: session.user.id,
          spellId: id,
        },
      },
    });

    if (existingFavorite) {
      return NextResponse.json(
        { error: "Already favorited" },
        { status: 400 }
      );
    }

    // Adicionar aos favoritos
    const favorite = await prisma.favorite.create({
      data: {
        userId: session.user.id,
        spellId: id,
      },
    });

    return NextResponse.json(favorite, { status: 201 });
  } catch (error) {
    console.error("Error favoriting spell:", error);
    return NextResponse.json(
      { error: "Failed to favorite spell" },
      { status: 500 }
    );
  }
}

// DELETE /api/spells/[id]/favorite - Remover dos favoritos
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

    // Verificar se está nos favoritos
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_spellId: {
          userId: session.user.id,
          spellId: id,
        },
      },
    });

    if (!favorite) {
      return NextResponse.json(
        { error: "Not favorited" },
        { status: 404 }
      );
    }

    // Remover dos favoritos
    await prisma.favorite.delete({
      where: {
        id: favorite.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error unfavoriting spell:", error);
    return NextResponse.json(
      { error: "Failed to unfavorite spell" },
      { status: 500 }
    );
  }
}

// GET /api/spells/[id]/favorite - Verificar se está nos favoritos
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ favorited: false });
    }

    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_spellId: {
          userId: session.user.id,
          spellId: id,
        },
      },
    });

    return NextResponse.json({ favorited: !!favorite });
  } catch (error) {
    console.error("Error checking favorite:", error);
    return NextResponse.json(
      { error: "Failed to check favorite" },
      { status: 500 }
    );
  }
}
