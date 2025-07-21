import { Request, Response } from "express";
import { PrismaClient as SatriaClient } from "../../../generated/satria-client";
import { getCurrentWIBDate } from "../../helpers/timeHelper";

interface MulterRequest extends Request {
  file: Express.Multer.File;
}

const prisma = new SatriaClient();

export const getPicturesByRfqId = async (req: Request, res: Response): Promise<void> => {
  const { rfq_id } = req.params;

  try {
    const pictures = await prisma.trs_rfq_picture.findMany({
      where: {
        rfq_id: Number(rfq_id),
        is_deleted: 0,
      },
      select: {
        id: true,
        rfq_id: true,
        filename: true,
        created_at: true,
        created_by: true,
        updated_at: true,
        updated_by: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "Successfully retrieved pictures",
      data: pictures,
    });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ success: false, message: "Error retrieving pictures" });
  }
};

export const uploadRfqPicture = async (req: Request, res: Response): Promise<void> => {
    const { rfq_id } = req.params;
    const { created_by } = req.body;
    const file = req.file;
  
    if (!file) {
      res.status(400).json({ success: false, message: "No file uploaded" });
      return;
    }
  
    try {
      const newPicture = await prisma.trs_rfq_picture.create({
        data: {
          rfq_id: Number(rfq_id),
          filename: file.originalname,
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
        message: "Picture uploaded successfully",
        data: newPicture,
      });
    } catch (err) {
      console.error("Database Error:", err);
      res.status(500).json({ success: false, message: "Error uploading picture" });
    }
  };

export const deleteRfqPicture = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    await prisma.trs_rfq_picture.update({
      where: { id: Number(id) },
      data: {
        is_deleted: 1,
        updated_at: getCurrentWIBDate(),
      },
    });

    res.status(200).json({
      success: true,
      message: "Picture deleted successfully",
    });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ success: false, message: "Error deleting picture" });
  }
};
