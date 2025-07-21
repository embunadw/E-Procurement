
import { PrismaClient as SatriaClient } from "../../../../generated/satria-client";
const prisma = new SatriaClient();

export const Kbli = {
  findUnique: prisma.ms_kbli.findUnique,

  findMany: prisma.ms_kbli.findMany,

  create: prisma.ms_kbli.create,

  update: prisma.ms_kbli.update,

  delete: prisma.ms_kbli.delete,

  count: prisma.ms_kbli.count,

  findFirst: prisma.ms_kbli.findFirst,

  upsert: prisma.ms_kbli.upsert,
};
