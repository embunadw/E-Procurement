import { PrismaClient as SatriaClient } from "../../../../generated/satria-client";
const prisma = new SatriaClient();

export const VendorQuotation = {
  findUnique: prisma.vendor_quotation.findUnique,

  findMany: prisma.vendor_quotation.findMany,

  create: prisma.vendor_quotation.create,

  update: prisma.vendor_quotation.update,

  delete: prisma.vendor_quotation.delete,

  count: prisma.vendor_quotation.count,

  findFirst: prisma.vendor_quotation.findFirst,

  upsert: prisma.vendor_quotation.upsert,
};
