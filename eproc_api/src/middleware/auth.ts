import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Ambil secret key dari environment variables
const JWT_SECRET = process.env.JWT_SECRET || "secret_key"; // Fallback jika tidak ada

export const authenticateJWT = (
  req: Request & { user?: any }, // Menambahkan properti user pada request
  res: Response,
  next: NextFunction
): void => {
  // Ambil Authorization header
  const authHeader = req.headers.authorization;

  // Cek jika authHeader ada
  if (!authHeader) {
    res.status(403).json({ error: "Access denied, token missing" });
    return; // Tidak perlu lanjutkan eksekusi lebih lanjut
  }

  // Token biasanya dikirim dengan format 'Bearer <token>'
  const token = authHeader.split(" ")[1]; // Ambil token setelah 'Bearer'

  if (!token) {
    res.status(403).json({ error: "Access denied, no token provided" });
    return; 
  }

  // Verifikasi token dengan JWT_SECRET
  try {
    // Memverifikasi token dan menambahkan informasi user di req.user
    const user = jwt.verify(token, JWT_SECRET);
    req.user = user; // Menyimpan user yang terverifikasi ke dalam request

    // Lanjutkan ke middleware berikutnya jika token valid
    next();
  } catch (err) {
    // Jika token tidak valid atau kedaluwarsa
    res.status(401).json({ error: "Invalid or expired token" });
    return; // Tidak lanjutkan eksekusi
  }
};
