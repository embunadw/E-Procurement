
import { PrismaClient as SatriaClient } from "../../../../generated/satria-client";
const prisma = new SatriaClient();

export const Material = {
  findUnique: prisma.ms_material.findUnique,

  findMany: prisma.ms_material.findMany,

  create: prisma.ms_material.create,

  update: prisma.ms_material.update,

  delete: prisma.ms_material.delete,

  count: prisma.ms_material.count,

  findFirst: prisma.ms_material.findFirst,

  upsert: prisma.ms_material.upsert,
};
