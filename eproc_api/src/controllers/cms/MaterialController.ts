import { Request, Response } from "express";
import { PrismaClient as SatriaClient } from "../../../generated/satria-client";

const prisma = new SatriaClient();

// Get All Materials
export const getAllMaterials = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = "1",
      limit = "100",
      search = "",
      sort = "material_number",
      order = "asc",
    } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const pageSize = parseInt(limit as string, 10);
    const skip = (pageNumber - 1) * pageSize;

    const validSortFields = ["material_number", "base_unit", "material_description"];
    const sortField = validSortFields.includes(sort as string) ? (sort as string) : "material_number";
    const sortOrder = order === "desc" ? "desc" : "asc";

    const whereClause = {
      is_deleted: 0,
      OR: [
        { material_number: { contains: search as string } },
        { base_unit: { contains: search as string } },
        { material_description: { contains: search as string } },
        { materialGroup: { material_group: { contains: search as string } } },
        { materialGroup: { material_group_description: { contains: search as string } } },
        { materialGroup: { material_type: { contains: search as string } } },
        { plant: { name: { contains: search as string } } },
      ],
    };

    const materials = await prisma.ms_material.findMany({
      where: whereClause,
      orderBy: {
        [sortField]: sortOrder,
      },
      skip,
      take: pageSize,
      include: {
        materialGroup: true,
        plant: true,
      },
    });

    const formattedMaterials = materials.map((item) => ({
      material_id: item.material_id,
      material_number: item.material_number,
      material_description: item.material_description,
      material_group: item.materialGroup?.material_group || "-",
      material_group_description: item.materialGroup?.material_group_description || "-",
      material_type: item.materialGroup?.material_type || "-",
      base_unit: item.base_unit,
      plant: item.plant?.name || "-",
    }));

    const totalItems = await prisma.ms_material.count({ where: whereClause });
    const totalPages = Math.ceil(totalItems / pageSize);

    res.status(200).json({
      success: true,
      message: "Successfully retrieved material data",
      data: {
        data: formattedMaterials,
        totalPages,
        currentPage: pageNumber,
        totalItems,
      },
    });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ success: false, message: "Error retrieving materials" });
  }
};

// Get Material by ID
export const getMaterialById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (isNaN(Number(id))) {
    res.status(400).json({ success: false, message: "Invalid ID format" });
    return;
  }

  try {
    const material = await prisma.ms_material.findUnique({
      where: {
        material_id: parseInt(id, 10),
      },
      include: {
        materialGroup: true,
        plant: true,
      },
    });

    if (!material) {
      res.status(404).json({ success: false, message: "Material not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Material found",
      data: material,
    });
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Create Material
export const createMaterial = async (req: Request, res: Response): Promise<void> => {
  const {
    material_group_id,
    material_number,
    material_description,
    base_unit,
    plant_id,
    user_id,
  } = req.body;

  if (
    isNaN(Number(material_group_id)) ||
    isNaN(Number(plant_id)) ||
    isNaN(Number(user_id))
  ) {
    res.status(400).json({ success: false, message: "ID harus berupa angka valid" });
    return;
  }

  try {
    // Cek apakah material_group_id valid
    const group = await prisma.ms_material_group.findUnique({
      where: { material_group_id: Number(material_group_id) },
    });

    if (!group) {
      res.status(400).json({
        success: false,
        message: "Material group tidak ditemukan",
      });
      return;
    }

    // Simpan material baru
    const newMaterial = await prisma.ms_material.create({
      data: {
        material_group_id: Number(material_group_id),
        material_number,
        material_description,
        base_unit,
        plant_id: Number(plant_id),
        is_deleted: 0,
      },
      include: {
        materialGroup: true,
        plant: true,
      },
    });

    res.status(201).json({
      success: true,
      message: "Material has been created successfully",
      data: newMaterial,
    });
  } catch (err: any) {
    console.error("Database Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to create material",
      error: err?.message || err,
    });
  }
};



// Update Material
export const updateMaterial = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const {
    material_group_id,
    material_number,
    material_description,
    base_unit,
    plant_id,
    user_id,
  } = req.body;

  if (
    isNaN(Number(id)) ||
    isNaN(Number(material_group_id)) ||
    isNaN(Number(plant_id)) ||
    isNaN(Number(user_id))
  ) {
    res.status(400).json({ success: false, message: "ID harus berupa angka valid" });
    return;
  }

  try {
    const group = await prisma.ms_material_group.findUnique({
      where: { material_group_id: Number(material_group_id) },
    });

    if (!group) {
      res.status(400).json({
        success: false,
        message: "Material group tidak ditemukan",
      });
      return;
    }

    const updatedMaterial = await prisma.ms_material.update({
      where: { material_id: Number(id) },
      data: {
        material_group_id: Number(material_group_id),
        material_number,
        material_description,
        base_unit,
        plant_id: Number(plant_id),
        users: {
          connect: { user_id: Number(user_id) },
        },
      },
      include: {
        materialGroup: true,
        plant: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "Material updated successfully",
      data: updatedMaterial,
    });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ success: false, message: "Failed to update material" });
  }
};

// Soft Delete Material
export const deleteMaterial = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (isNaN(Number(id))) {
    res.status(400).json({ success: false, message: "Invalid ID" });
    return;
  }

  try {
    await prisma.ms_material.update({
      where: { material_id: Number(id) },
      data: {
        is_deleted: 1,
      },
    });

    res.status(200).json({
      success: true,
      message: "Material deleted successfully",
    });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ success: false, message: "Failed to delete material" });
  }
};
