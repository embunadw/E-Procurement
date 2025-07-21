import { Request, Response } from 'express';
import { PrismaClient as SatriaClient } from "../../../generated/satria-client";
const prisma = new SatriaClient();

// Get All Subcontractors
export const getAllSubcontractors = async (req: Request, res: Response): Promise<void> => {
  try {
    const subcontractors = await prisma.subcontractor.findMany();
    res.status(200).json(subcontractors);
  } catch (error: unknown) {
    res.status(500).json({ error: (error as Error).message });
  }
};
