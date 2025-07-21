import { PrismaClient as SatriaClient } from "../../../../generated/satria-client";
const prisma = new SatriaClient();

export const RegisterVendor = {
  findUnique: prisma.register_vendor.findUnique,

  findMany: prisma.register_vendor.findMany,

  create: prisma.register_vendor.create,

  update: prisma.register_vendor.update,

  delete: prisma.register_vendor.delete,

  count: prisma.register_vendor.count,

  findFirst: prisma.register_vendor.findFirst,

  upsert: prisma.register_vendor.upsert,
};
