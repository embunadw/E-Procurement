import { Request, Response } from "express";
import { PrismaClient as SatriaClient } from "../../../generated/satria-client";

const prisma = new SatriaClient();

// List All Plants
export const getAllPlants = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = "1",
      limit = "100",
      search = "",
      sort = "plant",
      order = "asc",
    } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const pageSize = parseInt(limit as string, 10);
    const skip = (pageNumber - 1) * pageSize;

    const validSortFields = ["plant", "postcode", "city", "name"];
    const sortField = validSortFields.includes(sort as string) ? (sort as string) : "plant";
    const sortOrder = order === "desc" ? "desc" : "asc";

    const whereClause = {
      is_deleted: 0,
      OR: [
        { plant: { contains: search as string } },
        { city: { contains: search as string } },
        { name: { contains: search as string } },
      ],
    };

    const plants = await prisma.ms_plant.findMany({
      where: whereClause,
      orderBy: {
        [sortField]: sortOrder,
      },
      skip,
      take: pageSize,
      include: {
        user: true,
      },
    });

    const totalItems = await prisma.ms_plant.count({ where: whereClause });
    const totalPages = Math.ceil(totalItems / pageSize);

    res.status(200).json({
      success: true,
      message: "Successfully retrieved plant data",
      data: {
        data: plants,
        totalPages,
        currentPage: pageNumber,
        totalItems,
      },
    });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ success: false, message: "Error retrieving plants" });
  }
};

// Get Plant by ID
export const getPlantById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (isNaN(Number(id))) {
    res.status(400).json({ success: false, message: "Invalid ID format" });
    return;
  }

  try {
    const plant = await prisma.ms_plant.findUnique({
      where: {
        plant_id: parseInt(id, 10),
      },
      include: {
        user: true,
      },
    });

    if (!plant) {
      res.status(404).json({ success: false, message: "Plant not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Plant found",
      data: plant,
    });
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Create Plant
export const createPlant = async (req: Request, res: Response): Promise<void> => {
  const { user_id, plant, postcode, city, name } = req.body;

  try {
    // Check for duplicate plant code
    const existing = await prisma.ms_plant.findFirst({
      where: {
        plant,
        is_deleted: 0,
      },
    });

    if (existing) {
      res.status(400).json({
        success: false,
        message: "Plant code already exists",
      });
      return;
    }

    const newPlant = await prisma.ms_plant.create({
      data: {
        plant,
        postcode,
        city,
        name,
        is_deleted: 0,
        user: {
          connect: { user_id: Number(user_id) },
        },
      },
      include: {
        user: true,
      },
    });

    res.status(201).json({
      success: true,
      message: "Plant created successfully",
      data: newPlant,
    });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ success: false, message: "Error creating plant" });
  }
};

// Update Plant
export const updatePlant = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (isNaN(Number(id))) {
    res.status(400).json({ success: false, message: "Invalid plant ID" });
    return;
  }

  const { user_id, plant, postcode, city, name } = req.body;

  try {
    const existingPlant = await prisma.ms_plant.findUnique({
      where: { plant_id: Number(id) },
    });

    if (!existingPlant) {
      res.status(404).json({ success: false, message: "Plant not found" });
      return;
    }

    // Check for duplicate plant code in other entries
    const duplicate = await prisma.ms_plant.findFirst({
      where: {
        plant,
        is_deleted: 0,
        NOT: {
          plant_id: Number(id),
        },
      },
    });

    if (duplicate) {
      res.status(400).json({
        success: false,
        message: "Plant code already used by another record",
      });
      return;
    }

    const updatedPlant = await prisma.ms_plant.update({
      where: { plant_id: Number(id) },
      data: {
        plant,
        postcode,
        city,
        name,
        ...(user_id && {
          user: {
            connect: { user_id: Number(user_id) },
          },
        }),
      },
      include: {
        user: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "Plant updated successfully",
      data: updatedPlant,
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Error during update:", err.message);
      res.status(500).json({ success: false, message: "Error updating plant", error: err.message });
    } else {
      console.error("Unexpected error:", err);
      res.status(500).json({ success: false, message: "Unexpected error during update" });
    }
  }
};

// Soft Delete Plant
export const deletePlant = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    await prisma.ms_plant.update({
      where: { plant_id: Number(id) },
      data: {
        is_deleted: 1,
      },
    });

    res.status(200).json({
      success: true,
      message: "Plant deleted successfully",
    });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ success: false, message: "Error deleting plant" });
  }
};
