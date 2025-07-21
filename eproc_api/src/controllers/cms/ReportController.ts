import { Request, Response } from "express";
import { PrismaClient as SatriaClient } from "../../../generated/satria-client";

const prisma = new SatriaClient();

export const getReportRFQ = async (req: Request, res: Response): Promise<void> => {
  try {
    const quotations = await prisma.vendor_quotation.findMany({
      where: {
        is_submitted: true,
      },
      include: {
        rfq_detail: true, // relasi part_number dan part_name
        vendor: true,      // relasi vendor_name dan vendor_email
      },
    });

const formatted = quotations.map((q) => ({
  part_number: q.rfq_detail?.part_number ?? "-",
  part_name: q.rfq_detail?.description ?? "-", 
  vendor_name: q.vendor?.name ?? "-",          // ubah dari vendor_name ke name
  vendor_email: q.vendor?.email ?? "-",        // ubah dari vendor_email ke email
  price: q.price ?? 0,
  moq: q.moq ?? 0,
  valid_until: q.valid_until,
}));


    res.status(200).json({ success: true, data: formatted });
  } catch (err) {
    console.error("Error in getReportRFQ:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getVendorReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawVendorId = req.query.vendor_id;
    console.log("rawVendorId:", rawVendorId);

    // Validasi vendor_id
    if (!rawVendorId || isNaN(Number(rawVendorId))) {
      console.warn("vendor_id invalid:", rawVendorId);
      res.status(400).json({
        success: false,
        message: "vendor_id is required and must be a number",
      });
      return; // agar sesuai dengan Promise<void>
    }

    const vendor_id = Number(rawVendorId);
    console.log("vendor_id (parsed):", vendor_id);

    // Query ke database
    const quotations = await prisma.vendor_quotation.findMany({
      where: {
        is_submitted: true,
        vendor_id: vendor_id,
      },
      include: {
        rfq_detail: {
          select: {
            part_number: true,
            description: true,
          },
        },
      },
    });

    // Log hasil query
    console.log("quotations.length:", quotations.length);
    console.log("quotations sample:", quotations.slice(0, 3));

    const data = quotations.map((q, index) => ({
      number: index + 1,
      part_number: q.rfq_detail?.part_number ?? "-",
      part_name: q.rfq_detail?.description ?? "-",
      price: q.price ?? 0,
      moq: q.moq ?? 0,
      valid_until: q.valid_until,
    }));

    res.status(200).json({ success: true, data });
    return; // eksplisit return untuk void
  } catch (error) {
    console.error("Error getVendorReport:", error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
    return; // tetap return void walaupun error
  }
};