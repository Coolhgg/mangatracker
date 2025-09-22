import { prisma } from "@mangatracker/db";

export async function ensureUser(userId: string) {
  await prisma.user.upsert({
    where: { id: userId },
    create: { id: userId },
    update: {}
  });
}
