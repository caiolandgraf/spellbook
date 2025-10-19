import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/runes - List user's runes or all public runes
export async function GET(req: Request) {
  try {
    const session = await auth();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const isPublic = searchParams.get("public");

    let runes;

    if (userId) {
      // Get specific user's public runes
      runes = await prisma.rune.findMany({
        where: {
          userId,
          isPublic: true,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
            },
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
      });
    } else if (isPublic === "true") {
      // Get all public runes
      runes = await prisma.rune.findMany({
        where: {
          isPublic: true,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
            },
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
      });
    } else if (session?.user?.id) {
      // Get authenticated user's runes (all, public and private)
      runes = await prisma.rune.findMany({
        where: {
          userId: session.user.id,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
            },
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
      });
    } else {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(runes);
  } catch (error) {
    console.error("Error fetching runes:", error);
    return NextResponse.json(
      { error: "Failed to fetch runes" },
      { status: 500 }
    );
  }
}

// POST /api/runes - Create new rune
export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, html, css, javascript, isPublic, tags } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const rune = await prisma.rune.create({
      data: {
        title,
        description: description || null,
        html: html || "",
        css: css || "",
        javascript: javascript || "",
        isPublic: isPublic ?? true,
        tags: tags || [],
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(rune, { status: 201 });
  } catch (error) {
    console.error("Error creating rune:", error);
    return NextResponse.json(
      { error: "Failed to create rune" },
      { status: 500 }
    );
  }
}
