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
  spellbookId: z.string().optional(),
});

// GET /api/spells - Listar spells do usuário
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const language = searchParams.get("language");
    const spellbookId = searchParams.get("spellbookId");
    const search = searchParams.get("search");

    const where: any = { userId: session.user.id };
    
    if (language) where.language = language;
    if (spellbookId) where.spellbookId = spellbookId;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const spells = await prisma.spell.findMany({
      where,
      include: {
        spellbook: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json(spells);
  } catch (error) {
    console.error("Error fetching spells:", error);
    return NextResponse.json(
      { error: "Failed to fetch spells" },
      { status: 500 }
    );
  }
}

// POST /api/spells - Criar novo spell
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = spellSchema.parse(body);

    const spell = await prisma.spell.create({
      data: {
        ...validatedData,
        userId: session.user.id,
      },
      include: {
        spellbook: true,
      },
    });

    return NextResponse.json(spell, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating spell:", error);
    return NextResponse.json(
      { error: "Failed to create spell" },
      { status: 500 }
    );
  }
}
