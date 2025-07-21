import { Request, Response } from "express";
import { PrismaClient as SatriaClient } from "../../../generated/satria-client";
import formidable, { Fields, Files } from "formidable";
import { getCurrentWIBDate } from "../../helpers/timeHelper";
import path from "path";
import fs from "fs";

const prisma = new SatriaClient();

function getFieldValue(field: string | string[] | undefined): string {
  if (Array.isArray(field)) return field[0];
  return field ?? "";
}

export const submitVendorQuotation = async (req: Request, res: Response): Promise<void> => {
  const form = formidable({ multiples: false, keepExtensions: true });

  form.parse(req, async (err, fields: Fields, files: Files) => {
    if (err) {
      console.error("Form error:", err);
      res.status(500).json({ success: false, message: "Form parse error" });
      return;
    }

    try {
      const vendor_id = Number(getFieldValue(fields.vendor_id));
      const quotations = JSON.parse(getFieldValue(fields.quotations));
      const valid_until = new Date(getFieldValue(fields.valid_until));
      const file = files.attachment?.[0];

      if (!vendor_id || !Array.isArray(quotations) || quotations.length === 0) {
        res.status(400).json({ success: false, message: "Data tidak lengkap" });
        return;
      }

      // Baca file attachment sebagai buffer
      const fileBuffer = file ? await fs.promises.readFile(file.filepath) : null;

      for (const quote of quotations) {
        const rfq_detail_id = Number(quote.rfq_detail_id);

        const existing = await prisma.vendor_quotation.findFirst({
          where: { vendor_id, rfq_detail_id },
        });

        const data = {
          price: Number(quote.price),
          moq: Number(quote.moq),
          valid_until,
          is_submitted: true,
          attachment: fileBuffer,
          updated_at: getCurrentWIBDate(),
        };

        if (existing) {
          await prisma.vendor_quotation.update({
            where: { id: existing.id },
            data,
          });
        } else {
          await prisma.vendor_quotation.create({
            data: {
              ...data,
              vendor_id,
              rfq_detail_id,
              created_at: getCurrentWIBDate(),
            },
          });
        }
      }

      res.status(201).json({ success: true, message: "Quotation submitted successfully" });
    } catch (e) {
      console.error("Submit quotation error:", e);
      res.status(500).json({ success: false, message: "Internal error" });
    }
  });
};


export const getVendorRFQToQuote = async (req: Request, res: Response): Promise<void> => {
  const vendor_id = Number(req.query.vendor_id);

  if (!vendor_id || isNaN(vendor_id)) {
    res.status(400).json({ success: false, message: "vendor_id is required" });
    return;
  }

  try {
    const invited = await prisma.trs_rfq_vendor.findMany({
      where: { vendor_id },
      select: { rfq_id: true },
    });
    const invitedIds = invited.map((item) => item.rfq_id);

    const generalRFQs = await prisma.trs_rfq.findMany({
      where: { rfq_type: 'General', is_deleted: 0 },
      select: { rfq_id: true },
    });
    const generalIds = generalRFQs.map((item) => item.rfq_id);

    const accessibleRFQIds = [...new Set([...invitedIds, ...generalIds])];

    const rfqDetails = await prisma.trs_rfq_detail.findMany({
      where: {
        rfq_id: { in: accessibleRFQIds },
        status: 0,
      },
      include: {
        vendor_quotations: {
          where: { vendor_id },
          select: { id: true },
        },
      },
    });

    const rfqs = await prisma.trs_rfq.findMany({
      where: { rfq_id: { in: accessibleRFQIds } },
      select: { rfq_id: true, rfq_title: true, rfq_number: true, rfq_duedate: true },
    });
    const rfqMap = new Map(rfqs.map((rfq) => [rfq.rfq_id, rfq]));

    const uniqueDataMap = new Map<number, any>();

    rfqDetails.forEach((item) => {
      const rfq = rfqMap.get(item.rfq_id);
      if (!uniqueDataMap.has(item.rfq_id)) {
        uniqueDataMap.set(item.rfq_id, {
          rfq_detail_id: item.id,
          rfq_title: rfq?.rfq_title ?? "-",
          rfq_number: rfq?.rfq_number ?? "-",
          rfq_duedate: rfq?.rfq_duedate ?? "",
          is_submitted: item.vendor_quotations.length > 0,
        });
      }
    });

    const data = Array.from(uniqueDataMap.values());

    res.status(200).json({
      success: true,
      data: {
        data,
        totalItems: data.length,
        totalPages: 1,
        currentPage: 1,
      },
    });
  } catch (error) {
    console.error("Error in getVendorRFQToQuote:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const updateVendorQuotation = async (req: Request, res: Response): Promise<void> => {
  const form = formidable({ multiples: false, keepExtensions: true });

  form.parse(req, async (err, fields: Fields, files: Files) => {
    if (err) {
      console.error("Form error:", err);
      res.status(500).json({ success: false, message: "Form parse error" });
      return;
    }

    try {
      const vendor_id = Number(getFieldValue(fields.vendor_id));
      const quotations = JSON.parse(getFieldValue(fields.quotations));
      const valid_until = new Date(getFieldValue(fields.valid_until));
      const file = files.attachment?.[0];

      if (!vendor_id || !Array.isArray(quotations) || quotations.length === 0) {
        res.status(400).json({ success: false, message: "Data tidak lengkap" });
        return;
      }

      for (const quote of quotations) {
        const rfq_detail_id = Number(quote.rfq_detail_id);

        const existing = await prisma.vendor_quotation.findFirst({
          where: { vendor_id, rfq_detail_id },
        });

        if (!existing) {
          res.status(404).json({ success: false, message: "Quotation not found" });
          return;
        }

        const data = {
          price: Number(quote.price),
          moq: Number(quote.moq),
          valid_until,
          is_submitted: true,
          attachment: file ? fs.readFileSync(file.filepath) : existing?.attachment ?? null,
          updated_at: getCurrentWIBDate(),
        };

        await prisma.vendor_quotation.update({
          where: { id: existing.id },
          data,
        });
      }

      res.status(200).json({
        success: true,
        message: "Quotation updated successfully",
      });
    } catch (e) {
      console.error("Update quotation error:", e);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
};

export const getVendorQuotationDetail = async (req: Request, res: Response): Promise<void> => {
  const { vendor_id, rfq_detail_id } = req.query;

  if (!vendor_id || !rfq_detail_id) {
    res.status(400).json({ message: "Missing params" });
    return;
  }

  const quotation = await prisma.vendor_quotation.findFirst({
    where: {
      vendor_id: Number(vendor_id),
      rfq_detail_id: Number(rfq_detail_id),
    },
  });

  if (!quotation) {
    res.status(404).json({ message: "Quotation not found" });
    return;
  }

  res.status(200).json(quotation);
};

export const downloadQuotationAttachment = async (req: Request, res: Response): Promise<void> => {
  const { quotation_id } = req.params;

  console.log("Download request for quotation_id:", quotation_id);

  if (!quotation_id || isNaN(Number(quotation_id))) {
    console.error("Invalid quotation_id:", quotation_id);
    res.status(400).json({ success: false, message: "Missing or invalid quotation_id" });
    return;
  }

  try {
    const quotation = await prisma.vendor_quotation.findUnique({
      where: { id: Number(quotation_id) },
    });

    console.log("Found quotation:", quotation ? "Yes" : "No");
    console.log("Has attachment:", quotation?.attachment ? "Yes" : "No");

    if (!quotation) {
      res.status(404).json({ success: false, message: "Quotation not found" });
      return;
    }

    if (!quotation.attachment) {
      res.status(404).json({ success: false, message: "Attachment not found" });
      return;
    }

    // Generate filename
    const fileName = `quotation_${quotation.id}.pdf`;

    console.log("Sending attachment with filename:", fileName);
    console.log("Attachment size:", quotation.attachment.length);

    // Set headers for file download
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Length': quotation.attachment.length.toString(),
    });

    // Send the buffer directly
    res.send(quotation.attachment);

  } catch (error) {
    console.error("Error downloading attachment:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
