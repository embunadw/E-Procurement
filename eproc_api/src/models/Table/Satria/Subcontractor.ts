import { PrismaClient as SatriaClient } from "../../../../generated/satria-client";
const prisma = new SatriaClient();


export const Subcontractor = {
    findMany: (args: any) => prisma.subcontractor.findMany(args),
    findUnique: (args: any) => prisma.subcontractor.findUnique(args),
  };
  