import express, { Request, Response, NextFunction } from "express";
import apiRoutes from "./routes/api";
import authRoutes from "./routes/auth";

import cors from "cors";
import { authenticateJWT } from "./middleware/auth";

const app = express();

// Pasang CORS Middleware paling awal
const corsOptions = {
  origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"], // Sesuaikan dengan port Next.js 
  credentials: true, // Jika menggunakan cookie atau token
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Gunakan CORS middleware untuk mengizinkan permintaan dari origin tertentu
app.use(cors(corsOptions));

// Middleware untuk parsing request body JSON
app.use(express.json()); 

// Middleware untuk parsing URL-encoded data (opsional, hanya perlu jika ingin menerima form-data dari HTML forms)
app.use(express.urlencoded({ extended: true }));

// Routing untuk autentikasi
app.use("/auth", authRoutes);

// Routing untuk API utama
app.use("/api", apiRoutes);

app.get("/protected", authenticateJWT, (req, res) => {
  res.status(200).json({ message: "This is a protected route" });
});

// Menangani endpoint yang tidak ditemukan
app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: "error",
    message: "Halaman tidak ditemukan. Silakan periksa URL Anda.",
  });
});

// Middleware untuk penanganan error
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Unhandled Error:", err.message);
  res.status(500).json({
    status: "error",
    message: "Terjadi kesalahan server. Silakan coba lagi nanti.",
  });
});

// Menangani uncaughtException (kesalahan yang tidak tertangkap)
process.on("uncaughtException", (err: Error) => {
  console.error("Uncaught Exception:", err);
  process.exit(1); // Bisa diganti dengan restart server secara otomatis
});

// Menangani unhandledRejection (janji yang tidak tertangkap)
process.on("unhandledRejection", (reason: any, promise: Promise<any>) => {
  console.error("Unhandled Rejection:", reason);
});

// Jalankan server di port 3000
const PORT: number = 3000;
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
