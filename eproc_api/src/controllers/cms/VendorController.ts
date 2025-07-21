import { Request, Response } from "express";
import { PrismaClient as SatriaClient } from "../../../generated/satria-client";
import { getCurrentWIBDate } from "../../helpers/timeHelper";
import bcrypt from "bcryptjs";

const prisma = new SatriaClient();

// List All Vendors
export const getAllVendors = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = "1",
      limit = "1000",
      search = "",
      sort = "vendor_code",
      order = "asc",
    } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const pageSize = parseInt(limit as string, 10);
    const skip = (pageNumber - 1) * pageSize;

    const validSortFields = [
      "vendor_id",
      "created_at",
      "vendor_code",
      "name",
      "email",
      "vendor_type",
      "country_code",
    ];

    const sortField = validSortFields.includes(sort as string) ? (sort as string) : "vendor_id"; // default fallback juga vendor_id

    const sortOrder = order === "desc" ? "desc" : "asc";

    const whereClause = {
      is_deleted: 0,
      OR: [
        { vendor_code: { contains: search as string } },
        { name: { contains: search as string } },
        { email: { contains: search as string } },
        { vendor_type: { contains: search as string } },
        { country_code: { contains: search as string } },
      ],
    };

    const vendors = await prisma.ms_vendor.findMany({
      where: whereClause,
      orderBy: { [sortField]: sortOrder },
      skip,
      take: pageSize,
      include: {
        users: true,
      },
    });

    const totalItems = await prisma.ms_vendor.count({ where: whereClause });
    const totalPages = Math.ceil(totalItems / pageSize);

    res.status(200).json({
      success: true,
      message: "Successfully retrieved vendor data",
      data: {
        data: vendors,
        totalPages,
        currentPage: pageNumber,
        totalItems,
      },
    });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ success: false, message: "Error retrieving vendors" });
  }
};

// Get Vendor by ID
export const getVendorById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (isNaN(Number(id))) {
    res.status(400).json({ success: false, message: "Invalid ID format" });
    return;
  }

  try {
    const vendor = await prisma.ms_vendor.findUnique({
      where: { vendor_id: parseInt(id, 10) },
      include: {
        users: true,
      },
    });

    if (!vendor) {
      res.status(404).json({ success: false, message: "Vendor not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Vendor found",
      data: vendor,
    });
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Create Vendor
export const createVendor = async (req: Request, res: Response): Promise<void> => {
  const { name, email, vendor_code, password, ...rest } = req.body;

  if (!name || !email || !vendor_code || !password) {
    res.status(400).json({
      success: false,
      message: "Name, email, vendor code, and password are required",
    });
    return;
  }

  try {
    // Hash password sebelum simpan
    const hashedPassword = await bcrypt.hash(password, 10);

    const newVendor = await prisma.ms_vendor.create({
      data: {
        name,
        email,
        vendor_code,
        password: hashedPassword,
        ...rest,
        is_deleted: 0,
        created_at: getCurrentWIBDate(),
        updated_at: getCurrentWIBDate(),
        created_by: "",
        last_modified_by: "",
      },
    });

    // Hilangkan password dari response
    const { password: _, ...vendorWithoutPassword } = newVendor;

    res.status(201).json({
      success: true,
      message: "Vendor created successfully",
      data: vendorWithoutPassword,
    });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ success: false, message: "Error creating vendor" });
  }
};

// Update Vendor
export const updateVendor = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (isNaN(Number(id))) {
    res.status(400).json({ success: false, message: "Invalid vendor ID" });
    return;
  }

  try {
    const existingVendor = await prisma.ms_vendor.findUnique({
      where: { vendor_id: Number(id) },
    });

    if (!existingVendor) {
      res.status(404).json({ success: false, message: "Vendor not found" });
      return;
    }

    // Kalau ada password baru, hash!
    let updateData = { ...req.body, updated_at: getCurrentWIBDate(), last_modified_by: "" };
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const updatedVendor = await prisma.ms_vendor.update({
      where: { vendor_id: Number(id) },
      data: updateData,
    });

    const { password: _, ...vendorWithoutPassword } = updatedVendor;

    res.status(200).json({
      success: true,
      message: "Vendor updated successfully",
      data: vendorWithoutPassword,
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Error during update:", err.message);
      res.status(500).json({ success: false, message: "Error updating vendor", error: err.message });
    } else {
      console.error("Unexpected error:", err);
      res.status(500).json({ success: false, message: "Unexpected error during update" });
    }
  }
};


// Soft Delete Vendor
export const deleteVendor = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (isNaN(Number(id))) {
    res.status(400).json({ success: false, message: "Invalid vendor ID" });
    return;
  }

  try {
    await prisma.ms_vendor.update({
      where: { vendor_id: Number(id) },
      data: {
        is_deleted: 1,
        updated_at: getCurrentWIBDate(),
        last_modified_by: "admin",
      },
    });

    res.status(200).json({
      success: true,
      message: "Vendor deleted successfully",
    });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ success: false, message: "Error deleting vendor" });
  }
};

