// src/models/Table/Satria/ms_user.ts

import { PrismaClient as SatriaClient } from "../../../../generated/satria-client";

// Inisialisasi Prisma Client
const prisma = new SatriaClient();

// Model ms_user
export const User = {
  // Mendapatkan pengguna berdasarkan ID
  findUnique: prisma.ms_user.findUnique,

  // Mendapatkan semua pengguna
  findMany: prisma.ms_user.findMany,

  // Membuat pengguna baru
  create: prisma.ms_user.create,

  // Memperbarui pengguna
  update: prisma.ms_user.update,

  // Menghapus pengguna
  delete: prisma.ms_user.delete,

  // Fungsi lain yang terkait dengan model ms_user
  count: prisma.ms_user.count,
  findFirst: prisma.ms_user.findFirst,
  upsert: prisma.ms_user.upsert,
};
