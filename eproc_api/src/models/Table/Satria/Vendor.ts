import { PrismaClient as SatriaClient } from "../../../../generated/satria-client";
const prisma = new SatriaClient();

export const Vendor = {
  findUnique: prisma.ms_vendor.findUnique,

  findMany: prisma.ms_vendor.findMany,

  create: prisma.ms_vendor.create,

  update: prisma.ms_vendor.update,

  delete: prisma.ms_vendor.delete,

  count: prisma.ms_vendor.count,

  findFirst: prisma.ms_vendor.findFirst,

  upsert: prisma.ms_vendor.upsert,
};
