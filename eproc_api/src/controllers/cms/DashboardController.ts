import { Request, Response } from "express";
import { PrismaClient as SatriaClient } from "../../../generated/satria-client";

const prisma = new SatriaClient();

export const getDashboardSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const [totalVendors, totalRFQs, totalVendorInputs] = await Promise.all([
      prisma.ms_vendor.count({ where: { is_deleted: 0 } }),
      prisma.trs_rfq.count({ where: { is_deleted: 0 } }), 
      prisma.vendor_quotation.count({ where: { is_submitted: true } }),
    ]);

    res.status(200).json({
      success: true,
      message: "Dashboard summary fetched successfully",
      data: {
        totalVendors,
        totalRFQs,
        totalVendorInputs,
      },
    });
  } catch (err) {
    console.error("Error fetching dashboard summary:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard summary",
    });
  }
};



export const getDashboardVendorSummary = async (req: Request, res: Response): Promise<void> => {
  const vendor_id = Number(req.query.vendor_id);

  if (!vendor_id) {
    res.status(400).json({ success: false, message: "vendor_id is required" });
    return;
  }

  try {
    const totalVendorInputs = await prisma.vendor_quotation.count({
      where: { vendor_id },
    });

    res.status(200).json({
      success: true,
      message: "Vendor dashboard summary fetched successfully",
      data: { totalVendorInputs },
    });
  } catch (err) {
    console.error("Error fetching vendor dashboard summary:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch vendor dashboard summary",
    });
  }
};