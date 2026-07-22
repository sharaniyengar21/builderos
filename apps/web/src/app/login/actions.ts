"use server";

import { createHash, timingSafeEqual } from "node:crypto";
import { redirect } from "next/navigation";
import { prisma } from "@builderos/db";
import { clearSession, createSession } from "@/lib/session";

const DEMO_EMAIL = "demo@builderos.dev";

function passwordsMatch(candidate: string, expected: string): boolean {
  const a = createHash("sha256").update(candidate).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

export async function signInAsOwner(formData: FormData): Promise<void> {
  const password = String(formData.get("password") ?? "");
  const ownerPassword = process.env.OWNER_PASSWORD ?? "";
  const ownerEmail = process.env.OWNER_EMAIL ?? "owner@builderos.local";

  if (!ownerPassword || !passwordsMatch(password, ownerPassword)) {
    redirect("/login?error=invalid-password");
  }

  const owner = await prisma.user.findUnique({ where: { email: ownerEmail } });
  if (!owner) {
    redirect("/login?error=owner-not-seeded");
  }

  await createSession(owner.id);
  redirect("/");
}

export async function signInAsDemo(): Promise<void> {
  const demoUser = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } });
  if (!demoUser) {
    redirect("/login?error=demo-not-seeded");
  }
  await createSession(demoUser.id);
  redirect("/");
}

export async function logout(): Promise<void> {
  await clearSession();
  redirect("/login");
}
