import { PrismaClient as SatriaClient } from "../../../../generated/satria-client";
const prisma = new SatriaClient();

export const TrsRfqFile = {
  findUnique: prisma.trs_rfq_file.findUnique,
  findMany: prisma.trs_rfq_file.findMany,
  create: prisma.trs_rfq_file.create,
  update: prisma.trs_rfq_file.update,
  delete: prisma.trs_rfq_file.delete,
  count: prisma.trs_rfq_file.count,
  findFirst: prisma.trs_rfq_file.findFirst,
  upsert: prisma.trs_rfq_file.upsert,
};
