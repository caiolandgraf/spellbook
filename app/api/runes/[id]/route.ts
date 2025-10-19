import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/runes/[id] - Get rune by ID
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await auth();

    const rune = await prisma.rune.findUnique({
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
      },
    });

    if (!rune) {
      return NextResponse.json({ error: "Rune not found" }, { status: 404 });
    }

    // Check if user can access this rune
    if (!rune.isPublic && rune.userId !== session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Increment views
    await prisma.rune.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    return NextResponse.json({ ...rune, views: rune.views + 1 });
  } catch (error) {
    console.error("Error fetching rune:", error);
    return NextResponse.json(
      { error: "Failed to fetch rune" },
      { status: 500 }
    );
  }
}

// PATCH /api/runes/[id] - Update rune
export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rune = await prisma.rune.findUnique({
      where: { id },
    });

    if (!rune) {
      return NextResponse.json({ error: "Rune not found" }, { status: 404 });
    }

    if (rune.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, html, css, javascript, isPublic, tags } = body;

    const updatedRune = await prisma.rune.update({
      where: { id },
      data: {
        title: title !== undefined ? title : undefined,
        description: description !== undefined ? description : undefined,
        html: html !== undefined ? html : undefined,
        css: css !== undefined ? css : undefined,
        javascript: javascript !== undefined ? javascript : undefined,
        isPublic: isPublic !== undefined ? isPublic : undefined,
        tags: tags !== undefined ? tags : undefined,
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

    return NextResponse.json(updatedRune);
  } catch (error) {
    console.error("Error updating rune:", error);
    return NextResponse.json(
      { error: "Failed to update rune" },
      { status: 500 }
    );
  }
}

// DELETE /api/runes/[id] - Delete rune
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rune = await prisma.rune.findUnique({
      where: { id },
    });

    if (!rune) {
      return NextResponse.json({ error: "Rune not found" }, { status: 404 });
    }

    if (rune.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.rune.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Rune deleted successfully" });
  } catch (error) {
    console.error("Error deleting rune:", error);
    return NextResponse.json(
      { error: "Failed to delete rune" },
      { status: 500 }
    );
  }
}
