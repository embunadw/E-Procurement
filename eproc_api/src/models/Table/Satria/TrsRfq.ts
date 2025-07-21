import { PrismaClient as SatriaClient } from "../../../../generated/satria-client";
const prisma = new SatriaClient();

export const TrsRfq = {
  findUnique: prisma.trs_rfq.findUnique,
  findMany: prisma.trs_rfq.findMany,
  create: prisma.trs_rfq.create,
  update: prisma.trs_rfq.update,
  delete: prisma.trs_rfq.delete,
  count: prisma.trs_rfq.count,
  findFirst: prisma.trs_rfq.findFirst,
  upsert: prisma.trs_rfq.upsert,
};
