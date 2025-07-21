import { Request, Response } from "express";
import { PrismaClient as SatriaClient } from "../../../generated/satria-client";

const prisma = new SatriaClient();

// List All Material Groups
export const getAllMaterialGroups = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = "1",
      limit = "100",
      search = "",
      sort = "material_group",
      order = "asc",
    } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const pageSize = parseInt(limit as string, 10);
    const skip = (pageNumber - 1) * pageSize;

    const validSortFields = [
      "material_type",
      "material_group",
      "material_group_description",
    ];

    const sortField = validSortFields.includes(sort as string) ? (sort as string) : "material_group";
    const sortOrder = order === "desc" ? "desc" : "asc";

    const whereClause = {
      is_deleted: 0,
      OR: [
        { material_type: { contains: search as string } },
        { material_group: { contains: search as string } },
        { material_group_description: { contains: search as string } },
      ],
    };

    const groups = await prisma.ms_material_group.findMany({
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

    const totalItems = await prisma.ms_material_group.count({ where: whereClause });
    const totalPages = Math.ceil(totalItems / pageSize);

    res.status(200).json({
      success: true,
      message: "Successfully retrieved material group data",
      data: {
        data: groups,
        totalPages,
        currentPage: pageNumber,
        totalItems,
      },
    });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ success: false, message: "Error retrieving material groups" });
  }
};

// Get by ID
export const getMaterialGroupById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (isNaN(Number(id))) {
    res.status(400).json({ success: false, message: "Invalid ID format" });
    return;
  }

  try {
    const group = await prisma.ms_material_group.findUnique({
      where: {
        material_group_id: parseInt(id, 10),
      },
      include: {
        user: true,
      },
    });

    if (!group) {
      res.status(404).json({ success: false, message: "Material group not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Material group found",
      data: group,
    });
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Create
export const createMaterialGroup = async (req: Request, res: Response): Promise<void> => {
  const {
    user_id,
    material_type,
    material_group,
    material_group_description,
  } = req.body;

  try {

    const existing = await prisma.ms_material_group.findFirst({
      where: {
        material_type,
        material_group,
        is_deleted: 0,
      },
    });

    if (existing) {
      res.status(400).json({
        success: false,
        message: "A combination of material type and material group has been used.",
      });
      return;
    }

    const newGroup = await prisma.ms_material_group.create({
      data: {
        material_type,
        material_group,
        material_group_description,
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
      message: "Material group created successfully",
      data: newGroup,
    });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ success: false, message: "Error creating material group" });
  }
};


export const updateMaterialGroup = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (isNaN(Number(id))) {
    res.status(400).json({ success: false, message: "Invalid material group ID" });
    return;
  }

  const { material_type, material_group, material_group_description } = req.body;

  try {
    const existingGroup = await prisma.ms_material_group.findUnique({
      where: { material_group_id: Number(id) },
    });

    if (!existingGroup) {
      res.status(404).json({ success: false, message: "Material group not found" });
      return;
    }

    const duplicate = await prisma.ms_material_group.findFirst({
      where: {
        material_type,
        material_group,
        is_deleted: 0,
        NOT: {
          material_group_id: Number(id),
        },
      },
    });

    if (duplicate) {
      res.status(400).json({
        success: false,
        message: "A combination of material type and material group has been used.",
      });
      return;
    }

    const updatedGroup = await prisma.ms_material_group.update({
      where: { material_group_id: Number(id) },
      data: {
        material_type,
        material_group,
        material_group_description,
      },
    });

    res.status(200).json({
      success: true,
      message: "Material group updated successfully",
      data: updatedGroup,
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Error during update:", err.message);
      res.status(500).json({ success: false, message: "Error updating material group", error: err.message });
    } else {
      console.error("Unexpected error:", err);
      res.status(500).json({ success: false, message: "Unexpected error during update" });
    }
  }
};

// Soft Delete
export const deleteMaterialGroup = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    await prisma.ms_material_group.update({
      where: { material_group_id: Number(id) },
      data: {
        is_deleted: 1,
      },
    });

    res.status(200).json({
      success: true,
      message: "Material group deleted successfully",
    });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ success: false, message: "Error deleting material group" });
  }
};
