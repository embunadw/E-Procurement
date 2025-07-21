// controllers/rfqController.ts

import { Request, Response } from "express";
import { PrismaClient as SatriaClient } from "../../../generated/satria-client";
import { getCurrentWIBDate } from "../../helpers/timeHelper";
import fs from "fs";
import path from "path";

const prisma = new SatriaClient();

export const getAllRFQs = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = "1",
      limit = "10",
      search = "",
      sort = "rfq_number",
      order = "asc",
      role = "", // ambil role dari query param
    } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const pageSize = parseInt(limit as string, 10);
    const skip = (pageNumber - 1) * pageSize;

    const validSortFields = ["rfq_number", "rfq_title", "rfq_type", "is_approved", "rfq_id"];
    const sortField = validSortFields.includes(sort as string)
      ? (sort as string)
      : "rfq_id";
    const sortOrder = order === "desc" ? "desc" : "asc";

    const whereClause: any = {
      is_deleted: 0,
      OR: [
        { rfq_number: { contains: search as string } },
        { rfq_title: { contains: search as string } },
      ],
    };

   if (role === "vendor") {
  whereClause.is_approved = {
    equals: "Approved",
  };
}


    const rfqs = await prisma.trs_rfq.findMany({
      where: whereClause,
      orderBy: { [sortField]: sortOrder },
      skip,
      take: pageSize,
      include: {
        details: true,
      },
    });

    const totalItems = await prisma.trs_rfq.count({ where: whereClause });
    const totalPages = Math.ceil(totalItems / pageSize);

    res.status(200).json({
      success: true,
      message: "Successfully retrieved RFQ data",
      data: {
        data: rfqs,
        totalPages,
        currentPage: pageNumber,
        totalItems,
      },
    });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ success: false, message: "Error retrieving RFQs" });
  }
};


export const getRFQById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (isNaN(Number(id))) {
    res.status(400).json({ success: false, message: "Invalid ID format" });
    return;
  }

  try {
  const rfq = await prisma.trs_rfq.findUnique({
    where: { rfq_id: Number(id) },
    include: {
      user: true,
      details: true,
      files: {
        select: {
          id: true,
          filename: true,
          created_at: true,
          created_by: true,
          updated_at: true,
          updated_by: true,
          is_deleted: true,
          rfq_id: true,
        },
      },
      pictures: {
        select: {
          id: true,
          filename: true,
          created_at: true,
          created_by: true,
          updated_at: true,
          updated_by: true,
          is_deleted: true,
          rfq_id: true,
        },
      },
      vendors: {
        include: {
          vendor: true, // include detail vendor dari relasi
        },
      },
    },
  });

    if (!rfq) {
      res.status(404).json({ success: false, message: "RFQ not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "RFQ found",
      data: rfq,
    });
  } catch (error) {
    console.error("getRFQById ERROR:", error); 
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


export const createRFQ = async (req: Request, res: Response): Promise<void> => {
  const files = req.files as {
    rfqPicture?: Express.Multer.File[];
    rfqAttachment?: Express.Multer.File[];
  };

  const {
    user_id,
    rfq_category,
    rfq_type,
    rfq_title,
    rfq_specification,
    rfq_duedate,
    is_active,
    is_release,
    release_by,
    release_by_name,
    release_at,
    is_locked,
    status,
    details,
    vendor,
  } = req.body;

  if (!user_id || !rfq_title || !rfq_duedate || !rfq_category || !rfq_type) {
    res.status(400).json({
      success: false,
      message: "user_id, rfq_title, rfq_duedate, rfq_category, and rfq_type are required.",
    });
    return;
  }

  try {
    // Buat RFQ kosong dulu agar dapat rfq_id
    const tempRFQ = await prisma.trs_rfq.create({
      data: {
        user_id: Number(user_id),
        rfq_category,
        rfq_type,
        rfq_number: "", // sementara kosong, diupdate setelah tau rfq_id
        rfq_title,
        rfq_specification: rfq_specification || "",
        rfq_duedate: new Date(rfq_duedate),
        is_active: Number(is_active) || 1,
        is_release: Number(is_release) || 0,
        release_by: release_by || "",
        release_by_name: release_by_name || "",
        release_at: release_at ? new Date(release_at) : null,
        is_locked: Number(is_locked) || 0,
        is_deleted: 0,
        status: Number(status) || 0,
        created_by: "",
        created_at: getCurrentWIBDate(),
        updated_by: "",
        updated_at: getCurrentWIBDate(),
      },
    });

    const id = tempRFQ.rfq_id;

    // Generate format nomor RFQ
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");

    const kategoriCode = rfq_category === "vendor" ? "VM" : "SD";
    const typeCode = rfq_type === "general" ? "G" : "I";

    const formattedRFQNumber = `RFQ-UTE-${kategoriCode}/${day}${month}/${id}/${typeCode}`;

    // Update RFQ dengan nomor yang benar
    await prisma.trs_rfq.update({
      where: { rfq_id: id },
      data: { rfq_number: formattedRFQNumber },
    });

    // Simpan detail material
    if (details && Array.isArray(JSON.parse(details))) {
    
    const parsedDetails = JSON.parse(details);
    for (const item of parsedDetails) {
      await prisma.trs_rfq_detail.create({
        data: {
      rfq_id: id,
      pr_number: item.pr_number,
      pr_item: item.pr_item,
      part_number: String(item.part_number), // fix error 
      description: item.description,
      pr_qty: parseFloat(item.pr_qty),
      pr_uom: item.pr_uom,
      matgroup: item.matgroup,
      source_type: item.source_type || "vendor", // tambahan jika pakai subcontractor
      status: 0,
      created_at: getCurrentWIBDate(),
      last_modified_at: getCurrentWIBDate(),
      last_modified_by: "",
      is_deleted: 0,
      },
    });
  }
 }

    // Simpan vendor
if (vendor) {
  try {
    const vendorList = JSON.parse(vendor);
    if (Array.isArray(vendorList) && vendorList.length > 0) {
      for (const vendorId of vendorList) {
        if (vendorId !== null && !isNaN(Number(vendorId))) {
          await prisma.trs_rfq_vendor.create({
            data: {
              rfq_id: id,
              vendor_id: Number(vendorId),
              status: 0,
              created_at: getCurrentWIBDate(),
              last_modified_at: getCurrentWIBDate(),
              last_modified_by: "",
              is_deleted: 0,
            },
          });
        }
      }
    }
  } catch (err) {
    console.error("Failed to parse vendor list:", err);
  }
}

    // Simpan file attachment
    if (files.rfqAttachment?.length) {
      await prisma.trs_rfq_file.create({
        data: {
          rfq_id: id,
          filename: files.rfqAttachment[0].originalname,
       source: files.rfqAttachment[0].buffer,
          created_at: getCurrentWIBDate(),
          updated_at: getCurrentWIBDate(),
          created_by: "",
          updated_by: "",
          is_deleted: 0,
        },
      });
    }

    // Simpan picture
    if (files.rfqPicture?.length) {
      await prisma.trs_rfq_picture.create({
        data: {
          rfq_id: id,
          filename: files.rfqPicture[0].originalname,
          source: files.rfqPicture[0].buffer,
          created_at: getCurrentWIBDate(),
          updated_at: getCurrentWIBDate(),
          created_by: "",
          updated_by: "",
          is_deleted: 0,
        },
      });
    }

    res.status(201).json({
      success: true,
      message: "RFQ created successfully",
      data: { ...tempRFQ, rfq_number: formattedRFQNumber },
    });
  } catch (err) {
    console.error("❌ Error creating RFQ:", err);
    res.status(500).json({
      success: false,
      message: "Error creating RFQ",
    });
  }
};

export const updateRFQ = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { rfq_duedate } = req.body;

  if (!rfq_duedate) {
    res.status(400).json({ success: false, message: "rfq duedate is required to update." });
    return;
  }

  try {
    const updatedRFQ = await prisma.trs_rfq.update({
      where: { rfq_id: Number(id) },
      data: {
        rfq_duedate: new Date(rfq_duedate),
        updated_by: "",
        updated_at: getCurrentWIBDate(),
      },
    });

    res.status(200).json({
      success: true,
      message: "RFQ due date updated successfully",
      data: updatedRFQ,
    });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ success: false, message: "Error updating RFQ due date" });
  }
};

// Archive RFQ (soft delete)
export const archiveRFQ = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    await prisma.trs_rfq.update({
      where: { rfq_id: Number(id) },
      data: {
        is_deleted: 1,
        updated_at: getCurrentWIBDate(),
        updated_by: "", // atau req.user jika pakai token
      },
    });

    res.status(200).json({
      success: true,
      message: "RFQ archived successfully",
    });
  } catch (error) {
    console.error("Error archiving RFQ:", error);
    res.status(500).json({
      success: false,
      message: "Failed to archive RFQ",
    });
  }
};

export const approveRfq = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const updated = await prisma.trs_rfq.update({
      where: { rfq_id: Number(id) },
      data: {
        is_approved: "Approved",
        approved_at: new Date(),
        updated_at: new Date(),
        updated_by: "", // optional, isi dari req.user
      },
    });

     res.status(200).json({
      success: true,
      message: "RFQ approved successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Error approving RFQ:", error);
     res.status(500).json({
      success: false,
      message: "Failed to approve RFQ",
    });
  }
};

export const rejectRfq = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const updated = await prisma.trs_rfq.update({
      where: { rfq_id: Number(id) },
      data: {
        is_approved: "Rejected",
        approved_at: new Date(),
        updated_at: new Date(),
        updated_by: "",
      },
    });

     res.status(200).json({
      success: true,
      message: "RFQ rejected successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Error rejecting RFQ:", error);
     res.status(500).json({
      success: false,
      message: "Failed to reject RFQ",
    });
  }
};

export const downloadRFQPicture = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const picture = await prisma.trs_rfq_picture.findUnique({
      where: { id: Number(id) },
    });

    if (!picture || !picture.source) {
      res.status(404).json({ success: false, message: "Picture not found" });
      return;
    }

    res.setHeader("Content-Type", "image/jpeg");
    res.setHeader("Content-Disposition", `attachment; filename=\"${picture.filename}\"`);
    res.send(picture.source);
  } catch (err) {
    console.error("Error downloading picture:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const downloadRFQFile = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const file = await prisma.trs_rfq_file.findUnique({
      where: { id: Number(id) },
    });

    if (!file || !file.source) {
      res.status(404).json({ success: false, message: "File not found" });
      return;
    }

    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Disposition", `attachment; filename=\"${file.filename}\"`);
    res.send(file.source);
  } catch (err) {
    console.error("Error downloading file:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getRfqDetailById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const detail = await prisma.trs_rfq_detail.findUnique({
      where: { id: Number(id) },
      include: {
        rfq: {
          include: {
            user: true,
            details: true,
            pictures: true,
            files: true,
          },
        },
      },
    });

    if (!detail || detail.is_deleted) {
      res.status(404).json({ success: false, message: "RFQ detail not found" });
      return;
    }

    res.status(200).json({
      rfq_number: detail.rfq?.rfq_number,
      rfq_title: detail.rfq?.rfq_title,
      rfq_specification: detail.rfq?.rfq_specification,
      rfq_duedate: detail.rfq?.rfq_duedate,
      user: detail.rfq?.user,
      details: detail.rfq?.details,
      pictures: detail.rfq?.pictures,
      files: detail.rfq?.files,
      part_number: detail.part_number,
      description: detail.description,
      pr_qty: detail.pr_qty,
      pr_uom: detail.pr_uom,
      matgroup: detail.matgroup,
      source_type: detail.source_type,
    });
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

