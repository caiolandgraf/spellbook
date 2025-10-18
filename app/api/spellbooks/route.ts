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

// GET /api/spellbooks - Listar spellbooks do usuário
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const spellbooks = await prisma.spellbook.findMany({
      where: { userId: session.user.id },
      include: {
        _count: {
          select: { spells: true },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json(spellbooks);
  } catch (error) {
    console.error("Error fetching spellbooks:", error);
    return NextResponse.json(
      { error: "Failed to fetch spellbooks" },
      { status: 500 }
    );
  }
}

// POST /api/spellbooks - Criar novo spellbook
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = spellbookSchema.parse(body);

    const spellbook = await prisma.spellbook.create({
      data: {
        ...validatedData,
        userId: session.user.id,
      },
      include: {
        _count: {
          select: { spells: true },
        },
      },
    });

    return NextResponse.json(spellbook, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating spellbook:", error);
    return NextResponse.json(
      { error: "Failed to create spellbook" },
      { status: 500 }
    );
  }
}
