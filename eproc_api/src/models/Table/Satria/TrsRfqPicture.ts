import { PrismaClient as SatriaClient } from "../../../../generated/satria-client";
const prisma = new SatriaClient();

export const TrsRfqPicture = {
  findUnique: prisma.trs_rfq_picture.findUnique,
  findMany: prisma.trs_rfq_picture.findMany,
  create: prisma.trs_rfq_picture.create,
  update: prisma.trs_rfq_picture.update,
  delete: prisma.trs_rfq_picture.delete,
  count: prisma.trs_rfq_picture.count,
  findFirst: prisma.trs_rfq_picture.findFirst,
  upsert: prisma.trs_rfq_picture.upsert,
};
