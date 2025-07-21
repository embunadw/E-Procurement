import { Request, Response } from "express";
import { PrismaClient as SatriaClient } from "../../../generated/satria-client";
import { getCurrentWIBDate } from "../../helpers/timeHelper";

const prisma = new SatriaClient();

// Get All Vendors by RFQ ID
export const getVendorsByRfqId = async (req: Request, res: Response): Promise<void> => {
  const { rfq_id } = req.params;

  try {
    const vendors = await prisma.trs_rfq_vendor.findMany({
      where: {
        rfq_id: Number(rfq_id),
        is_deleted: 0,
      },
      include: {
        vendor: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "Successfully retrieved RFQ vendors",
      data: vendors,
    });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ success: false, message: "Error retrieving RFQ vendors" });
  }
};

//Create
export const addVendorToRfq = async (req: Request, res: Response): Promise<void> => {
  const { rfq_id } = req.params;
  const { vendor_id, status, last_modified_by } = req.body;

  try {
    const newEntry = await prisma.trs_rfq_vendor.create({
      data: {
        rfq_id: Number(rfq_id),
        vendor_id,
        status,
        created_at: getCurrentWIBDate(),
        last_modified_at: getCurrentWIBDate(),
        last_modified_by,
        is_deleted: 0,
      },
    });

    res.status(201).json({
      success: true,
      message: "Vendor added to RFQ successfully",
      data: newEntry,
    });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ success: false, message: "Error adding vendor to RFQ" });
  }
};

// Update
export const updateRfqVendor = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status, last_modified_by } = req.body;

  try {
    const updated = await prisma.trs_rfq_vendor.update({
      where: { id: Number(id) },
      data: {
        status,
        last_modified_by,
        last_modified_at: getCurrentWIBDate(),
      },
    });

    res.status(200).json({
      success: true,
      message: "RFQ vendor updated successfully",
      data: updated,
    });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ success: false, message: "Error updating RFQ vendor" });
  }
};

// Soft Delete Vendor dari RFQ
export const deleteRfqVendor = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    await prisma.trs_rfq_vendor.update({
      where: { id: Number(id) },
      data: {
        is_deleted: 1,
        last_modified_at: getCurrentWIBDate(),
      },
    });

    res.status(200).json({
      success: true,
      message: "RFQ vendor deleted successfully",
    });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ success: false, message: "Error deleting RFQ vendor" });
  }
};