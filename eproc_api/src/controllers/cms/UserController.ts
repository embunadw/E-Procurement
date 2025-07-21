import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { PrismaClient as SatriaClient } from "../../../generated/satria-client";
import { getCurrentWIBDate } from "../../helpers/timeHelper";

const prisma = new SatriaClient();

// Get All Users
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = "1",
      limit = "100",
      search = "",
      sort = "username",
      order = "asc",
    } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const pageSize = parseInt(limit as string, 10);
    const skip = (pageNumber - 1) * pageSize;

    const validSortFields = [
      "username", "personal_number", "dept", "department", "division", "email_sf", "role"
    ];

    const sortField = validSortFields.includes(sort as string) ? (sort as string) : "username";
    const sortOrder = order === "desc" ? "desc" : "asc";

    const whereClause = {
      is_deleted: 0,
      OR: [
        { username: { contains: search as string } },
        { dept: { contains: search as string } },
        { department: { contains: search as string } },
        { division: { contains: search as string } },
        { email_sf: { contains: search as string } },
        { role: { contains: search as string } },
      ],
    };

    const users = await prisma.ms_user.findMany({
      where: whereClause,
      orderBy: { [sortField]: sortOrder },
      skip,
      take: pageSize,
      select: {
        user_id: true,
        username: true,
        personal_number: true,
        dept: true,
        department: true,
        division: true,
        email_sf: true,
        role: true,
        created_at: true,
        is_deleted: true,
      },
    });

    const totalItems = await prisma.ms_user.count({ where: whereClause });
    const totalPages = Math.ceil(totalItems / pageSize);

    res.status(200).json({
      success: true,
      message: "Successfully retrieved users",
      data: {
        data: users,
        totalPages,
        currentPage: pageNumber,
        totalItems,
      },
    });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ success: false, message: "Error retrieving users" });
  }
};


export const getUserById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = Number(id);

  if (isNaN(userId)) {
    res.status(400).json({ success: false, message: "Invalid user ID format" });
    return;
  }

  try {
    const user = await prisma.ms_user.findUnique({
      where: { user_id: userId },
    });

    if (!user || user.is_deleted === 1) {
      res.status(404).json({ success: false, message: "User not found or deleted" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "User found",
      data: user,
    });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ success: false, message: "Error retrieving user" });
  }
};

// Create User
export const createUser = async (req: Request, res: Response): Promise<void> => {
  const { username, email_sf, password, role = "user", personal_number, dept, department, division } = req.body;

  if (!username || !email_sf || !password || !personal_number || !dept || !department || !division) {
    res.status(400).json({ error: "All fields (username, email, password, personal_number, dept, department, division) are required" });
    return;
  }

  try {
    // Validasi panjang password
    if (password.length < 6 || password.length > 12) {
      res.status(400).json({ error: "Password must be between 6 and 12 characters" });
      return;
    }

    // Validasi nomor telepon (maksimal 15 digit, hanya angka)
    if (!/^\d{1,15}$/.test(personal_number)) {
      res.status(400).json({ error: "Personal number must be numeric and max 15 digits" });
      return;
    }

    // Cek apakah email sudah terdaftar
    const existingUser = await prisma.ms_user.findFirst({
      where: { email_sf, is_deleted: 0 },
    });

    if (existingUser) {
      res.status(400).json({ error: "Email already exists" });
      return;
    }

    // Cek apakah username sudah terdaftar
    const existingUsername = await prisma.ms_user.findFirst({
      where: { username, is_deleted: 0 },
    });

    if (existingUsername) {
      res.status(400).json({ error: "Username already exists" });
      return;
    }

    // Cek apakah personal_number sudah terdaftar
    const existingPN = await prisma.ms_user.findFirst({
      where: { personal_number: String(personal_number), is_deleted: 0 },
    });

    if (existingPN) {
      res.status(400).json({ error: "Personal number already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.ms_user.create({
      data: {
        username,
        email_sf,
        password: hashedPassword,
        role,
        personal_number: String(personal_number),
        dept,
        department,
        division,
        created_at: new Date(),
        is_deleted: 0,
      },
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: newUser,
    });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ success: false, message: "Error creating user" });
  }
};


// Update User
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = Number(id);
  let data = req.body;

  if (isNaN(userId)) {
    res.status(400).json({ success: false, message: "Invalid user ID format" });
    return;
  }

  try {
    const { password, personal_number } = data;

    // Hindari perubahan username dan email
    delete data.username;
    delete data.email_sf;

    // Validasi dan enkripsi password jika dikirim
    if (password && password.trim() !== "") {
      if (password.length < 6 || password.length > 12) {
        res.status(400).json({ success: false, message: "Password must be between 6 and 12 characters" });
        return;
      }
      data.password = await bcrypt.hash(password, 10);
    } else {
      delete data.password;
    }

    // Validasi personal_number jika dikirim
    if (personal_number) {
      if (!/^\d{1,15}$/.test(personal_number)) {
        res.status(400).json({ success: false, message: "Personal number must be numeric and max 15 digits" });
        return;
      }

      const existingPN = await prisma.ms_user.findFirst({
        where: {
          personal_number: String(personal_number),
          user_id: { not: userId },
          is_deleted: 0,
        },
      });

      if (existingPN) {
        res.status(400).json({ success: false, message: "Personal number already exists" });
        return;
      }
    }

    const updatedUser = await prisma.ms_user.update({
      where: { user_id: userId },
      data,
    });

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (err) {
    console.error("Update Error:", err);
    res.status(500).json({ success: false, message: "Error updating user" });
  }
};


// Soft Delete User
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = Number(id);

  if (isNaN(userId)) {
    res.status(400).json({ success: false, message: "Invalid user ID format" });
    return;
  }

  try {
    const deletedUser = await prisma.ms_user.update({
      where: { user_id: userId },
      data: { is_deleted: 1 },
    });

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ success: false, message: "Error deleting user" });
  }
};
