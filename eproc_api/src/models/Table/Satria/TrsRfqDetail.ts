import { PrismaClient as SatriaClient } from "../../../../generated/satria-client";
const prisma = new SatriaClient();

export const TrsRfqDetail = {
  findUnique: prisma.trs_rfq_detail.findUnique,
  findMany: prisma.trs_rfq_detail.findMany,
  create: prisma.trs_rfq_detail.create,
  update: prisma.trs_rfq_detail.update,
  delete: prisma.trs_rfq_detail.delete,
  count: prisma.trs_rfq_detail.count,
  findFirst: prisma.trs_rfq_detail.findFirst,
  upsert: prisma.trs_rfq_detail.upsert,
};
