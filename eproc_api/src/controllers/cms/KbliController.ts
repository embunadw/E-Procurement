import { Request, Response } from "express";
import { PrismaClient as SatriaClient } from "../../../generated/satria-client";

const prisma = new SatriaClient();

// GET ALL KBLIs
export const getAllKblis = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = "1",
      limit = "100",
      search = "",
      sort = "code",
      order = "asc",
    } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const pageSize = parseInt(limit as string, 10);
    const skip = (pageNumber - 1) * pageSize;

    const validSortFields = ["code", "title", "year", "description"];
    const sortField = validSortFields.includes(sort as string) ? (sort as string) : "code";
    const sortOrder = order === "desc" ? "desc" : "asc";

    const whereClause = {
      enable: 1,
      OR: [
        { code: { contains: search as string } },
        { title: { contains: search as string } },
        { year: { contains: search as string } },
        { description: { contains: search as string } },
      ],
    };

    const kblis = await prisma.ms_kbli.findMany({
      where: whereClause,
      orderBy: {
        [sortField]: sortOrder,
      },
      skip,
      take: pageSize,
    });

    const totalItems = await prisma.ms_kbli.count({ where: whereClause });
    const totalPages = Math.ceil(totalItems / pageSize);

    res.status(200).json({
      success: true,
      message: "Successfully retrieved KBLI data",
      data: {
        data: kblis,
        totalPages,
        currentPage: pageNumber,
        totalItems,
      },
    });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ success: false, message: "Error retrieving KBLIs" });
  }
};

// GET KBLI BY ID
export const getKbliById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const kbli = await prisma.ms_kbli.findUnique({
      where: { id: Number(id) },
    });

    if (!kbli || kbli.enable === 0) {
      res.status(404).json({ success: false, message: "KBLI not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "KBLI found",
      data: kbli,
    });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ success: false, message: "Error retrieving KBLI" });
  }
};

// CREATE KBLI
export const createKbli = async (req: Request, res: Response): Promise<void> => {
  const { year, code, title, description } = req.body;

  if (!year || !code || !title || !description) {
    res.status(400).json({ success: false, message: "Missing required fields" });
    return;
  }

  try {
    // Check if KBLI code already exists
    const existingKbli = await prisma.ms_kbli.findFirst({
      where: {
        code: code,
        enable: 1 // Only check active records
      }
    });

    if (existingKbli) {
      res.status(409).json({
        success: false,
        message: "KBLI Code is using"
      });
      return;
    }

    const newKbli = await prisma.ms_kbli.create({
      data: {
        year,
        code,
        title,
        description,
        enable: 1,
      },
    });

    res.status(201).json({
      success: true,
      message: "KBLI created successfully",
      data: newKbli,
    });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ success: false, message: "Error creating KBLI" });
  }
};


// UPDATE KBLI
export const updateKbli = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { year, code, title, description } = req.body;

  try {
    const existingKbli = await prisma.ms_kbli.findUnique({
      where: { id: Number(id) },
    });

    if (!existingKbli || existingKbli.enable === 0) {
      res.status(404).json({ success: false, message: "KBLI not found" });
      return;
    }

    const updatedKbli = await prisma.ms_kbli.update({
      where: { id: Number(id) },
      data: {
        year,
        code,
        title,
        description,
      },
    });

    res.status(200).json({
      success: true,
      message: "KBLI updated successfully",
      data: updatedKbli,
    });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ success: false, message: "Error updating KBLI" });
  }
};

// SOFT DELETE KBLI
export const deleteKbli = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    await prisma.ms_kbli.update({
      where: { id: Number(id) },
      data: { enable: 0 },
    });

    res.status(200).json({
      success: true,
      message: "KBLI deleted successfully",
    });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ success: false, message: "Error deleting KBLI" });
  }
};
