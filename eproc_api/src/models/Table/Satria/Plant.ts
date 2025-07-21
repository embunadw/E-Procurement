import { PrismaClient as SatriaClient } from "../../../../generated/satria-client";
const prisma = new SatriaClient();

export const Plant = {
  findUnique: prisma.ms_plant.findUnique,

  findMany: prisma.ms_plant.findMany,

  create: prisma.ms_plant.create,

  update: prisma.ms_plant.update,

  delete: prisma.ms_plant.delete,

  count: prisma.ms_plant.count,

  findFirst: prisma.ms_plant.findFirst,

  upsert: prisma.ms_plant.upsert,
};
