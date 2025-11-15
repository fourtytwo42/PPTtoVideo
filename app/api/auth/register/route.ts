import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { hash } from "bcryptjs";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Name, email, and password are required." }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters long." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  const totalUsers = await prisma.user.count();
  const passwordHash = await hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: totalUsers === 0 ? Role.ADMIN : Role.USER,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: "user_registered",
      entityType: "User",
      entityId: user.id,
      metadata: { selfService: true },
    },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
