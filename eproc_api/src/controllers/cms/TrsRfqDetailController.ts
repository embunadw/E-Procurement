import { Request, Response } from "express";
import { PrismaClient as SatriaClient } from "../../../generated/satria-client";
import { getCurrentWIBDate } from "../../helpers/timeHelper";

const prisma = new SatriaClient();

// Get All RFQ Details dari RFQ ID
export const getRfqDetailsByRfqId = async (req: Request, res: Response): Promise<void> => {
  const { rfq_id } = req.params;

  try {
    const details = await prisma.trs_rfq_detail.findMany({
      where: {
        rfq_id: Number(rfq_id),
        is_deleted: 0,
      },
    });

    res.status(200).json({
      success: true,
      message: "Successfully retrieved RFQ details",
      data: details,
    });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ success: false, message: "Error retrieving RFQ details" });
  }
};

export const getRfqDetailById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const detail = await prisma.trs_rfq_detail.findUnique({
      where: { id: Number(id) },
    });

    if (!detail || detail.is_deleted) {
      res.status(404).json({ success: false, message: "RFQ detail not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "RFQ detail found",
      data: detail,
    });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ success: false, message: "Error retrieving RFQ detail" });
  }
};

// Create RFQ Detail
export const createRfqDetail = async (req: Request, res: Response): Promise<void> => {
  const data = req.body;

  try {
    const newDetail = await prisma.trs_rfq_detail.create({
      data: {
        ...data,
        created_at: getCurrentWIBDate(),
        last_modified_at: getCurrentWIBDate(),
        is_deleted: 0,
      },
    });

    res.status(201).json({
      success: true,
      message: "RFQ detail created successfully",
      data: newDetail,
    });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ success: false, message: "Error creating RFQ detail" });
  }
};

// Update RFQ Detail
export const updateRfqDetail = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const data = req.body;

  try {
    const updatedDetail = await prisma.trs_rfq_detail.update({
      where: { id: Number(id) },
      data: {
        ...data,
        last_modified_at: getCurrentWIBDate(),
      },
    });

    res.status(200).json({
      success: true,
      message: "RFQ detail updated successfully",
      data: updatedDetail,
    });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ success: false, message: "Error updating RFQ detail" });
  }
};

// Soft Delete RFQ Detail
export const deleteRfqDetail = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    await prisma.trs_rfq_detail.update({
      where: { id: Number(id) },
      data: { is_deleted: 1 },
    });

    res.status(200).json({
      success: true,
      message: "RFQ detail deleted successfully",
    });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ success: false, message: "Error deleting RFQ detail" });
  }
};
