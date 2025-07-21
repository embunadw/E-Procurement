import { Request, Response } from "express";
import { PrismaClient as SatriaClient } from "../../../generated/satria-client";
import { getCurrentWIBDate } from "../../helpers/timeHelper";

const prisma = new SatriaClient();

// Get All Files by RFQ ID
export const getFilesByRfqId = async (req: Request, res: Response): Promise<void> => {
  const { rfq_id } = req.params;

  try {
    const files = await prisma.trs_rfq_file.findMany({
      where: {
        rfq_id: Number(rfq_id),
        is_deleted: 0,
      },
    });

    res.status(200).json({
      success: true,
      message: "Successfully retrieved files",
      data: files,
    });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ success: false, message: "Error retrieving files" });
  }
};

// Upload New File to RFQ
export const uploadRfqFile = async (req: Request, res: Response): Promise<void> => {
  const { rfq_id } = req.params;
  const { filename, created_by } = req.body;
    const file = req.file;
  
    if (!file) {
      res.status(400).json({ success: false, message: "No file uploaded" });
      return;
    }
  try {
    const newFile = await prisma.trs_rfq_file.create({
      data: {
        rfq_id: Number(rfq_id),
        filename,
           source: file.buffer,
        created_by,
        updated_by: created_by,
        created_at: getCurrentWIBDate(),
        updated_at: getCurrentWIBDate(),
        is_deleted: 0,
      },
    });

    res.status(201).json({
      success: true,
      message: "File uploaded successfully",
      data: newFile,
    });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ success: false, message: "Error uploading file" });
  }
};

// Delete File (Soft Delete)
export const deleteRfqFile = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    await prisma.trs_rfq_file.update({
      where: { id: Number(id) },
      data: { is_deleted: 1, updated_at: getCurrentWIBDate() },
    });

    res.status(200).json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ success: false, message: "Error deleting file" });
  }
};
