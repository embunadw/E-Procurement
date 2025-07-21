// src/routes/auth.ts
import express, { Request, Response } from "express";
import * as AuthController from "../controllers/Auth/AuthController";

const router = express.Router();

// Route register vendor
router.post("/register", async (req: Request, res: Response) => {
  await AuthController.registerVendor(req, res);
});

// Route login internal user (karyawan)
router.post("/login", async (req: Request, res: Response) => {
  await AuthController.loginUser(req, res);
});

// Route login khusus vendor
router.post("/login-vendor", async (req: Request, res: Response) => {
  await AuthController.loginVendor(req, res);
});

export default router;
