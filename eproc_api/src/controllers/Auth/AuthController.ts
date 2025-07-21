
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { PrismaClient as SatriaClient } from "../../../generated/satria-client";

dotenv.config();
const prisma = new SatriaClient();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in the environment variables");
}

// Login user
// export const loginUser = async (req: Request, res: Response): Promise<void> => {
//   const { email_sf, password } = req.body;

//   try {
//     // Cari user berdasarkan email
//     const user = await prisma.ms_user.findFirst({
//       where: {
//         email_sf,
//         is_deleted: 0,
//       },
//     });

//     if (!user || user.is_deleted) {
//       res.status(401).json({ error: "User is not active" });
//       return;
//     }

//     // Verifikasi password
//     const isValidPassword = await bcrypt.compare(password, user.password);
//     if (!isValidPassword) {
//       res.status(401).json({ error: "Invalid Password" });
//       return;
//     }

//     // Buat token JWT dengan userName
//     const token = jwt.sign(
//       {
//         id: user.user_id,
//         email: user.email_sf,
//        role: user.role?.toLowerCase(), 
//     userName: user.username,
//       },
//       JWT_SECRET,
//       { expiresIn: "24h" }
//     );

//     // Response dengan token dan user data termasuk userName
//     res.status(200).json({
//       message: "Login successful",
//       token,
//       user: {
//         id: user.user_id,
//         email: user.email_sf,
//         role: user.role,
//         userName: user.username,
//       },
//     });
//   } catch (err) {
//     console.error("Login Error:", err);
//     res.status(500).json({ error: "Error during login" });
//   }
// };


export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { email_sf, password } = req.body;

  // === LOGIN STATIS UNTUK PATRIA ADMIN ===
  const staticEmail = "patria@gmail.com";
  const staticPassword = "patria1";

  try {
    if (email_sf === staticEmail && password === staticPassword) {
      const token = jwt.sign(
        {
          id: 0,
          email: staticEmail,
          role: "patria",
          userName: "Patria Admin",
        },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      res.status(200).json({
        message: "Login successful (static)",
        token,
        user: {
          id: 0,
          email: staticEmail,
          role: "patria",
          userName: "Patria Admin",
        },
      });
      return;
    }

    // === LOGIN DARI DATABASE ===
    const user = await prisma.ms_user.findFirst({
      where: {
        email_sf,
        is_deleted: 0,
      },
    });

    if (!user || user.is_deleted) {
      res.status(401).json({ error: "User is not active" });
      return;
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({ error: "Invalid Password" });
      return;
    }

    const token = jwt.sign(
      {
        id: user.user_id,
        email: user.email_sf,
        role: user.role?.toLowerCase(),
        userName: user.username,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.user_id,
        email: user.email_sf,
        role: user.role,
        userName: user.username,
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Error during login" });
  }
};
export function getUserFromToken(token: string | undefined) {
  if (!token) return null;

  try {
    // JWT format: header.payload.signature
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));
    return {
      userName: decoded.username || decoded.name || decoded.userName || "User",
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };
  } catch (error) {
    return null;
  }
}


export const registerVendor = async (req: Request, res: Response) => {
  try {
    const {
      company_name,
      telephone,
      address,
      nib,
      email,
      password,
      vendor_category,
      referral,
      company_aff_id,
      kbli_ids, // <-- Ganti dari kbli_id jadi array
    } = req.body;

    if (
      !company_name || !telephone || !address || !email || !password ||
      !vendor_category || !company_aff_id || !kbli_ids || !Array.isArray(kbli_ids)
    ) {
      return res.status(400).json({ success: false, message: "Missing required fields or KBLI IDs must be array." });
    }

    const existing = await prisma.register_vendor.findUnique({
      where: { email },
    });
    if (existing) {
      return res.status(400).json({ success: false, message: "Email already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const vendor = await tx.ms_vendor.create({
        data: {
          name: company_name,
          email,
          password: hashedPassword,
          country_code: "",
          postal_code: "",
          address,
          vendor_code: nib,
          phone_no: telephone,
          vendor_type: vendor_category,
          email_po: email,
          created_at: new Date(),
          created_by: "system",
          updated_at: new Date(),
          last_modified_by: "system",
        },
      });

      const reg = await tx.register_vendor.create({
        data: {
          company_name,
          telephone,
          address,
          nib,
          email,
          password: hashedPassword,
          vendor_category,
          referral,
          company_aff_id: Number(company_aff_id),
          vendor_id: vendor.vendor_id,
        },
      });

      await tx.ms_kbli_detail.createMany({
        data: kbli_ids.map((id: number) => ({
          kbli_id: id,
          register_vendor_id: reg.id,
        })),
      });

      return reg;
    });

    res.status(201).json({
      success: true,
      message: "Vendor and KBLI registered successfully",
      data: result,
    });
  } catch (err: any) {
    console.error("Error creating vendor:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



export const loginVendor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validasi input
    if (!email || !password) {
      res.status(400).json({ success: false, message: "Email and password are required." });
      return;
    }

    // Cari user berdasarkan email
    const registered = await prisma.register_vendor.findUnique({
      where: { email },
      include: { vendor: true }, 
    });

    // Jika tidak ditemukan
    if (!registered) {
      res.status(401).json({ success: false, message: "Account not found." });
      return;
    }

    // Cek password
    const isMatch = await bcrypt.compare(password, registered.password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: "Wrong password." });
      return;
    }

    // Generate token
    const token = jwt.sign(
      {
        id: registered.id,
        email: registered.email,
        role: "vendor",
        
      },
      process.env.JWT_SECRET || "secret", 
      { expiresIn: "1d" }
    );

    // Kirim respons sukses
    res.status(200).json({
      success: true,
      message: "Login berhasil",
      token,
      data: {
        id: registered.id,
        email: registered.email,
        name: registered.vendor?.name || "", 
        vendor_id: registered.vendor?.vendor_id || null,
        company_name: registered.company_name,
      },
    });
  } catch (error: any) {
    console.error("Login vendor error:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


